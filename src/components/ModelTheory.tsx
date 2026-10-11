import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Eye,
  Database,
  Shuffle,
  Grid3X3,
  HelpCircle,
  FileCheck,
  Zap,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Search,
  Filter
} from 'lucide-react';

interface TheoryTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  details: string[];
  formula?: string;
}

const THEORY_TOPICS: TheoryTopic[] = [
  {
    id: 'cifake',
    title: 'What is CIFAKE?',
    category: 'Dataset',
    summary: 'A standardized computer vision benchmark comprising 120,000 images (32×32 pixels, 3 RGB channels) for synthetic image detection research.',
    details: [
      'CIFAKE contains an equal split of 60,000 authentic images and 60,000 synthetic images.',
      'Authentic images are sampled from the CIFAR-10 repository across 10 classes: airplane, automobile, bird, cat, deer, dog, frog, horse, ship, and truck.',
      'Synthetic images were generated using Stable Diffusion 1.4 conditioned on identical CIFAR-10 class labels.',
      'The benchmark enables researchers to evaluate whether classifiers learn generalizable diffusion artifacts or overfit to specific prompt distributions.'
    ]
  },
  {
    id: 'real',
    title: 'What is a REAL Image?',
    category: 'Dataset',
    summary: 'Authentic photographic images captured via optical sensors (CCD/CMOS) containing physical light transport and natural camera noise.',
    details: [
      'Sourced directly from real-world photography in the CIFAR-10 dataset.',
      'Exhibits genuine camera sensor shot noise (Poisson distribution) and optical depth of field.',
      'Demonstrates physically consistent specular highlights, shadow penumbras, and natural micro-textures (fur, foliage, vehicle metallic grain).'
    ]
  },
  {
    id: 'synthetic',
    title: 'What is a Synthetic / AI-Generated Image?',
    category: 'Dataset',
    summary: 'Images synthesized using deep generative algorithms (specifically Latent Diffusion Models like Stable Diffusion 1.4).',
    details: [
      'Generated through an iterative reverse denoising process in latent representation space.',
      'Diffusion decoders leave characteristic spectral artifacts, including periodic lattice ringing and subtle grid discontinuities in the frequency domain.',
      'Frequently features semantic anomalies: blurred peripheral backgrounds, pupil shape asymmetry, unnatural skin smoothing, and warped geometric lines.'
    ]
  },
  {
    id: 'cnn',
    title: 'What is a Convolutional Neural Network (CNN)?',
    category: 'Deep Learning',
    summary: 'A specialized deep neural architecture designed to process grid-structured data through learnable shift-invariant spatial filters.',
    details: [
      'Replaces general matrix multiplications with discrete 2D cross-correlations in convolutional layers.',
      'Features parameter sharing: a single 3×3 kernel slides across the entire image, detecting edges, corners, and texture motifs anywhere in the frame.',
      'Hierarchical feature extraction: shallow layers detect low-level edges; deep layers capture complex semantic parts and diffusion boundary artifacts.'
    ]
  },
  {
    id: 'cnn2d',
    title: 'What is CNN2D?',
    category: 'Deep Learning',
    summary: 'A 2D spatial convolution operation where kernels slide across height and width dimensions simultaneously across RGB channels.',
    details: [
      'The standard building block for photographic analysis.',
      'Operates on tensors of shape [Batch, Height, Width, Channels].',
      'Preserves spatial locality while computing dot products between weights and local pixel receptive fields.'
    ],
    formula: 'S(i, j) = (I * K)(i, j) = Σ_m Σ_n I(i - m, j - n) · K(m, n)'
  },
  {
    id: 'maxpool',
    title: 'What is MaxPooling?',
    category: 'Architecture',
    summary: 'A spatial downsampling operation that extracts the maximum activation within a sliding window (e.g. 2×2 pool size).',
    details: [
      'Reduces spatial dimensions (e.g., from 32×32 to 16×16), cutting computational cost for downstream layers.',
      'Provides translation invariance: small spatial shifts in the input image do not alter the pooled feature representation.',
      'Discards 75% of activation values, retaining only the most salient filter responses.'
    ]
  },
  {
    id: 'batchnorm',
    title: 'What is BatchNormalization?',
    category: 'Architecture',
    summary: 'A normalization layer applied across mini-batches that stabilizes internal covariate shift and accelerates gradient convergence.',
    details: [
      'Normalizes layer inputs to zero mean and unit variance, then scales and shifts using learnable parameters γ and β.',
      'Smooths the loss landscape, enabling higher learning rates and reducing dependency on sensitive weight initializations.',
      'Acts as a mild regularizer, decreasing generalization error during training.'
    ],
    formula: 'y = γ · (x - μ_B) / √(σ_B² + ε) + β'
  },
  {
    id: 'flatten',
    title: 'What is Flatten?',
    category: 'Architecture',
    summary: 'A tensor reshaping operation that collapses multidimensional spatial feature maps into a single 1D feature vector.',
    details: [
      'Used in Standard CNN2D to bridge convolutional pooling outputs with dense classification layers.',
      'Limitation: An 8×8×64 feature map collapses into 4,096 scalar units, requiring huge parameter matrices connecting to dense layers.',
      'This parameter explosion makes traditional Flatten-based networks prone to overfitting on synthetic training noise.'
    ]
  },
  {
    id: 'gap',
    title: 'What is Global Average Pooling (GAP)?',
    category: 'Architecture',
    summary: 'A structural regularizer that averages each 2D feature map across its spatial dimensions, producing one scalar value per channel.',
    details: [
      'Replaces the bulky Flatten() + Dense() pipeline with spatial mean operations.',
      'Contains ZERO trainable parameters, drastically shrinking model footprint from 326k down to 83k weights.',
      'Enforces a direct structural relationship between convolutional feature maps and output categories, improving Grad-CAM interpretability.'
    ],
    formula: 'GAP_k = (1 / (H · W)) · Σ_i Σ_j A_{i, j}^k'
  },
  {
    id: 'dropout',
    title: 'What is Dropout?',
    category: 'Regularization',
    summary: 'A stochastic regularization technique that randomly zeros a fraction of neuron activations during forward training passes.',
    details: [
      'In Modified CNN2D, spatial dropout (25%) is applied after pooling, and dense dropout (40%) is applied before output classification.',
      'Prevents co-adaptation of specialized synthetic noise detectors, forcing individual filters to learn robust, independent features.',
      'At test time, all neurons remain active with weights scaled by (1 - p).'
    ]
  },
  {
    id: 'classification',
    title: 'What is Image Classification?',
    category: 'Inference',
    summary: 'The task of assigning an input image into one of discrete pre-defined categories (here: REAL vs FAKE).',
    details: [
      'The model maps an input tensor X ∈ R^{32×32×3} to a probability distribution over the label set {REAL, FAKE}.',
      'The final layer uses a Softmax function to ensure outputs are strictly non-negative and sum to 1.0.'
    ]
  },
  {
    id: 'confidence',
    title: 'What is Confidence?',
    category: 'Inference',
    summary: 'The maximum predicted class probability expressed as a percentage, reflecting model certainty.',
    details: [
      'Evaluated as Confidence = max(P_real, P_fake) × 100%.',
      'A prediction with 98% confidence reflects strong alignment with the model learned weights.',
      'Values near 50% indicate boundary ambiguity between photographic film grain and subtle diffusion textures.'
    ]
  },
  {
    id: 'gradcam',
    title: 'What is Grad-CAM?',
    category: 'Explainability',
    summary: 'Gradient-weighted Class Activation Mapping computes backpropagated gradients to visualize feature map spatial importance.',
    details: [
      'Calculates the gradient of the predicted class score y^c with respect to feature maps A^k of the final convolutional layer.',
      'Averages gradients across spatial dimensions to compute channel importance weights α_k^c.',
      'Applies a Rectified Linear Unit (ReLU) to combine maps, highlighting only features with positive contribution to the prediction.'
    ],
    formula: 'L_{Grad-CAM}^c = ReLU( Σ_k α_k^c · A^k ), where α_k^c = (1/Z) · Σ_i Σ_j (∂y^c / ∂A_{i,j}^k)'
  },
  {
    id: 'xai_help',
    title: 'How Does Explainable AI (XAI) Help in Synthetic Detection?',
    category: 'Explainability',
    summary: 'Provides transparent verification for human forensic reviewers, eliminating black-box opacity.',
    details: [
      'Allows analysts to verify whether the model is identifying genuine generative artifacts (distorted eyes, boundary ringing) or cheating on irrelevant image borders.',
      'Critical for judicial, journalistic, and security workflows where decisions must be auditable and defensible.',
      'Essential for debugging model bias and improving dataset curation.'
    ]
  }
];

const MODIFIED_LAYERS = [
  { name: 'Input Layer', inShape: '32 × 32 × 3', outShape: '32 × 32 × 3', params: '0', purpose: 'Standardizes input pixel tensor normalized in range [0.0, 1.0].', benefit: 'Ensures uniform floating-point scale across all mini-batches.' },
  { name: 'Conv2D Block 1 (32)', inShape: '32 × 32 × 3', outShape: '32 × 32 × 32', params: '896', purpose: 'Extracts low-level edge, gradient, and color transition features using 3×3 kernels.', benefit: 'Shift-invariant spatial filter matching.' },
  { name: 'BatchNormalization 1', inShape: '32 × 32 × 32', outShape: '32 × 32 × 32', params: '128', purpose: 'Normalizes layer outputs across mini-batches to zero mean and unit variance.', benefit: 'Prevents internal covariate shift and stabilizes training convergence.' },
  { name: 'MaxPooling2D 1', inShape: '32 × 32 × 32', outShape: '16 × 16 × 32', params: '0', purpose: 'Spatial downsampling by factor of 2 using 2×2 max windows.', benefit: 'Enforces local translation invariance and reduces compute.' },
  { name: 'Spatial Dropout 1 (0.25)', inShape: '16 × 16 × 32', outShape: '16 × 16 × 32', params: '0', purpose: 'Randomly zeros 25% of feature map activations during forward training.', benefit: 'Prevents co-adaptation of noise-detecting convolutional filters.' },
  { name: 'Conv2D Block 2 (64)', inShape: '16 × 16 × 32', outShape: '16 × 16 × 64', params: '18,496', purpose: 'Detects mid-level geometric patterns, textures, and boundary ringing artifacts.', benefit: 'Primary target layer for Grad-CAM backpropagation attribution.' },
  { name: 'BatchNormalization 2', inShape: '16 × 16 × 64', outShape: '16 × 16 × 64', params: '256', purpose: 'Normalizes mid-level feature distributions.', benefit: 'Permits higher learning rates without divergence.' },
  { name: 'MaxPooling2D 2', inShape: '16 × 16 × 64', outShape: '8 × 8 × 64', params: '0', purpose: 'Downsamples feature representations to 8×8 resolution.', benefit: 'Broadens the receptive field of subsequent deeper filters.' },
  { name: 'Spatial Dropout 2 (0.25)', inShape: '8 × 8 × 64', outShape: '8 × 8 × 64', params: '0', purpose: 'Regularizes second block activations.', benefit: 'Mitigates memorization of diffusion prompt-specific patterns.' },
  { name: 'Conv2D Block 3 (128)', inShape: '8 × 8 × 64', outShape: '8 × 8 × 128', params: '73,856', purpose: 'Synthesizes high-level semantic representations of realistic vs generative imagery.', benefit: 'Deepest convolutional feature hierarchy.' },
  { name: 'GlobalAveragePooling2D', inShape: '8 × 8 × 128', outShape: '128', params: '0 (Zero Weights!)', purpose: 'Computes spatial average across each 8×8 feature map channel.', benefit: 'Replaces bulky Flatten() head, eliminating 243k excess weights and preventing overfitting.' },
  { name: 'Dense Projection (64)', inShape: '128', outShape: '64', params: '8,256', purpose: 'Linear projection into decision subspace.', benefit: 'Refines classification boundary.' },
  { name: 'Dense Dropout (0.40)', inShape: '64', outShape: '64', params: '0', purpose: 'Stochastic regularization before output layer.', benefit: 'Prevents reliance on single neurons for decision making.' },
  { name: 'Softmax Output (2)', inShape: '64', outShape: '2 (REAL, FAKE)', params: '130', purpose: 'Maps logits to normalized probability distribution summing to 1.0.', benefit: 'Generates well-calibrated confidence scores.' }
];

const STANDARD_LAYERS = [
  { name: 'Input Layer', inShape: '32 × 32 × 3', outShape: '32 × 32 × 3', params: '0', purpose: 'Accepts raw input image tensor.', benefit: 'Standard input shape for CIFAR-scale tasks.' },
  { name: 'Conv2D Block 1 (32)', inShape: '32 × 32 × 3', outShape: '32 × 32 × 32', params: '896', purpose: 'Low-level edge and corner detection.', benefit: 'Initial spatial feature extraction.' },
  { name: 'Conv2D Block 1b (32)', inShape: '32 × 32 × 32', outShape: '30 × 30 × 32', params: '9,248', purpose: 'Stacked convolution for receptive field expansion.', benefit: 'Deepens shallow feature hierarchy.' },
  { name: 'MaxPooling2D 1', inShape: '30 × 30 × 32', outShape: '15 × 15 × 32', params: '0', purpose: 'Downsampling spatial dimensions.', benefit: 'Cuts compute overhead.' },
  { name: 'Conv2D Block 2 (64)', inShape: '15 × 15 × 32', outShape: '15 × 15 × 64', params: '18,496', purpose: 'Mid-level feature extraction.', benefit: 'Captures object textures.' },
  { name: 'Conv2D Block 2b (64)', inShape: '15 × 15 × 64', outShape: '13 × 13 × 64', params: '36,928', purpose: 'Second stacked convolution.', benefit: 'Target layer for baseline Grad-CAM.' },
  { name: 'MaxPooling2D 2', inShape: '13 × 13 × 64', outShape: '6 × 6 × 64', params: '0', purpose: 'Final spatial pooling.', benefit: 'Prepares for flattening.' },
  { name: 'Flatten Layer', inShape: '6 × 6 × 64', outShape: '2,304 features', params: '0', purpose: 'Unrolls multi-dimensional tensor into a 1D vector of 2,304 scalars.', benefit: 'Enables dense connection, but destroys spatial correlation.' },
  { name: 'Dense Hidden (128)', inShape: '2,304', outShape: '128', params: '295,040 (90.3% of model!)', purpose: 'Fully connected projection layer.', benefit: 'High capacity, but extremely prone to overfitting on synthetic training noise.' },
  { name: 'Softmax Output (2)', inShape: '128', outShape: '2 (REAL, FAKE)', params: '258', purpose: 'Produces output class probabilities.', benefit: 'Standard binary cross-entropy output.' }
];

export const ModelTheory: React.FC = () => {
  const [activePipelineTab, setActivePipelineTab] = useState<'prediction' | 'training'>('prediction');
  const [expandedId, setExpandedId] = useState<string>('cifake');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Section 27 state
  const [selectedArch, setSelectedArch] = useState<'modified' | 'standard'>('modified');
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(10); // GlobalAveragePooling by default

  const activeLayers = selectedArch === 'modified' ? MODIFIED_LAYERS : STANDARD_LAYERS;
  const currentActiveLayer = activeLayers[selectedLayerIndex] || activeLayers[0];

  const filteredTopics = THEORY_TOPICS.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Editorial Header */}
      <div className="border-b border-[#1c2638] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>04. Model Architectures & Deep Learning Theory</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Neural Architecture Foundations & Theoretical Mechanics
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete conceptual breakdown of convolutional neural engineering, Global Average Pooling, and the mathematical mechanics of Grad-CAM.
        </p>
      </div>

      {/* 1. ARCHITECTURE FLOWCHART VISUALIZATION (SECTION 25) */}
      <div className="bg-[#0e131f] border border-[#1c2638] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-sans">
              System Architecture Flowchart & Processing Pipelines
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive end-to-end data flow visualization
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActivePipelineTab('prediction')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activePipelineTab === 'prediction'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Prediction Pipeline
            </button>
            <button
              onClick={() => setActivePipelineTab('training')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activePipelineTab === 'training'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Training Pipeline
            </button>
          </div>
        </div>

        {/* SVG Flowchart Viewport */}
        <div className="w-full bg-[#07090e] p-6 rounded-lg border border-slate-800 overflow-x-auto">
          {activePipelineTab === 'prediction' ? (
            /* Prediction Pipeline Flow */
            <svg className="w-full min-w-[720px] h-[190px]" viewBox="0 0 780 190">
              <defs>
                <marker id="arrowHead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
              </defs>

              {/* Step 1: User / Upload */}
              <rect x="10" y="45" width="100" height="55" rx="8" fill="#141b2d" stroke="#2a374f" strokeWidth="1.5" />
              <text x="60" y="70" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">User Upload</text>
              <text x="60" y="86" fill="#94a3b8" fontSize="9" textAnchor="middle">JPG / PNG / WebP</text>

              <line x1="110" y1="72" x2="140" y2="72" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowHead)" />

              {/* Step 2: Validation */}
              <rect x="140" y="45" width="95" height="55" rx="8" fill="#141b2d" stroke="#2a374f" strokeWidth="1.5" />
              <text x="187" y="70" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">Validation</text>
              <text x="187" y="86" fill="#94a3b8" fontSize="9" textAnchor="middle">MIME & Size &lt;5MB</text>

              <line x1="235" y1="72" x2="265" y2="72" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowHead)" />

              {/* Step 3: Resizing & Norm */}
              <rect x="265" y="45" width="115" height="55" rx="8" fill="#141b2d" stroke="#2a374f" strokeWidth="1.5" />
              <text x="322" y="68" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">Preprocessing</text>
              <text x="322" y="82" fill="#38bdf8" fontSize="9" textAnchor="middle">32×32 Bicubic</text>
              <text x="322" y="93" fill="#94a3b8" fontSize="8" textAnchor="middle">Norm [0.0, 1.0]</text>

              <line x1="380" y1="72" x2="410" y2="72" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowHead)" />

              {/* Step 4: CNN Model Inference */}
              <rect x="410" y="35" width="130" height="75" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
              <text x="475" y="58" fill="#60a5fa" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">Dual CNN Engine</text>
              <text x="475" y="74" fill="#e2e8f0" fontSize="9" textAnchor="middle">Standard CNN2D or</text>
              <text x="475" y="88" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">Modified CNN2D (GAP)</text>

              <line x1="540" y1="72" x2="570" y2="72" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowHead)" />

              {/* Step 5: Classification Result */}
              <rect x="570" y="45" width="110" height="55" rx="8" fill="#141b2d" stroke="#2a374f" strokeWidth="1.5" />
              <text x="625" y="68" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">Prediction</text>
              <text x="625" y="82" fill="#4ade80" fontSize="9" fontWeight="bold" textAnchor="middle">REAL vs FAKE</text>
              <text x="625" y="93" fill="#94a3b8" fontSize="8" textAnchor="middle">Confidence Score %</text>

              {/* Step 6: Grad-CAM Flow */}
              <path d="M 475 110 L 475 145 L 625 145 L 625 105" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrowHead)" />
              <rect x="425" y="132" width="165" height="24" rx="4" fill="#083344" stroke="#06b6d4" strokeWidth="1" />
              <text x="507" y="148" fill="#67e8f9" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">Grad-CAM Heatmap + Overlay</text>

              {/* Step 7: Final DB Log */}
              <line x1="680" y1="72" x2="710" y2="72" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowHead)" />
              <rect x="710" y="45" width="60" height="55" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <text x="740" y="70" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">History</text>
              <text x="740" y="86" fill="#64748b" fontSize="8" textAnchor="middle">SQLite Log</text>
            </svg>
          ) : (
            /* Training Pipeline Flow */
            <svg className="w-full min-w-[720px] h-[190px]" viewBox="0 0 780 190">
              <defs>
                <marker id="arrowHead2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
              </defs>

              {/* Step 1: CIFAKE Dataset */}
              <rect x="10" y="45" width="110" height="55" rx="8" fill="#141b2d" stroke="#2a374f" strokeWidth="1.5" />
              <text x="65" y="68" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">CIFAKE Dataset</text>
              <text x="65" y="82" fill="#94a3b8" fontSize="9" textAnchor="middle">120,000 Images</text>
              <text x="65" y="93" fill="#64748b" fontSize="8" textAnchor="middle">60k Real / 60k Fake</text>

              <line x1="120" y1="72" x2="150" y2="72" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowHead2)" />

              {/* Step 2: Preprocess */}
              <rect x="150" y="45" width="105" height="55" rx="8" fill="#141b2d" stroke="#2a374f" strokeWidth="1.5" />
              <text x="202" y="68" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">Preprocessing</text>
              <text x="202" y="82" fill="#38bdf8" fontSize="9" textAnchor="middle">Resize (32×32)</text>
              <text x="202" y="93" fill="#94a3b8" fontSize="8" textAnchor="middle">Scale [0.0, 1.0]</text>

              <line x1="255" y1="72" x2="285" y2="72" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowHead2)" />

              {/* Step 3: Train / Test Split */}
              <rect x="285" y="45" width="105" height="55" rx="8" fill="#141b2d" stroke="#2a374f" strokeWidth="1.5" />
              <text x="337" y="68" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">Dataset Split</text>
              <text x="337" y="82" fill="#94a3b8" fontSize="9" textAnchor="middle">80% Train · 10% Val</text>
              <text x="337" y="93" fill="#94a3b8" fontSize="8" textAnchor="middle">10% Test (N=10k)</text>

              <line x1="390" y1="72" x2="420" y2="72" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowHead2)" />

              {/* Step 4: Dual Training */}
              <rect x="420" y="30" width="150" height="85" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
              <text x="495" y="52" fill="#60a5fa" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">Model Training</text>
              <text x="495" y="68" fill="#94a3b8" fontSize="9" textAnchor="middle">Adam (lr=0.001) · Batch=64</text>
              <text x="495" y="83" fill="#cbd5e1" fontSize="9" textAnchor="middle">Standard CNN2D (326k)</text>
              <text x="495" y="98" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">Modified CNN2D (83k)</text>

              <line x1="570" y1="72" x2="600" y2="72" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowHead2)" />

              {/* Step 5: Evaluation */}
              <rect x="600" y="45" width="90" height="55" rx="8" fill="#141b2d" stroke="#2a374f" strokeWidth="1.5" />
              <text x="645" y="68" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">Evaluation</text>
              <text x="645" y="82" fill="#94a3b8" fontSize="9" textAnchor="middle">Acc · F1 · CM</text>
              <text x="645" y="93" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle">95.38% (Mod)</text>

              <line x1="690" y1="72" x2="720" y2="72" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowHead2)" />

              {/* Step 6: Saved Models */}
              <rect x="720" y="45" width="55" height="55" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <text x="747" y="70" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">Save</text>
              <text x="747" y="86" fill="#64748b" fontSize="8" textAnchor="middle">.h5 weights</text>
            </svg>
          )}
        </div>
      </div>

      {/* 2. INTERACTIVE ARCHITECTURE EXPLORER (SECTION 27) */}
      <div className="bg-[#0e131f] border border-[#1c2638] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-mono text-cyan-400 block uppercase">Section 27 Specification</span>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              Interactive Layer Architecture Explorer
            </h3>
            <p className="text-xs text-slate-400">
              Click any neural layer in the pipeline below to inspect its mathematical purpose, parameter count, and architectural benefit.
            </p>
          </div>
          <div className="inline-flex p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSelectedArch('modified')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                selectedArch === 'modified' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Modified CNN2D (83k)
            </button>
            <button
              onClick={() => setSelectedArch('standard')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                selectedArch === 'standard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard CNN2D (326k)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Layer List Column (6 cols) */}
          <div className="lg:col-span-6 space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {activeLayers.map((layer, idx) => {
              const isSelected = selectedLayerIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedLayerIndex(idx)}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer font-mono ${
                    isSelected
                      ? 'bg-blue-600/20 border-cyan-500/60 text-white shadow-sm ring-1 ring-cyan-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 w-5">0{idx + 1}</span>
                    <span className="font-semibold text-white truncate max-w-[190px]">{layer.name}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 shrink-0">{layer.outShape}</span>
                </button>
              );
            })}
          </div>

          {/* Layer Inspection Card (6 cols) */}
          <div className="lg:col-span-6 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-sans text-xs">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                Layer Inspection Readout
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {currentActiveLayer.name}
              </h4>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Input Shape:</span>
                <span className="text-slate-200">{currentActiveLayer.inShape}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Output Shape:</span>
                <span className="text-cyan-400 font-bold">{currentActiveLayer.outShape}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Trainable Weights:</span>
                <span className="text-slate-200">{currentActiveLayer.params}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">Functional Purpose:</span>
                <p className="text-slate-400 leading-relaxed font-sans text-[11px]">
                  {currentActiveLayer.purpose}
                </p>
              </div>

              <div>
                <span className="font-semibold text-emerald-400 block mb-0.5">Architectural Benefit:</span>
                <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                  {currentActiveLayer.benefit}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE CONCEPTUAL KNOWLEDGE BASE */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2638] pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Curated Technical Topics (14 Modules)
            </h3>
            <p className="text-xs text-slate-400">
              Undergraduate-level lecture guide explaining concepts from first principles
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Dataset">Dataset</option>
              <option value="Deep Learning">Deep Learning</option>
              <option value="Architecture">Architecture</option>
              <option value="Regularization">Regularization</option>
              <option value="Inference">Inference</option>
              <option value="Explainability">Explainability</option>
            </select>
          </div>
        </div>

        {/* Expandable Topic Cards */}
        <div className="space-y-3">
          {filteredTopics.map((topic) => {
            const isExpanded = expandedId === topic.id;
            return (
              <div
                key={topic.id}
                className="rounded-xl bg-[#0e131f] border border-[#1c2638] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? '' : topic.id)}
                  className="w-full p-4 text-left flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {topic.category}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {topic.title}
                    </h4>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-800/60 text-xs">
                    <p className="text-slate-300 font-medium leading-relaxed">
                      {topic.summary}
                    </p>

                    <div className="space-y-1.5 pl-3 border-l-2 border-slate-800 text-slate-400 leading-relaxed">
                      {topic.details.map((d, idx) => (
                        <p key={idx}>· {d}</p>
                      ))}
                    </div>

                    {topic.formula && (
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
                        {topic.formula}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
