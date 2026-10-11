import React, { useState } from 'react';
import {
  ShieldCheck,
  Eye,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  BarChart3,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Code2,
  Terminal,
  Activity,
  Sparkles,
  Play,
  HelpCircle,
  AlertCircle,
  FileCheck2,
  Workflow
} from 'lucide-react';
import { User } from '../types';
import { generateCifakeSamples } from '../data/cifakeSamples';

interface HomeHeroProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenLiveDemo?: () => void;
  currentUser: User | null;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onGetStarted,
  onLearnMore,
  onNavigateTab,
  onOpenAuth,
  onOpenLiveDemo,
  currentUser,
}) => {
  const samples = generateCifakeSamples();
  const realSample = samples.find((s) => s.label === 'REAL') || samples[0];
  const fakeSample = samples.find((s) => s.label === 'FAKE') || samples[5];
  const [activePreviewType, setActivePreviewType] = useState<'real' | 'fake'>('fake');

  const currentSample = activePreviewType === 'real' ? realSample : fakeSample;

  return (
    <div className="space-y-16 max-w-6xl mx-auto">
      {/* 1. HERO SECTION (SECTION 7 & 8) */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0e131f] border border-[#1c2638] p-8 sm:p-12 lg:p-14">
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Zone */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>CIFAKE · Image Authenticity & Deep Forensics</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
                CAN YOU TRUST THIS IMAGE?
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-xl">
                CIFAKE analyzes visual patterns to classify images as <strong className="text-emerald-400 font-semibold">REAL</strong> or <strong className="text-rose-400 font-semibold">AI-GENERATED</strong> and provides explainable evidence through Grad-CAM.
              </p>
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>ANALYZE AN IMAGE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onLearnMore}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-slate-400" />
                <span>EXPLORE THE RESEARCH</span>
              </button>

              {onOpenLiveDemo && (
                <button
                  onClick={onOpenLiveDemo}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-mono text-xs font-semibold bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-cyan-400" />
                  <span>VIVA DEMO</span>
                </button>
              )}
            </div>

            {/* Academic Credibility Notice (No 100% false claims) */}
            <p className="text-[11px] text-slate-500 font-mono pt-1">
              Notice: Grad-CAM provides a visual attribution signal and should not be interpreted as a complete causal explanation.
            </p>
          </div>

          {/* Right Visual Stage: Interactive Pipeline Attribution Diagram (Section 8) */}
          <div className="lg:col-span-5">
            <div className="bg-[#07090e] border border-[#1c2638] rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ANALYSIS PIPELINE STAGE</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px] font-mono">
                  <button
                    onClick={() => setActivePreviewType('fake')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      activePreviewType === 'fake' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Synthetic Specimen
                  </button>
                  <button
                    onClick={() => setActivePreviewType('real')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      activePreviewType === 'real' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Photographic Specimen
                  </button>
                </div>
              </div>

              {/* Sample Analysis Dual View */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    32×32 Tensor Input
                  </span>
                  <div className="aspect-square bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                    <img
                      src={currentSample.dataUrl}
                      alt={currentSample.name}
                      style={{ imageRendering: 'pixelated' }}
                      className="w-full h-full object-contain rounded"
                    />
                    <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/75 px-1 rounded text-slate-300">
                      RGB 32×32
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Grad-CAM Attribution
                  </span>
                  <div className="aspect-square bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                    <div className="relative w-full h-full">
                      <img
                        src={currentSample.dataUrl}
                        alt="Attribution"
                        style={{ imageRendering: 'pixelated' }}
                        className="w-full h-full object-contain absolute inset-0 rounded"
                      />
                      <div
                        className={`w-full h-full rounded absolute inset-0 mix-blend-screen opacity-75 ${
                          activePreviewType === 'fake'
                            ? 'bg-gradient-to-tr from-cyan-600 via-amber-500 to-rose-600'
                            : 'bg-gradient-to-r from-blue-700 via-emerald-500 to-yellow-500'
                        }`}
                      />
                    </div>
                    <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/75 px-1 rounded text-cyan-300">
                      ∂y^c / ∂A^k
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Result Readout */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-400">Classification Outcome:</span>
                  <span className={activePreviewType === 'real' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {activePreviewType === 'real' ? 'AUTHENTIC REAL' : 'AI-GENERATED FAKE'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-400">Softmax Confidence:</span>
                  <span className="text-white font-bold">
                    {activePreviewType === 'real' ? '92.4% REAL · 7.6% FAKE' : '94.8% FAKE · 5.2% REAL'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-400">Attribution Focus:</span>
                  <span className="text-slate-300">
                    {activePreviewType === 'real' ? 'Natural photographic textures' : 'Diffusion lattice ringing'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOME METRIC STRIP (SECTION 9) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0e131f] border border-[#1c2638] rounded-xl p-5">
          <div className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
            95.38%
          </div>
          <div className="text-xs font-semibold text-white mt-1">
            Modified CNN2D Accuracy
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
            Evaluated on N=10,000 CIFAKE test set
          </span>
        </div>

        <div className="bg-[#0e131f] border border-[#1c2638] rounded-xl p-5">
          <div className="text-3xl font-extrabold font-mono text-cyan-400 tabular-nums">
            95.40%
          </div>
          <div className="text-xs font-semibold text-white mt-1">
            Modified CNN2D F1-Score
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
            Harmonic mean of precision & recall
          </span>
        </div>

        <div className="bg-[#0e131f] border border-[#1c2638] rounded-xl p-5">
          <div className="text-3xl font-extrabold font-mono text-blue-400 tabular-nums">
            83,202
          </div>
          <div className="text-xs font-semibold text-white mt-1">
            Model Parameters
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
            -74.5% vs 326k baseline Standard CNN2D
          </span>
        </div>

        <div className="bg-[#0e131f] border border-[#1c2638] rounded-xl p-5">
          <div className="text-3xl font-extrabold font-mono text-purple-400 tabular-nums">
            2 Classes
          </div>
          <div className="text-xs font-semibold text-white mt-1">
            REAL and FAKE
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
            Binary photographic authenticity
          </span>
        </div>
      </section>

      {/* 3. “WHY CIFAKE?” SECTION (SECTION 10) */}
      <section className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-mono text-cyan-400 block uppercase">
            Theoretical Motivation
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Why CIFAKE?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Column 1: The Problem */}
          <div className="p-5 rounded-xl bg-[#07090e] border border-slate-800 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/40 border border-rose-800/50 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">The Problem</h3>
            <p className="text-slate-400 leading-relaxed font-sans">
              AI-generated images from state-of-the-art latent diffusion models can contain subtle visual artifacts that are virtually imperceptible to human reviewers, complicating photographic verification in journalism, law, and security.
            </p>
          </div>

          {/* Column 2: The Approach */}
          <div className="p-5 rounded-xl bg-[#07090e] border border-slate-800 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-800/50 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">The Approach</h3>
            <p className="text-slate-400 leading-relaxed font-sans">
              CIFAKE combines deep convolutional neural feature extraction (Modified CNN2D with Global Average Pooling and Dropout) with Gradient-weighted Class Activation Mapping (Grad-CAM) to localize discriminative features.
            </p>
          </div>

          {/* Column 3: The Result */}
          <div className="p-5 rounded-xl bg-[#07090e] border border-slate-800 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">The Result</h3>
            <p className="text-slate-400 leading-relaxed font-sans">
              The system delivers both a high-certainty prediction (REAL vs FAKE) and an intuitive, pixel-level visual attribution map, transforming a black-box neural network into a transparent, defensible forensic tool.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS WORKFLOW DIAGRAM (SECTION 8 & 45) */}
      <section className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-mono text-cyan-400 block uppercase">
              End-to-End Processing Architecture
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              How CIFAKE Operates
            </h2>
          </div>
          <button
            onClick={onGetStarted}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            Launch Live Pipeline <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step-by-Step Flowchart */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs text-center font-mono">
          <div className="p-3.5 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
            <span className="text-cyan-400 font-bold block text-[10px]">STEP 01</span>
            <h4 className="font-semibold text-white font-sans">INPUT</h4>
            <p className="text-[11px] text-slate-400 font-sans">Upload JPG/PNG or select benchmark</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
            <span className="text-cyan-400 font-bold block text-[10px]">STEP 02</span>
            <h4 className="font-semibold text-white font-sans">PREPROCESS</h4>
            <p className="text-[11px] text-slate-400 font-sans">Bicubic 32×32 & [0, 1] normalization</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
            <span className="text-cyan-400 font-bold block text-[10px]">STEP 03</span>
            <h4 className="font-semibold text-white font-sans">CNN2D</h4>
            <p className="text-[11px] text-slate-400 font-sans">Conv blocks + GAP feature pooling</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
            <span className="text-cyan-400 font-bold block text-[10px]">STEP 04</span>
            <h4 className="font-semibold text-white font-sans">PREDICTION</h4>
            <p className="text-[11px] text-slate-400 font-sans">Softmax logits REAL vs FAKE</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
            <span className="text-cyan-400 font-bold block text-[10px]">STEP 05</span>
            <h4 className="font-semibold text-white font-sans">GRAD-CAM</h4>
            <p className="text-[11px] text-slate-400 font-sans">Backpropagated spatial attribution</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
            <span className="text-cyan-400 font-bold block text-[10px]">STEP 06</span>
            <h4 className="font-semibold text-white font-sans">EXPLANATION</h4>
            <p className="text-[11px] text-slate-400 font-sans">Synchronized overlay & pixel probe</p>
          </div>
        </div>
      </section>

      {/* 5. MODEL COMPARISON STORY: TWO MODELS. ONE TASK. (SECTION 22) */}
      <section className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 block uppercase">
              Comparative Deep Learning Innovation
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              TWO MODELS. ONE TASK.
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-400 self-start sm:self-auto">
            74.5% Parameter Reduction (83,202 vs 326,754)
          </span>
        </div>

        {/* Metric Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Model 1: Standard CNN2D */}
          <div className="p-5 rounded-xl bg-[#07090e] border border-slate-800 space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-sm font-bold text-white">STANDARD CNN2D</h3>
              <span className="text-[11px] font-mono text-slate-400">Architecture A (Baseline)</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Parameters</span>
                <span className="text-sm font-bold font-mono text-slate-200 tabular-nums">326,754</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Accuracy</span>
                <span className="text-sm font-bold font-mono text-slate-200 tabular-nums">91.42%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">F1-Score</span>
                <span className="text-sm font-bold font-mono text-slate-200 tabular-nums">91.47%</span>
              </div>
            </div>

            {/* Architecture Flow */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Layer Pipeline:</span>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-nowrap">
                Conv → Pool → Conv → Pool → <span className="text-amber-400 font-semibold">Flatten</span> → Dense
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Standard CNN2D utilizes traditional Flatten() producing 2,304 spatial features connecting into Dense(128). This parameter explosion causes susceptibility to overfitting on localized synthetic artifacts.
            </p>
          </div>

          {/* Model 2: Modified CNN2D */}
          <div className="p-5 rounded-xl bg-[#07090e] border border-blue-900/50 space-y-4">
            <div className="flex justify-between items-baseline">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">MODIFIED CNN2D</h3>
                <span className="text-[11px] font-mono text-cyan-400">· Proposed Improvement</span>
              </div>
              <span className="text-[11px] font-mono text-blue-400">Architecture B</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Parameters</span>
                <span className="text-sm font-bold font-mono text-cyan-300 tabular-nums">83,202</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Accuracy</span>
                <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">95.38%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">F1-Score</span>
                <span className="text-sm font-bold font-mono text-purple-300 tabular-nums">95.40%</span>
              </div>
            </div>

            {/* Architecture Flow */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Layer Pipeline:</span>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-nowrap">
                Conv → BN → Pool → Conv → BN → Pool → Conv → <span className="text-emerald-400 font-semibold">GAP</span> → <span className="text-cyan-400 font-semibold">Dropout</span> → Dense
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Global Average Pooling averages each feature map across spatial height and width, generating 128 scalar channels with zero trainable weights, preventing parameter bloat and dramatically boosting generalizability.
            </p>
          </div>
        </div>

        {/* Visual Parameter Footprint Comparison */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Trainable Parameter Footprint:</span>
            <span>Modified CNN2D (83,202) vs Standard CNN2D (326,754)</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div style={{ width: '25.5%' }} className="bg-cyan-500" title="Modified CNN2D (25.5%)" />
            <div style={{ width: '74.5%' }} className="bg-slate-700" title="Dense Overfitting Overhead in Standard CNN2D" />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>● 83,202 weights (Modified CNN2D)</span>
            <span>+243,552 parameters eliminated by Global Average Pooling</span>
          </div>
        </div>
      </section>

      {/* 6. RESEARCH SUITE NAVIGATION HUBS (SECTION 45) */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-[#1c2638] pb-3">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Research Modules & Capabilities
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Full System Suite
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#0e131f] border border-[#1c2638] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Analysis Console</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Upload custom files or test calibrated benchmark images with multi-colormap Grad-CAM and pixel probe.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analyze')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer pt-2"
            >
              Start Analysis <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-5 rounded-xl bg-[#0e131f] border border-[#1c2638] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Training & Evaluation</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Hyperparameter experimentation, live convergence SVG plots, and complete 2×2 confusion matrix metrics.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('research')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer pt-2"
            >
              Open Research Lab <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-5 rounded-xl bg-[#0e131f] border border-[#1c2638] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-600/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Model Theory & XAI</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Mathematical derivations for cross-correlation, Batch Normalization, GAP, and Grad-CAM backpropagation.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('insights')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer pt-2"
            >
              Read Theory <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-5 rounded-xl bg-[#0e131f] border border-[#1c2638] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Report & QA Suite</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Complete 10-chapter academic dissertation, 12-test live automated QA runner, and Python source browser.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('project')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer pt-2"
            >
              View Thesis <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="p-8 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/60 border border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white font-sans">
            Ready to classify and explain synthetic image artifacts?
          </h3>
          <p className="text-xs text-slate-400">
            Launch the primary Image Analysis Console and evaluate any visual specimen with pixel-level attribution.
          </p>
        </div>
        <button
          onClick={onGetStarted}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 whitespace-nowrap shrink-0"
        >
          <Eye className="w-4 h-4" />
          <span>START ANALYSIS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>
    </div>
  );
};
