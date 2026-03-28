# FinSight — AI Financial Report Analyzer

Production-style full-stack app for analyzing Indian company financial text with **Gemini 2.5 Flash**, **Express + MongoDB**, and **React + Tailwind + Three.js**.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- [Google AI Studio](https://aistudio.google.com/) API key (`GEMINI_API_KEY`)

## Backend

```bash
cd backend
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, CLIENT_ORIGIN
npm install
npm run dev
```

API base: `http://localhost:5000` — health: `GET /health`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Dev server proxies `/api` to the backend (`vite.config.js`). Optional: set `VITE_API_URL` if the API is on another origin.

## Features

- JWT auth (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- Protected analyses (`POST /api/analyses`, `GET /api/analyses`, `GET /api/analyses/:id`)
- Structured JSON output (summary, metrics, risks, sentiment, takeaway, confidence)
- 3D insight graph (Revenue/Profit green, Risk red, Sentiment coloring)

**Disclaimer:** Outputs are for research and education only, not investment advice.
