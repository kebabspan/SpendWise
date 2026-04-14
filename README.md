# SpendWise – Frontend indítási útmutató

## Előfeltételek
 - Docker Desktop (Windows/macOS) vagy Docker Engine + Docker Compose (Linux) – 4.x+
 - Legalább 8 GB RAM és elegendő szabad tárhely a Docker image-ekhez
 - Visual Studio Code (ajánlott fejlesztői környezet)


## Indítás

### Függőségek telepítése
```powershell
pnpm install
```

### Fejlesztői szerver indítása
```powershell
pnpm run dev
```

Böngészőben: http://localhost:5173 (vagy 5174 ha foglalt)

### Build (produkciós)
```powershell
pnpm run build
```

### Build előnézet
```powershell
pnpm run preview
```

---

## Környezeti változók
Hozz létre egy `.env.local` fájlt a `frontend/` mappában ha eltérő backend URL-t használsz:

```
VITE_API_URL=http://localhost:3001/api
```

## Portok
| Szolgáltatás | Port |
|---|---|
| Frontend (dev) | http://localhost:5173 |
| Backend API | http://localhost:3001/api |
