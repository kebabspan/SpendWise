# SpendWise

A SpendWise egy webalapú pénzügyi nyilvántartó alkalmazás, ahol az emberek egyszerűen rögzíthetik bevételeiket, kiadásaikat, kezelhetik számláikat, és nyomon követhetik megtakarítási céljaikat. A rendszer számlaalapú: a felhasználók külön pénzügyi "zsebeket" kezelhetnek (készpénz, bankszámla, megtakarítás), és minden tranzakciót ezekhez rendelnek. Van egy riportmodul is, ami vizuálisan is megmutatja, hogyan alakulnak a pénzügyek.


## Indítás

**Egyetlen előfeltétel: Docker Desktop legyen telepítve és fusson.**

```bash
docker compose up --build
```

Az első indítás 1-3 percet vehet igénybe (npm install + Prisma generálás + adatbázis séma létrehozása).

### Elérhetőségek

| Szolgáltatás | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api |
| Swagger docs | http://localhost:3001/api/docs |
| MySQL | localhost:3307 (user: `root` / pass: `root`) |

---

## Hasznos parancsok

```bash
# Indítás (újrabuildelés nélkül, ha már le van buildeve)
docker compose up

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

## Gyakori hibák

### A backend nem indul el

Várj 30-60 másodpercet – a backend megvárja, amíg a MySQL elindul, de az első adatbázis-inicializálás eltarthat egy ideig. Ha tartósan nem indul:

```bash
docker compose restart backend
```

### Tiszta újraindítás (ha valami elromlott)

```bash
docker compose down -v
docker compose up --build
```
