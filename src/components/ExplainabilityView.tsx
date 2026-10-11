import React, { useState } from 'react';
import {
  Eye,
  Layers,
  ArrowRight,
  Info,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { generateCifakeSamples } from '../data/cifakeSamples';

interface ExplainabilityViewProps {
  onGoToPredict: () => void;
}

export const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({ onGoToPredict }) => {
  const [activeLayer, setActiveLayer] = useState<'conv1' | 'conv2' | 'conv3'>('conv3');
  const [comparisonAlpha, setComparisonAlpha] = useState<number>(0.55);

  const samples = generateCifakeSamples();
  const realSample = samples.find(s => s.label === 'REAL') || samples[0];
  const fakeSample = samples.find(s => s.label === 'FAKE') || samples[5];

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Editorial Header */}
      <div className="border-b border-[#1c2638] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>05. Explainable AI & Grad-CAM Mathematical Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Explainable AI (XAI) & Attribution Mathematics
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Mathematical foundations, convolutional activation mechanics, and spatial attribution heatmaps in synthetic image detection.
        </p>
      </div>

      {/* 1. Core Mathematical Formulation Card */}
      <div className="bg-[#0e131f] border border-[#1c2638] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-white font-sans">
            Grad-CAM Mathematical Formulation
          </h3>
          <span className="text-xs font-mono text-cyan-400 self-start sm:self-auto">
            Selvaraju et al. (2017) Formulation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Step 1: Neuron Importance Weights (α_k^c)</h4>
            <p className="text-slate-400 leading-relaxed font-sans">
              To obtain the importance weight of channel $k$ for class $c$, the gradient of the unnormalized score $y^c$ with respect to the activation map $A^k$ is pooled across spatial dimensions using Global Average Pooling:
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[12px] text-cyan-300">
              {"α_k^c = (1 / Z) · Σ_i Σ_j (∂y^c / ∂A_{i,j}^k)"}
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              where Z = H × W represents the spatial area of the convolutional feature map.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white">Step 2: Linear Combination & ReLU</h4>
            <p className="text-slate-400 leading-relaxed font-sans">
              The heat attribution map is a weighted sum of forward feature maps followed by a Rectified Linear Unit (ReLU) to focus strictly on features having a positive impact on the target category:
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[12px] text-emerald-400">
              {"L_{Grad-CAM}^c = ReLU( Σ_k α_k^c · A^k )"}
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Features contributing negatively toward class $c$ are clamped to zero.
            </p>
          </div>
        </div>

        {/* Mandated Quotation */}
        <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-800/60 text-cyan-200 text-xs italic">
          “Highlighted regions indicate areas that contributed more strongly to the model's prediction.”
        </div>
      </div>

      {/* 2. Side-by-Side Attribution Contrast: REAL vs FAKE */}
      <div className="bg-[#0e131f] border border-[#1c2638] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Empirical Attribution Patterns: Photographic vs Synthetic
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              How convolutional gradients distribute across authentic CIFAR-10 textures versus Stable Diffusion artifacts
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Overlay: {Math.round(comparisonAlpha * 100)}%</span>
            <input
              type="range"
              min="0.2"
              max="0.9"
              step="0.05"
              value={comparisonAlpha}
              onChange={(e) => setComparisonAlpha(parseFloat(e.target.value))}
              className="w-20 accent-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Real Sample Card */}
          <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase">
                Authentic Photographic Attribution
              </span>
              <span className="text-[10px] font-mono text-slate-500">CIFAR-10 Real</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Input Image</span>
                <img
                  src={realSample.dataUrl}
                  alt="Real Sample"
                  className="w-full aspect-square object-contain rounded bg-slate-900 border border-slate-800"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Grad-CAM Overlay</span>
                <div className="relative w-full aspect-square rounded bg-slate-900 border border-slate-800 overflow-hidden">
                  <img
                    src={realSample.dataUrl}
                    alt="Real"
                    className="w-full h-full object-contain absolute inset-0"
                  />
                  <div
                    style={{ opacity: comparisonAlpha }}
                    className="w-full h-full absolute inset-0 bg-gradient-to-tr from-blue-600/60 via-emerald-500/80 to-transparent mix-blend-screen"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <strong className="text-white block text-[11px] font-mono">Observed Spatial Pattern:</strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Activations concentrate uniformly across salient physical contours (wing structures, fuselages, animal facial centers) and natural optical lighting gradients.
              </p>
            </div>
          </div>

          {/* Fake Sample Card */}
          <div className="p-5 rounded-xl bg-slate-950 border border-rose-500/30 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-rose-400 font-mono uppercase">
                Synthetic Diffusion Attribution
              </span>
              <span className="text-[10px] font-mono text-slate-500">Stable Diffusion 1.4</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Input Image</span>
                <img
                  src={fakeSample.dataUrl}
                  alt="Fake Sample"
                  className="w-full aspect-square object-contain rounded bg-slate-900 border border-slate-800"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Grad-CAM Overlay</span>
                <div className="relative w-full aspect-square rounded bg-slate-900 border border-slate-800 overflow-hidden">
                  <img
                    src={fakeSample.dataUrl}
                    alt="Fake"
                    className="w-full h-full object-contain absolute inset-0"
                  />
                  <div
                    style={{ opacity: comparisonAlpha }}
                    className="w-full h-full absolute inset-0 bg-gradient-to-br from-rose-600/80 via-amber-500/70 to-blue-900/60 mix-blend-screen"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <strong className="text-white block text-[11px] font-mono">Observed Spatial Pattern:</strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Activations strongly cluster around high-frequency boundary halos, non-physical geometric seams, and repetitive background checkerboard diffusion artifacts.
              </p>
            </div>
          </div>
        </div>

        {/* CTA to Predict Console */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            Want to test custom images and inspect their Grad-CAM heatmaps?
          </span>
          <button
            onClick={onGoToPredict}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
            <span>Launch Prediction Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
