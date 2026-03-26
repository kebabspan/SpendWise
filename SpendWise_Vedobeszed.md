# SpendWise – Frontend fejlesztés
### Technikai védőbeszéd
*React • TypeScript • Tailwind CSS • Recharts • Framer Motion*

---

## 1. Az alkalmazásról – rövid áttekintés

A SpendWise egy modern, webalapú személyi pénzügyi nyilvántartó alkalmazás. A felhasználó egy helyen tudja kezelni banki számláit, rögzíteni bevételeit és kiadásait, beállítani havi költségkereteket, takarékossági célokat és ismétlődő tranzakciókat, valamint grafikonos riportokat megtekinteni a pénzügyi szokásairól.

A frontend teljes egészében a böngészőben fut: a React Single Page Application (SPA) kommunikál egy külön NestJS backenddel REST API-n keresztül.

---

## 2. Felhasznált technológiák és eszközök

### 2.1 Alap technológiák

- **React 19** – a felhasználói felület komponensalapú felépítéséhez; a `useState`, `useEffect`, `useContext`, `useMemo`, `useCallback` hookokat aktívan használtam.
- **TypeScript 5** – statikus típusellenőrzés; minden komponens, hook és API-függvény saját típusdefiníciót kapott, ezzel sok runtime hibát előre ki lehetett szűrni.
- **Vite 7** – fejlesztési szerver és bundler; rendkívül gyors HMR (Hot Module Replacement) miatt választottam a Create React App helyett.
- **React Router DOM 7** – kliensoldali útvonalkezelés; a védett útvonalakat egy `ProtectedApp` wrapper komponenssel oldottam meg.

### 2.2 Stílus és dizájn

- **Tailwind CSS 3 + DaisyUI 4** – utility-first CSS keretrendszer; az egyedi vizuális elemeket saját CSS osztályokkal egészítettem ki (`dashboard.css`, `auth.css`, `ui.css`).
- **Postcss + Autoprefixer** – a böngészőkompatibilitás automatikus kezelésére.
- **Lucide React** – konzisztens SVG ikonkönyvtár; az oldalmenü, gombok és kártyák ikonjai innen származnak (pl. `Wallet`, `PiggyBank`, `Target`, `BarChart3`).

### 2.3 Animációk

- **Framer Motion 12** – deklaratív animációs könyvtár React-hoz; a belépési oldal hero szekciója, a profilmodal ki- és belépése (`AnimatePresence`), valamint a regisztrációs nézet váltás animálása ezzel készült.

### 2.4 Grafikonok

- **Recharts 3** – React-natív diagramkönyvtár; a Dashboard `AreaChart`-ot és `PieChart`-ot használ. A Reports oldalon `BarChart`, `LineChart` és `PieChart` egyszerre jelenik meg.

### 2.5 Hálózati kommunikáció

- **Axios 1.11** – a backend REST API hívásokhoz; az `api/client.ts` fájlban konfigurált Axios instance automatikusan csatolja a JWT tokent minden kéréshez (request interceptor).

---

## 3. Az alkalmazás szerkezete

### 3.1 Mappastruktúra

```
src/
  api/         – Axios kliens (client.ts)
  components/  – Újrafelhasználható UI elemek (UI.tsx, Onboarding.tsx)
  context/     – Globális állapot (AuthContext, FinanceContext, ToastContext)
  layout/      – AppShell (sidebar + topbar + Outlet)
  pages/       – Oldalkomponensek (Dashboard, Transactions, Budgets, ...)
  utils/       – Segédfüggvények (format.ts)
  types.ts     – Közös TypeScript típusok
```

### 3.2 Routing és útvonalvédelem

Az `App.tsx` tartalmazza az összes útvonalat. A `ProtectedApp` komponens ellenőrzi, hogy van-e érvényes JWT token; ha nincs, automatikusan átirányít a `/auth` oldalra.

```tsx
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
          {/* ... többi oldal */}
        </Route>
      </Routes>
    </FinanceProvider>
  );
}
```

---

## 4. Globális állapotkezelés – Context API

### 4.1 AuthContext

Az `AuthContext` tárolja a bejelentkezett felhasználó adatait (`name`, `email`, `currency`) és a JWT tokent. Induláskor a `localStorage`-ból állítja vissza az állapotot, majd automatikusan validálja a tokent a backend `/user/me` endpointján. Ha a token lejárt, automatikusan kijelentkeztet.

A `useMemo`-t használtam a context értékének memoizálásához, hogy elkerüljem a felesleges re-rendereléseket:

```ts
const value = useMemo(
  () => ({ user, token, loading, login, register, logout, refreshUser, updateProfile }),
  [user, token, loading],
);
```

### 4.2 FinanceContext

A `FinanceContext` az összes pénzügyi adat egyetlen forrása. Induláskor parallel hívja le az összes adatot a `Promise.all` segítségével, így minimalizálja a betöltési időt:

```ts
const refreshAll = useCallback(async () => {
  const [a, c, b, t, g, r] = await Promise.all([
    api.get('/accounts').then(r => r.data),
    api.get('/categories').then(r => r.data),
    api.get('/budgets').then(r => r.data),
    api.get('/transactions').then(r => r.data),
    api.get('/goals').then(r => r.data),
    api.get('/recurring').then(r => r.data),
  ]);
  setAccounts(a); setCategories(c); setTransactions(t); /* ... */
}, []);
```

Minden mutáló művelet (pl. `addTransaction`, `deleteGoal`) a `refreshAll()`-t hívja, így az UI mindig naprakész.

### 4.3 ToastContext

Az értesítési rendszer egy külön kontextusba került, hogy bármely komponensből lehessen sikert vagy hibát jelezni. A toast elemek CSS keyframe animációval jelennek meg és tűnnek el automatikusan.

---

## 5. Újrafelhasználható UI komponensek

Az `UI.tsx` fájlban saját kis komponens-könyvtárat hoztam létre, hogy az összes oldalon egységes kinézet legyen:

- **`Card`** – az összes tartalmi kártyának `glass-card` CSS osztályt ad (glassmorphism hatás: `backdrop-filter: blur()` + félig átlátszó háttér).
- **`Button`** – `loading` prop esetén pörögő ikont mutat, és automatikusan `disabled` állapotba kerül, megakadályozva a dupla kattintást.
- **`Input` / `Select`** – egységes input stílus az egész appban.
- **`Modal`** – kattintásra a backdrop bezárja, de a belső kártyára kattintva nem (`e.stopPropagation()`).
- **`ColorPicker`** – 27 előre definiált szín palettán klikkelve lehet számla-, kategória- és célszínt választani.

```tsx
export function Button({ children, loading, ...props }) {
  return (
    <button className="btn" disabled={loading || props.disabled} {...props}>
      {loading ? <LoaderCircle className="spin" size={18} /> : children}
    </button>
  );
}
```

---

## 6. Főbb oldalak és megoldott feladatok

### 6.1 AuthPage – belépési és regisztrációs oldal

A landing oldal két részből áll: bal oldalon egy animált hero szekció Framer Motion-nel (`initial`/`animate`/`transition` props), jobb oldalon a belépési/regisztrációs űrlap. A `mode` állapot (`login`/`register`) váltásával a form megváltozik, az animáció pedig a nézetek közötti átmenetet simítja.

### 6.2 AppShell – az alkalmazás váza

Az `AppShell` egy layout komponens, amelyet a React Router `Outlet` mechanizmusa tesz lehetővé: a sidebar és a topbar mindig látható, az `Outlet` helyére renderelődik az aktuális oldal. A felhasználó monogramját `useMemo`-val számolom:

```ts
const initials = useMemo(
  () => (user?.name || 'U').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(),
  [user?.name],
);
```

### 6.3 DashboardPage – irányítópult

A dashboard az alkalmazás szíve: összesített egyenleg, havi bevétel/kiadás statisztikák, területi grafikon (`AreaChart`) bevétel és kiadás trenddel, kördiagram (`PieChart`) a kiadások kategória szerinti megoszlásával, és a legutóbbi tranzakciók listája.

Az időtáv váltó (7 nap / 1 hónap / 6 hónap) a `spendingTrend` adatot dinamikusan számolja újra az aktuális tranzakciók alapján – kizárólag kliensoldalon, a backend nem kap újabb kérést:

```ts
// Aktuális hónap napjai szerinti csoportosítás (30d nézet):
const daysInMonth = new Date(year, month + 1, 0).getDate();
return Array.from({ length: daysInMonth }).map((_, i) => {
  const day = i + 1;
  const start = new Date(year, month, day, 0, 0, 0);
  const end   = new Date(year, month, day, 23, 59, 59);
  const items = transactions.filter(t => {
    const td = new Date(t.date); return td >= start && td <= end;
  });
  return { label: `${day}.`, bevétel: ..., kiadás: ... };
});
```

### 6.4 TransactionsPage – tranzakciókezelés

A tranzakciós oldal a legkomplexebb: szűrő (szöveg, típus, kategória, dátumtartomány), rendezés, lapozás (pagination) és teljes CRUD. A modális ablak ugyanaz a komponens hozzáadáshoz és szerkesztéshez is – az `editingTx` state dönti el, melyik módban van. Átutalásnál a form dinamikusan változik: a kategória mező eltűnik, a célszámla mező megjelenik.

### 6.5 BudgetsPage – havi keretek

A keretoldal az aktuális havi tranzakciókból számolja ki a felhasználás mértékét. A progress bar piros lesz, ha a keret 90%-a elhasználódott, narancs 75% felett, egyébként zöld – egyszerű CSS osztályváltással.

### 6.6 GoalsPage – takarékossági célok

Minden célon látható a megtakarított összeg, a célösszeg, a haladási sáv és a határidő. A „Hozzáadás" gomb egy külön modált nyit, ahol csak egy összeget kell megadni – ez a `/goals/:id/add` endpointot hívja.

### 6.7 RecurringPage – ismétlődő tranzakciók

Az ismétlődő tranzakciók automatikusan feldolgozódnak az alkalmazás indulásakor (`POST /recurring/process`), így ha a felhasználó napokat nem nyitotta meg az appot, az összes esedékes tétel rögzítésre kerül. Ezt a `FinanceContext`-ben a `useEffect` kezeli, még az adatok betöltése előtt.

### 6.8 ReportsPage – riportok

A riportoldalon három grafikon jelenik meg egymás alatt: havi bevétel/kiadás oszlopdiagram, egyenlegváltozás vonalas grafikon és kiadások kategória szerinti kördiagram. Az adatokat az already betöltött tranzakciókból számolom kliensoldalon.

---

## 7. Vizuális dizájn és UX döntések

### 7.1 Sötét téma és glassmorphism

Az alkalmazás dark mode témát használ: sötétkék (`#07111f`) háttér, félig átlátszó kártyák `backdrop-filter: blur(14px)` effekttel. A háttéren radial gradient foltok adnak mélységet:

```css
:root {
  background:
    radial-gradient(circle at top left, rgba(91, 140, 255, 0.35), transparent 28%),
    radial-gradient(circle at top right, rgba(58, 214, 181, 0.18), transparent 25%),
    linear-gradient(135deg, #07111f 0%, #101d35 55%, #0a1327 100%);
}
```

### 7.2 Színpaletta

Az elsődleges akcentszínek: `#5b8cff` (kék) és `#3ad6b5` (türkiz). Ezek a sidebar logóján, az aktív navigációs elemen és a grafikonok adatsorain jelennek meg – az egész app vizuálisan egységes marad.

### 7.3 Animációk

A Framer Motion `AnimatePresence` komponensét a profilmodal és az `AuthPage` hero szekciójához használtam. Az egyéb UI elemeken (toast értesítések, loading spinner) CSS keyframe animációkat alkalmaztam, mert azok nem igényelnek JavaScript futtatási időt.

---

## 8. Tanulási folyamat és felhasznált források

**React és TypeScript**
- React hivatalos dokumentáció (react.dev) – különösen a hooksokról és a kontextuskezelésről szóló fejezetek.
- TypeScript Handbook (typescriptlang.org) – az interface/type definíciók, generikusok és utility típusok megértéséhez.
- Kent C. Dodds blogja (kentcdodds.com) – a Context API helyes használatáról, custom hookokról és `useCallback`/`useMemo` optimalizációról.

**Recharts**
- Recharts dokumentáció (recharts.org) – az `AreaChart`, `PieChart` és `BarChart` konfigurációjához, a `ResponsiveContainer` és a `Tooltip` testreszabásához.

**Framer Motion**
- Framer Motion dokumentáció (framer.com/motion) – az `initial`/`animate`/`exit` props és az `AnimatePresence` helyes használatához.

**CSS és dizájn ötletek**
- Glassmorphism minták – a glassmorphism.com és CodePen demók alapján tanultam meg a `backdrop-filter` technikát.
- Tailwind CSS dokumentáció (tailwindcss.com) – az utility class-ok gyors alkalmazásához.
- Dribbble és Behance – modern fintech alkalmazás designok vizsgálata (Revolut, N26 stílusú dark dashboardok) a dizájn irány meghatározásához.

**Axios**
- Axios dokumentáció (axios-http.com) – az interceptorok (request interceptor a JWT csatoláshoz) és a hibakezelés megértéséhez.

---

## 9. Kihívások és megoldott problémák

- **JWT token kezelés** – eleinte a token nem frissült induláskor; a megoldás: a `useEffect` a `token` változóra figyel, és automatikusan validálja a backenddel.
- **Ismétlődő tranzakciók sorrendje** – az adatbetöltés előtt kell a `/recurring/process` endpoint, ezért a `FinanceProvider` indulásakor először ezt hívom, és csak a `.finally()`-ben töltöm be az adatokat.
- **Recharts `ResponsiveContainer`** – ha a szülő konténernek nincs explicit magassága, a grafikon nem jelenik meg. Minden grafikonnál explicit `height: 240` értéket kellett megadni a szülő `div`-en.
- **TypeScript strict módban a `number | string` union** – a backend Decimal mezőket stringként adja vissza. Megoldás: a `toNumber()` segédfüggvény, amely mindkét esetet kezeli (`parseFloat`).
- **Modal bezárás propagáció** – a Modal backdrop kattintásra bezár, de a belső tartalom kattintása ne csukja be. Megoldás: `e.stopPropagation()` a `modal-card` `onClick` handlerén.

---

## 10. Összefoglalás

A SpendWise frontend egy teljes értékű, modern React + TypeScript alkalmazás, amely production-ready technológiákat alkalmaz: Vite build rendszert, Context API-alapú globális állapotkezelést, Recharts diagramokat, Framer Motion animációkat és Tailwind CSS stílusozást. Az alkalmazás teljesen szétválasztott architektúrán alapul (frontend ↔ backend REST API), és minden CRUD műveletet a `FinanceContext` absztrahál.

A fejlesztés során sokat tanultam a React hálózati kommunikációjáról, az aszinkron adatbetöltés kezeléséről, a TypeScript erős típusrendszerének előnyeiről és a modern CSS dizájntechnikákról (glassmorphism, CSS változók, keyframe animációk).

---

*– Köszönöm a figyelmet –*
