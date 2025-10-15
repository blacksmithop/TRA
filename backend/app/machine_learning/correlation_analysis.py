from scipy.stats import pearsonr
from typing import Dict


def calculate_skill_successs_correlation(data: Dict, my_id: int):
    oxiblurr_revives = [
        r
        for r in data["revives"]
        if r["reviver"]["id"] == my_id and r["reviver"]["skill"] is not None
    ]
    oxiblurr_revives.sort(key=lambda x: x["timestamp"])

    chances = []
    gains = []
    for i in range(len(oxiblurr_revives) - 1):
        chances.append(oxiblurr_revives[i]["success_chance"])
        gain = (
            oxiblurr_revives[i + 1]["reviver"]["skill"]
            - oxiblurr_revives[i]["reviver"]["skill"]
        )
        gains.append(gain)

    if len(chances) >= 2:
        corr, p_value = pearsonr(chances, gains)
        print(f"Pearson correlation coefficient: {corr}")
        print(f"P-value: {p_value}")
        return corr, p_value
    else:
        raise ValueError("Not enough data points for correlation.")


__all__ = ["calculate_skill_successs_correlation"]
