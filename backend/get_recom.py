import json

DATA = {
    "bacterial_leaf_blight": {
        "type": "high",
        "why_occurs": "Caused by Xanthomonas oryzae bacteria, favored by high humidity, warm temperatures, and heavy rains. It enters the plant through wounds or natural openings in the leaf.",
        "pesticide": "Kasugamycin + Copper Oxychloride",
        "quantity": "2.5 ml/L + 2.5 g/L",
        "when": "Early symptoms, repeat every 7–10 days",
        "how": "Fine mist spray, cover both leaf sides"
    },
    "bacterial_leaf_streak": {
        "type": "high",
        "why_occurs": "Caused by Xanthomonas oryzae pv. oryzicola. Thrives in severe storms and high humidity. It spreads through mechanical wounding of leaves during strong winds or heavy rain.",
        "pesticide": "Copper Hydroxide",
        "quantity": "2 g/L",
        "when": "At first streak appearance",
        "how": "Light spray, avoid runoff"
    },
    "bacterial_panicle_blight": {
        "type": "high",
        "why_occurs": "Caused by Burkholderia glumae, highly associated with unusually high temperatures during the booting and heading stages. Spread rapidly via infected seeds.",
        "pesticide": "Oxolinic Acid",
        "quantity": "1 ml/L",
        "when": "Booting & flowering stage",
        "how": "Target panicles directly"
    },
    "blast": {
        "type": "high",
        "why_occurs": "Caused by the fungus Magnaporthe oryzae. Outbreaks happen during extended periods of free moisture on leaves, cool nights, and high nitrogen fertilizer levels.",
        "pesticide": "Tricyclazole",
        "quantity": "0.6 g/L",
        "when": "First spots, repeat 10–14 days",
        "how": "Uniform full-field spray"
    },
    "tungro": {
        "type": "high",
        "why_occurs": "A viral disease transmitted by the Green Leafhopper insect. Spreads rapidly when insect populations peak during late planting or adjacent staggered planting.",
        "pesticide": "Imidacloprid",
        "quantity": "0.3 ml/L",
        "when": "When leafhoppers appear",
        "how": "Spray base & underside of leaves"
    },
    "dead_heart": {
        "type": "high",
        "why_occurs": "Caused by Stem Borer larvae burrowing into the tillers. The eggs hatch and larvae penetrate the stem, cutting off the nutrient supply to the shoot context.",
        "pesticide": "Chlorantraniliprole",
        "quantity": "0.4 ml/L",
        "when": "When dead heart symptom appears",
        "how": "Spray at plant base"
    },

    "brown_spot": {
        "type": "low",
        "why_occurs": "Caused by Bipolaris oryzae fungus. Often a sign of nutrient deficiency (Nitrogen, Potassium) or poor soil health and water scarcity.",
        "solution": "Neem Extract",
        "prep": "1 kg neem leaves + 5L water → filter → dilute to 10L",
        "when": "Early spotting, repeat 7–10 days",
        "how": "Uniform spray on leaves"
    },
    "downy_mildew": {
        "type": "low",
        "why_occurs": "Caused by Sclerophthora macrospora, triggered by prolonged flooding or highly stagnant water during early vegetative stages.",
        "solution": "Buttermilk Spray",
        "prep": "1L sour buttermilk + 5L water → ferment 1–2 days",
        "when": "Early stage, morning spray",
        "how": "Spray underside of leaves"
    },
    "hispa": {
        "type": "low",
        "why_occurs": "Rice Hispa beetle scrapes the upper surface of leaves. Outbreaks happen after heavy rains followed by dry spells in poorly weeded fields.",
        "solution": "Garlic-Chili Spray",
        "prep": "100g garlic + 50g chili + 5L water + soap",
        "when": "At first insect damage",
        "how": "Spray directly on insects"
    }
}

treatment_impact = {
    "blast": {"N": -10, "P": -5, "K": -5},
    "bacterial_leaf_blight": {"N": -8, "P": -4, "K": -4},
    "bacterial_leaf_streak": {"N": -8, "P": -4, "K": -4},
    "bacterial_panicle_blight": {"N": -8, "P": -4, "K": -4},
    "tungro": {"N": -6, "P": -3, "K": -3},
    "dead_heart": {"N": -7, "P": -3, "K": -2},
    # bio interventions have a tiny positive/neutral impact
    "brown_spot": {"N": 1, "P": 1, "K": 1},
    "downy_mildew": {"N": 1, "P": 1, "K": 1},
    "hispa": {"N": 1, "P": 1, "K": 1},
}

def apply_treatment(soil, disease):
    impact = treatment_impact.get(disease, {"N": 0, "P": 0, "K": 0})
    
    for key in soil:
        soil[key] += impact[key]
        soil[key] = max(soil[key], 0)  # avoid negative
    
    avg = (soil["N"] + soil["P"] + soil["K"]) / 3

    if avg > 50:
        return soil, 'healthy', "Continue farming ✅"
    elif 30 < avg <= 50:
        return soil, 'medium', "Grow legumes (beans, pulses) to restore nutrients 🌾"
    else:
        return soil, 'critical', "Apply Vermicompost (2 tons/acre) immediately ⚠️"

def get_recommendation(disease, weather_code=None, temperature=None):
    if not isinstance(disease, str):
        return {"error": "Invalid disease input"}

    disease = disease.lower()
    
    # Simple Open-Meteo weather codes parser
    weather_cond = "clear"
    if weather_code is not None:
        if 51 <= weather_code <= 67 or 80 <= weather_code <= 82:
            weather_cond = "rainy"
        elif weather_code >= 95:
            weather_cond = "stormy"

    weather_warning = "✅ Safe to spray today."
    if weather_cond in ["rainy", "stormy"]:
        weather_warning = "❌ Do NOT spray today. Rain expected."
    elif temperature and temperature > 35:
        weather_warning = "⚠️ Too hot. Spray ONLY in the evening."

    if disease not in DATA:
        return {"error": f"Disease {disease} not found in knowledge base."}

    d = DATA[disease]

    result = {
        "disease": disease,
        "risk": "HIGH" if d["type"] == "high" else "LOW",
        "why_occurs": d.get("why_occurs", ""),
        "weather_advice": weather_warning,
    }

    if d["type"] == "high":
        result.update({
            "pesticide": d["pesticide"],
            "quantity": d["quantity"],
            "when_to_spray": d["when"],
            "how_to_spray": d["how"],
        })
    else:
        result.update({
            "bio_solution": d["solution"],
            "preparation": d["prep"],
            "when_to_spray": d["when"],
            "how_to_spray": d["how"]
        })

    return result
