# AEH Testmodule – Starter Kit

This is a minimal, production-ready starter for the AEH multilingual quiz module.

## What you get
- React + Vite PWA
- Supabase (Auth + Postgres) integration
- Edge Function to read Google Sheet questions
- Admin dashboard (filters + CSV export)
- i18n for UI labels (English, Polish, Ukrainian, Filipino, Belarusian, Hindi, Sinhala, Tamil)
- Optional Google Apps Script alternative

## Quick start
1) Copy `.env.example` to `.env` and fill values.
2) `npm i` then `npm run dev`
3) Deploy: Vercel/Netlify for frontend; Supabase for DB + functions.

## Environment
Frontend:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GET_QUESTIONS_URL=https://<your-project>.functions.supabase.co/get-questions
VITE_PASS_THRESHOLD=70
```

Supabase Function env:
```
SHEET_ID=...
SHEETS_API_KEY=...
SHEET_RANGE=Questions!A1:H1000
```

## Google Sheet columns
`Question | Option A | Option B | Option C | Correct Answer | Language | Test Name | Active`

## Admin route
Mount `AdminLogin` and `AdminDashboard` under `/admin` in your router if needed.
