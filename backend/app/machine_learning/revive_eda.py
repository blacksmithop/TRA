# app/machine_learning/revive_eda.py
from typing import List, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime
from app import models

def _ensure_list_of_dicts(data: Any) -> List[Dict[str, Any]]:
    """Normalise any plausible payload → list[dict]"""
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
    """
    Returns a **fully-validated** ``models.ReviveResponse`` instance.

    All enriched columns are added **as top-level keys** on each revive dict
    (``Success``, ``Category``, ``Chance``, ``Likelihood``, ``Gain``).
    """
    revives = _ensure_list_of_dicts(raw_revives)
    if not revives:
        return models.ReviveResponse(
            revives=[],
            _metadata=models.MetadataFull(total=0, enriched_at=datetime.utcnow()),
        )

    # ------------------------------------------------------------------
    # 2. DataFrame with a clean sequential index
    # ------------------------------------------------------------------
    df = pd.DataFrame(revives).reset_index(drop=True)

    # ------------------------------------------------------------------
    # 3. Top-level derived columns
    # ------------------------------------------------------------------
    df["Success"] = df["result"].apply(lambda x: x == "success")
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

    # ------------------------------------------------------------------
    # 4. Skill-Gain (only for revives *given* by the user)
    # ------------------------------------------------------------------
    gain_col = "Gain"
    df[gain_col] = np.nan

    reviver_ids = df["reviver"].apply(lambda r: r.get("id"))
    target_ids = df["target"].apply(lambda t: t.get("id"))
    mask_my = (reviver_ids == user_revive_id) & (target_ids != user_revive_id)

    my_idx = df.index[mask_my].tolist()
    if my_idx:
        skills = df.loc[mask_my, "reviver"].apply(lambda r: r.get("revive_skill", 0.0))
        gains = skills.diff(periods=-1).round(2)               # next - current
        prev_skill = skills.shift(1)
        gains = np.where(prev_skill >= 100, 0.0, gains)       # cap at 100

        # Convert to Series → safe .iloc assignment for the last row
        gains_series = pd.Series(gains, index=skills.index)
        gains_series.iloc[-1] = np.nan
        df.loc[my_idx, gain_col] = gains_series.values

    # ------------------------------------------------------------------
    # 5. Build list of enriched dicts (Pydantic will validate)
    # ------------------------------------------------------------------
    enriched_dicts = []
    new_fields = ["Success", "Category", "Chance", "Likelihood", "Gain"]

    for i in range(len(df)):
        rec = df.iloc[i].to_dict()
        # Pull only the original API fields + the enriched ones
        base = {
            "id": rec["id"],
            "reviver": rec["reviver"],
            "target": rec["target"],
            "result": rec["result"],
            "success_chance": rec["success_chance"],
            "timestamp": rec["timestamp"],
        }
        # Add enriched top-level fields (None if NaN)
        for f in new_fields:
            val = rec.get(f)
            base[f] = None if pd.isna(val) else val

        enriched_dicts.append(base)

    # ------------------------------------------------------------------
    # 6. Return the fully-typed response
    # ------------------------------------------------------------------
    return models.ReviveResponse(
        revives=[models.ReviveFull(**d) for d in enriched_dicts],
        _metadata=models.MetadataFull(
            links={} # whats this for?
        ),
    )