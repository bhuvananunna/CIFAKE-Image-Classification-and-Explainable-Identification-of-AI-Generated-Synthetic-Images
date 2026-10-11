"""
CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
Architecture B: Modified CNN2D Image Classification Model

Key Architectural Enhancements over Standard CNN2D:
1. Global Average Pooling (GAP):
   - Replaces the bulky Flatten() + large Dense() layer.
   - Takes the spatial average of each feature map directly before classification.
   - Drastically reduces parameter count (from ~300k+ to ~75k), minimizing parameter redundancy.
   - Acts as a strong structural regularizer, preventing spatial overfitting on local GAN/diffusion artifacts.
   - Enforces a direct correspondence between feature maps and categories, making Grad-CAM attributions sharper and more interpretable.

2. Strategic Dropout Layers:
   - Dropout(0.25) after spatial pooling blocks breaks co-adaptation of intermediate convolutional filters.
   - Dropout(0.40) before final dense projection prevents dominant neuron reliance when classifying subtle synthetic textures.

3. Batch Normalization:
   - Stabilizes internal covariate shift across training mini-batches.
   - Smooths the optimization landscape, allowing faster convergence and better generalization.
"""

import tensorflow as tf
from tensorflow.keras import layers, models, optimizers

def build_modified_cnn2d(input_shape=(32, 32, 3), num_classes=2, learning_rate=0.001):
    """
    Builds and compiles the Modified CNN2D architecture featuring:
    - Batch Normalization
    - Convolutional Dropout (0.25)
    - Global Average Pooling (GAP)
    - Dense Dropout (0.40)
    
    Parameters:
        input_shape (tuple): Spatial dimensions and channels (32, 32, 3).
        num_classes (int): Number of target classes (2: REAL, FAKE).
        learning_rate (float): Optimizer learning rate.
        
    Returns:
        tf.keras.Model: Compiled Keras model instance.
    """
    model = models.Sequential(name="CIFAKE_Modified_CNN2D_GAP_Dropout")

    # Convolutional Block 1: Low-level spatial feature extraction
    model.add(layers.Input(shape=input_shape, name="input_layer"))
    model.add(layers.Conv2D(32, (3, 3), padding="same", activation="relu", name="modified_conv2d_0"))
    model.add(layers.BatchNormalization(name="batch_norm_0"))
    model.add(layers.Conv2D(32, (3, 3), padding="same", activation="relu", name="modified_conv2d_1"))
    model.add(layers.BatchNormalization(name="batch_norm_1"))
    model.add(layers.MaxPooling2D(pool_size=(2, 2), name="maxpool_0"))
    model.add(layers.Dropout(0.25, name="conv_dropout_0"))

    # Convolutional Block 2: Deep semantic & artifact feature extraction
    model.add(layers.Conv2D(64, (3, 3), padding="same", activation="relu", name="modified_conv2d_2"))
    model.add(layers.BatchNormalization(name="batch_norm_2"))
    # Target feature layer for Grad-CAM explainability
    model.add(layers.Conv2D(64, (3, 3), padding="same", activation="relu", name="modified_conv2d_3"))
    model.add(layers.BatchNormalization(name="batch_norm_3"))
    model.add(layers.MaxPooling2D(pool_size=(2, 2), name="maxpool_1"))
    model.add(layers.Dropout(0.25, name="conv_dropout_1"))

    # Convolutional Block 3: High-level synthetic pattern aggregation
    model.add(layers.Conv2D(128, (3, 3), padding="same", activation="relu", name="modified_conv2d_4"))
    model.add(layers.BatchNormalization(name="batch_norm_4"))

    # CRITICAL MODIFICATION 1: Global Average Pooling (GAP)
    # Computes the 1D average across each HxW feature map (from 8x8x128 -> 128)
    # Eliminates hundreds of thousands of dense weights and prevents overfitting.
    model.add(layers.GlobalAveragePooling2D(name="global_average_pooling"))

    # CRITICAL MODIFICATION 2: Dropout Regularization before output
    model.add(layers.Dense(64, activation="relu", name="dense_projection"))
    model.add(layers.Dropout(0.40, name="dense_dropout"))

    # Output Layer
    model.add(layers.Dense(num_classes, activation="softmax", name="classification_output"))

    optimizer = optimizers.Adam(learning_rate=learning_rate)
    model.compile(
        optimizer=optimizer,
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model

if __name__ == "__main__":
    model = build_modified_cnn2d()
    model.summary()
