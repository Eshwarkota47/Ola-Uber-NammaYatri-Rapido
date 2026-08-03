# FarePulse — Ride Fare Aggregator

A real-time **4-way ride fare comparison** web app for **Bengaluru**, comparing fares across:

- 🟡 **Namma Yatri** — Screenshot-calibrated rate card (₹36 base, ₹18/km, IST Night Surcharge)
- 🔵 **Uber** — Dynamic pricing with surge, booking fees, and time-based rates
- 🟢 **Ola** — Distance-slab pricing with 5% GST taxes
- 🟠 **Rapido** — Per-km + per-min rate card (calibrated to real Rapido app fares)

## Features

- 🗺️ **Google Maps Integration** — Places Autocomplete (live dropdown for any street/colony/company) + Directions API for exact driving distance
- 📊 **5 Vehicle Categories** — Auto, Mini/Hatchback, Sedan, SUV, Bike
- 💸 **Lowest Fare Badges** — Highlights cheapest provider in each category
- 🌙 **Night Surcharge Simulation** — Toggle IST night fares (10 PM – 5 AM)
- ⚡ **Surge Multiplier Control** — Simulate peak-hour demand pricing
- 🧾 **Itemized Fare Breakdown Modal** — Detailed per-ride calculation with taxes

---

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Vanilla CSS (dark glassmorphism design)
- **Backend**: Node.js + Express + TypeScript
- **Maps**: Google Places Autocomplete API + Google Directions API
- **Fallback Geocoding**: Photon (OpenStreetMap)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
# Install backend dependencies
cd server
npm install
npm run dev       # Starts on http://localhost:5000

# Install frontend dependencies
cd client
npm install
npm run dev       # Starts on http://localhost:3000
```

### Google Maps API Key (Optional but recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Places API** and **Directions API**
3. Copy your API key
4. In the app, click **"Add Google Maps API Key"** and paste it in

Without the key, the app falls back to Haversine distance estimation and Photon OSM geocoding.

---

## Project Structure

```
cabs/
├── server/                  # Express TypeScript backend
│   └── src/
│       ├── engines/
│       │   ├── nammaYatri.ts   # Namma Yatri fare engine
│       │   ├── uber.ts         # Uber fare engine
│       │   ├── ola.ts          # Ola fare engine
│       │   └── rapido.ts       # Rapido fare engine
│       ├── lib/
│       │   ├── googleMaps.ts   # Google Places + Directions API
│       │   ├── geo.ts          # Haversine distance fallback
│       │   └── locations.ts    # Bengaluru landmark presets
│       └── routes/
│           └── compare.ts      # API routes
└── client/                  # React + Vite frontend
    └── src/
        ├── components/
        │   ├── FareCard.tsx
        │   ├── CategorySection.tsx
        │   ├── FareBreakdownModal.tsx
        │   ├── LocationSelector.tsx
        │   └── SimControls.tsx
        └── App.tsx
```

---

## Live Fare Comparison Example

**Route**: PES University → Shirvanthe Technologies (10.6 km)

| Provider | Vehicle | Fare |
|----------|---------|------|
| Namma Yatri | Auto Easy Commute | ₹191–₹201 |
| Namma Yatri | Auto Priority | ₹221–₹231 |
| Uber | Uber Auto | ~₹186 |
| Ola | Ola Auto | ~₹198 |
| Rapido | Rapido Auto | ~₹196 |
