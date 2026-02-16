accounts: 
1. Számla Létrehozása (CREATE)
Ezzel hozzuk létre az új pénztárcát vagy bankfiókot.

Metódus: POST

URL: http://localhost:3001/api/accounts

Body (JSON):

JSON
{
  "name": "OTP Bank",
  "balance": 150000,
  "color": "#2ecc71",
  "icon": "bank"
}
Fontos: A válaszban kapott "id" értéket (pl. cl... vagy egy szám) másold ki, mert a többi lépéshez ez kell!

2. Számlák Lekérése (READ)
Ezzel listázzuk ki az összes saját számlánkat.

Metódus: GET

URL: http://localhost:3001/api/accounts

Várható válasz: Egy lista [ { ... } ] az összes számláddal.

3. Számla Módosítása (UPDATE)
Ha változott az egyenleg vagy átneveznéd. Itt javítottuk a DTO-t!

Metódus: PATCH

URL: http://localhost:3001/api/accounts/{ID}(Az {ID} helyére illeszd be a kapott azonosítót!)

Body (JSON):

JSON
{
  "balance": 165000,
  "name": "OTP Megtakarítás"
}
Figyelem: Ne tegyél idézőjelet a 165000 köré, mert az szám, nem szöveg!

4. Számla Törlése (DELETE)
Ha meg akarsz szüntetni egy számlát.

Metódus: DELETE

URL: http://localhost:3001/api/accounts/{ID}

Body: Üres (nem kell semmit küldeni).






auth:
1. Regisztráció (CREATE USER)
Ezzel hozod létre a fiókodat az adatbázisban.

Metódus: POST

URL: http://localhost:3001/api/auth/register

Body (JSON):

JSON
{
  "email": "teszt@gmail.com",
  "password": "jelszo123",
  "name": "Teszt Elek",
  "currency": "HUF"
}
Válasz: Ha sikeres, kapsz egy üzenetet: "Sikeres regisztráció!" és a felhasználói ID-dat.

2. Bejelentkezés (LOGIN)
Ezzel kapod meg a tokent, ami minden más kontrollerhez (Accounts, Budgets) kelleni fog.

Metódus: POST

URL: http://localhost:3001/api/auth/login

Body (JSON):

JSON
{
  "email": "teszt@gmail.com",
  "password": "jelszo123"
}
Válasz: Kapsz egy access_token mezőt. Ez egy nagyon hosszú karaktersorozat.
TEENDŐ: Ezt a tokent másold ki (idézőjelek nélkül), és ezt kell majd beillesztened a többi kérésnél a Bearer Token mezőbe!





categories:

Categories Modul (Kategóriák)
Ne feledd: Bearer Token bekapcsolva a Thunder Clientben!

1. Kategória Létrehozása (CREATE)
Hozzunk létre alap kategóriákat, amiket később a tranzakciókhoz rendelünk.

Metódus: POST

URL: http://localhost:3001/api/categories

Body (JSON):

JSON
{
  "name": "Élelmiszer",
  "type": "EXPENSE",
  "color": "#e74c3c",
  "icon": "shopping-cart"
}
Tipp: Érdemes létrehozni egy INCOME (Bevétel) típusút is (pl. "Fizetés"), hogy tudj pénzt is hozzáadni a rendszerhez, ne csak költeni!

2. Kategóriák Listázása (READ)
Metódus: GET

URL: http://localhost:3001/api/categories

Válasz: Megkapod a kategóriáidat. Minden kategória ID-ját jegyezd fel, mert ezekre fogsz hivatkozni a tranzakcióknál!

3. Kategória Módosítása (PATCH)
Ha elírtad a nevet vagy más színt szeretnél.

Metódus: PATCH

URL: http://localhost:3001/api/categories/{ID}

Body (JSON):

JSON
{
  "name": "Bevásárlás",
  "color": "#c0392b"
}
4. Kategória Törlése (DELETE)
Metódus: DELETE

URL: http://localhost:3001/api/categories/{ID}

Figyelem: Ha később olyan kategóriát törölsz, amihez már tartozik tranzakció, az adatbázis hibát dobhat (Foreign Key constraint), kivéve ha beállítottad a "Cascade" törlést.








tranzakció(transactions):
Mivel korábban töröltél mindent, egy teljesen üres adatbázisból indulunk. Ahhoz, hogy a tranzakciókat kezelni tudd, szükséged van egy hierarchiára: először létrehozzuk az "alapokat" (Számla és Kategória), és csak utána a tranzakciót.Itt a teljes folyamat, amit a Thunder Clientben egymás után kell lefuttatnod:1. Előzetes lépés: Számla (Account) létrehozásaA tranzakciónak tudnia kell, melyik pénztárcádat módosítsa.Method: POSTURL: http://localhost:3001/api/accountsBody (JSON):JSON{
  "name": "OTP Bank",
  "balance": 50000,
  "color": "#2ecc71",
  "icon": "bank"
}
Teendő: Kattints a Send-re, majd a válaszból másold ki az "id" értékét (pl. cm123...). Ez lesz az accountId.2. Előzetes lépés: Kategória (Category) létrehozásaA tranzakciót be kell sorolni valahová (pl. kaja, rezsi).Method: POSTURL: http://localhost:3001/api/categoriesBody (JSON):JSON{
  "name": "Bevásárlás",
  "type": "EXPENSE",
  "color": "#e74c3c",
  "icon": "cart"
}
Teendő: Kattints a Send-re, majd a válaszból másold ki az "id" értékét. Ez lesz a categoryId.3. Tranzakció létrehozása (POST)Most, hogy megvannak az ID-k, jöhet a tényleges költés rögzítése.Method: POSTURL: http://localhost:3001/api/transactionsBody (JSON):JSON{
  "amount": 4500,
  "type": "EXPENSE",
  "description": "Tesco kaja",
  "accountId": "IDE_MÁSOLD_AZ_ACCOUNT_ID-T",
  "categoryId": "IDE_MÁSOLD_A_KATEGÓRIA_ID-T",
  "date": "2024-05-20T10:00:00.000Z"
}
Eredmény: A válaszban megkapod a létrehozott tranzakciót. Másold ki ennek az ID-ját is a törlés teszteléséhez!4. Összes tranzakció lekérése (GET)Itt látod az összes rögzített mozgást.Method: GETURL: http://localhost:3001/api/transactionsBody: Üres (nem kell semmi).Eredmény: Egy lista az összes tranzakcióddal.5. Egy tranzakció törlése (DELETE)Ha elrontottál valamit, így tudod eltávolítani. A Service-ed úgy van megírva, hogy törléskor az egyenleget is visszakorrigálja!Method: DELETEURL: http://localhost:3001/api/transactions/IDE_A_TRANZAKCIÓ_ID-TPélda URL: http://localhost:3001/api/transactions/cm456...Eredmény: A tranzakció eltűnik, és ha ez egy 4500 Ft-os kiadás volt, az "OTP Bank" egyenlege újra 50000 Ft lesz.💡 Fontos összefoglaló táblázat az ID-khoz:MűveletHonnan jön az ID?Hová kell beilleszteni?Account POSTA válaszból (id)A Transaction POST accountId mezőjébeCategory POSTA válaszból (id)A Transaction POST categoryId mezőjébeTransaction POSTA válaszból (id)A DELETE kérés URL-jébe






user:
Ez a User Modul, amivel a felhasználó a saját adatait tudja kezelni. Itt már nincs szükség ID-kra az URL-ben, mert a JwtAuthGuard a tokenedből (amit a Bearer Token-nél adtál meg) automatikusan tudja, ki vagy.

Nézzük meg, hogyan tudod ezt tesztelni a Thunder Clientben!

1. Profil lekérése (GET me)
Ez a végpont válaszolja meg a kérdést: "Ki vagyok én most?"

Metódus: GET

URL: http://localhost:3001/api/user/me

Auth: Ügyelj rá, hogy a Bearer Token be legyen állítva!

Válasz: Visszakapod a saját adataidat (id, email, név, createdAt).

2. Profil frissítése (PATCH update)
Itt tudod módosítani például a nevedet vagy az alapértelmezett pénznemedet.

Metódus: PATCH

URL: http://localhost:3001/api/user/update

Body (JSON):

JSON
{
  "name": "Új Teszt Elek",
  "currency": "EUR" 
}
Figyelem: Ehhez szükséged lesz az UpdateUserDto-ra a kódban. Ha a szerver hibát dob (pl. "property name should not exist"), akkor nézd meg a user.dto.ts fájlt, és győződj meg róla, hogy a mezők benne vannak @IsOptional()-lel!









budgets:
1. Előzetes lépés: Kategória létrehozása (POST)Előbb létrehozzuk a "dobozt" (pl. Kaja), amire majd a keretet állítjuk be.Method: POSTURL: http://localhost:3001/api/categoriesAuth: Bearer Token legyen beállítva!Body (JSON):JSON{
  "name": "Étel és Ital",
  "type": "EXPENSE",
  "color": "#e74c3c",
  "icon": "pizza"
}
Teendő: Kattints a Send-re.Ami fontos: A válaszból (Response) másold ki az "id" értékét (pl. cmloq63...). Ez lesz a te categoryId-d.2. Művelet: Budget (Költségkeret) létrehozása (POST)Most jön a te specifikus DTO-dhoz igazított kérés.Method: POSTURL: http://localhost:3001/api/budgetsBody (JSON):JSON{
  "limitAmount": 60000,
  "month": 2,
  "year": 2026,
  "categoryId": "IDE_MÁSOLD_BE_AZ_ELŐZŐ_LÉPÉSBŐL_AZ_ID-T"
}
Ami fontos: A válaszból másold ki a budget saját "id"-ját. Ezzel tudod majd később törölni.3. Művelet: Összes Budget lekérése (GET)Ellenőrizzük, hogy látod-e, amit létrehoztál.Method: GETURL: http://localhost:3001/api/budgetsBody: Üres.Eredmény: Látnod kell egy listát a februári 60.000 Ft-os kereteddel.4. Művelet: Budget törlése (DELETE)Ha mégsem kell ez a keret.Method: DELETEURL: http://localhost:3001/api/budgets/A_BUDGET_SAJÁT_ID-JAFontos: Ide a 2. lépésben kapott ID kell, NEM a categoryId!Összegzés az ID-khoz (hogy ne keverd össze):LépésID neveMiért kell?1. Kategória kérésidEzt írod be a Budget JSON-be categoryId néven.2. Budget kérésidEzt írod be a DELETE URL végére, ha törölni akarsz.


vmi