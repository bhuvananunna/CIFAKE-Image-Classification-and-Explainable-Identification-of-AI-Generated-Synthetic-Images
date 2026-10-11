"""
CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
Project Configuration Module
"""

import os
from pathlib import Path

# Base Directory of the Project
BASE_DIR = Path(__file__).resolve().parent

# ==========================================
# DATASET CONFIGURATION
# ==========================================
# Specify your CIFAKE dataset path here (can be configured via environment variable)
# CIFAKE dataset structure should be:
# DATASET_PATH/
#   ├── train/
#   │   ├── REAL/
#   │   └── FAKE/
#   └── test/
#       ├── REAL/
#       └── FAKE/
DATASET_PATH = os.environ.get("DATASET_PATH", str(BASE_DIR / "dataset"))

# Image Dimensions (CIFAKE images are 32x32 pixels, 3 color channels)
IMAGE_HEIGHT = 32
IMAGE_WIDTH = 32
CHANNELS = 3
IMAGE_SIZE = (IMAGE_HEIGHT, IMAGE_WIDTH)
INPUT_SHAPE = (IMAGE_HEIGHT, IMAGE_WIDTH, CHANNELS)

# Class Labels
CLASSES = ["REAL", "FAKE"]
CLASS_LABELS = {0: "REAL", 1: "FAKE"}
NUM_CLASSES = 2

# ==========================================
# TRAINING HYPERPARAMETERS
# ==========================================
BATCH_SIZE = int(os.environ.get("BATCH_SIZE", 64))
EPOCHS = int(os.environ.get("EPOCHS", 20))
LEARNING_RATE = float(os.environ.get("LEARNING_RATE", 0.001))
VALIDATION_SPLIT = 0.2
RANDOM_SEED = 42

# Regularization Parameters
DROPOUT_RATE_CONV = 0.25
DROPOUT_RATE_DENSE = 0.40

# ==========================================
# MODEL STORAGE PATHS
# ==========================================
MODEL_DIR = BASE_DIR / "models" / "saved_models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

CNN2D_MODEL_PATH = str(MODEL_DIR / "cifake_cnn2d.h5")
MODIFIED_CNN2D_MODEL_PATH = str(MODEL_DIR / "cifake_modified_cnn2d.h5")
DEFAULT_MODEL_PATH = MODIFIED_CNN2D_MODEL_PATH

# ==========================================
# APPLICATION & DATABASE CONFIGURATION
# ==========================================
SECRET_KEY = os.environ.get("SECRET_KEY", "cifake-academic-project-secret-key-2026")
DATABASE_DIR = BASE_DIR / "database"
DATABASE_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_PATH = str(DATABASE_DIR / "cifake_project.db")

UPLOAD_DIR = BASE_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed image extensions and max upload size (5MB)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024

# Grad-CAM Settings
GRADCAM_TARGET_LAYER_CNN2D = "conv2d_3"
GRADCAM_TARGET_LAYER_MODIFIED = "modified_conv2d_3"
