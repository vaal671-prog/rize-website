"""
Calorie/macro targets for the /resultats page — the live questionnaire only
collects raw answers (no macro math happens client-side), so the pipeline
computes them here before building the results link.

Method: Mifflin-St Jeor BMR (male — every silhouette/photo on the site is
male, this is a men's coaching offer and the questionnaire never asks for
sex), x an activity multiplier blending job activity + training frequency,
then a goal/pace-based adjustment. Macros: 2g protein/kg bodyweight,
25% of calories from fat, remainder from carbs.
"""

# Base TDEE multiplier by weekly training frequency (days/week).
FREQUENCY_MULTIPLIER = {
    "3": 1.375,
    "4": 1.4625,
    "5": 1.55,
}

# Nudge from job/daily activity level, layered on top of the training multiplier.
WORK_ACTIVITY_ADJUSTMENT = {
    "sedentaire": -0.05,
    "modere": 0.0,
    "tres_actif": 0.10,
}

# Matches the deficit % already stated in the pace step's own UI copy
# (see lib/questionnaire-data.ts "pace" step descriptions).
LOSS_PACE_DEFICIT = {
    "lente": 0.10,
    "moderee": 0.15,
    "rapide": 0.20,
}

# No loss-side copy to mirror for a bulk, so a standard lean-bulk surplus scale.
GAIN_PACE_SURPLUS = {
    "lente": 0.05,
    "moderee": 0.10,
    "rapide": 0.15,
}


def compute_macros(answers: dict) -> dict:
    age = float(answers.get("age_years") or _age_bucket_midpoint(answers.get("age")))
    weight = float(answers["weightKg"])
    height = float(answers["heightCm"])

    bmr = 10 * weight + 6.25 * height - 5 * age + 5

    freq_mult = FREQUENCY_MULTIPLIER.get(str(answers.get("frequencyPerWeek")), 1.4625)
    work_adj = WORK_ACTIVITY_ADJUSTMENT.get(answers.get("workActivity"), 0.0)
    maintenance = round(bmr * (freq_mult + work_adj))

    goal = answers.get("goal")
    pace = answers.get("pace")
    if goal == "perte_gras":
        adjustment = 1 - LOSS_PACE_DEFICIT.get(pace, 0.15)
    elif goal == "prise_muscle":
        adjustment = 1 + GAIN_PACE_SURPLUS.get(pace, 0.10)
    else:
        adjustment = 1.0
    calories = round(maintenance * adjustment)

    proteines = round(weight * 2)
    lipides = round(calories * 0.25 / 9)
    glucides = max(0, round((calories - proteines * 4 - lipides * 9) / 4))

    return {
        "maintenance": maintenance,
        "calories": calories,
        "proteines": proteines,
        "glucides": glucides,
        "lipides": lipides,
    }


# The sheet stores age as a bucket ("18-24", "55+", ...), not a single value —
# use each bucket's midpoint as a reasonable stand-in for the exact age.
_AGE_BUCKET_MIDPOINTS = {
    "18-24": 21,
    "25-34": 29,
    "35-44": 39,
    "45-54": 49,
    "55+": 58,
}


def _age_bucket_midpoint(bucket: str | None) -> float:
    return _AGE_BUCKET_MIDPOINTS.get(bucket or "", 30)
