========================================================================
CIFAKE DATASET INSTRUCTIONS
========================================================================

Dataset Name: CIFAKE: Real and AI-Generated Synthetic Images
Source: Kaggle (https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images)

Dataset Overview:
- Total Images: 120,000 (32x32 pixels, RGB 3-channel)
- Class REAL: 60,000 authentic photographic images drawn directly from CIFAR-10.
- Class FAKE: 60,000 AI-generated synthetic images synthesized using Stable Diffusion 1.4.

Expected Directory Structure:
cifake_python/dataset/
├── train/
│   ├── REAL/  (50,000 .jpg images)
│   └── FAKE/  (50,000 .jpg images)
└── test/
    ├── REAL/  (10,000 .jpg images)
    └── FAKE/  (10,000 .jpg images)

How to load the dataset:
1. Download archive.zip from Kaggle.
2. Unzip into this `dataset/` folder.
3. Configure DATASET_PATH in config.py or pass DATASET_PATH environment variable:
   export DATASET_PATH="./dataset"
4. Run training:
   python -m training.train_modified_cnn2d
   python -m training.train_cnn2d
   python -m training.evaluate
========================================================================
