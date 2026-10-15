# EcoVision AI — Smart Recycling Assistant & Circular Intelligence Platform

> **An architectural environmental intelligence system featuring Google Gemini multimodal vision material classification, facility digital twin simulation, and personalized circular economy roadmaps.**

---

## 🌟 Key Capabilities

1. **Multimodal Computer Vision Material Classification**
   - Ingests physical specimen imagery via high-fidelity optical viewfinder or drag-and-drop.
   - Evaluates polymer chains, alloys, and biomass densities using Google Gemini Vision (`gemini-3.1-flash-lite` / `gemini-3.5-flash`).
   - Categorizes specimens accurately into **`Plastic`**, **`Paper`**, **`Metal`**, **`Glass`**, **`Organic`**, and **`General`** waste streams.
   - Computes empirical decomposition duration, carbon offsets ($\text{CO}_2\text{e}$), and actionable contamination avoidance guidelines.

2. **Facility Digital Twin Simulation (Unit 04 Metro Sorter)**
   - Top-down vector schematic displaying real-time pneumatic routing and optical conveyor sorting.
   - Dynamic storage silos tracking live capacity, weight ($\text{kg}$), and fill percentages across all material streams.
   - Transactionally consistent updates: every verified scan directly updates the corresponding facility silo bounded by maximum silo capacity.

3. **Generative AI Personalized Circular Economy Advisor**
   - Synthesizes the user's empirical scan history from the SQLite audit database.
   - Calculates a personal **Circularity Score** ($0–100$) and assigns a circular tier badge.
   - Ranks prioritized reduction actions with estimated monthly $\text{CO}_2\text{e}$ savings.
   - Generates tailored **Closed-Loop Material Swaps** to transition from single-use packaging to durable, circular alternatives.
   - Provides contamination mitigation rules and milestone goals with interactive checklists.

4. **Interactive Recycling Query Assistant**
   - Dedicated natural language recycling chatbot powered by Google Gemini.
   - System instruction curated to advise on municipal variability, grease contamination in paper pulping, battery/e-waste hazard mitigation, and resin code sorting.

---

## 🛠️ Architecture & Technology Stack

- **Backend**: Python 3, Flask, SQLite3, `python-dotenv`
- **Generative AI & Vision SDK**: `google-genai` (Google Gemini 3 multimodal series)
- **Frontend**: Vanilla JavaScript (ES6+), Modern Vanilla CSS (Architectural Editorial Design System, Newsreader Serif, Inter, JetBrains Mono)
- **Visualizations**: Chart.js for volume composition and processing throughput timelines

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+
- A Google Gemini API Key (obtainable from [Google AI Studio](https://aistudio.google.com/))

### 2. Installation
```bash
# Clone repository
git clone https://github.com/varun2125kg/smart-recycling-assistant.git
cd smart-recycling-assistant

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and enter your Gemini API key:
```bash
cp .env.example .env
```
Edit `.env`:
```env
GEMINI_API_KEY="your_actual_api_key_here"
PORT=5050
GEMINI_MODEL=gemini-3.1-flash-lite
```

### 4. Running the Application
```bash
python3 app.py
```
Open your browser and navigate to:
```
http://127.0.0.1:5050
```

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/status` | `GET` | Health check, facility telemetry, and Gemini model status. |
| `/api/scan` | `POST` | Ingests multipart image upload (`image=@file`), runs Gemini vision inference, updates Digital Twin. |
| `/api/chat` | `POST` | Recycling guidance chatbot (`{"prompt": "How do I recycle..."}`). |
| `/api/recommendations` | `GET` / `POST` | Generates personalized circular economy roadmap and circularity score from scan history. |
| `/api/digital-twin` | `GET` | Current facility silo fill percentages and weight metrics. |
| `/api/history` | `GET` | Paginated immutable audit ledger of past scans. |
| `/api/stats` | `GET` | Aggregate diversion rate, total scans, and avoided $\text{CO}_2\text{e}$. |

---

## 🔒 Security Note
- `.env` and SQLite database files are strictly excluded from version control via `.gitignore`.
- API keys are never returned in frontend JavaScript or API responses.
