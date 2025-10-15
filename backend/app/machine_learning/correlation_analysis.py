from scipy.stats import pearsonr
from typing import Dict
import numpy as np
import json

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, float) and (np.isnan(obj) or np.isinf(obj)):
            return None  # Replace nan or inf with None for JSON compatibility
        return super().default(obj)

def calculate_skill_success_correlation(data: Dict, my_id: int):
    # Filter revives for the given player ID with non-None skill
    my_revives = [
        r
        for r in data["revives"]
        if r["reviver"]["id"] == my_id and r["reviver"]["skill"] is not None
    ]
    
    if not my_revives:
        raise ValueError("No valid revives found for the given player ID.")

    # Sort by timestamp
    my_revives.sort(key=lambda x: x["timestamp"])

    chances = []
    gains = []
    for i in range(len(my_revives) - 1):
        chances.append(my_revives[i]["success_chance"])
        gain = (
            my_revives[i + 1]["reviver"]["skill"]
            - my_revives[i]["reviver"]["skill"]
        )
        gains.append(gain)

    # Convert to numpy arrays and replace NaN with 0.0
    chances = np.array(chances)
    gains = np.array(gains)
    chances = np.where(np.isnan(chances), 0.0, chances)
    gains = np.where(np.isnan(gains), 0.0, gains)

    if len(chances) < 2:
        print("Not enough data points for correlation (need at least 2).")
        return 0.0, 0.0
    
    # Check for constant input
    if np.std(chances) == 0 or np.std(gains) == 0:
        print("Warning: One or both input arrays are constant. Correlation is undefined.")
        return 0.0, 0.0

    # Calculate Pearson correlation
    try:
        corr, p_value = pearsonr(chances, gains)
        print(f"Pearson correlation coefficient: {corr}")
        print(f"P-value: {p_value}")
        return corr, p_value
    except Exception as e:
        print(f"Error calculating correlation: {e}")
        return 0.0, 0.0

__all__ = ["calculate_skill_success_correlation"]
