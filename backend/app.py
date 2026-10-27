from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import json
import torch
import timm
from PIL import Image
import torchvision.transforms as transforms
import io
from get_recom import get_recommendation, apply_treatment

app = Flask(__name__)
CORS(app)
DB_PATH = 'agridna3.db' # Renamed to ensure fresh schema instance

# --- DATABASE INIT ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT,
        place TEXT,
        land_size TEXT,
        password_hash TEXT,
        soil_n INTEGER,
        soil_p INTEGER,
        soil_k INTEGER
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS history (
        scan_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        date TEXT,
        disease TEXT,
        location TEXT,
        weather_code INTEGER,
        temperature REAL,
        recom_json TEXT,
        FOREIGN KEY(user_id) REFERENCES users(user_id)
    )''')
    conn.commit()
    conn.close()

init_db()

# --- MODEL INIT ---
print("Loading Model...")
try:
    checkpoint = torch.load("best_model.pth", map_location="cpu")
    classes = checkpoint["classes"]
    num_classes = len(classes)
    model = timm.create_model('efficientnet_b3', pretrained=False, num_classes=num_classes)
    model.load_state_dict(checkpoint["model_state"])
    model.eval()
    transform = transforms.Compose([
        transforms.Resize((300, 300)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    MODEL_LOADED = True
    print("Model Loaded Successfully.")
except Exception as e:
    print(f"Warning: Failed to load best_model.pth. {e}")
    MODEL_LOADED = False
    classes = ["bacterial_leaf_blight", "blast", "brown_spot", "healthy"] 

# --- AUTH ROUTES ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    user_id = data.get('user_id')
    name = data.get('name')
    place = data.get('place', 'Unknown')
    land_size = data.get('land_size', '')
    password = data.get('password')
    
    if not all([user_id, name, password]):
        return jsonify({"error": "Missing fields"}), 400
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        # Default soil health starts at 80-60-70
        c.execute("INSERT INTO users (user_id, name, place, land_size, password_hash, soil_n, soil_p, soil_k) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                  (user_id, name, place, land_size, generate_password_hash(password), 80, 60, 70))
        conn.commit()
        return jsonify({"success": True, "message": "Registered successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "User already exists"}), 409
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user_id = data.get('user_id')
    password = data.get('password')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT name, place, land_size, password_hash FROM users WHERE user_id = ?", (user_id,))
    user = c.fetchone()
    conn.close()
    
    if user and check_password_hash(user[3], password):
        return jsonify({"success": True, "name": user[0], "place": user[1], "land_size": user[2], "user_id": user_id})
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# --- SCAN ROUTE ---
@app.route('/api/scan', methods=['POST'])
def scan():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    file = request.files['image']
    user_id = request.form.get('user_id', 'anonymous')
    location = request.form.get('location', 'Unknown')
    weather_code = request.form.get('weather_code')
    weather_code = int(weather_code) if weather_code else None
    temp = request.form.get('temperature')
    temp = float(temp) if temp else None

    # Predict Disease
    disease = "healthy"
    try:
        if MODEL_LOADED:
            image = Image.open(io.BytesIO(file.read())).convert("RGB")
            tensor_img = transform(image).unsqueeze(0)
            with torch.no_grad():
                output = model(tensor_img)
                _, pred = torch.max(output, 1)
            disease = classes[pred.item()]
        else:
            disease = "blast" # Dummy fallback
    except Exception as e:
        print("Prediction error:", e)

    # DRY RUN FOR UI PREVIEW
    if request.form.get("dry_run") == "true":
        return jsonify({"success": True, "disease": disease})

    # -------------------------
    # Soil Intelligence Pipeline
    # -------------------------
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Get current soil values
    c.execute("SELECT soil_n, soil_p, soil_k FROM users WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    soil = {"N": row[0], "P": row[1], "K": row[2]} if row else {"N": 80, "P": 60, "K": 70}

    # Defaults
    status_level = 'healthy'
    action = "Keep up the good work!"
    new_soil = soil.copy()

    if disease.lower() == "healthy":
        recom = {
            "disease": "healthy", 
            "risk": "LOW",
            "status": "✅ Plant Looks Healthy! No action needed.", 
            "bio_solution": "Maintain normal care.",
            "weather_advice": "Perfect day for farming.",
            "why_occurs": "Standard healthy crop cycle."
        }
    else:
        # Apply treatment to get new soil status
        new_soil, status_level, action = apply_treatment(soil, disease)
        # Get pesticide details
        recom = get_recommendation(disease, weather_code, temp)
        
    # Inject our visual UI values for the React frontend
    recom["soil_level"] = status_level  # 🟢, 🟡, 🔴
    recom["soil_action"] = action       # simplified action text

    # Save exact new values to user
    if row:
        c.execute("UPDATE users SET soil_n = ?, soil_p = ?, soil_k = ? WHERE user_id = ?",
                  (new_soil["N"], new_soil["P"], new_soil["K"], user_id))
    else:
        c.execute("INSERT INTO users (user_id, name, place, land_size, password_hash, soil_n, soil_p, soil_k) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                  (user_id, 'Anonymous Farm', 'Unknown', '0', '', new_soil["N"], new_soil["P"], new_soil["K"]))

    # Save to history
    date_str = datetime.datetime.now().isoformat()
    # Ensure recom is a dict before JSON dumping
    recom_str = json.dumps(recom)
    c.execute('''INSERT INTO history (user_id, date, disease, location, weather_code, temperature, recom_json)
                 VALUES (?, ?, ?, ?, ?, ?, ?)''', 
              (user_id, date_str, disease, location, weather_code, temp, recom_str))
    
    conn.commit()
    conn.close()

    return jsonify({"success": True, "disease": disease, "recommendation": recom})

# --- HISTORY ROUTE ---
@app.route('/api/history/<user_id>', methods=['GET'])
def get_history(user_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM history WHERE user_id = ? ORDER BY scan_id DESC", (user_id,))
    rows = c.fetchall()
    conn.close()
    
    history = []
    for r in rows:
        history.append({
            "scan_id": r["scan_id"],
            "date": r["date"],
            "disease": r["disease"],
            "location": r["location"],
            "temperature": r["temperature"],
            "recommendation": json.loads(r["recom_json"]) if r["recom_json"] else {}
        })
    return jsonify({"success": True, "history": history})

# --- SOIL ROUTE ---
@app.route('/api/soil/<user_id>', methods=['GET'])
def get_soil(user_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Get Soil N, P, K
    c.execute("SELECT soil_n, soil_p, soil_k FROM users WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    if not row:
        soil = {"N": 80, "P": 60, "K": 70}
        c.execute("INSERT INTO users (user_id, name, place, land_size, password_hash, soil_n, soil_p, soil_k) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                  (user_id, 'Anonymous Farm', 'Unknown', '0', '', 80, 60, 70))
        conn.commit()
    else:
        soil = {"N": row["soil_n"], "P": row["soil_p"], "K": row["soil_k"]}
    
    # Recalculate level
    avg = (soil["N"] + soil["P"] + soil["K"]) / 3
    if avg > 50:
        level, action = 'healthy', "All good. Continue farming."
    elif 30 < avg <= 50:
        level, action = 'medium', "Grow legumes (beans, pulses) to restore nutrients."
    else:
        level, action = 'critical', "Apply Vermicompost immediately."

    # Get specific timeline from history (Last 5 impact events)
    c.execute("SELECT date, disease, recom_json FROM history WHERE user_id = ? AND disease != 'healthy' ORDER BY scan_id DESC LIMIT 5", (user_id,))
    events = c.fetchall()
    timeline = []
    
    # We show them latest-first in the UI
    for idx, event in enumerate(events):
        d = datetime.datetime.fromisoformat(event["date"])
        # Use simple date display
        title = f"{event['disease'].replace('_', ' ').title()} detected"
        recom = json.loads(event["recom_json"]) if event["recom_json"] else {}
        action_taken = recom.get("pesticide", recom.get("bio_solution", "Applied Treatment"))
        summary = f"Impact: {action_taken}"
        timeline.append({"title": title, "summary": summary, "date": d.strftime("%b %d, %H:%M")})

    return jsonify({"success": True, "soil": soil, "level": level, "action": action, "timeline": timeline})

@app.route('/api/soil/heal', methods=['POST'])
def heal_soil():
    data = request.json
    user_id = data.get('user_id')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT soil_n, soil_p, soil_k FROM users WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    if not row:
        n, p, k = 100, 100, 100 # Reset fallback values directly
        c.execute("INSERT INTO users (user_id, name, place, land_size, password_hash, soil_n, soil_p, soil_k) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                  (user_id, 'Anonymous Farm', 'Unknown', '0', '', n, p, k))
    else:
        # Heal stats
        n = min(row[0] + 15, 100)
        p = min(row[1] + 15, 100)
        k = min(row[2] + 15, 100)
        c.execute("UPDATE users SET soil_n=?, soil_p=?, soil_k=? WHERE user_id=?", (n, p, k, user_id))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Soil Health Restored!", "new_stats": {"N": n, "P": p, "K": k}})

if __name__ == '__main__':
    app.run(debug=True, port=5000)