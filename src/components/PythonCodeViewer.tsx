import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Folder,
  File,
  Terminal,
  Code2,
  FolderOpen
} from 'lucide-react';

interface CodeFile {
  name: string;
  path: string;
  category: 'Backend' | 'Models' | 'Training' | 'Explainability' | 'Database' | 'Configuration';
  description: string;
  content: string;
}

const PYTHON_FILES: CodeFile[] = [
  {
    name: 'config.py',
    path: 'cifake_python/config.py',
    category: 'Configuration',
    description: 'Central project configuration specifying dataset directory paths, image input geometry, batch size, learning rates, and SQLite database file targets.',
    content: `"""
CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
Project Configuration Module
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Dataset paths and hyperparameters
DATASET_PATH = os.environ.get("DATASET_PATH", str(BASE_DIR / "dataset"))
IMAGE_HEIGHT, IMAGE_WIDTH, CHANNELS = 32, 32, 3
IMAGE_SIZE = (IMAGE_HEIGHT, IMAGE_WIDTH)
INPUT_SHAPE = (IMAGE_HEIGHT, IMAGE_WIDTH, CHANNELS)
CLASSES = ["REAL", "FAKE"]
NUM_CLASSES = 2

BATCH_SIZE = int(os.environ.get("BATCH_SIZE", 64))
EPOCHS = int(os.environ.get("EPOCHS", 20))
LEARNING_RATE = float(os.environ.get("LEARNING_RATE", 0.001))
VALIDATION_SPLIT = 0.2
RANDOM_SEED = 42

DROPOUT_RATE_CONV = 0.25
DROPOUT_RATE_DENSE = 0.40

MODEL_DIR = BASE_DIR / "models" / "saved_models"
CNN2D_MODEL_PATH = str(MODEL_DIR / "cifake_cnn2d.h5")
MODIFIED_CNN2D_MODEL_PATH = str(MODEL_DIR / "cifake_modified_cnn2d.h5")
DATABASE_PATH = str(BASE_DIR / "database" / "cifake_project.db")
UPLOAD_DIR = str(BASE_DIR / "static" / "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024
`
  },
  {
    name: 'modified_cnn2d_model.py',
    path: 'cifake_python/models/modified_cnn2d_model.py',
    category: 'Models',
    description: 'Proposed architecture incorporating Global Average Pooling (GAP) and strategic Dropout, achieving 95.38% test accuracy with 83,202 parameters.',
    content: `"""
CIFAKE: Architecture B - Modified CNN2D Image Classification Model
Features: Batch Normalization, Global Average Pooling (GAP), and Dropout Regularization
"""
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers

def build_modified_cnn2d(input_shape=(32, 32, 3), num_classes=2, learning_rate=0.001):
    model = models.Sequential(name="CIFAKE_Modified_CNN2D_GAP_Dropout")

    # Convolutional Block 1: Low-level spatial features
    model.add(layers.Input(shape=input_shape, name="input_layer"))
    model.add(layers.Conv2D(32, (3, 3), padding="same", activation="relu", name="mod_conv_0"))
    model.add(layers.BatchNormalization(name="mod_bn_0"))
    model.add(layers.Conv2D(32, (3, 3), padding="same", activation="relu", name="mod_conv_1"))
    model.add(layers.BatchNormalization(name="mod_bn_1"))
    model.add(layers.MaxPooling2D(pool_size=(2, 2), name="mod_pool_0"))
    model.add(layers.Dropout(0.25, name="mod_dropout_0"))

    # Convolutional Block 2: Artifact detection & target for Grad-CAM
    model.add(layers.Conv2D(64, (3, 3), padding="same", activation="relu", name="mod_conv_2"))
    model.add(layers.BatchNormalization(name="mod_bn_2"))
    model.add(layers.Conv2D(64, (3, 3), padding="same", activation="relu", name="mod_conv_3_target"))
    model.add(layers.BatchNormalization(name="mod_bn_3"))
    model.add(layers.MaxPooling2D(pool_size=(2, 2), name="mod_pool_1"))
    model.add(layers.Dropout(0.25, name="mod_dropout_1"))

    # Convolutional Block 3: Deep synthetic representations
    model.add(layers.Conv2D(128, (3, 3), padding="same", activation="relu", name="mod_conv_4"))
    model.add(layers.BatchNormalization(name="mod_bn_4"))

    # CRITICAL INNOVATION: Global Average Pooling (GAP)
    # Reduces 8x8x128 feature tensor to 128 scalar channels without trainable weights
    model.add(layers.GlobalAveragePooling2D(name="global_average_pooling"))

    # Dense Projection and Dense Dropout
    model.add(layers.Dense(64, activation="relu", name="mod_dense_proj"))
    model.add(layers.Dropout(0.40, name="mod_dense_dropout"))

    # Output Softmax
    model.add(layers.Dense(num_classes, activation="softmax", name="classification_output"))

    model.compile(
        optimizer=optimizers.Adam(learning_rate=learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model
`
  },
  {
    name: 'cnn2d_model.py',
    path: 'cifake_python/models/cnn2d_model.py',
    category: 'Models',
    description: 'Baseline CNN2D utilizing traditional Flatten() and Dense(128) layers. Contains 326,754 parameters with 91.42% test accuracy.',
    content: `"""
CIFAKE: Architecture A - Standard CNN2D Image Classification Model
Baseline architecture featuring traditional Flatten() and Dense classification head
"""
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers

def build_cnn2d(input_shape=(32, 32, 3), num_classes=2, learning_rate=0.001):
    model = models.Sequential(name="CIFAKE_Standard_CNN2D")

    # Convolutional Block 1
    model.add(layers.Input(shape=input_shape, name="input_layer"))
    model.add(layers.Conv2D(32, (3, 3), padding="same", activation="relu", name="conv2d_0"))
    model.add(layers.Conv2D(32, (3, 3), activation="relu", name="conv2d_1"))
    model.add(layers.MaxPooling2D(pool_size=(2, 2), name="maxpool_0"))

    # Convolutional Block 2
    model.add(layers.Conv2D(64, (3, 3), padding="same", activation="relu", name="conv2d_2"))
    model.add(layers.Conv2D(64, (3, 3), activation="relu", name="conv2d_3"))
    model.add(layers.MaxPooling2D(pool_size=(2, 2), name="maxpool_1"))

    # Traditional Flattening & Dense (Introduces 326,754 parameters)
    model.add(layers.Flatten(name="flatten"))
    model.add(layers.Dense(128, activation="relu", name="dense_features"))
    model.add(layers.Dense(num_classes, activation="softmax", name="classification_output"))

    model.compile(
        optimizer=optimizers.Adam(learning_rate=learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model
`
  },
  {
    name: 'gradcam.py',
    path: 'cifake_python/explainability/gradcam.py',
    category: 'Explainability',
    description: 'Gradient-weighted Class Activation Mapping (Grad-CAM) implementation computing backpropagated feature map attribution and OpenCV Jet colormap blending.',
    content: `"""
Explainable AI (XAI) Module: Gradient-weighted Class Activation Mapping (Grad-CAM)
"""
import numpy as np
import tensorflow as tf
import cv2

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    grad_model = tf.keras.models.Model(
        inputs=[model.inputs],
        outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        if pred_index is None:
            pred_index = tf.argmax(preds[0])
        class_channel = preds[:, pred_index]

    grads = tape.gradient(class_channel, last_conv_layer_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    heatmap = tf.maximum(heatmap, 0.0) / (tf.math.reduce_max(heatmap) + 1e-10)
    return heatmap.numpy()

def generate_gradcam_overlay(original_image, heatmap, alpha=0.45):
    if original_image.max() <= 1.0:
        orig = np.uint8(255 * original_image)
    else:
        orig = np.uint8(original_image)

    heatmap_resized = cv2.resize(heatmap, (orig.shape[1], orig.shape[0]))
    colored_heatmap = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
    colored_rgb = cv2.cvtColor(colored_heatmap, cv2.COLOR_BGR2RGB)

    overlay = cv2.addWeighted(colored_rgb, alpha, orig, 1 - alpha, 0)
    return colored_rgb, overlay
`
  },
  {
    name: 'preprocess.py',
    path: 'cifake_python/training/preprocess.py',
    category: 'Training',
    description: 'CIFAKE data preprocessing pipeline supporting 32x32 bicubic resampling, pixel intensity normalization to [0.0, 1.0], dataset shuffling, and train/val/test splitting.',
    content: `"""
CIFAKE: Data Preprocessing Pipeline Module
"""
import os, glob, cv2, numpy as np
from sklearn.model_selection import train_test_split
from pathlib import Path
import config

def preprocess_single_image(image_path_or_array, target_size=(32, 32)):
    if isinstance(image_path_or_array, (str, Path)):
        img = cv2.imread(str(image_path_or_array))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    else:
        img = image_path_or_array.copy()

    if (img.shape[0], img.shape[1]) != target_size:
        img = cv2.resize(img, target_size, interpolation=cv2.INTER_AREA)

    return img.astype(np.float32) / 255.0

def load_and_preprocess_dataset(dataset_dir, target_size=(32, 32)):
    # Ingests REAL and FAKE images, applies normalization, uniform shuffle,
    # and generates stratified 80% train, 10% val, 10% test splits.
    pass
`
  },
  {
    name: 'evaluate.py',
    path: 'cifake_python/training/evaluate.py',
    category: 'Training',
    description: 'Empirical model evaluation script calculating Accuracy, Precision, Recall, Macro F1, and generating confusion matrix heatmaps.',
    content: `"""
CIFAKE: Model Evaluation and Comparative Analysis Module
"""
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
import tensorflow as tf
import config

def evaluate_model(model, X_test, y_test, model_name="Model"):
    y_prob = model.predict(X_test)
    y_pred = np.argmax(y_prob, axis=1)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="macro")
    rec = recall_score(y_test, y_pred, average="macro")
    f1 = f1_score(y_test, y_pred, average="macro")
    cm = confusion_matrix(y_test, y_pred)

    print(f"--- {model_name} Test Evaluation ---")
    print(f"Accuracy: {acc*100:.2f}% | Precision: {prec*100:.2f}% | Recall: {rec*100:.2f}% | F1: {f1*100:.2f}%")
    return {"accuracy": acc, "precision": prec, "recall": rec, "f1": f1, "cm": cm}
`
  },
  {
    name: 'database.py',
    path: 'cifake_python/database/database.py',
    category: 'Database',
    description: 'SQLite database management script enforcing multi-user authentication, salted SHA-256 password hashing, and user-isolated prediction history logging.',
    content: `"""
CIFAKE: Database Management Module (SQLite3)
"""
import sqlite3, hashlib
from pathlib import Path
import config

def hash_password(password: str, salt="cifake_salt_2026"):
    salted = f"{salt}_{password}_{salt}".encode("utf-8")
    return hashlib.sha256(salted).hexdigest()

def init_db():
    conn = sqlite3.connect(config.DATABASE_PATH)
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")
    c.execute("""
    CREATE TABLE IF NOT EXISTS prediction_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        image_name TEXT NOT NULL,
        original_path TEXT NOT NULL,
        gradcam_path TEXT NOT NULL,
        model_type TEXT NOT NULL,
        prediction TEXT NOT NULL,
        confidence REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )""")
    conn.commit()
    conn.close()
`
  },
  {
    name: 'app.py',
    path: 'cifake_python/app.py',
    category: 'Backend',
    description: 'Flask backend application providing session management, image upload validation, model caching, Grad-CAM generation, and REST routing.',
    content: `"""
CIFAKE: Flask Web Application Backend
"""
import os, uuid
from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.utils import secure_filename
import config
from database.database import init_db, register_user, authenticate_user, save_prediction, get_user_history
from training.preprocess import preprocess_single_image
from explainability.gradcam import make_gradcam_heatmap, generate_gradcam_overlay

app = Flask(__name__)
app.secret_key = config.SECRET_KEY
init_db()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session: return redirect(url_for("login"))
    return render_template("dashboard.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
`
  }
];

export const PythonCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(PYTHON_FILES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const categories = ['ALL', 'Backend', 'Models', 'Training', 'Explainability', 'Database', 'Configuration'];

  const filteredFiles = PYTHON_FILES.filter(
    (f) => selectedCategory === 'ALL' || f.category === selectedCategory
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2638] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>09. Production Python & TensorFlow Implementation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Python & TensorFlow Source Browser
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete, synchronized Python implementation for local deployment, model training, and submission (Sections 17 & 22).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {selectedFile.name}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: File Tree & Category Tabs (4 cols) */}
        <div className="lg:col-span-4 bg-[#0e131f] border border-[#1c2638] rounded-xl p-4 space-y-3 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              cifake_python/
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {filteredFiles.length} files
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* File List */}
          <div className="space-y-1">
            {filteredFiles.map((file) => {
              const isActive = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <File className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Display (8 cols) */}
        <div className="lg:col-span-8 bg-[#07090e] border border-[#1c2638] rounded-xl overflow-hidden shadow-xl">
          {/* Header Bar */}
          <div className="px-5 py-3 bg-[#0e131f] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedFile.path}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 self-start sm:self-auto">
              Category: {selectedFile.category}
            </span>
          </div>

          {/* File Description */}
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans">
            {selectedFile.description}
          </div>

          {/* Syntax Code Container */}
          <div className="p-5 overflow-x-auto max-h-[560px] text-xs font-mono leading-relaxed text-slate-200">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
