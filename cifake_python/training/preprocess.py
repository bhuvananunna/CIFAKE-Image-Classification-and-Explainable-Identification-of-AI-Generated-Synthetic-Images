"""
CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
Data Preprocessing Pipeline Module

Pipeline Steps:
1. Load images from directory paths (REAL vs FAKE)
2. Resize images to target input size (32, 32)
3. Normalize pixel intensities to [0.0, 1.0] range
4. Shuffle data uniformly
5. Stratified train/validation/testing split
6. Compute and report class distribution statistics
7. Provide sample visualization utilities
"""

import os
import glob
import numpy as np
import cv2
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from pathlib import Path
import config

def load_image_paths_and_labels(dataset_dir):
    """
    Scans the CIFAKE dataset directory for REAL (0) and FAKE (1) images.
    Supports either:
      - Split layout: dataset_dir/{train,test}/{REAL,FAKE}/*.jpg
      - Flat layout: dataset_dir/{REAL,FAKE}/*.jpg
    """
    dataset_path = Path(dataset_dir)
    image_paths = []
    labels = []

    # Check for direct class subfolders
    real_paths = []
    fake_paths = []

    for pattern in ["REAL/*.jpg", "REAL/*.png", "train/REAL/*.jpg", "train/REAL/*.png"]:
        real_paths.extend(glob.glob(str(dataset_path / pattern)))

    for pattern in ["FAKE/*.jpg", "FAKE/*.png", "train/FAKE/*.jpg", "train/FAKE/*.png"]:
        fake_paths.extend(glob.glob(str(dataset_path / pattern)))

    # Deduplicate
    real_paths = sorted(list(set(real_paths)))
    fake_paths = sorted(list(set(fake_paths)))

    print(f"[PREPROCESS] Found {len(real_paths)} REAL images and {len(fake_paths)} FAKE images in {dataset_dir}")

    for p in real_paths:
        image_paths.append(p)
        labels.append(0)  # REAL

    for p in fake_paths:
        image_paths.append(p)
        labels.append(1)  # FAKE

    return image_paths, labels

def preprocess_single_image(image_path_or_array, target_size=(32, 32)):
    """
    Standard preprocessing for a single image:
    1. Read / convert to RGB
    2. Resize to (32, 32)
    3. Normalize pixel intensities to [0.0, 1.0]
    
    Returns:
        np.ndarray: Preprocessed image of shape (32, 32, 3) with float32 values [0.0, 1.0].
    """
    if isinstance(image_path_or_array, str) or isinstance(image_path_or_array, Path):
        img = cv2.imread(str(image_path_or_array))
        if img is None:
            raise ValueError(f"Could not read image from {image_path_or_array}")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    else:
        img = image_path_or_array.copy()
        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        elif img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)

    # Resize to model input dimensions
    if (img.shape[0], img.shape[1]) != target_size:
        img = cv2.resize(img, target_size, interpolation=cv2.INTER_AREA)

    # Normalize to [0.0, 1.0]
    img_normalized = img.astype(np.float32) / 255.0
    return img_normalized

def load_and_preprocess_dataset(dataset_dir, max_samples_per_class=None, target_size=(32, 32)):
    """
    Loads full dataset, resizes, normalizes, shuffles, and generates train/val splits.
    """
    image_paths, labels = load_image_paths_and_labels(dataset_dir)
    if len(image_paths) == 0:
        raise FileNotFoundError(f"No valid CIFAKE images found in {dataset_dir}. Please verify dataset directory structure.")

    # Balance or cap samples if specified
    if max_samples_per_class:
        real_indices = [i for i, l in enumerate(labels) if l == 0][:max_samples_per_class]
        fake_indices = [i for i, l in enumerate(labels) if l == 1][:max_samples_per_class]
        selected_indices = real_indices + fake_indices
        image_paths = [image_paths[i] for i in selected_indices]
        labels = [labels[i] for i in selected_indices]

    print(f"[PREPROCESS] Processing {len(image_paths)} images...")
    X = []
    y = []

    for path, label in zip(image_paths, labels):
        try:
            processed = preprocess_single_image(path, target_size)
            X.append(processed)
            y.append(label)
        except Exception as e:
            print(f"[WARNING] Skipping corrupted image {path}: {e}")

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int32)

    # Shuffle uniformly
    indices = np.arange(len(X))
    np.random.seed(config.RANDOM_SEED)
    np.random.shuffle(indices)
    X = X[indices]
    y = y[indices]

    # Stratified Train/Val/Test Split (80% train, 10% val, 10% test)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.20, random_state=config.RANDOM_SEED, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=config.RANDOM_SEED, stratify=y_temp
    )

    print("\n================ DATASET SPLIT SUMMARY ================")
    print(f"Total Preprocessed Samples: {len(X)}")
    print(f"Training Samples:           {len(X_train)} ({len(X_train)/len(X)*100:.1f}%)")
    print(f"Validation Samples:         {len(X_val)} ({len(X_val)/len(X)*100:.1f}%)")
    print(f"Test Samples:               {len(X_test)} ({len(X_test)/len(X)*100:.1f}%)")
    print("=======================================================\n")

    return (X_train, y_train), (X_val, y_val), (X_test, y_test)

def display_class_distribution(y_train, y_val, y_test, save_path=None):
    """Generates bar chart of class distributions across splits."""
    categories = ["Training", "Validation", "Testing"]
    real_counts = [np.sum(y_train == 0), np.sum(y_val == 0), np.sum(y_test == 0)]
    fake_counts = [np.sum(y_train == 1), np.sum(y_val == 1), np.sum(y_test == 1)]

    x = np.arange(len(categories))
    width = 0.35

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(x - width/2, real_counts, width, label="REAL (0)", color="#2563eb")
    ax.bar(x + width/2, fake_counts, width, label="FAKE (1)", color="#dc2626")

    ax.set_ylabel("Number of Samples")
    ax.set_title("CIFAKE Dataset Class Distribution Across Splits")
    ax.set_xticks(x)
    ax.set_xticklabels(categories)
    ax.legend()
    ax.grid(axis="y", linestyle="--", alpha=0.5)

    if save_path:
        plt.tight_layout()
        plt.savefig(save_path, dpi=200)
        print(f"[PREPROCESS] Distribution plot saved to {save_path}")
    plt.close()

def visualize_sample_images(X, y, num_samples=10, save_path=None):
    """Visualizes sample REAL and FAKE images side by side."""
    fig, axes = plt.subplots(2, num_samples // 2, figsize=(12, 5))
    axes = axes.flatten()

    for i in range(num_samples):
        axes[i].imshow(X[i])
        axes[i].set_title(f"Class: {config.CLASS_LABELS[y[i]]}")
        axes[i].axis("off")

    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=200)
        print(f"[PREPROCESS] Sample visualization saved to {save_path}")
    plt.close()
