# SpendWise – Indítási útmutató

## Projekt leírás

**SpendWise** egy full-stack személyi pénzügyi nyilvántartó alkalmazás.

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + DaisyUI
- **Backend**: NestJS 11 + TypeScript + Prisma 7
- **Adatbázis**: MySQL 8.0
- **Konténerizáció**: Docker + Docker Compose

### Funkciók
- Számlák kezelése (egyenleg követés)
- Bevételek / kiadások / átutalások rögzítése
- Kategóriák és büdzsék
- Megtakarítási célok
- Ismétlődő tranzakciók
- Riportok és grafikonok
- JWT alapú hitelesítés

---

## Szükséges eszközök

| Eszköz | Verzió | Letöltés |
|--------|--------|----------|
| Docker Desktop | 24+ | https://www.docker.com/products/docker-desktop |
| Docker Compose | v2+ (beépített) | Docker Desktop részeként |
| Git | tetszőleges | https://git-scm.com |

> **Node.js nem szükséges** – Docker konténerben fut minden.

---

## Gyors indítás

```bash
# 1. Klónozás / kicsomagolás
cd SpendWise-fixed

# 2. Backend .env fájl másolása (ha még nincs)
cp backend/.env.example backend/.env

# 3. Teljes stack indítása egyetlen paranccsal
docker-compose up --build
```

Az alkalmazás elérhető:

| Szolgáltatás | URL |
|-------------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:3001/api |
| **Swagger docs** | http://localhost:3001/api/docs |
| **Healthcheck** | http://localhost:3001/api/health |
| **MySQL** | localhost:3307 (user: root / pass: root) |

> Az első indítás lassabb lehet (npm install + Prisma generate + db push ~1-3 perc).

---

## Environment változók

### `backend/.env`

```env
# MySQL kapcsolat – Docker Compose-on belül a service neve "mysql"
DATABASE_URL="mysql://root:root@mysql:3306/spendwise"

# JWT titkos kulcs – éles környezetben cseréld le!
JWT_SECRET="spendwise-super-secret-jwt-key-2026"
```

### Frontend (opcionális, `.env` fájl a `frontend/` mappában)

```env
# Backend API URL – böngészőből hívódik, localhost-ot kell használni
VITE_API_URL=http://localhost:3001/api
```

---

## Docker Compose szolgáltatások

```
spendwise_mysql     – MySQL 8.0 adatbázis (port 3307)
spendwise_backend   – NestJS API (port 3001)
spendwise_frontend  – Vite dev szerver (port 5173)
```

### Hasznos Docker parancsok

```bash
# Indítás (build nélkül, ha már le van buildeve)
docker-compose up

# Indítás újrabuildeléssel
docker-compose up --build

# Leállítás
docker-compose down

# Leállítás + adatbázis törlése (tiszta újraindításhoz)
docker-compose down -v

# Logok követése
docker-compose logs -f backend
docker-compose logs -f frontend

# Backend shell
docker exec -it spendwise_backend sh

# Prisma Studio (adatbázis böngésző)
docker exec -it spendwise_backend npx prisma studio
```

---

## Gyakori hibák és megoldások

### ❌ `DATABASE_URL is missing from .env`

**Ok**: Hiányzik a `backend/.env` fájl.

**Megoldás**:
```bash
cp backend/.env.example backend/.env
```

---

### ❌ `Can't connect to MySQL` / `Backend crashes on startup`

**Ok**: A backend hamarabb indul, mint az adatbázis.

**Megoldás**: Docker Compose automatikusan újraindítja (`restart: unless-stopped`). Várj 20-30 másodpercet, vagy:
```bash
docker-compose restart backend
```

---

### ❌ `prisma generate` hiba

**Ok**: A Prisma Client nincs legenerálva (tipikusan klónozás / másik gépre átvitel után).

**Megoldás** (automatikusan fut `docker-compose up --build`-nál, de manuálisan is):
```bash
docker exec -it spendwise_backend npx prisma generate
```

---

### ❌ `Table 'spendwise.User' doesn't exist`

**Ok**: Az adatbázis séma nincs létrehozva.

**Megoldás**:
```bash
docker exec -it spendwise_backend npx prisma db push --accept-data-loss
```

---

### ❌ `Port 3001 already in use`

**Ok**: Másik folyamat foglalja a portot.

**Megoldás**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

---

### ❌ Frontend nem éri el a backend-et

**Ok**: `VITE_API_URL` nincs beállítva, vagy rossz értékre mutat.

**Megoldás**: Ellenőrizd, hogy a böngészőből `http://localhost:3001/api` elérhető-e. A frontend mindig a **host gép** localhost-ját használja (nem a Docker belső hálózatot).

---

### ❌ `node_modules` problémák (Windows / Mac M1)

**Ok**: A helyi `node_modules` mappa ütközik a Docker konténerével.

**Megoldás**:
```bash
# Helyi node_modules törlése (a Docker saját node_modules-t használ)
rm -rf backend/node_modules frontend/node_modules
docker-compose up --build
```

---

## Fejlesztési workflow

A hot reload mindkét oldalon aktív:
- **Frontend**: Vite HMR – fájlmentés után azonnal frissül a böngészőben
- **Backend**: NestJS watch mód (`--watch`) – TypeScript változás után automatikusan újraindítja

---

## API dokumentáció

A Swagger UI elérhető futó backend esetén:

```
http://localhost:3001/api/docs
```

Összes endpoint dokumentálva van, Bearer token authentikációval tesztelhető közvetlenül a böngészőből.

### Gyors API teszt

```bash
# Healthcheck
curl http://localhost:3001/api/health

# Regisztráció
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"jelszo123","name":"Teszt Felhasználó"}'

# Bejelentkezés
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"jelszo123"}'
```
