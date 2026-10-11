"""
CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
Architecture A: Standard CNN2D Image Classification Model

Architecture Design:
1. Input Layer: (32, 32, 3)
2. Block 1:
   - Conv2D(32, (3, 3), padding='same', activation='relu')
   - Conv2D(32, (3, 3), activation='relu')
   - MaxPooling2D((2, 2))
3. Block 2:
   - Conv2D(64, (3, 3), padding='same', activation='relu')
   - Conv2D(64, (3, 3), activation='relu') -> Last Conv Layer for Grad-CAM
   - MaxPooling2D((2, 2))
4. Dense Classification Head:
   - Flatten()
   - Dense(128, activation='relu')
   - Dense(2, activation='softmax')
"""

import tensorflow as tf
from tensorflow.keras import layers, models, optimizers

def build_cnn2d(input_shape=(32, 32, 3), num_classes=2, learning_rate=0.001):
    """
    Builds and compiles the standard 2D Convolutional Neural Network (CNN2D).
    
    Parameters:
        input_shape (tuple): Spatial dimensions and channels of input images (32, 32, 3).
        num_classes (int): Number of output categories (2: REAL, FAKE).
        learning_rate (float): Optimizer learning rate.
        
    Returns:
        tf.keras.Model: Compiled Keras model instance.
    """
    model = models.Sequential(name="CIFAKE_Standard_CNN2D")

    # Convolutional Block 1: Low-level spatial features (edges, color gradients)
    model.add(layers.Input(shape=input_shape, name="input_layer"))
    model.add(layers.Conv2D(32, (3, 3), padding="same", activation="relu", name="conv2d_0"))
    model.add(layers.Conv2D(32, (3, 3), activation="relu", name="conv2d_1"))
    model.add(layers.MaxPooling2D(pool_size=(2, 2), name="maxpool_0"))

    # Convolutional Block 2: Mid-to-high level representations (textures, synthetic artifacts)
    model.add(layers.Conv2D(64, (3, 3), padding="same", activation="relu", name="conv2d_2"))
    # Named explicitly for Grad-CAM explainability hooks
    model.add(layers.Conv2D(64, (3, 3), activation="relu", name="conv2d_3"))
    model.add(layers.MaxPooling2D(pool_size=(2, 2), name="maxpool_1"))

    # Traditional Flattening & Fully Connected Layer
    # Note: Flattening produces a large 64 * 6 * 6 = 2304 dimensional vector,
    # which introduces significant parameter overhead and vulnerability to overfitting.
    model.add(layers.Flatten(name="flatten"))
    model.add(layers.Dense(128, activation="relu", name="dense_features"))

    # Output Layer: 2 units with Softmax probability distribution
    model.add(layers.Dense(num_classes, activation="softmax", name="classification_output"))

    optimizer = optimizers.Adam(learning_rate=learning_rate)
    model.compile(
        optimizer=optimizer,
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model

if __name__ == "__main__":
    model = build_cnn2d()
    model.summary()
