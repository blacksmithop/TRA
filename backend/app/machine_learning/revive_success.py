from app import models
from time import time


def calculate_target_score(revives: models.ReviveResponse) -> float:
    """
    Calculate the target score based on revive timestamps.
    
    Args:
        revives: ReviveResponse containing list of revive attempts
        
    Returns:
        float: Calculated score for the target
    """
    total = 0.0
    current_time = int(time())
    
    for revive in revives.revives:
        time_diff = current_time - revive.timestamp
        if time_diff < 86400:  # Only consider revives within last 24 hours
            total += 1 - (time_diff / 86400)  # 86,400 seconds = 24 hours
    
    return total

def calculate_revive_chance(skill_reviver: float, revives: models.ReviveResponse) -> models.ReviveChance:
    """
    Calculate the chance of successful revive.
    
    Args:
        skill_reviver: Reviver's skill level (0-100)
        score_target: Calculated score for the target
        
    Returns:
        float: Percentage chance of successful revive (0-100)
    """
    target_score = calculate_target_score(revives=revives)
    _chance = 90 + (skill_reviver / 10) - target_score * (8 - skill_reviver / 25)
    chance = max(0, min(100, _chance))
    return models.ReviveChance(target_score=target_score, revive_chance=chance)
    