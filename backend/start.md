# SpendWise – Backend indítási útmutató

## Előfeltételek
- Docker Desktop telepítve és fut
- A `backend/.env` fájl létezik (lásd lent)

## .env fájl létrehozása
A `backend/` mappában hozd létre a `.env` fájlt az alábbi tartalommal:

```
DATABASE_URL="mysql://root:root@mysql:3306/chronos"
JWT_SECRET="spendwise-super-secret-jwt-key-2026"
```

PowerShellből (a projekt gyökeréből):
```powershell
New-Item -Path "backend\.env" -ItemType File -Force
Set-Content -Path "backend\.env" -Value "DATABASE_URL=`"mysql://root:root@mysql:3306/chronos`"`nJWT_SECRET=`"spendwise-super-secret-jwt-key-2026`""
```

---

## Parancsok (projekt gyökérből futtatva)

### Első indítás / kód változás után
```powershell
docker compose up -d --build
```

### Egyszerű indítás (ha már buildelve van)
```powershell
docker compose up -d
```

### Leállítás
```powershell
docker compose down
```

### Logok élőben
```powershell
docker compose logs -f backend
```

### Backend újraindítása
```powershell
docker compose restart backend
```

### Adatbázis táblák újralétrehozása
```powershell
docker exec -it expensetracker_backend npx prisma db push
```

### Seed adatok betöltése
```powershell
docker exec expensetracker_backend pnpm run prisma:seed
```

### Prisma Studio (adatbázis böngésző)
```powershell
docker exec -it expensetracker_backend npx prisma studio --browser none --port 5555
```
Böngészőben: http://localhost:5555

---

## Portok
| Szolgáltatás | Port |
|---|---|
| Backend API | http://localhost:3001/api |
| Swagger docs | http://localhost:3001/api/docs |
| MySQL | 3307 (külső) |
| Prisma Studio | http://localhost:5555 |
