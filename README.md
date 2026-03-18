# PV-Park Finanzrechner

Web-App zur Berechnung und Analyse eines Photovoltaik-Parks (10,7 MWp) mit Batteriespeicher über 30 Jahre.

## Stack

- **Backend:** FastAPI (Python 3.11)
- **Frontend:** React + Vite
- **Hosting:** Railway (Dockerfile-basiert)

## Features

- 6 Handlungsmodelle (HM1–HM6) mit vollständiger 30-Jahres-Berechnung
- GuV, Cashflow, DSCR, NPV, IRR und weitere Kennzahlen
- 3 Makro-Optimierungen: Reset, Zyklen-Optimierung, Fixvergütungs-Optimierung
- Apple-like Design (Inter Font, viel Weißraum, große KPI-Zahlen)
- CSV-Export für alle Datenblätter
- Live-Berechnung mit 500ms Debounce

## Lokale Entwicklung

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Proxy auf localhost:8000
```

## Railway Deployment

```bash
railway up
```

## Projektstruktur

```
pv-park-app/
├── backend/
│   ├── main.py          # FastAPI App + Endpoints
│   ├── calculator.py    # Alle Berechnungen (GuV, CF, KPIs)
│   ├── optimizer.py     # Makro-Optimierungen
│   ├── models.py        # Pydantic Models
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/       # Dashboard, Parameter, HMDetail, etc.
│       ├── components/  # KPICard, Sidebar, etc.
│       └── api/         # API Client
├── Dockerfile
└── railway.toml
```
