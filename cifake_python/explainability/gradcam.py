"""
CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
Explainable AI (XAI) Module: Gradient-weighted Class Activation Mapping (Grad-CAM)

Mathematical Principle:
Grad-CAM computes the gradient of the class score y^c with respect to feature map activations
A^k of the last convolutional layer. The channel neuron importance weights alpha_k^c are obtained
via Global Average Pooling:
    alpha_k^c = (1 / Z) * sum_i sum_j (d y^c / d A_{i,j}^k)

The Grad-CAM heat map L_{Grad-CAM}^c is a weighted combination of forward activation maps
followed by a Rectified Linear Unit (ReLU) to highlight features that positively contribute
to the target class:
    L_{Grad-CAM}^c = ReLU( sum_k alpha_k^c * A^k )

Note on Interpretation:
Highlighted regions indicate areas that contributed more strongly to the model's prediction.
It does not prove ontological authenticity, but provides human-interpretable visual evidence
of the network's spatial attention.
"""

import numpy as np
import tensorflow as tf
import cv2
import matplotlib.pyplot as plt

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    """
    Computes Grad-CAM heatmap tensor for a given input image and target model.
    
    Parameters:
        img_array (np.ndarray): Preprocessed image batch of shape (1, 32, 32, 3).
        model (tf.keras.Model): Trained classification model.
        last_conv_layer_name (str): Name of the target feature map convolutional layer.
        pred_index (int, optional): Target class index (0 for REAL, 1 for FAKE). If None, uses argmax.
        
    Returns:
        np.ndarray: 2D normalized heatmap of shape (32, 32) in range [0, 1].
    """
    # Create sub-model mapping input -> (last conv layer activations, model predictions)
    grad_model = tf.keras.models.Model(
        inputs=[model.inputs],
        outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        if pred_index is None:
            pred_index = tf.argmax(preds[0])
        class_channel = preds[:, pred_index]

    # Compute gradients of the predicted class score w.r.t. the convolutional feature maps
    grads = tape.gradient(class_channel, last_conv_layer_output)

    # Global Average Pooling of gradients to obtain importance weight per channel
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Weight the convolutional feature maps by corresponding gradient importance
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # Apply ReLU to focus on features having positive impact on target class
    heatmap = tf.maximum(heatmap, 0.0) / (tf.math.reduce_max(heatmap) + 1e-10)
    return heatmap.numpy()

def generate_gradcam_overlay(original_image, heatmap, alpha=0.45, colormap=cv2.COLORMAP_JET):
    """
    Overlays Grad-CAM heatmap onto the original image.
    
    Parameters:
        original_image (np.ndarray): Original image (RGB format, shape (H, W, 3), range [0, 255] or [0, 1]).
        heatmap (np.ndarray): 2D float array in range [0, 1].
        alpha (float): Transparency factor for heatmap overlay (0.0 to 1.0).
        colormap: OpenCV colormap (COLORMAP_JET or COLORMAP_VIRIDIS).
        
    Returns:
        tuple: (colored_heatmap, overlay_image)
    """
    if original_image.max() <= 1.0:
        orig = np.uint8(255 * original_image)
    else:
        orig = np.uint8(original_image)

    # Resize heatmap to match original image dimensions
    heatmap_resized = cv2.resize(heatmap, (orig.shape[1], orig.shape[0]))
    heatmap_uint8 = np.uint8(255 * heatmap_resized)

    # Apply colormap
    colored_heatmap = cv2.applyColorMap(heatmap_uint8, colormap)
    colored_heatmap_rgb = cv2.cvtColor(colored_heatmap, cv2.COLOR_BGR2RGB)

    # Blend original and heatmap
    overlay = cv2.addWeighted(colored_heatmap_rgb, alpha, orig, 1 - alpha, 0)
    return colored_heatmap_rgb, overlay
