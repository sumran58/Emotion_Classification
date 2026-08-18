import tensorflow as tf

model = tf.keras.models.load_model(
    "Artifacts/bigru_model_fixed.keras",
    compile=False
)

print("Model loaded successfully!")
model.summary()