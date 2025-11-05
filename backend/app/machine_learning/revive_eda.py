from typing import List, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime
from app import models


def _ensure_list_of_dicts(data: Any) -> List[Dict[str, Any]]:
    if isinstance(data, list):
        return data
    if isinstance(data, pd.DataFrame):
        return data.to_dict(orient="records")
    if isinstance(data, dict):
        for key in ("revives", "data", "results"):
            if key in data:
                return _ensure_list_of_dicts(data[key])
    raise ValueError("Expected list of revive dicts or wrapper")


def enrich_revives(
    raw_revives: Any,
    user_revive_id: int,
) -> models.ReviveResponse:
    revives = _ensure_list_of_dicts(raw_revives)
    if not revives:
        return models.ReviveResponse(
            revives=[],
            _metadata=models.MetadataFull(total=0, enriched_at=datetime.utcnow()),
        )

    df = pd.DataFrame(revives).reset_index(drop=True)

    df["Success"] = df["result"] == "success"
    df["Hospitalized By"] = df["target"].apply(lambda t: t.get("hospital_reason", ""))

    def _category(reason: str) -> str:
        if any(p in reason for p in ("Lost to", "Mugged by", "Hospitalized by")):
            return "PvP"
        if any(o in reason for o in ("Overdosed on", "Collapsed after")):
            return "OD"
        return "Crime"

    df["Category"] = df["Hospitalized By"].apply(_category)
    df["Chance"] = pd.to_numeric(
        df["success_chance"].astype(str).str.rstrip("%"), errors="coerce"
    )

    bins = [0, 30, 60, 80, 100]
    labels = ["Low", "Medium", "High", "Very High"]
    df["Likelihood"] = pd.cut(
        df["Chance"], bins=bins, labels=labels, include_lowest=True
    )

    gain_col = "Gain"
    df[gain_col] = np.nan

    reviver_ids = pd.to_numeric(df["reviver"].apply(lambda r: r.get("id")), errors="coerce")
    target_ids = pd.to_numeric(df["target"].apply(lambda t: t.get("id")), errors="coerce")

    mask_my_revives = (reviver_ids == user_revive_id) & (target_ids != user_revive_id)
    mask_success = df["result"] == "success"
    mask = mask_my_revives & mask_success

    my_successful_idx = df.index[mask].tolist()
    if len(my_successful_idx) >= 2:
        my_df = df.loc[mask].sort_values("timestamp").reset_index(drop=True)
        skills = pd.to_numeric(my_df["reviver"].apply(lambda r: r.get("revive_skill", np.nan)), errors="coerce")
        gains = skills.diff(periods=-1).round(2)
        gains = pd.Series(np.where(skills.shift(-1) >= 100, 0.0, gains), index=gains.index)
        gains.iloc[-1] = np.nan
        original_idx = my_df.index
        df.loc[original_idx[:-1], gain_col] = gains.iloc[:-1].values

    enriched_dicts = []
    new_fields = ["Success", "Category", "Chance", "Likelihood", "Gain"]

    for i in range(len(df)):
        rec = df.iloc[i].to_dict()
        base = {
            "id": rec["id"],
            "reviver": rec["reviver"],
            "target": rec["target"],
            "result": rec["result"],
            "success_chance": rec["success_chance"],
            "timestamp": rec["timestamp"],
        }
        for f in new_fields:
            val = rec.get(f)
            base[f] = None if pd.isna(val) else val
        enriched_dicts.append(base)

    return models.ReviveResponse(
        revives=[models.ReviveFull(**d) for d in enriched_dicts],
        _metadata=models.MetadataFull(
            links={},
            enriched_at=datetime.utcnow(),
        ),
    )