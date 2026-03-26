# SpendWise – Frontend Védő Szöveg
### Technikusi Vizsgaremek | Webfejlesztő szak

---

## 1. A projekt bemutatása és motiváció

A **SpendWise** egy személyi pénzügyi nyilvántartó webalkalmazás, amelyet azért készítettem, mert a mindennapi életben sokan küzdenek azzal, hogy nem látják át pontosan, mire költik a pénzüket. A létező megoldások (pl. banki alkalmazások) sokszor korlátozottak vagy nem elég átláthatóak. Célom egy olyan eszköz volt, amely:

- Egyszerűen és gyorsan rögzíthetővé teszi a bevételeket és kiadásokat
- Vizuálisan is megmutatja a pénzügyi tendenciákat
- Havi keretekkel segít a tudatos tervezésben
- Megtakarítási célok kitűzését és követését lehetővé teszi

Az ötletet részben a Mint.com és a YNAB (You Need A Budget) nevű alkalmazásokból merítettem, de ezek fizetősek és angol nyelvűek. Egy egyszerűbb, magyar nyelvű, önállóan futtatható változatot akartam megvalósítani.

---

## 2. Felhasznált technológiák és indoklásuk

### 2.1 React 19 + TypeScript

A frontend keretrendszernek a **React**-ot választottam, mivel ez a legelterjedtebb JavaScript UI-könyvtár, komponens-alapú felépítése átlátható kódstruktúrát tesz lehetővé, és hatalmas ökoszisztémával rendelkezik.

A **TypeScript** használatát azért tartottam fontosnak, mert egy pénzügyi alkalmazásban kritikus, hogy az adattípusok helyesek legyenek (pl. összeg soha ne legyen `string` ott ahol `number` kellene). A TypeScript fordítási hibákat jelz már fejlesztés közben, nem csak futáskor.

```typescript
// types.ts – minden entitás típusa egyértelműen definiálva
export interface Transaction {
  id: string;
  amount: number | string;
  note?: string;
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  category?: { name: string };
  fromAccount?: { name: string };
}
```

### 2.2 Vite

Build eszköznek a **Vite**-ot választottam a Create React App helyett, mert:
- Natív ES modul alapú fejlesztői szerver, így az indulás és a hot reload azonnali
- Modern bundler (Rollup alapú), gyors production build
- Egyszerű konfiguráció

### 2.3 TailwindCSS + DaisyUI

A stílusozáshoz **TailwindCSS** utility osztályokat használtam, mert nem kell külön CSS fájlokat karbantartani minden komponenshez – a stílus közvetlenül az elemeken van, átlátható és módosítható.

A **DaisyUI** egy Tailwind-re épülő komponens könyvtár, amely kész CSS osztályokat ad gombokhoz, kártyákhoz, modálokhoz – így nem kellett alapokat nulláról írni, de teljes kontrollt tartottam meg a testreszabásban.

### 2.4 Recharts

A grafikonokhoz a **Recharts** könyvtárat választottam, mert React-natív (nem wrapper), deklaratív API-val rendelkezik, és SVG-alapú, így vektoros, skálázható megjelenést biztosít. Az irányítópulton területi diagramot (AreaChart) és kördiagramot (PieChart) implementáltam.

### 2.5 Framer Motion

Az animációkhoz a **Framer Motion**-t használtam. Az auth oldal belépésekor smooth fade-in és slide animációt alkalmaztam, amely professzionális megjelenést kölcsönöz az alkalmazásnak anélkül, hogy komplex CSS animációkat kellene írni.

```tsx
// AuthPage.tsx – az auth kártya animálása
<motion.section
  className="auth-form-wrap"
  initial={{ opacity: 0, y: 18, scale: 0.985 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.4 }}
>
```

### 2.6 Axios

HTTP kliensnek az **Axios**-t választottam a natív `fetch` helyett, mert:
- Interceptor mechanizmusa lehetővé teszi a JWT token automatikus csatolását minden kéréshez
- A 401-es válasz automatikus kezelése egyetlen helyen megoldható
- Jobban olvasható hibakezelés

```typescript
// client.ts – JWT token automatikus csatolása
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spendwise_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 esetén automatikus kijelentkeztetés
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('spendwise_token');
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  },
);
```

---

## 3. Architektúra és tervezési döntések

### 3.1 Context API – állapotkezelés

Az állapotkezelésre nem használtam külső könyvtárat (Redux, Zustand), hanem a React beépített **Context API**-ját. Két fő kontextust hoztam létre:

**AuthContext** – a felhasználói bejelentkezés állapotát kezeli:
- Tárolja a JWT tokent és a felhasználói adatokat `localStorage`-ban, így oldalnézet frissítés után sem kell újra bejelentkezni
- Alkalmazás indulásakor automatikusan validálja a tokent a `/user/me` endpointtal
- Ha a token lejárt vagy érvénytelen, automatikusan törli és átirányít a login oldalra

```typescript
// AuthContext.tsx – token validálás alkalmazás induláskor
useEffect(() => {
  if (!token) { setLoading(false); return; }
  api.get<User>('/user/me')
    .then(({ data }) => {
      setUser(data);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
    })
    .catch(() => {
      // Lejárt vagy érvénytelen token: kijelentkeztetés
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    })
    .finally(() => setLoading(false));
}, [token]);
```

**FinanceContext** – az összes pénzügyi adat (számlák, tranzakciók, kategóriák, büdzsék, célok, ismétlődők) egy helyen:
- `refreshAll()` függvény párhuzamosan tölti be az összes adatot (`Promise.all`)
- Minden mutáció (létrehozás, frissítés, törlés) után automatikusan frissül az állapot

```typescript
// FinanceContext.tsx – párhuzamos adatbetöltés
const refreshAll = useCallback(async () => {
  const [a, c, b, t, g, r] = await Promise.all([
    api.get('/accounts').then(r => r.data),
    api.get('/categories').then(r => r.data),
    api.get('/budgets').then(r => r.data),
    api.get('/transactions').then(r => r.data),
    api.get('/goals').then(r => r.data),
    api.get('/recurring').then(r => r.data),
  ]);
  setAccounts(a); setCategories(c); setBudgets(b);
  setTransactions(t); setGoals(g); setRecurring(r);
}, []);
```

### 3.2 Útvonalvédelem (Protected Routes)

A bejelentkezés nélkül nem elérhető oldalakat egy `ProtectedApp` komponenssel védtem le. Ha nincs érvényes token, a React Router automatikusan átirányít a bejelentkezési oldalra:

```tsx
// App.tsx – útvonalvédelem
function ProtectedApp() {
  const { token, loading } = useAuth();

  if (loading) return <div className="center-screen"><div className="loading-spinner" /></div>;
  if (!token) return <Navigate to="/auth" replace />;

  return (
    <FinanceProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/"             element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          {/* ... */}
        </Route>
      </Routes>
    </FinanceProvider>
  );
}
```

A `loading` állapot azért fontos, mert az alkalmazás induláskor aszinkron ellenőrzi a tokent – e nélkül a felhasználó be sem lépve rögtön a login oldalra kerülne, mielőtt a validáció lefutna.

### 3.3 Vite proxy – hálózati elérés megoldása

Az alkalmazásnak egy sajátos problémát kellett megoldani: ha a frontend nem `localhost`-ról (hanem pl. mobilról, `192.168.0.73:5173`-ról) töltik be, a böngésző `http://localhost:3001/api`-t próbál elérni – de az a telefon saját localhost-ja, nem a szervergép.

Ezt **Vite proxy**-val oldottam meg: a frontend relatív `/api` URL-t hív, a Vite dev szerver pedig szerver oldalon továbbítja a backend felé. Így az API cím IP-től független.

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0',  // minden hálózati interfészen elérhető
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

```typescript
// client.ts – relatív URL, nem kötött IP-hez
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

---

## 4. Főbb oldalak megvalósítása

### 4.1 Bejelentkezési / Regisztrációs oldal (AuthPage)

A landing page és az auth form egy oldalon van megvalósítva, kétpaneles elrendezéssel:
- Bal oldal: marketing tartalom, feature-kártyák, animált előnézet diagram (statikus CSS)
- Jobb oldal: bejelentkezési / regisztrációs form, tab-váltással

A form egyetlen `useState`-tel kezeli az összes mezőt, és a hibákat API válasz alapján jeleníti meg:

```tsx
// AuthPage.tsx – egységes hibakezelés
} catch (err: any) {
  const msg = err.response?.data?.message;
  // A NestJS validation pipe tömb is adhat vissza, ezért join
  setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Valami hiba történt.');
}
```

### 4.2 Irányítópult (DashboardPage)

Ez az alkalmazás legösszetettebb oldala. Főbb elemei:

**KPI kártyák** – 3 mutató: teljes egyenleg (összes számla összege), havi bevétel, havi kiadás:
```tsx
const totalBalance = accounts.reduce((s, a) => s + toNumber(a.balance), 0);
const monthlyIncome = monthlyTransactions
  .filter(t => t.type === 'INCOME')
  .reduce((s, t) => s + toNumber(t.amount), 0);
```

**Pénzforgalom grafikon** – 3 időtávot lehet választani (7 nap / 1 hónap / 6 hónap). Az adatokat kliens oldalon aggregálom a már betöltött tranzakciókból, így nincs szükség külön API hívásra:

```typescript
// 30 napos nézet: az aktuális hónap minden napjára összesít
const daysInMonth = new Date(year, month + 1, 0).getDate();
return Array.from({ length: daysInMonth }).map((_, i) => {
  const day = i + 1;
  const items = transactions.filter(t => {
    const td = new Date(t.date);
    return td >= new Date(year, month, day, 0,0,0) &&
           td <= new Date(year, month, day, 23,59,59);
  });
  return {
    label: `${day}.`,
    bevétel: items.filter(t => t.type === 'INCOME').reduce((s,t) => s + toNumber(t.amount), 0),
    kiadás:  items.filter(t => t.type === 'EXPENSE').reduce((s,t) => s + toNumber(t.amount), 0),
  };
});
```

A grafikont SVG `linearGradient` és `feDropShadow` SVG filterrel díszítettem, hogy a vonalak "világítós" hatást adjanak.

**Keretállapot sáv** – a büdzsék aktuális kihasználtságát vizuálisan mutatja, és színt vált ha közeledik a limithez:
```tsx
<div
  className="progress-fill"
  style={{
    width: `${b.percent}%`,
    background: b.percent >= 100 ? '#ff5c7a'   // piros: túllépve
             : b.percent >= 75  ? '#ffc857'    // sárga: figyelmeztetés
             : undefined                        // kék: normál
  }}
/>
```

### 4.3 Tranzakciók oldal (TransactionsPage)

A tranzakciók listája szűrhető év, hónap, típus, kategória és számla szerint. A szűrés kliens oldalon, `useMemo`-val történik, így nem terheli az API-t:

```typescript
const filtered = useMemo(() => transactions.filter((item) => {
  const d = new Date(item.date);
  return (
    (filters.categoryId === 'all' || item.categoryId === filters.categoryId) &&
    (filters.type === 'all' || item.type === filters.type) &&
    Number(filters.month) === d.getMonth() + 1 &&
    Number(filters.year) === d.getFullYear()
  );
}), [transactions, filters]);
```

A szerkesztő modál előre tölti a tranzakció meglévő adatait, és összeg változásakor a backend automatikusan korrigálja az érintett számla egyenlegét.

### 4.4 Onboarding komponens

Új felhasználónál, ha még nincs egyetlen számla sem, egy útmutató banner jelenik meg. Az elrejtés `localStorage`-ban tárolódik, így nem jelenik meg újra:

```typescript
const [onboardingDismissed, setOnboardingDismissed] = useState(
  () => localStorage.getItem('spendwise_onboarding_dismissed') === 'true',
);
const showOnboarding = !onboardingDismissed && !loading && accounts.length === 0;
```

---

## 5. UX / UI döntések

### Sötét téma
Az alkalmazás kizárólag sötét témában készült, mert pénzügyi adatokat megjelenítő dashboardoknál (pl. Bloomberg Terminal, trading platformok) ez az elfogadott iparági szabvány – a grafikonok és számok jobban érvényesülnek.

### Ikonok
Az ikonokhoz a **Lucide React** könyvtárat használtam, ami a Feather Icons modern utódja. Egységes, vékony vonalú ikonokat biztosít, amelyek illeszkednek a minimalist design-hoz.

### Valuta formázás
Egy `formatCurrency` segédfüggvényt implementáltam, amely a Intl.NumberFormat API-t használja, így HUF, EUR, USD stb. a helyes lokalizált formában jelenik meg:

```typescript
// utils/format.ts
export function formatCurrency(amount: number, currency = 'HUF'): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'HUF' ? 0 : 2,
  }).format(amount);
}
```

---

## 6. Kihívások és megoldásuk

### 6.1 CORS probléma LAN eléréskor
Amikor mobilról próbáltam elérni az alkalmazást, a böngésző `localhost:3001`-et próbált hívni (ami a telefon saját localhost-ja). Megoldás: Vite proxy bevezetése, ahol a frontend relatív URL-t hív, és a Vite szerver proxyzza a backendhez.

### 6.2 Prisma 7 újdonságai
A Prisma 7-ben a `schema.prisma`-ból eltávolították az `url` property-t a datasource blokkból. Ez más verziókhoz szokott fejlesztőknek nem nyilvánvaló. Megoldás: a `prisma.config.ts` fájl tartalmazza az URL-t a CLI parancsokhoz, a runtime kapcsolatot a MariaDB driver adapter kezeli.

### 6.3 Docker Windows EBUSY hiba
A `nest start --watch` Windows + Docker kombináción `EBUSY: resource busy or locked` hibát dobott a `/dist` mappa törlésénél. Megoldás: `rm -rf dist` explicit futtatása a start script előtt a docker-compose parancsban.

---

## 7. Összefoglalás

A SpendWise frontend egy modern, TypeScript alapú React SPA, amely:

| Szempont | Megvalósítás |
|----------|-------------|
| **Keretrendszer** | React 19 + TypeScript + Vite |
| **Állapotkezelés** | Context API (AuthContext + FinanceContext) |
| **Routing** | React Router v7, védett útvonalakkal |
| **HTTP** | Axios, JWT interceptorral |
| **Vizualizáció** | Recharts (AreaChart, PieChart, BarChart) |
| **Animáció** | Framer Motion |
| **Stílus** | TailwindCSS + DaisyUI + egyedi CSS |
| **Hálózat** | Vite proxy – IP-független API elérés |

Az alkalmazás teljesen dockerizált, egyetlen `docker-compose up --build` paranccsal indul, és helyi hálózaton (mobiltelefonról is) elérhető.
