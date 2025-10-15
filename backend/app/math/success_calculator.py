def calculate_score_target(revives):
    total = 0
    for t in revives:
        total += 1 - (t / 86_400)  # 86,400 seconds = 24 hours
    return total

def calculate_chance(skill_reviver, score_target):
    chance = 90 + (skill_reviver / 10) - score_target * (8 - skill_reviver / 25)
    return max(0, min(100, chance))  # Ensure chance is between 0 and 100

if __name__ == "__main__":
    # Example usage
    revives = [3600, 7200]  # Seconds since revive (e.g., 1 hour, 2 hours)
    score = calculate_score_target(revives)
    skill = 50
    chance = calculate_chance(skill, score)
    print(f"Revive score: {score}")
    print(f"Chance of revive with skill {skill}: {chance}%")