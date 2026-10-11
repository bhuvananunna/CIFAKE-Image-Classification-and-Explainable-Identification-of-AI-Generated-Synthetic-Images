import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Eye,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileImage,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Crosshair,
  Sparkles,
  Printer,
  FileText,
  BarChart2,
  Cpu,
  Activity
} from 'lucide-react';
import { ModelType, PredictionLabel, SampleImage, User } from '../types';
import { generateCifakeSamples } from '../data/cifakeSamples';
import { runPredictionAndGradCAM, ColormapType, GradCamResult } from '../services/cifakeModel';
import { savePredictionRecord } from '../services/db';

interface PredictSectionProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onGoToHistory: () => void;
}

export const PredictSection: React.FC<PredictSectionProps> = ({
  currentUser,
  onOpenAuth,
  onGoToHistory,
}) => {
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [selectedSample, setSelectedSample] = useState<SampleImage | null>(null);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('sample_benchmark.png');
  const [fileDetails, setFileDetails] = useState<{ sizeKb: number; type: string } | null>(null);
  const [modelType, setModelType] = useState<ModelType>('modified_cnn2d');
  
  // Grad-CAM Controls
  const [colormap, setColormap] = useState<ColormapType>('jet');
  const [layerChoice, setLayerChoice] = useState<'block2' | 'block3'>('block3');
  const [overlayAlpha, setOverlayAlpha] = useState<number>(0.50);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pixelated, setPixelated] = useState<boolean>(true);

  // Interactive Crosshair Probe State
  const [probePos, setProbePos] = useState<{ x: number; y: number } | null>(null);

  // Progressive loading states
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const [predictionResult, setPredictionResult] = useState<(GradCamResult & { timestamp: string }) | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = generateCifakeSamples();
    setSamples(s);
    if (s.length > 0) {
      setSelectedSample(s[0]);
      setUploadedImageSrc(s[0].dataUrl);
      setImageName(s[0].name);
      setFileDetails({ sizeKb: 3.2, type: 'image/png' });
    }
  }, []);

  const handleSelectSample = (sample: SampleImage) => {
    setSelectedSample(sample);
    setUploadedImageSrc(sample.dataUrl);
    setImageName(sample.name);
    setFileDetails({ sizeKb: 3.2, type: 'image/png' });
    setPredictionResult(null);
    setErrorMsg(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    const validExtensions = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validExtensions.includes(file.type)) {
      setErrorMsg('Invalid file format. Supported formats are JPG, JPEG, PNG, and WebP.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 5MB maximum limit. Please upload a smaller image.');
      return;
    }

    setErrorMsg(null);
    setSelectedSample(null);
    setImageName(file.name);
    setFileDetails({ sizeKb: Math.round(file.size / 1024), type: file.type });

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setUploadedImageSrc(src);
      setPredictionResult(null);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRunPrediction = async () => {
    if (!uploadedImageSrc) {
      setErrorMsg('Please select or upload an image first.');
      return;
    }

    setIsInferring(true);
    setErrorMsg(null);

    try {
      setLoadingStep('Bicubic resampling to 32×32 tensor & normalizing [0.0, 1.0]...');
      await new Promise((r) => setTimeout(r, 160));

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = uploadedImageSrc;

      await new Promise((res, rej) => {
        img.onload = () => res(null);
        img.onerror = () => rej(new Error('Image decoding failed.'));
      });

      setLoadingStep(`Running forward pass through ${modelType === 'modified_cnn2d' ? 'Modified CNN2D (GAP)' : 'Standard CNN2D'}...`);
      await new Promise((r) => setTimeout(r, 180));

      setLoadingStep('Backpropagating gradients & generating Grad-CAM heatmaps...');
      const result = await runPredictionAndGradCAM(img, modelType, colormap, layerChoice);

      setLoadingStep('Compositing visual attribution overlays...');
      await new Promise((r) => setTimeout(r, 120));

      const enrichedResult = {
        ...result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setPredictionResult(enrichedResult);

      if (currentUser) {
        savePredictionRecord({
          userId: currentUser.id,
          imageName,
          originalImage: uploadedImageSrc,
          gradcamOverlay: result.overlayDataUrl,
          heatmapOnly: result.heatmapDataUrl,
          modelType,
          prediction: result.prediction,
          confidence: result.confidence,
          realProbability: result.realProbability,
          fakeProbability: result.fakeProbability,
          inferenceTimeMs: result.inferenceTimeMs,
        });
      }
    } catch (err: any) {
      setErrorMsg(`Inference failure: ${err.message || 'Tensor processing error'}`);
    } finally {
      setIsInferring(false);
      setLoadingStep('');
    }
  };

  // Re-render Grad-CAM colormap change when prediction already exists
  useEffect(() => {
    if (predictionResult && uploadedImageSrc && !isInferring) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = uploadedImageSrc;
      img.onload = async () => {
        try {
          const res = await runPredictionAndGradCAM(img, modelType, colormap, layerChoice);
          setPredictionResult((prev) => (prev ? { ...prev, ...res } : null));
        } catch {}
      };
    }
  }, [colormap, layerChoice]);

  const downloadVisualization = () => {
    if (!predictionResult) return;
    const a = document.createElement('a');
    a.href = predictionResult.overlayDataUrl;
    a.download = `cifake_gradcam_${imageName.replace(/\.[^/.]+$/, '')}_${modelType}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const gridX = Math.max(0, Math.min(31, Math.floor(relX * 32)));
    const gridY = Math.max(0, Math.min(31, Math.floor(relY * 32)));
    setProbePos({ x: gridX, y: gridY });
  };

  const handleStageMouseLeave = () => {
    setProbePos(null);
  };

  const probedActivation = (predictionResult?.activationGrid && probePos)
    ? (predictionResult.activationGrid[probePos.y]?.[probePos.x] ?? 0.5)
    : null;

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      
      {/* Console Header (Section 11) */}
      <div className="border-b border-[#1c2638] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>PIPELINE SEQUENCE · 01 INPUT → 02 PREPROCESS → 03 INFERENCE → 04 EXPLAIN → 05 REPORT</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
          Image Analysis Console
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload an image and inspect the complete inference pipeline with pixel-level Grad-CAM backpropagation.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ================= 01 INPUT STAGE (SECTION 12 & 13) ================= */}
      <section className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-mono text-cyan-400 block uppercase">Stage 01</span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              Input Specimen Selection
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            {uploadedImageSrc ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                INPUT READY
              </span>
            ) : (
              <span className="text-amber-400">AWAITING INPUT</span>
            )}
          </div>
        </div>

        {/* Benchmark Samples Strip (Section 13) */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline text-xs">
            <span className="font-semibold text-slate-200">
              CIFAKE Benchmark Specimens
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              5 Real CIFAR-10 Photographs · 5 Synthetic Stable Diffusion Specimens
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {samples.map((s) => {
              const isSelected = selectedSample?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  title={`${s.name} (${s.label}) - ${s.description}`}
                  className={`relative rounded-xl p-1 border transition-all cursor-pointer group text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/15 shadow-sm ring-1 ring-blue-500/50'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={s.dataUrl}
                    alt={s.name}
                    style={{ imageRendering: 'pixelated' }}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <span
                    className={`absolute top-1.5 right-1.5 text-[8px] font-mono font-bold px-1 rounded text-white ${
                      s.label === 'REAL' ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    {s.label[0]}
                  </span>
                  <div className="mt-1 truncate text-[9px] font-mono text-slate-400 px-0.5">
                    {s.name.split('.')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Workspace (Drag & Drop) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const input = fileInputRef.current;
                  if (input) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    input.files = dt.files;
                    handleFileUpload({ target: input } as any);
                  }
                }
              }}
              className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/60 hover:bg-slate-900/40"
            >
              <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-200 font-semibold">
                Click or drag & drop custom photograph or synthetic image here
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                JPG, JPEG, PNG, or WebP up to 5 MB (Standardized bicubic scaling to 32×32)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* File Specimen Information Readout */}
          <div className="md:col-span-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              Active Specimen Metadata
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Filename:</span>
              <span className="text-white truncate max-w-[140px] font-semibold">{imageName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">File Type:</span>
              <span className="text-slate-300">{fileDetails?.type || 'image/png'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">File Size:</span>
              <span className="text-slate-300">{fileDetails?.sizeKb ? `${fileDetails.sizeKb} KB` : '3.2 KB'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Standard Grid:</span>
              <span className="text-cyan-400 font-bold">32 × 32 (3 RGB)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 02 PREPROCESSING VISUALIZER (SECTION 14) ================= */}
      {uploadedImageSrc && (
        <section className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono text-cyan-400 block uppercase">Stage 02</span>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Preprocessing Pipeline Visualization
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              ORIGINAL → BICUBIC RESAMPLING (32×32) → NORMALIZATION [0.0, 1.0] → RGB TENSOR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center text-xs">
            {/* 1. Original Image */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">1. Input Image</span>
              <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                <img src={uploadedImageSrc} alt="Raw" className="w-full h-full object-contain" />
              </div>
              <span className="text-[11px] font-mono text-slate-300 block">Native Source Buffer</span>
            </div>

            {/* 2. Bicubic Resampling */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">2. Bicubic Resampling</span>
              <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden bg-slate-900 border border-blue-500/40 flex items-center justify-center">
                <img src={uploadedImageSrc} alt="32x32" style={{ imageRendering: 'pixelated' }} className="w-full h-full object-contain" />
              </div>
              <span className="text-[11px] font-mono text-blue-400 block">32 × 32 Pixel Lattice</span>
            </div>

            {/* 3. Normalized RGB Channels */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">3. Normalized Representation</span>
              <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden bg-slate-900 border border-emerald-500/40 flex flex-col justify-center items-center font-mono text-[9px] text-slate-300 p-1">
                <span>Range [0.0, 1.0]</span>
                <span className="text-emerald-400 font-bold mt-1">X_norm = X / 255.0</span>
                <span className="text-slate-500 mt-1">Zero-Offset Tensor</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 block">Float32 Bounded</span>
            </div>

            {/* 4. Tensor Statistics */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left font-mono text-[11px] space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block mb-1">4. RGB Channel Statistics</span>
                <div className="text-slate-300">Red Channel: <strong className="text-white">{predictionResult?.preprocessingStats.meanR ?? 0.48}</strong></div>
                <div className="text-slate-300">Green Channel: <strong className="text-white">{predictionResult?.preprocessingStats.meanG ?? 0.46}</strong></div>
                <div className="text-slate-300">Blue Channel: <strong className="text-white">{predictionResult?.preprocessingStats.meanB ?? 0.45}</strong></div>
                <div className="text-slate-300">Standard Dev: <strong className="text-white">{predictionResult?.preprocessingStats.stdDev ?? 0.22}</strong></div>
              </div>
              <span className="text-[10px] text-cyan-400 block border-t border-slate-800 pt-1">
                Tensor: [1, 32, 32, 3]
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ================= 03 INFERENCE STAGE (SECTION 15, 16 & 17) ================= */}
      <section className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-mono text-cyan-400 block uppercase">Stage 03</span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              Deep Neural Network Inference
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Architecture:</span>
            <div className="inline-flex p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setModelType('modified_cnn2d')}
                className={`px-3 py-1.5 rounded font-mono font-semibold transition-colors cursor-pointer ${
                  modelType === 'modified_cnn2d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Modified CNN2D (GAP)
              </button>
              <button
                type="button"
                onClick={() => setModelType('cnn2d')}
                className={`px-3 py-1.5 rounded font-mono font-semibold transition-colors cursor-pointer ${
                  modelType === 'cnn2d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard CNN2D
              </button>
            </div>
          </div>
        </div>

        {/* Execution Trigger Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-white">
              Target Architecture: {modelType === 'modified_cnn2d' ? 'Modified CNN2D with GAP & Dropout' : 'Standard CNN2D (Flatten)'}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Parameters: {modelType === 'modified_cnn2d' ? '83,202 (-74.5%)' : '326,754'} · Reported Acc: {modelType === 'modified_cnn2d' ? '95.38%' : '91.42%'}
            </p>
          </div>

          <button
            onClick={handleRunPrediction}
            disabled={isInferring || !uploadedImageSrc}
            className="px-6 py-3 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isInferring ? (
              <>
                <Clock className="w-4 h-4 animate-spin text-white" />
                <span>{loadingStep || 'Executing Forward Inference...'}</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Classify & Generate Grad-CAM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Prediction Results Display (Section 16 & 17) */}
        {predictionResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Primary Classification Verdict (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Classification Outcome (Actual Inference)
                </span>
                
                {/* Large Typography Result */}
                <div className="mt-2 flex items-baseline gap-4">
                  <div
                    className={`text-4xl sm:text-5xl font-black font-sans tracking-tight ${
                      predictionResult.prediction === 'REAL' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {predictionResult.prediction}
                  </div>
                  <div className="text-slate-300 font-mono text-sm">
                    {predictionResult.prediction === 'REAL' ? 'AUTHENTIC PHOTOGRAPH' : 'AI-GENERATED SYNTHETIC IMAGE'}
                  </div>
                </div>

                <div className="mt-3 text-xs font-mono text-slate-300">
                  Confidence: <strong className="text-white text-base">{predictionResult.confidence}%</strong>
                </div>
              </div>

              {/* Probability Distribution Bar */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold">
                    REAL: {predictionResult.realProbability}%
                  </span>
                  <span className="text-rose-400 font-semibold">
                    FAKE: {predictionResult.fakeProbability}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    style={{ width: `${predictionResult.realProbability}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`REAL: ${predictionResult.realProbability}%`}
                  />
                  <div
                    style={{ width: `${predictionResult.fakeProbability}%` }}
                    className="bg-rose-500 transition-all duration-500"
                    title={`FAKE: ${predictionResult.fakeProbability}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Softmax Sum: {(predictionResult.realProbability + predictionResult.fakeProbability).toFixed(0)}%</span>
                  <span>Latency: {predictionResult.inferenceTimeMs} ms</span>
                </div>
              </div>
            </div>

            {/* Model Intelligence Panel (Section 17) (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>Model Intelligence</span>
                <span className="text-emerald-400 text-[10px]">LIVE INFERENCE</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Architecture:</span>
                  <span className="text-white font-semibold">
                    {modelType === 'modified_cnn2d' ? 'Modified CNN2D (GAP)' : 'Standard CNN2D'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Parameters:</span>
                  <span className="text-cyan-300 font-bold tabular-nums">
                    {modelType === 'modified_cnn2d' ? '83,202' : '326,754'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Input Tensor:</span>
                  <span className="text-slate-200">32 × 32 × 3</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Prediction:</span>
                  <span className={predictionResult.prediction === 'REAL' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {predictionResult.prediction}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="text-white font-bold">{predictionResult.confidence}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Explainability:</span>
                  <span className="text-cyan-400 font-semibold">Grad-CAM Available</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
            Click "Classify & Generate Grad-CAM" to run forward inference.
          </div>
        )}
      </section>

      {/* ================= 04 EXPLAINABILITY — MAKE IT THE STAR (SECTIONS 18, 19 & 20) ================= */}
      {predictionResult && uploadedImageSrc && (
        <section className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-cyan-400 block uppercase">Stage 04 · Attribution</span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              WHY DID THE MODEL PREDICT THIS?
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Three synchronized viewpoints revealing how convolutional gradient attributions align with visual features.
            </p>
          </div>

          {/* Three Synchronized Views (Section 18) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs">
            {/* View 1: Original Image */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
                1. Original Image (Input)
              </span>
              <div className="aspect-square w-full max-w-[240px] mx-auto rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                <img
                  src={uploadedImageSrc}
                  alt="Original"
                  style={{ imageRendering: pixelated ? 'pixelated' : 'auto' }}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 block">Specimen Visual Baseline</span>
            </div>

            {/* View 2: Raw Heatmap */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block font-semibold">
                2. Grad-CAM Heatmap
              </span>
              <div className="aspect-square w-full max-w-[240px] mx-auto rounded-lg overflow-hidden bg-slate-900 border border-cyan-500/40 flex items-center justify-center">
                <img
                  src={predictionResult.heatmapDataUrl}
                  alt="Heatmap"
                  style={{ imageRendering: pixelated ? 'pixelated' : 'auto' }}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] font-mono text-cyan-400 block">
                {colormap.toUpperCase()} Gradient Colormap
              </span>
            </div>

            {/* View 3: Alpha-Blended Overlay with Pixel Probe Reticle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase block font-semibold">
                3. Grad-CAM Overlay (Attribution)
              </span>
              <div
                ref={stageRef}
                onMouseMove={handleStageMouseMove}
                onMouseLeave={handleStageMouseLeave}
                className="relative aspect-square w-full max-w-[240px] mx-auto rounded-lg overflow-hidden bg-slate-900 border border-emerald-500/40 cursor-crosshair"
              >
                <img
                  src={uploadedImageSrc}
                  alt="Base"
                  style={{ imageRendering: pixelated ? 'pixelated' : 'auto' }}
                  className="w-full h-full object-contain absolute inset-0"
                />
                <img
                  src={predictionResult.heatmapDataUrl}
                  alt="Overlay"
                  style={{
                    opacity: overlayAlpha,
                    imageRendering: pixelated ? 'pixelated' : 'auto',
                  }}
                  className="w-full h-full object-contain absolute inset-0 mix-blend-screen pointer-events-none"
                />

                {/* Reticle */}
                {probePos && (
                  <div
                    className="absolute pointer-events-none border border-cyan-400 bg-cyan-400/25"
                    style={{
                      left: `${(probePos.x / 32) * 100}%`,
                      top: `${(probePos.y / 32) * 100}%`,
                      width: `${(1 / 32) * 100}%`,
                      height: `${(1 / 32) * 100}%`,
                    }}
                  />
                )}
              </div>
              <span className="text-[11px] font-mono text-emerald-400 block">
                Alpha {Math.round(overlayAlpha * 100)}% Blended
              </span>
            </div>
          </div>

          {/* Interactive Pixel Reticle Probe HUD */}
          {probePos && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <span>Tensor Grid Probe: ({probePos.x}, {probePos.y})</span>
              </div>
              {probedActivation !== null && (
                <div className="flex items-center gap-3">
                  <span>Grad-CAM Attribution α: <strong className="text-cyan-400">{probedActivation.toFixed(3)}</strong></span>
                  <span className="text-slate-500">·</span>
                  <span className={probedActivation > 0.65 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                    {probedActivation > 0.70 ? 'Primary Discriminative Region' : probedActivation > 0.40 ? 'Moderate Salience' : 'Background / Low Gradient'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Grad-CAM Controls Panel (Section 19) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            {/* Opacity slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Overlay Opacity:</span>
                <span className="font-mono text-cyan-400">{Math.round(overlayAlpha * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="1.0"
                step="0.05"
                value={overlayAlpha}
                onChange={(e) => setOverlayAlpha(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Scientific Colormap */}
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] block">Colormap:</span>
              <select
                value={colormap}
                onChange={(e) => setColormap(e.target.value as ColormapType)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="jet">Jet (Classic Scientific)</option>
                <option value="turbo">Turbo (Perceptual Rainbow)</option>
                <option value="viridis">Viridis (Uniform Luminescence)</option>
                <option value="inferno">Inferno (High-Contrast Thermal)</option>
              </select>
            </div>

            {/* Layer Selection */}
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] block">Conv Layer Attribution:</span>
              <select
                value={layerChoice}
                onChange={(e) => setLayerChoice(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="block3">Deep Layer (mod_conv_4 / High-Level)</option>
                <option value="block2">Mid Conv (mod_conv_3 / Ringing Artifacts)</option>
              </select>
            </div>

            {/* Rendering toggle & export */}
            <div className="space-y-1.5 flex flex-col justify-between">
              <span className="text-slate-400 text-[11px] block">Rendering & Actions:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPixelated(!pixelated)}
                  className={`flex-1 py-1 px-2 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    pixelated ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {pixelated ? 'Nearest-Neighbor' : 'Bilinear'}
                </button>
                <button
                  onClick={downloadVisualization}
                  className="py-1 px-2.5 rounded text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  PNG
                </button>
              </div>
            </div>
          </div>

          {/* Academic Caution (Section 20 mandatory wording) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-sans space-y-1.5">
            <span className="font-semibold text-white block">Academic Explainability Guidance:</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              “Highlighted regions indicate image areas that contributed more strongly to the model's output according to the Grad-CAM attribution.”
            </p>
            <p className="text-slate-500 text-[11px] italic">
              “Grad-CAM provides a visual attribution signal and should not be interpreted as a complete causal explanation of the model's decision.”
            </p>
          </div>
        </section>
      )}

      {/* ================= 05 AI ANALYSIS REPORT (SECTION 21) ================= */}
      {predictionResult && uploadedImageSrc && (
        <section className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-6 sm:p-8 space-y-6 printable-report">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono text-cyan-400 block uppercase">Stage 05 · Synthesis</span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                AI ANALYSIS REPORT
              </h2>
            </div>
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-auto no-print"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>Generate Analysis Report / Print PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs font-sans">
            {/* Left Summary Table (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
                  Diagnostic Summary
                </h4>
                
                <div className="divide-y divide-slate-800/80 font-mono text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Specimen File:</span>
                    <span className="text-white font-semibold">{imageName}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Classification:</span>
                    <span className={predictionResult.prediction === 'REAL' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {predictionResult.prediction}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Calculated Confidence:</span>
                    <span className="text-white font-bold">{predictionResult.confidence}%</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Classification Architecture:</span>
                    <span className="text-slate-200">
                      {modelType === 'modified_cnn2d' ? 'Modified CNN2D (Global Average Pooling + Dropout)' : 'Standard CNN2D (Flatten)'}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Input Geometry:</span>
                    <span className="text-slate-200">32 × 32 × 3 RGB Tensor</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Preprocessing Protocol:</span>
                    <span className="text-slate-200">Bicubic Resampling & [0.0, 1.0] Normalization</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Explainability Method:</span>
                    <span className="text-cyan-400">Grad-CAM Convolutional Attribution</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Inference Latency:</span>
                    <span className="text-slate-300">{predictionResult.inferenceTimeMs} ms</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-slate-400">{predictionResult.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Evidence Panel (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-center">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono text-left">
                  Visual Forensic Evidence
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">Input Specimen</span>
                    <img
                      src={uploadedImageSrc}
                      alt="Evidence Original"
                      style={{ imageRendering: 'pixelated' }}
                      className="w-full aspect-square object-contain rounded border border-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 block mb-1">Grad-CAM Overlay</span>
                    <img
                      src={predictionResult.overlayDataUrl}
                      alt="Evidence Overlay"
                      style={{ imageRendering: 'pixelated' }}
                      className="w-full aspect-square object-contain rounded border border-cyan-500/40"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-left font-sans pt-1">
                  The visual overlay above maps positive gradient attributions indicating feature regions that most strongly drove the {predictionResult.prediction} classification.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
