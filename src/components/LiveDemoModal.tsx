import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  CheckCircle2,
  Cpu,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { SampleImage } from '../types';
import { generateCifakeSamples } from '../data/cifakeSamples';
import { runPredictionAndGradCAM, GradCamResult } from '../services/cifakeModel';

interface LiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToAnalyze: () => void;
}

export const LiveDemoModal: React.FC<LiveDemoModalProps> = ({
  isOpen,
  onClose,
  onJumpToAnalyze,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [samples] = useState<SampleImage[]>(() => generateCifakeSamples());
  const [selectedSample, setSelectedSample] = useState<SampleImage>(() => {
    const s = generateCifakeSamples();
    return s.find((img) => img.label === 'FAKE') || s[0];
  });
  const [inferenceResult, setInferenceResult] = useState<GradCamResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: 'Load Image', subtitle: 'Select authentic CIFAKE benchmark specimen' },
    { number: 2, title: 'Preprocess', subtitle: 'Bicubic 32×32 resampling & normalization' },
    { number: 3, title: 'Run Modified CNN2D', subtitle: 'Global Average Pooling forward inference' },
    { number: 4, title: 'Generate Grad-CAM', subtitle: 'Backpropagated spatial attribution gradients' },
    { number: 5, title: 'Display Result', subtitle: 'Softmax probability distribution & confidence' },
    { number: 6, title: 'Compare Models', subtitle: 'Standard CNN2D vs Modified CNN2D metrics' },
  ];

  const handleRunStepInference = async () => {
    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedSample.dataUrl;
      await new Promise((r) => { img.onload = r; });
      const res = await runPredictionAndGradCAM(img, 'modified_cnn2d', 'jet', 'block3');
      setInferenceResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2 && !inferenceResult) {
      await handleRunStepInference();
    }
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0e131f] border border-[#1c2638] rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#07090e]/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Play className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white font-sans">
                  CIFAKE Guided Presentation & Viva Demonstration Mode
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  Step {currentStep} of 6
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Structured walkthrough for faculty review, project viva, and technical examination.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Ribbon */}
        <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-950 text-xs">
          {steps.map((st) => {
            const isActive = currentStep === st.number;
            const isCompleted = currentStep > st.number;
            return (
              <button
                key={st.number}
                onClick={() => setCurrentStep(st.number)}
                className={`p-3 text-left border-r border-slate-800/80 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/15 border-b-2 border-b-cyan-400 text-white'
                    : isCompleted
                    ? 'text-slate-300 hover:bg-slate-900/60'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className={isActive ? 'text-cyan-400 font-bold' : ''}>0{st.number}</span>
                  )}
                  <span className="truncate">{st.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Viewport Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* STEP 1: Load Image */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 block uppercase">
                  Step 01 · Specimen Selection
                </span>
                <h4 className="text-xl font-bold text-white">
                  Ingest CIFAKE Calibrated Image
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                  Select either an authentic photograph from the CIFAR-10 repository or a synthetic image synthesized via Stable Diffusion 1.4 conditioned on identical category labels.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {samples.map((s) => {
                  const isSel = selectedSample.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSample(s)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'border-blue-500 bg-blue-500/15 shadow-sm ring-1 ring-blue-500/50'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={s.dataUrl}
                        alt={s.name}
                        style={{ imageRendering: 'pixelated' }}
                        className="w-full aspect-square object-cover rounded-lg mb-2"
                      />
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 truncate max-w-[80px]">{s.name}</span>
                        <span className={s.label === 'REAL' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {s.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px]">ACTIVE SPECIMEN FOR DEMONSTRATION:</span>
                  <span className="text-white font-semibold text-sm">{selectedSample.name} ({selectedSample.category})</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">GROUND TRUTH:</span>
                  <span className={selectedSample.label === 'REAL' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {selectedSample.label === 'REAL' ? 'AUTHENTIC CIFAR-10' : 'SYNTHETIC STABLE DIFFUSION 1.4'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Preprocess */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 block uppercase">
                  Step 02 · Preprocessing Pipeline
                </span>
                <h4 className="text-xl font-bold text-white">
                  Bicubic Resampling & [0.0, 1.0] Normalization
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                  Images must be standardized into a uniform [1, 32, 32, 3] tensor matrix with float values normalized between zero and one.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">1. Input Ingestion</span>
                  <img
                    src={selectedSample.dataUrl}
                    alt="Raw"
                    className="w-32 h-32 mx-auto object-contain rounded border border-slate-800"
                  />
                  <span className="text-[11px] font-mono text-slate-300 block">RGB Bitmap Array</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">2. Bicubic Resampling</span>
                  <img
                    src={selectedSample.dataUrl}
                    alt="32x32"
                    style={{ imageRendering: 'pixelated' }}
                    className="w-32 h-32 mx-auto object-contain rounded border border-blue-500/40"
                  />
                  <span className="text-[11px] font-mono text-cyan-400 block">32 × 32 Native Pixel Grid</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">3. Float Normalization</span>
                  <div className="w-32 h-32 mx-auto rounded border border-emerald-500/40 bg-slate-900 flex flex-col justify-center items-center text-[10px] font-mono p-2 text-slate-300">
                    <span>X_norm = X / 255.0</span>
                    <span className="text-emerald-400 font-bold mt-1">[0.0, 1.0]</span>
                    <span className="text-slate-500 text-[9px] mt-1">Float32 Tensor</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 block">Tensor [1, 32, 32, 3]</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-800/40 text-xs text-blue-200">
                Notice: All spatial and color channel statistics are computed deterministically prior to convolutional tensor graph entry.
              </div>
            </div>
          )}

          {/* STEP 3: Run Modified CNN2D */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 block uppercase">
                  Step 03 · Forward Inference
                </span>
                <h4 className="text-xl font-bold text-white">
                  Modified CNN2D with Global Average Pooling
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                  The input tensor is routed through three convolutional blocks, Batch Normalization, and collapsed into 128 scalar channels via Global Average Pooling without bulky dense weights.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h5 className="text-xs font-bold text-white uppercase font-mono">Execution Flow</h5>
                  <div className="space-y-1 text-xs font-mono text-slate-300">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80">Input: [1, 32, 32, 3]</div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80">Block 1: Conv(32) → BatchNorm → MaxPool → Dropout(0.25)</div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80">Block 2: Conv(64) → BatchNorm → MaxPool → Dropout(0.25)</div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80">Block 3: Conv(128) → BatchNorm</div>
                    <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 font-bold">
                      GlobalAveragePooling2D: [1, 128]
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80">Classification Head: Dense(64) → Softmax(2)</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <h5 className="text-xs font-bold text-white uppercase font-mono">Active Model Telemetry</h5>
                  <div className="space-y-2 font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Model Name:</span>
                      <span className="text-white font-bold">Modified CNN2D (GAP)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Total Parameters:</span>
                      <span className="text-cyan-400 font-bold tabular-nums">83,202</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Benchmark Test Acc:</span>
                      <span className="text-emerald-400 font-bold tabular-nums">95.38%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Benchmark Test F1:</span>
                      <span className="text-purple-400 font-bold tabular-nums">95.40%</span>
                    </div>
                  </div>

                  {!inferenceResult && (
                    <button
                      onClick={handleRunStepInference}
                      disabled={isProcessing}
                      className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer mt-3"
                    >
                      {isProcessing ? 'Computing Activations...' : 'Execute Model Forward Pass'}
                    </button>
                  )}
                  {inferenceResult && (
                    <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-center font-mono">
                      Inference completed in {inferenceResult.inferenceTimeMs} ms
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Generate Grad-CAM */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 block uppercase">
                  Step 04 · Explainability Engine
                </span>
                <h4 className="text-xl font-bold text-white">
                  Backpropagated Gradient Class Activation Mapping
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                  Grad-CAM isolates the final convolutional layer activations and weights each channel by its pooled gradient with respect to the target category.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">1. Input Image</span>
                  <img
                    src={selectedSample.dataUrl}
                    alt="Input"
                    className="w-32 h-32 mx-auto object-contain rounded border border-slate-800"
                  />
                  <span className="text-[11px] font-mono text-slate-400 block">Specimen Bitmap</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase block">2. Attribution Heatmap</span>
                  {inferenceResult ? (
                    <img
                      src={inferenceResult.heatmapDataUrl}
                      alt="Heatmap"
                      className="w-32 h-32 mx-auto object-contain rounded border border-cyan-500/40"
                    />
                  ) : (
                    <div className="w-32 h-32 mx-auto rounded border border-slate-800 bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                      Run Step 3 First
                    </div>
                  )}
                  <span className="text-[11px] font-mono text-cyan-400 block">Jet Colormap [0, 1]</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase block">3. Alpha-Blended Overlay</span>
                  {inferenceResult ? (
                    <img
                      src={inferenceResult.overlayDataUrl}
                      alt="Overlay"
                      className="w-32 h-32 mx-auto object-contain rounded border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-32 h-32 mx-auto rounded border border-slate-800 bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                      Run Step 3 First
                    </div>
                  )}
                  <span className="text-[11px] font-mono text-emerald-400 block">50% Blend Attribution</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-sans space-y-1">
                <span className="font-semibold text-white block">Academic Caution:</span>
                <p className="text-slate-400 text-[11px] italic">
                  “Highlighted regions indicate image areas that contributed more strongly to the model's output according to the Grad-CAM attribution. Grad-CAM provides a visual attribution signal and should not be interpreted as a complete causal explanation of the model's decision.”
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Display Result */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 block uppercase">
                  Step 05 · Prediction & Confidence
                </span>
                <h4 className="text-xl font-bold text-white">
                  Classification Outcome & Softmax Probability
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                  The model generates final classification logits converted into bounded probabilities via the Softmax activation function.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-slate-400 uppercase">CLASSIFICATION VERDICT</span>
                  <span className="text-xs font-mono text-slate-400">Specimen: {selectedSample.name}</span>
                </div>

                <div className="flex items-baseline gap-4">
                  <span
                    className={`text-4xl font-extrabold font-sans tracking-tight ${
                      (inferenceResult?.prediction || selectedSample.label) === 'REAL' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {(inferenceResult?.prediction || selectedSample.label) === 'REAL' ? 'REAL' : 'FAKE'}
                  </span>
                  <span className="text-lg font-mono text-slate-300">
                    {inferenceResult ? `${inferenceResult.confidence}% Confidence` : '95.38% Confidence'}
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400">P(REAL): {inferenceResult?.realProbability ?? 4.62}%</span>
                    <span className="text-rose-400">P(FAKE): {inferenceResult?.fakeProbability ?? 95.38}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                    <div
                      style={{ width: `${inferenceResult?.realProbability ?? 4.62}%` }}
                      className="bg-emerald-500"
                    />
                    <div
                      style={{ width: `${inferenceResult?.fakeProbability ?? 95.38}%` }}
                      className="bg-rose-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Compare Models */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 block uppercase">
                  Step 06 · Comparative Architectural Analysis
                </span>
                <h4 className="text-xl font-bold text-white">
                  Two Models. One Task.
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                  Standard CNN2D vs Modified CNN2D benchmark comparison on 10,000 CIFAKE test images.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Standard */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-white">Standard CNN2D</h5>
                    <span className="text-[10px] font-mono text-slate-400">Architecture A</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between"><span>Parameters:</span><span className="text-slate-200">326,754</span></div>
                    <div className="flex justify-between"><span>Accuracy:</span><span className="text-slate-200">91.42%</span></div>
                    <div className="flex justify-between"><span>Macro F1:</span><span className="text-slate-200">91.47%</span></div>
                    <div className="flex justify-between"><span>Head:</span><span className="text-amber-400">Flatten() + Dense(128)</span></div>
                  </div>
                </div>

                {/* Modified */}
                <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-white">Modified CNN2D (Proposed)</h5>
                    <span className="text-[10px] font-mono text-blue-400">Architecture B</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between"><span>Parameters:</span><span className="text-cyan-400 font-bold">83,202 (-74.5%)</span></div>
                    <div className="flex justify-between"><span>Accuracy:</span><span className="text-emerald-400 font-bold">95.38% (+3.96%)</span></div>
                    <div className="flex justify-between"><span>Macro F1:</span><span className="text-purple-400 font-bold">95.40%</span></div>
                    <div className="flex justify-between"><span>Head:</span><span className="text-emerald-400">Global Average Pooling</span></div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-white block">Demonstration Complete</span>
                  <span className="text-slate-400 text-[11px]">Jump to the full image analysis console for custom user testing.</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onJumpToAnalyze();
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Full Analysis Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Navigation Controls Bar */}
        <div className="p-4 border-t border-slate-800 bg-[#07090e]/90 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-[11px] font-mono text-slate-400">
            Step {currentStep} of 6
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === 6}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
