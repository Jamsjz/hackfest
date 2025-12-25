import tensorflow as tf
import numpy as np
from PIL import Image
import io

MODEL_PATH = "app/data/model.h5"
model = None
IMG_HEIGHT = 220  # Assuming a fixed image height for the model
IMG_WIDTH = 220  # Assuming a fixed image width for the model
SOIL_TYPES = [
    "Black Soil",
    "Cinder Soil",
    "Laterite Soil",
    "Peat Soil",
    "Yellow Soil",
]


model = tf.keras.models.load_model(MODEL_PATH)


def preprocess_image(image_file):
    img = Image.open(image_file).convert("RGB")
    img = img.resize((IMG_WIDTH, IMG_HEIGHT))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)  # Create a batch
    return img_array


def predict_soil_type_from_file(image_file: io.BytesIO):
    if model is None:
        return "Unknown", 0.0  # Or raise an error, depending on desired behavior

    preprocessed_image = preprocess_image(image_file)
    predictions = model.predict(preprocessed_image)

    # Assuming predictions is a 2D array like [[0.1, 0.8, 0.1]]
    predicted_class_index = np.argmax(predictions, axis=1)[0]

    if predicted_class_index < len(SOIL_TYPES):
        predicted_soil_type = SOIL_TYPES[predicted_class_index]
    else:
        predicted_soil_type = "Unknown"

    return predicted_soil_type
