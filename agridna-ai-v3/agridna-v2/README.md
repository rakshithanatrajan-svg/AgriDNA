# AgriDNA AI — v3 Frontend

Precision agriculture platform with AI-powered crop disease detection, soil health tracking, and village-level outbreak prediction.

## Setup

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 🌿 **Landing Page** — Marketing page with animated particle canvas
- 🔐 **Auth Flow** — Login → OTP verification → Onboarding
- 📊 **Dashboard** — KPI cards, disease results, nutrient depletion charts, alerts
- 📸 **AI Leaf Scan** — Drag-and-drop image upload with animated analysis pipeline
- 🧬 **Crop Memory Model** — Multi-season nutrient tracking and yield predictions (NEW)
- 🌱 **Soil Vitality** — Soil score ring, radar chart, 7-month trend
- 🗺️ **Village Map** — Farm clustering with outbreak visualization
- 🔔 **Alerts** — Categorized disease, weather, nutrition, advisory alerts
- ⚙️ **Settings** — Language switcher (6 Indian languages), notifications, farm details

## AI Translation

Uses the Anthropic API for real-time translation to Tamil, Hindi, Malayalam, Kannada, and Telugu.

Set your API key in the environment:
```
REACT_APP_ANTHROPIC_KEY=your_key_here
```

## Stack

- React 18 + Recharts for data visualization
- Dark earthy green theme with CSS variables
- Syne (headings) + DM Sans (body) typefaces
