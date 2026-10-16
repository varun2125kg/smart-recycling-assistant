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

### 4. Running the Application Locally
**Development Mode (Flask):**
```bash
python3 app.py
```

**Production Mode (Gunicorn WSGI):**
```bash
gunicorn app:app --workers 2 --threads 4 --timeout 120 --bind 0.0.0.0:5050
```

Open your browser and navigate to:
```
http://localhost:5050
```

---

## ☁️ Deploying to Render via GitHub

### Option A: Automatic Deployment with Blueprint (`render.yaml`)
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect `render.yaml` and configure the Web Service with Python runtime, build command, and start command.
5. In the Environment settings, add your secret `GEMINI_API_KEY`.
6. Click **Apply** to deploy.

### Option B: Manual Web Service Setup
1. In Render, select **New** → **Web Service** and connect your GitHub repository.
2. Configure settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --workers 2 --threads 4 --timeout 120 --bind 0.0.0.0:$PORT`
   - **Plan**: Free or Starter
3. Add Environment Variables under the **Environment** tab:
   - `GEMINI_API_KEY`: `<your_actual_gemini_api_key>`
   - `GEMINI_MODEL`: `gemini-3.1-flash-lite`
   - `PYTHON_VERSION`: `3.11.9` (or `3.10.x`)
4. Click **Create Web Service**.

---

## 💾 Storage Architecture & Hosting Limitations

> [!IMPORTANT]
> **Ephemeral Filesystem on Free/Default Render Instances:**
> Standard Render Web Service containers use an **ephemeral disk**. When a web instance restarts, deploys a new commit, or spins down from inactivity (on free tier):
> - Any SQLite database (`ecovision.db`) stored on the local container disk is reset to the initial state.
> - Any uploaded images in `./uploads` are cleared.

### Enabling Persistent Storage (Optional on Render Paid Tier):
1. Add a **Persistent Disk** in your Render Web Service settings (e.g. mounted at `/var/data`).
2. Add the following environment variables in Render:
   - `DATABASE_PATH`: `/var/data/ecovision.db`
   - `UPLOAD_FOLDER`: `/var/data/uploads`
3. EcoVision AI automatically creates the directory structure and initializes the SQLite schema on startup.

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
- `.env`, Python virtual environments, and SQLite database files are strictly excluded from version control via `.gitignore`.
- API keys are read from environment variables and are never logged, printed, or exposed in API responses.

