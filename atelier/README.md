# Atelier: makeup service booking (frontend)
Run: `npm install` then `npm run dev` (open http://localhost:5173).
Env: copy `.env.example` to `.env` (VITE_API_BASE_URL, VITE_WHATSAPP_NUMBER digits only).
Structure: src/pages (screens), src/components, src/context (auth, store), src/services/api.js (replace mocks with Spring Boot calls),
src/config (policy, terms, onboarding: all placeholders), src/data (catalogue from the pricing PDF), src/utils (pricing, schedule).
Demo only: no real login, payment or database. Sign in at /login with a demo user. Backend plan: docs/BACKEND_BLUEPRINT.md
