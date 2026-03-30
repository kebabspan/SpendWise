# SpendWise

Személyi pénzügyi nyilvántartó full-stack alkalmazás.

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + DaisyUI
- **Backend**: NestJS 11 + TypeScript + Prisma 7
- **Adatbázis**: MySQL 8.0
- **Konténerizáció**: Docker + Docker Compose

### Funkciók
- Számlák kezelése és egyenleg követés
- Bevételek, kiadások, átutalások rögzítése
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
| Git | bármely | https://git-scm.com |

> **Node.js nem szükséges** – minden Docker konténerben fut.

---

## Indítás

```bash
# 1. Klónozás
git clone <repo-url>
cd SpendWise-main

# 2. Teljes stack indítása (első alkalommal ~1-3 perc)
docker compose up --build -d
```

Az alkalmazás elérhető:

| Szolgáltatás | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:3001/api |
| **Swagger docs** | http://localhost:3001/api/docs |
| **MySQL** | localhost:3307 (user: `root` / pass: `root`) |

> Az első indításkor az adatbázis automatikusan feltöltődik seed adatokkal (`initdb/spendwise_backup.sql`).

---

## Prisma Studio (adatbázis böngésző)

A Prisma Studio lokálisan futtatható, de a Docker által kiszolgált adatbázishoz kell csatlakozni:

```bash
cd backend
npx prisma studio --url "mysql://root:root@localhost:3307/chronos"
```

---

## Hasznos Docker parancsok

```bash
# Indítás újrabuildeléssel
docker compose up --build -d

# Indítás (ha már le van buildeve)
docker compose up -d

# Leállítás
docker compose down

# Leállítás + adatbázis törlése (tiszta újraindításhoz)
docker compose down -v

# Logok követése
docker compose logs -f backend
docker compose logs -f frontend

# Backend shell
docker exec -it spendwise_backend sh
```

---

## Környezeti változók

### `backend/.env`
```env
DATABASE_URL="mysql://root:root@mysql:3306/chronos"
JWT_SECRET="spendwise-super-secret-jwt-key-2026"
```

> A `mysql` hostname csak Docker hálózaton belül működik. Lokális eszközöknél (pl. Prisma Studio) használd a `--url` paramétert `localhost:3307`-tel.

---

## Gyakori hibák

### ❌ `introspect operation failed` – Prisma Studio üres
**Ok**: A Prisma Studio nem éri el a Docker adatbázist sima `npx prisma studio`-val.  
**Megoldás**: Használd az `--url` paramétert:
```bash
npx prisma studio --url "mysql://root:root@localhost:3307/chronos"
```

---

### ❌ Backend összeomlik indításkor
**Ok**: A backend hamarabb indul, mint az adatbázis.  
**Megoldás**: Docker Compose automatikusan újraindítja. Várj 20-30 másodpercet, vagy:
```bash
docker compose restart backend
```

---

### ❌ `Table 'chronos.X' doesn't exist`
**Ok**: Az adatbázis séma hiányzik.  
**Megoldás**:
```bash
docker exec -it spendwise_backend npx prisma db push --accept-data-loss
```

---

### ❌ Seed adat nem töltődött be (üres táblák)
**Ok**: A `mysql_data` volume már létezett az `initdb` hozzáadása előtt.  
**Megoldás**: Töröld a volume-ot és indítsd újra:
```bash
docker compose down -v
docker compose up -d
```

---

### ❌ `Port 3001 / 5173 already in use`
**Megoldás**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

## Fejlesztés

Hot reload mindkét oldalon aktív:
- **Frontend**: Vite HMR – mentés után azonnal frissül
- **Backend**: NestJS watch mód – TypeScript változás után automatikusan újraindul

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
