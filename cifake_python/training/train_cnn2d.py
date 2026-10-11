"""
CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
Training Script for Architecture A: Standard CNN2D
"""

import os
import matplotlib.pyplot as plt
import tensorflow as tf
from pathlib import Path
import config
from models.cnn2d_model import build_cnn2d
from training.preprocess import load_and_preprocess_dataset

def plot_history(history, save_prefix="cnn2d"):
    """Generates and saves Accuracy vs Epochs and Loss vs Epochs plots."""
    plots_dir = config.BASE_DIR / "static" / "plots"
    plots_dir.mkdir(parents=True, exist_ok=True)

    epochs_range = range(1, len(history.history["accuracy"]) + 1)

    # 1. Accuracy Plot
    plt.figure(figsize=(8, 5))
    plt.plot(epochs_range, history.history["accuracy"], "o-", label="Training Accuracy", color="#2563eb")
    plt.plot(epochs_range, history.history["val_accuracy"], "s-", label="Validation Accuracy", color="#16a34a")
    plt.title("Standard CNN2D: Accuracy vs Epochs")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend()
    plt.grid(True, linestyle="--", alpha=0.6)
    plt.tight_layout()
    acc_plot_path = str(plots_dir / f"{save_prefix}_accuracy.png")
    plt.savefig(acc_plot_path, dpi=200)
    plt.close()

    # 2. Loss Plot
    plt.figure(figsize=(8, 5))
    plt.plot(epochs_range, history.history["loss"], "o-", label="Training Loss", color="#dc2626")
    plt.plot(epochs_range, history.history["val_loss"], "s-", label="Validation Loss", color="#ea580c")
    plt.title("Standard CNN2D: Loss vs Epochs")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    plt.grid(True, linestyle="--", alpha=0.6)
    plt.tight_layout()
    loss_plot_path = str(plots_dir / f"{save_prefix}_loss.png")
    plt.savefig(loss_plot_path, dpi=200)
    plt.close()

    print(f"[TRAIN] Plots saved: {acc_plot_path}, {loss_plot_path}")

def train_cnn2d(dataset_path=None, epochs=None, batch_size=None, lr=None):
    """
    Executes end-to-end training pipeline for Standard CNN2D on CIFAKE dataset.
    """
    dataset_path = dataset_path or config.DATASET_PATH
    epochs = epochs or config.EPOCHS
    batch_size = batch_size or config.BATCH_SIZE
    lr = lr or config.LEARNING_RATE

    print("=" * 60)
    print("STARTING TRAINING PIPELINE: STANDARD CNN2D")
    print(f"Dataset Path:  {dataset_path}")
    print(f"Epochs:        {epochs}")
    print(f"Batch Size:    {batch_size}")
    print(f"Learning Rate: {lr}")
    print("=" * 60)

    # 1. Load and preprocess dataset
    (X_train, y_train), (X_val, y_val), (X_test, y_test) = load_and_preprocess_dataset(dataset_path)

    # 2. Build model architecture
    model = build_cnn2d(input_shape=config.INPUT_SHAPE, num_classes=config.NUM_CLASSES, learning_rate=lr)
    model.summary()

    # 3. Callbacks: Early Stopping and Model Checkpoint
    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        tf.keras.callbacks.ModelCheckpoint(config.CNN2D_MODEL_PATH, monitor="val_accuracy", save_best_only=True, verbose=1)
    ]

    # 4. Train Model
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=1
    )

    # 5. Save Final Model and Plots
    model.save(config.CNN2D_MODEL_PATH)
    print(f"[TRAIN] CNN2D model successfully saved to: {config.CNN2D_MODEL_PATH}")

    plot_history(history, save_prefix="cnn2d")

    # 6. Evaluate on Test Set
    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"\n[TEST EVALUATION] CNN2D Test Loss: {test_loss:.4f} | Test Accuracy: {test_acc*100:.2f}%\n")

    return model, history

if __name__ == "__main__":
    train_cnn2d()
