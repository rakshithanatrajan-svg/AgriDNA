def get_recommendation(disease, weather, temperature):
    
    # -------------------------
    # DATABASE
    # -------------------------
    data = {
        "bacterial_leaf_blight": {
            "type": "high",
            "pesticide": "Kasugamycin + Copper Oxychloride",
            "quantity": "2.5 ml/L + 2.5 g/L",
            "when": "Early symptoms, repeat every 7–10 days",
            "how": "Fine mist spray, cover both leaf sides"
        },
        "bacterial_leaf_streak": {
            "type": "high",
            "pesticide": "Copper Hydroxide",
            "quantity": "2 g/L",
            "when": "At first streak appearance",
            "how": "Light spray, avoid runoff"
        },
        "bacterial_panicle_blight": {
            "type": "high",
            "pesticide": "Oxolinic Acid",
            "quantity": "1 ml/L",
            "when": "Booting & flowering stage",
            "how": "Target panicles directly"
        },
        "blast": {
            "type": "high",
            "pesticide": "Tricyclazole",
            "quantity": "0.6 g/L",
            "when": "First spots, repeat 10–14 days",
            "how": "Uniform full-field spray"
        },
        "tungro": {
            "type": "high",
            "pesticide": "Imidacloprid",
            "quantity": "0.3 ml/L",
            "when": "When leafhoppers appear",
            "how": "Spray base & underside of leaves"
        },
        "dead_heart": {
            "type": "high",
            "pesticide": "Chlorantraniliprole",
            "quantity": "0.4 ml/L",
            "when": "When dead heart symptom appears",
            "how": "Spray at plant base"
        },

        "brown_spot": {
            "type": "low",
            "solution": "Neem Extract",
            "prep": "1 kg neem leaves + 5L water → filter → dilute to 10L",
            "when": "Early spotting, repeat 7–10 days",
            "how": "Uniform spray on leaves"
        },
        "downy_mildew": {
            "type": "low",
            "solution": "Buttermilk Spray",
            "prep": "1L sour buttermilk + 5L water → ferment 1–2 days",
            "when": "Early stage, morning spray",
            "how": "Spray underside of leaves"
        },
        "hispa": {
            "type": "low",
            "solution": "Garlic-Chili Spray",
            "prep": "100g garlic + 50g chili + 5L water + soap",
            "when": "At first insect damage",
            "how": "Spray directly on insects"
        }
    }

    # -------------------------
    # WEATHER LOGIC
    # -------------------------
    weather_warning = None
    
    if weather.lower() == "rainy":
        weather_warning = "❌ Do NOT spray (rain will wash it away)"
    elif temperature > 35:
        weather_warning = "⚠️ Too hot, spray only in evening"
    elif weather.lower() == "windy":
        weather_warning = "⚠️ Avoid spraying (drift loss)"
    else:
        weather_warning = "✅ Safe to spray"

    # -------------------------
    # GET DATA
    # -------------------------
    if disease not in data:
        return {"error": "Disease not found"}

    d = data[disease]

    # -------------------------
    # OUTPUT FORMAT
    # -------------------------
    result = {
        "disease": disease,
        "risk": "HIGH 🚨" if d["type"] == "high" else "LOW 🟡",
        "weather_advice": weather_warning
    }

    if d["type"] == "high":
        result.update({
            "pesticide": d["pesticide"],
            "quantity": d["quantity"],
            "when_to_spray": d["when"],
            "how_to_spray": d["how"]
        })
    else:
        result.update({
            "bio_solution": d["solution"],
            "preparation": d["prep"],
            "when_to_spray": d["when"],
            "how_to_spray": d["how"]
        })

    return result
res = get_recommendation("blast", "rainy", 28)
print(res)