"""
CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
Model Evaluation and Comparative Analysis Module

Metrics Calculated:
- Accuracy
- Precision (REAL & FAKE)
- Recall (REAL & FAKE)
- F1-Score (Macro & Weighted)
- Confusion Matrix (TN, FP, FN, TP)
- Comparative Performance Table
"""

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report
)
import tensorflow as tf
from pathlib import Path
import config
from training.preprocess import load_and_preprocess_dataset

def evaluate_model(model, X_test, y_test, model_name="Model", save_plots=True):
    """
    Evaluates a trained model on the CIFAKE test set and computes all academic metrics.
    
    Returns:
        dict: Dictionary containing accuracy, precision, recall, f1, and confusion matrix.
    """
    print(f"\n[EVALUATION] Commencing evaluation for {model_name}...")
    
    # Generate predictions
    y_prob = model.predict(X_test, batch_size=config.BATCH_SIZE, verbose=1)
    y_pred = np.argmax(y_prob, axis=1)

    # Compute core performance metrics
    acc = accuracy_score(y_test, y_pred)
    prec_macro = precision_score(y_test, y_pred, average="macro")
    rec_macro = recall_score(y_test, y_pred, average="macro")
    f1_macro = f1_score(y_test, y_pred, average="macro")

    # Class-specific metrics
    prec_real = precision_score(y_test, y_pred, pos_label=0)
    rec_real = recall_score(y_test, y_pred, pos_label=0)
    f1_real = f1_score(y_test, y_pred, pos_label=0)

    prec_fake = precision_score(y_test, y_pred, pos_label=1)
    rec_fake = recall_score(y_test, y_pred, pos_label=1)
    f1_fake = f1_score(y_test, y_pred, pos_label=1)

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    report_str = classification_report(y_test, y_pred, target_names=["REAL", "FAKE"], digits=4)

    print(f"\n--- {model_name} Classification Report ---")
    print(report_str)
    print(f"Confusion Matrix:\n{cm}")
    print(f"True Real: {tn} | False Fake: {fp}")
    print(f"False Real: {fn} | True Fake: {tp}")

    if save_plots:
        plots_dir = config.BASE_DIR / "static" / "plots"
        plots_dir.mkdir(parents=True, exist_ok=True)
        cm_path = str(plots_dir / f"{model_name.lower().replace(' ', '_')}_confusion_matrix.png")

        plt.figure(figsize=(6, 5))
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                    xticklabels=["Pred REAL", "Pred FAKE"],
                    yticklabels=["True REAL", "True FAKE"])
        plt.title(f"{model_name} - Confusion Matrix")
        plt.ylabel("Actual Label")
        plt.xlabel("Predicted Label")
        plt.tight_layout()
        plt.savefig(cm_path, dpi=200)
        plt.close()
        print(f"[EVALUATION] Confusion matrix saved to: {cm_path}")

    return {
        "model_name": model_name,
        "accuracy": acc,
        "precision": prec_macro,
        "recall": rec_macro,
        "f1_score": f1_macro,
        "real_metrics": {"precision": prec_real, "recall": rec_real, "f1": f1_real},
        "fake_metrics": {"precision": prec_fake, "recall": rec_fake, "f1": f1_fake},
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
        "classification_report": report_str
    }

def compare_models(dataset_path=None):
    """
    Loads both CNN2D and Modified CNN2D models and generates the academic comparison table.
    """
    dataset_path = dataset_path or config.DATASET_PATH
    (_, _), (_, _), (X_test, y_test) = load_and_preprocess_dataset(dataset_path)

    results = []

    # Check CNN2D
    if Path(config.CNN2D_MODEL_PATH).exists():
        print(f"[COMPARE] Loading Standard CNN2D from {config.CNN2D_MODEL_PATH}...")
        model_cnn = tf.keras.models.load_model(config.CNN2D_MODEL_PATH)
        res_cnn = evaluate_model(model_cnn, X_test, y_test, model_name="CNN2D")
        results.append(res_cnn)
    else:
        print(f"[COMPARE] Standard CNN2D model not found at {config.CNN2D_MODEL_PATH}. Model training required.")

    # Check Modified CNN2D
    if Path(config.MODIFIED_CNN2D_MODEL_PATH).exists():
        print(f"[COMPARE] Loading Modified CNN2D from {config.MODIFIED_CNN2D_MODEL_PATH}...")
        model_mod = tf.keras.models.load_model(config.MODIFIED_CNN2D_MODEL_PATH)
        res_mod = evaluate_model(model_mod, X_test, y_test, model_name="Modified CNN2D")
        results.append(res_mod)
    else:
        print(f"[COMPARE] Modified CNN2D model not found at {config.MODIFIED_CNN2D_MODEL_PATH}. Model training required.")

    # Print Comparison Table
    print("\n" + "=" * 70)
    print("MODEL PERFORMANCE COMPARISON ON CIFAKE TEST SET")
    print("=" * 70)
    print(f"{'Model':<20} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1-score':<10}")
    print("-" * 70)

    if not results:
        print("Model training required. No saved models were found to evaluate.")
    else:
        for r in results:
            print(f"{r['model_name']:<20} | {r['accuracy']*100:>8.2f}% | {r['precision']*100:>8.2f}% | {r['recall']*100:>8.2f}% | {r['f1_score']*100:>8.2f}%")

    print("=" * 70 + "\n")
    return results

if __name__ == "__main__":
    compare_models()
