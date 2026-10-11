"""
CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
Flask Web Application Backend
"""

import os
import uuid
from pathlib import Path
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import numpy as np
import cv2

import config
from database.database import (
    init_db, register_user, authenticate_user,
    save_prediction, get_user_history, get_user_dashboard_stats
)
from training.preprocess import preprocess_single_image
from explainability.gradcam import make_gradcam_heatmap, generate_gradcam_overlay

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)
app.secret_key = config.SECRET_KEY
app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH

# Initialize database
init_db()

# Global model cache
LOADED_MODELS = {}

def get_model(model_type="modified_cnn2d"):
    """Loads and caches the requested TensorFlow model on demand."""
    import tensorflow as tf
    if model_type in LOADED_MODELS:
        return LOADED_MODELS[model_type]

    model_path = config.MODIFIED_CNN2D_MODEL_PATH if model_type == "modified_cnn2d" else config.CNN2D_MODEL_PATH
    if not os.path.exists(model_path):
        return None

    try:
        model = tf.keras.models.load_model(model_path)
        LOADED_MODELS[model_type] = model
        return model
    except Exception as e:
        print(f"[ERROR] Failed to load model {model_path}: {e}")
        return None

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS

# ==========================================
# AUTHENTICATION ROUTES
# ==========================================

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        if not name or not email or not password:
            flash("All fields are required.", "danger")
            return render_template("register.html")

        if len(password) < 6:
            flash("Password must be at least 6 characters long.", "danger")
            return render_template("register.html")

        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return render_template("register.html")

        res = register_user(name, email, password)
        if res["success"]:
            flash("Account registered successfully! Please log in.", "success")
            return redirect(url_for("login"))
        else:
            flash(res["error"], "danger")

    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        user = authenticate_user(email, password)
        if user:
            session["user_id"] = user["id"]
            session["user_name"] = user["name"]
            session["user_email"] = user["email"]
            flash(f"Welcome back, {user['name']}!", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid email address or password.", "danger")

    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    flash("You have been securely logged out.", "info")
    return redirect(url_for("login"))

# ==========================================
# DASHBOARD & APPLICATION ROUTES
# ==========================================

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        flash("Please log in to access your dashboard.", "warning")
        return redirect(url_for("login"))

    stats = get_user_dashboard_stats(session["user_id"])
    recent_history = get_user_history(session["user_id"])[:5]
    return render_template("dashboard.html", stats=stats, recent_history=recent_history)

@app.route("/upload", methods=["GET", "POST"])
def upload():
    if "user_id" not in session:
        flash("Please log in to make predictions.", "warning")
        return redirect(url_for("login"))

    if request.method == "POST":
        if "image" not in request.files:
            flash("No image file provided.", "danger")
            return render_template("upload.html")

        file = request.files["image"]
        if file.filename == "":
            flash("No file selected.", "danger")
            return render_template("upload.html")

        if not allowed_file(file.filename):
            flash("Invalid file format. Please upload JPG, JPEG, or PNG images.", "danger")
            return render_template("upload.html")

        model_type = request.form.get("model_type", "modified_cnn2d")

        # Save upload securely
        ext = file.filename.rsplit(".", 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        save_path = os.path.join(config.UPLOAD_DIR, unique_filename)
        file.save(save_path)

        # Execute prediction
        return redirect(url_for("predict_route", filename=unique_filename, model_type=model_type))

    return render_template("upload.html")

@app.route("/predict/<filename>")
def predict_route(filename):
    if "user_id" not in session:
        return redirect(url_for("login"))

    model_type = request.args.get("model_type", "modified_cnn2d")
    image_path = os.path.join(config.UPLOAD_DIR, filename)

    if not os.path.exists(image_path):
        flash("Image file not found.", "danger")
        return redirect(url_for("upload"))

    model = get_model(model_type)
    if model is None:
        flash(f"Model ({model_type}) has not been trained yet. Please train the model first.", "warning")
        return render_template("result.html", error="Model training required", filename=filename)

    try:
        # 1. Preprocess
        processed_img = preprocess_single_image(image_path, target_size=config.IMAGE_SIZE)
        input_tensor = np.expand_dims(processed_img, axis=0)

        # 2. Prediction
        predictions = model.predict(input_tensor)[0]
        real_prob = float(predictions[0])
        fake_prob = float(predictions[1])

        pred_idx = int(np.argmax(predictions))
        pred_label = "REAL" if pred_idx == 0 else "FAKE"
        confidence = float(np.max(predictions)) * 100.0

        # 3. Grad-CAM Explainability
        target_layer = config.GRADCAM_TARGET_LAYER_MODIFIED if model_type == "modified_cnn2d" else config.GRADCAM_TARGET_LAYER_CNN2D
        heatmap = make_gradcam_heatmap(input_tensor, model, target_layer, pred_index=pred_idx)

        # Original image reading
        orig_img = cv2.imread(image_path)
        orig_img_rgb = cv2.cvtColor(orig_img, cv2.COLOR_BGR2RGB)
        colored_heatmap, overlay = generate_gradcam_overlay(orig_img_rgb, heatmap)

        # Save Grad-CAM visualization
        gradcam_filename = f"gradcam_{filename}"
        gradcam_path = os.path.join(config.UPLOAD_DIR, gradcam_filename)
        cv2.imwrite(gradcam_path, cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))

        # Save to database
        save_prediction(
            user_id=session["user_id"],
            image_name=filename,
            original_path=filename,
            gradcam_path=gradcam_filename,
            model_type="Modified CNN2D (GAP)" if model_type == "modified_cnn2d" else "Standard CNN2D",
            prediction=pred_label,
            confidence=confidence
        )

        return render_template(
            "result.html",
            filename=filename,
            gradcam_filename=gradcam_filename,
            prediction=pred_label,
            confidence=confidence,
            real_prob=real_prob * 100.0,
            fake_prob=fake_prob * 100.0,
            model_type=model_type
        )

    except Exception as e:
        flash(f"Error during prediction and Grad-CAM generation: {str(e)}", "danger")
        return redirect(url_for("upload"))

@app.route("/history")
def history():
    if "user_id" not in session:
        return redirect(url_for("login"))

    records = get_user_history(session["user_id"])
    return render_template("history.html", records=records)

@app.route("/model-info")
def model_info():
    return render_template("model_info.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
