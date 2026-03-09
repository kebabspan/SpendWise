# Expense Tracker Frontend

React + Vite frontend a megadott NestJS backendhez.

## Funkciók
- JWT alapú regisztráció és bejelentkezés
- Dashboard összesített statokkal és chartokkal
- Transactions oldal tranzakció, kategória és account létrehozással
- Budgets oldal kategóriánkénti budget követéssel
- Reports oldal automatikus insightokkal
- Profil szerkesztés és kijelentkezés

## Indítás
```bash
npm install
cp .env.example .env
npm run dev
```

A `.env` fájlban:
```bash
VITE_API_URL=http://localhost:3001/api
```

## Backend kompatibilitás
A frontend ezekre a végpontokra csatlakozik:
- `POST /auth/register`
- `POST /auth/login`
- `GET /user/me`
- `PATCH /user/update`
- `GET/POST /accounts`
- `GET/POST /categories`
- `GET/POST/DELETE /budgets`
- `GET/POST/DELETE /transactions`

## Megjegyzés
A backendben jelenleg nincs külön dashboard/report végpont, ezért a dashboard és reports számításai a frontendben készülnek a betöltött tranzakciókból, budgetekből és kategóriákból.
