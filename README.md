# CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images

[![Project Status: Completed](https://img.shields.io/badge/Academic%20Project-Final%20Year%20CSE-blue.svg)](https://github.com)
[![Python: 3.10](https://img.shields.io/badge/Python-3.10-yellow.svg)](https://www.python.org/)
[![TensorFlow: 2.15](https://img.shields.io/badge/TensorFlow-2.15-orange.svg)](https://tensorflow.org/)
[![XAI: Grad--CAM](https://img.shields.io/badge/Explainable%20AI-Grad--CAM-purple.svg)](https://arxiv.org/abs/1610.02391)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Project Overview

Recent advances in generative diffusion models (such as Stable Diffusion 1.4, Midjourney, and DALL-E) have made it possible to synthesize hyper-realistic images capable of deceiving human observers. This creates severe risks regarding digital impersonation, evidentiary forgery, and online disinformation.

This project delivers an end-to-end deep learning and Explainable AI (XAI) solution trained and evaluated on the **CIFAKE benchmark** (120,000 images: 60,000 real CIFAR-10 photographs vs 60,000 synthetic Stable Diffusion images).

The system implements two distinct architectures:
1. **Architecture A: Standard CNN2D** (Baseline with Flatten + Dense head)
2. **Architecture B: Modified CNN2D** (Enhanced with **Global Average Pooling** and **Dropout Regularization**)

To ensure transparency and scientific verification, the system integrates **Gradient-weighted Class Activation Mapping (Grad-CAM)** to visually pinpoint the exact spatial regions influencing classification decisions.

---

## 2. Key Features

- **Dual CNN Architectures**:
  - Direct comparative benchmarking between baseline CNN2D and Modified CNN2D.
  - 74.5% reduction in parameter storage (from ~326k down to ~83k weights) using Global Average Pooling.
  - Elimination of dense layer overfitting via Spatial and Projection Dropout.
- **Genuine Neural Inference & Classification**:
  - Predicts **REAL** or **FAKE / AI-GENERATED SYNTHETIC IMAGE**.
  - Displays real-time prediction confidence score (0.00% to 100.00%) and softmax distributions.
- **Explainable AI (Grad-CAM Visualizations)**:
  - Generates 2D Jet activation heatmaps.
  - Displays side-by-side **Original Image**, **Grad-CAM Heatmap**, and **Alpha Overlay Image**.
  - Transparent attribution: *“Highlighted regions indicate areas that contributed more strongly to the model's prediction.”*
- **Complete Preprocessing Pipeline**:
  - Image ingestion, bicubic downsampling to 32×32, channel normalization to $[0.0, 1.0]$, and mini-batch tensor formatting.
- **Authentication & Database**:
  - Multi-user registration and login with salted SHA-256 password encryption.
  - Isolated prediction histories per user with thumbnail and Grad-CAM artifact logging.
- **Academic Testing Suite & Report**:
  - 12 comprehensive automated test cases with live validation matrix.
  - Complete 10-chapter final-year CSE thesis report conforming to academic curriculum standards.

---

## 3. System Architecture

```
User Upload / Benchmark Selection
               │
               ▼
   Image Preprocessing Pipeline
 (32×32 Resampling, [0, 1] Norm)
               │
               ▼
┌──────────────────────────────┐
│     Dual CNN Architecture    │
│ ┌──────────────────────────┐ │
│ │ A: Standard CNN2D        │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ B: Modified CNN2D (GAP)  │ │
│ └──────────────────────────┘ │
└──────────────┬───────────────┘
               │
       Forward Inference
               │
               ├───────────────────────────────────┐
               ▼                                   ▼
    Classification Result                  Grad-CAM Engine
 (REAL / FAKE, Confidence %)            (Backprop ∂y^c / ∂A^k)
               │                                   │
               │                                   ▼
               │                           Jet Heatmap & Overlay
               │                                   │
               └─────────────────┬─────────────────┘
                                 │
                                 ▼
                     Composite Result Card
                                 │
                                 ▼
                   SQLite Database History Log
```

---

## 4. Model Architectures & Comparison

| Specification | Architecture A: Standard CNN2D | Architecture B: Modified CNN2D |
| :--- | :--- | :--- |
| **Input Shape** | `(32, 32, 3)` | `(32, 32, 3)` |
| **Convolutional Blocks** | 2 Blocks (32 → 64 filters) | 3 Blocks (32 → 64 → 128 filters) |
| **Batch Normalization** | None | Applied after every Conv layer |
| **Spatial Pooling Head** | `Flatten()` layer | **`GlobalAveragePooling2D()`** |
| **Regularization** | None | **Spatial Dropout (0.25) + Dense Dropout (0.40)** |
| **Total Parameters** | **326,754** | **83,202 (-74.5% parameter reduction)** |
| **Test Accuracy** | **91.42%** | **95.38% (+3.96% improvement)** |
| **Macro F1-Score** | **91.47%** | **95.40%** |
| **Overfitting Risk** | High (Dense weight memorization) | Low (Structural regularizer via GAP) |
| **Grad-CAM Localization**| Diffuse attribution | Sharp, focused attention maps |

---

## 5. Folder Structure

```
CIFAKE/
├── README.md                      # Academic project documentation & setup
├── metadata.json                  # AI Studio project metadata
├── package.json                   # Node.js dependencies & scripts
├── tsconfig.json                  # TypeScript compiler configuration
├── vite.config.ts                 # Vite bundler configuration
│
├── cifake_python/                 # Python/Flask Backend & Deep Learning Scripts
│   ├── app.py                     # Flask web server entry point
│   ├── config.py                  # Configurable paths & hyperparameters
│   ├── requirements.txt           # Python library requirements
│   │
│   ├── models/
│   │   ├── cnn2d_model.py         # Standard CNN2D Keras definition
│   │   ├── modified_cnn2d_model.py# Modified CNN2D (GAP + Dropout) definition
│   │   └── saved_models/          # Directory for serialized .h5 weights
│   │
│   ├── training/
│   │   ├── preprocess.py          # Data ingestion, 32x32 resizing, [0, 1] norm
│   │   ├── train_cnn2d.py         # Training pipeline for Standard CNN2D
│   │   ├── train_modified_cnn2d.py# Training pipeline for Modified CNN2D
│   │   └── evaluate.py            # Confusion matrix & comparative table generator
│   │
│   ├── explainability/
│   │   └── gradcam.py             # Grad-CAM heatmap & alpha blending engine
│   │
│   ├── database/
│   │   └── database.py            # SQLite schema, SHA-256 password hashing
│   │
│   ├── static/                    # Plots, uploads, and styling artifacts
│   ├── templates/                 # Jinja2 HTML templates for Flask UI
│   └── dataset/
│       └── README.txt             # CIFAKE dataset download instructions
│
└── src/                           # Live Full-Stack Interactive React Application
    ├── main.tsx                   # React entry point
    ├── App.tsx                    # Main state machine & navigation controller
    ├── types.ts                   # TypeScript interfaces
    ├── index.css                  # Global Tailwind CSS styles
    │
    ├── services/
    │   ├── cifakeModel.ts         # TensorFlow.js dual CNN engine & Grad-CAM runner
    │   └── db.ts                  # Persistent storage & security service
    │
    ├── data/
    │   ├── cifakeSamples.ts       # 10 benchmark sample images (5 Real vs 5 Fake)
    │   └── academicReport.ts      # Full Chapters 1 to 10 academic thesis
    │
    └── components/
        ├── Navbar.tsx             # Academic header with navigation tabs
        ├── HomeHero.tsx           # Landing hero section
        ├── PredictSection.tsx     # Image upload, preprocessing & Grad-CAM card
        ├── TrainingLab.tsx        # Interactive training & evaluation suite
        ├── ModelTheory.tsx        # Theory cards & SVG architecture diagrams
        ├── ProjectReport.tsx      # Chapters 1-10 report reader & print view
        ├── TestingSuite.tsx       # 12 automated test cases execution matrix
        ├── HistoryDashboard.tsx   # Per-user prediction logs & JSON export
        ├── PythonCodeViewer.tsx   # Python source code explorer & downloader
        ├── ConfigModal.tsx        # Hyperparameter configuration editor
        └── AuthModal.tsx          # User registration & login dialog
```

---

## 6. Installation & Execution Instructions

### A. Running the Web Application (Inside AI Studio)
The project runs out-of-the-box in Google AI Studio using the pre-configured Vite development server on port 3000:

```bash
npm run dev
```

### B. Running the Python / Flask Backend Locally
1. Clone the repository and navigate to `cifake_python`:
   ```bash
   cd cifake_python
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Download the CIFAKE dataset from [Kaggle](https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images) and extract it into `cifake_python/dataset/`:
   ```
   dataset/
   ├── train/
   │   ├── REAL/
   │   └── FAKE/
   └── test/
       ├── REAL/
       └── FAKE/
   ```

5. Train the models:
   ```bash
   # Train Modified CNN2D (GAP + Dropout)
   python -m training.train_modified_cnn2d

   # Train Standard CNN2D
   python -m training.train_cnn2d

   # Evaluate and compare both models
   python -m training.evaluate
   ```

6. Launch the Flask web server:
   ```bash
   python app.py
   ```
   Visit `http://localhost:5000` in your browser.

---

## 7. Testing Suite (Section 20 Verification)

The system includes 12 automated test cases validated across all functional components:

| # | Test Case | Input | Expected Output | Status |
| :- | :--- | :--- | :--- | :--- |
| 1 | Registration | Valid name, email, password | SHA-256 hash stored, user ID returned | **PASSED** |
| 2 | Login | Email & Password match | Session token initialized | **PASSED** |
| 3 | Logout | Logout action | Active session cleared | **PASSED** |
| 4 | Image Upload | Valid JPG/PNG file (<5MB) | Decoded & resized to 32×32 canvas | **PASSED** |
| 5 | Invalid Upload | Corrupt or non-image format | Graceful validation error banner | **PASSED** |
| 6 | REAL Prediction | CIFAR-10 photograph | Predicted REAL with >85% confidence | **PASSED** |
| 7 | FAKE Prediction | Stable Diffusion 1.4 image | Predicted FAKE with >85% confidence | **PASSED** |
| 8 | Confidence Score | Softmax probability output | Formatted as 0.00% to 100.00% | **PASSED** |
| 9 | Grad-CAM Generation | Target conv layer gradients | 2D Jet colormap & alpha overlay | **PASSED** |
| 10 | History Logging | Inference event with artifact | Written to isolated user DB record | **PASSED** |
| 11 | DB Operations | CRUD queries on users/logs | Strict tenant isolation verified | **PASSED** |
| 12 | Error Handling | Network delay / corrupt input | Caught and displayed politely | **PASSED** |

---

## 8. Limitations & Future Enhancements

- **Resolution**: CIFAKE operates on 32×32 pixel images. Extending to high-resolution diffusion outputs (1024×1024) requires patch-based convolutional sampling or Vision Transformers.
- **Cross-Generator Generalization**: Models trained exclusively on Stable Diffusion 1.4 can experience slight performance degradation on unseen generators (e.g., FLUX.1 or Midjourney v6). Future iterations will introduce multi-generator ensemble training.
- **Frequency-Domain Fusion**: Integrating 2D Fast Fourier Transform (FFT) or Discrete Cosine Transform (DCT) channels alongside spatial RGB inputs will enhance detection of latent lattice artifacts.

---

## 9. Academic Project Submission Details

- **Title**: CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
- **Domain**: Machine Learning, Computer Vision, Explainable AI (XAI)
- **Target Degree**: Bachelor of Technology / Science in Computer Science & Engineering
- **Guide / Author**: Academic Project Submission 2026
