# Food Verse AI

> **Smarter Food. Safer Choices. Healthier Living.**  
> A comprehensive multimodal AI food intelligence platform delivering dish recognition, optical macronutrient estimation, produce freshness audits, restaurant hygiene compliance, smart cooking guidance, and allergen-verified personalized meal planning.

---

## Table of Contents
1. [Project Overview & Objectives](#project-overview--objectives)
2. [Key Features](#key-features)
3. [Technology Stack & Architecture](#technology-stack--architecture)
4. [How AI Analysis Works](#how-ai-analysis-works)
5. [Setup & Environment Variables](#setup--environment-variables)
6. [Running the Application](#running-the-application)
7. [Deployment Instructions](#deployment-instructions)
8. [Limitations & Ethical Boundaries](#limitations--ethical-boundaries)
9. [Migration Path to Python FastAPI](#migration-path-to-python-fastapi)
10. [Future Roadmap](#future-roadmap)

---

## 1. Project Overview & Objectives

**Food Verse AI** bridges the gap between culinary convenience and scientific food safety. Everyday consumers and food service operators make critical decisions regarding nutritional balance, spoilage detection, allergen safety, and kitchen hygiene.

The core objectives of the platform are:
- **Democratize Food Intelligence:** Allow anyone to take a photo of a meal or produce and obtain instant, context-rich culinary, nutritional, and microbial evaluations.
- **Enforce Scientific Rigor & Transparency:** Never fabricate artificial 99.9% certainty scores. Clearly separate visual optical approximations from chemical bomb calorimetry laboratory data.
- **Prioritize Food Safety:** Prominently communicate the "When in doubt, throw it out" directive, explaining that visual appearance cannot detect invisible or odorless pathogenic bacteria (such as *Salmonella*, *Listeria*, or *Staphylococcus aureus* enterotoxins).
- **Deliver Real Multimodal Capabilities:** Support image uploads, live camera capture, video keyframe extraction for sanitation audits, and high-fidelity text-to-speech voice narration.

---

## 2. Key Features

### 🍽️ 1. Food Recognition & Nutrition Audit
- **Multimodal Visual Identification:** Analyzes plated meals to identify dish name, regional culinary origin, and specific preparation techniques.
- **Detected Ingredients Breakdown:** Quantifies primary ingredients, garnishes, sauces, seasonings, and bases with estimated gram masses.
- **Optical Macronutrient Estimates:** Calculates calories, protein, carbohydrates, dietary fiber, sodium, and total fats.
- **Portion Sensitivity Slider:** Adjust serving scales from 0.5x to 2.5x with real-time recalculation of caloric load.
- **Allergen & Safety Tags:** Surfaces common allergens (gluten, dairy, eggs, nuts) and safe temperature handling warnings.

### 🍎 2. Freshness & Spoilage Assessment
- **Surface Phenotype Diagnostic:** Examines cellular turgor, surface wrinkling, dehydration, discoloration, enzymatic browning, and mold mycelium (*Botrytis cinerea*, penicillium).
- **Tri-State Classification:**
  - `Fresh`: High turgor, vibrant pigmentation, peak antioxidant value.
  - `Moderately Fresh`: Minor dehydration; consume promptly or cook.
  - `Potentially Spoiled`: Significant enzymatic breakdown or microbial risk; discard recommended.
- **Mandatory Safety Directives:** Outlines crisper storage guidelines, temperature thresholds, and explicit warnings against consuming questionable perishables.

### 🛡️ 3. Restaurant Hygiene Monitoring
- **Video & Multi-Frame Video Extraction:** Upload an MP4/WebM video or kitchen photos. The browser extracts 4 key temporal frames via HTML5 `<canvas>` for multimodal inspection.
- **4-Pillar Sanitation Analysis:**
  1. *Glove & Hand Hygiene:* Single-use gloves on ready-to-eat foods vs bare-hand contact.
  2. *Hair & Face Restraints:* Caps, nets, and beard guards.
  3. *Cross-Contamination Risks:* Distance between raw meat trimming stations and cold salad garnish areas.
  4. *Surface & Equipment Sanitation:* Submerged sanitizer towels vs loose rags, clean stainless steel.
- **Transparent Limitation Disclaimer:** Clearly highlights that this is a preliminary visual screening tool based on accessible frames, not a certified municipal health code inspection.

### 👨‍🍳 4. Smart Cooking Assistant
- **Pantry Staple Engine:** Add ingredients on hand or choose from pantry staples to eliminate food waste.
- **Custom Filters:** Filter by cuisine (Mediterranean, Asian, Italian, Mexican, etc.), cooking time (15 to 75 minutes), and dietary preferences (Vegan, Keto, Gluten-Free).
- **Foolproof Recipes:** Includes exact measurements, checkable step-by-step instructions, and chef substitutions.
- **Temperature Safety Mandate:** Integrates USDA safe internal temperatures (e.g., 165°F for poultry, 145°F for finfish) into cooking steps.

### 📅 5. Personalized Meal Planner
- **Metabolic Profile Formulation:** Tailors 1-day blueprints based on goal (Muscle Preservation, Fat Loss, Glycemic Control), diet archetype, and activity level.
- **Allergen Verification Audit:** Performs an automated safety audit confirming complete exclusion of prohibited ingredients (nuts, dairy, gluten, soy, etc.).
- **Alternative Ingredient Swaps:** Provides 1-click alternative swaps for breakfast, lunch, dinner, and snacks.

### 🎙️ 6. Multimodal Interaction & Voice Audio
- **Audio Narration:** Listen to dish descriptions, cooking instructions, or food safety audits using Gemini Text-to-Speech (`gemini-3.8-flash-lite-tts`) with browser SpeechSynthesis fallback.
- **Camera Snapshot:** Snap photos directly using webcams on mobile or desktop devices.

### 📊 7. Dashboard & Local Intelligence History
- **Macro & Calorie Targeter:** Interactive Harris-Benedict daily energy expenditure calculator.
- **History Feed:** Locally cached recent analyses with thumbnail previews, tags, and 1-click reload.
- **Pre-loaded Benchmark Reports:** 6 instantly inspectable demo reports so users can test all features with zero friction.

---

## 3. Technology Stack & Architecture

```
Food Verse AI Architecture
├── Frontend (Client)
│   ├── React 19 (TypeScript)
│   ├── Tailwind CSS v4 (Design system with warm cream & deep forest green)
│   ├── Lucide React (Icons)
│   └── HTML5 Canvas & Web Media APIs (Video frame extraction & Audio playback)
│
├── Backend (Server)
│   ├── Express.js (Node.js / tsx runtime)
│   ├── Vite Middlewares (Dev HMR and asset serving)
│   └── REST API Routes (/api/food/*)
│
└── AI Engine (Server-Side Only)
    ├── Google GenAI SDK (@google/genai)
    ├── Primary Multimodal Model: gemini-3.1-flash-lite (high-speed sub-second inference)
    ├── Audio & Narration: Gemini TTS / Web SpeechSynthesis API
    └── Strict JSON Schema Validation & 28-second Timeout Guards
```

- **Client Security:** All Gemini API credentials reside exclusively on the server in environment secrets. Zero API keys are bundled or exposed to client browsers.
- **FastAPI-Ready Modularity:** Business logic in `/server/services/geminiService.ts` and `/server/routes/foodRoutes.ts` follows a clean functional architecture that translates 1:1 to Python Pydantic models and FastAPI router endpoints.

---

## 4. How AI Analysis Works

1. **Multimodal Vision Ingestion:**
   When an image or video frame is uploaded, it is converted to base64 on the client and sent to `/api/food/*`.
2. **Schema-Constrained Generation (`gemini-3.1-flash-lite`):**
   The server constructs a domain-specific prompt and passes a strict JSON schema via `responseSchema` and `Type.OBJECT` to guarantee reliable structured responses.
3. **Transparent Confidence Reporting:**
   The model evaluates visible visual evidence and assigns certainty as `High Certainty`, `Moderate Certainty`, or `Tentative / Ambiguous`, accompanied by an explicit explanation of what was visually detected and what remains ambiguous.
4. **Safety Verification:**
   Before returning results, the prompt forces inclusion of food safety notices, allergen warnings, and regulatory disclaimers.

---

## 5. Setup & Environment Variables

### Environment Variables (`.env`)
Create a `.env` file in the root directory (refer to `.env.example`):

```bash
# GEMINI_API_KEY: Injected by AI Studio or obtained from Google AI Studio
GEMINI_API_KEY="your-google-gemini-api-key"

# Port (defaults to 3000)
PORT=3000
```

*Note: If no `GEMINI_API_KEY` is present, the app gracefully runs in **Demonstration Mode** using pre-calibrated sample reports, ensuring zero crashes or broken buttons.*

---

## 6. Running the Application

### Install Dependencies
```bash
npm install
```

### Development Mode (Full-stack Express + Vite)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Check & Linting
```bash
npm run lint
```

---

## 7. Deployment Instructions

### Production Build
```bash
npm run build
```
This compiles the React frontend into the `dist/` directory.

### Start Production Server
```bash
npm start
```
The Express server automatically detects `process.env.NODE_ENV === 'production'` and serves the compiled static bundle from `dist/` while routing all API requests through `/api/food/*`.

---

## 8. Limitations & Ethical Boundaries

- **Not a Medical Device:** Macronutrient and calorie figures are algorithmic estimations based on standard recipe databases and visual volume approximations. They do not replace clinical dietetic counseling.
- **Invisible Microbes:** Spoilage organisms often produce foul odors and discoloration, but dangerous foodborne bacteria (*Listeria monocytogenes*, *Salmonella*, *Escherichia coli*, *Clostridium botulinum*) can multiply without altering appearance. Always adhere to temperature danger zone rules (40°F–140°F / 4°C–60°C).
- **Regulatory Status:** The Restaurant Hygiene Monitor is an educational decision-support tool. It is not an official municipal health inspection, code certification, or proof of biological sanitization.

---

## 9. Migration Path to Python FastAPI

The backend service is structured for seamless transition to Python FastAPI:
- Replace `server/routes/foodRoutes.ts` with a FastAPI `APIRouter` in `routers/food.py`.
- Convert TypeScript interfaces in `src/types/index.ts` to `pydantic.BaseModel` classes.
- Use the official Google GenAI Python SDK (`google-genai`) in `services/gemini_service.py`.

---

## 10. Future Roadmap

- [ ] Barcode and packaged nutrition facts OCR scanning.
- [ ] Direct USDA FoodData Central API integration for dual-source nutrition verification.
- [ ] Bluetooth digital meat probe integration for automated internal temperature logging.
- [ ] Multi-day weekly meal prep scheduling and grocery list export to PDF/CSV.

---

*Crafted with care for Food Verse AI — Smarter Food. Safer Choices. Healthier Living.*
