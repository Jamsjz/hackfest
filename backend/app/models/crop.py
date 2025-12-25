from typing import Any
import pandas as pd
import numpy as np
from app.core.constants import CROPS_USED, MODEL_ALPHA, MODEL_GOLDUNIT


class Model:
    """ML Model for crop recommendation based on soil parameters"""

    def __init__(
        self,
        alpha=MODEL_ALPHA,
        goldunit=MODEL_GOLDUNIT,
        crops_used=CROPS_USED,
    ):
        self._df = pd.read_csv("app/data/data.csv")
        self.alpha = alpha
        self.goldunit = goldunit
        self.crops_used = crops_used
        self.df_filtered = self._df[self._df["label"].isin(self.crops_used)]
        self.summary_dict = self.df_filtered.groupby("label").mean().T.to_dict()
        self.d = {k: np.array(list(v.values())) for k, v in self.summary_dict.items()}

    def predict(self, params: np.ndarray) -> dict:
        """
        Calculate distance from params to each crop's ideal conditions.
        Order of params: ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        Returns dict of {crop_name: distance}
        """
        return {k: float(np.linalg.norm(v - params)) for k, v in self.d.items()}

    def topn(self, n: int, params: np.ndarray) -> tuple[list[str], dict[str, Any]]:
        """
        Get top N recommended crops based on soil parameters.

        Args:
            n: Number of top crops to return
            params: np.array of [N, P, K, temperature, humidity, ph, rainfall]
            predict_gold: If True, convert distances to gold predictions

        Returns:
            tuple of (top_crop_names, prediction_dict)
        """
        predictions = self.predict(params)
        if not predictions:
            return [], {}

        # Sort by distance (lower is better)
        sorted_predictions = dict(sorted(predictions.items(), key=lambda item: item[1]))
        top_keys = list(sorted_predictions.keys())[:n]
        return top_keys, sorted_predictions
