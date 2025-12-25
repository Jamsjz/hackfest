import tensorflow as tf
import numpy as np
from io import BytesIO
from app.core.constants import DISEASE_CLASSES


model = tf.keras.models.load_model("app/data/trained_model.h5")


def predict_disease_from_file(file: BytesIO) -> tuple[str, float]:
    image = tf.keras.utils.load_img(
        file, target_size=(128, 128)
    )  # or tf.keras.preprocessing.image.load_img
    input_arr = tf.keras.utils.img_to_array(image)
    input_arr = np.expand_dims(input_arr, axis=0)  # (1, 128, 128, 3)
    prediction = model.predict(input_arr)
    confidence_score = float(np.max(prediction))
    result_index = int(np.argmax(prediction))
    disease_name = DISEASE_CLASSES[result_index]
    return disease_name, confidence_score
