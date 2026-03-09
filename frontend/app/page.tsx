import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      title: 'Tranzakciók kezelése',
      desc: 'Rögzítsd gyorsan a bevételeidet és kiadásaidat, és tarts mindent egy helyen.',
    },
    {
      title: 'Számlák és egyenlegek',
      desc: 'Kezeld külön a bankszámláidat, készpénzedet és egyéb pénzügyi forrásaidat.',
    },
    {
      title: 'Kategóriák rendszerezése',
      desc: 'Bontsd le a költéseidet és bevételeidet jól átlátható kategóriákra.',
    },
    {
      title: 'Havi budget követés',
      desc: 'Állíts be költségkereteket, és figyeld, mennyire tartod a céljaidat.',
    },
    {
      title: 'Modern dashboard',
      desc: 'Lásd egy helyen az egyenlegedet, havi mozgásaidat és a legfrissebb adatokat.',
    },
    {
      title: 'Tudatos pénzügyi kontroll',
      desc: 'A SpendWise segít jobban megérteni, mire megy el a pénzed hónapról hónapra.',
    },
  ];

  const transactions = [
    { name: 'Fizetés', amount: '+420 000 Ft', type: 'income' },
    { name: 'Élelmiszer', amount: '-18 400 Ft', type: 'expense' },
    { name: 'Üzemanyag', amount: '-24 900 Ft', type: 'expense' },
    { name: 'Előfizetés', amount: '-2 990 Ft', type: 'expense' },
  ];

  const highlights = [
    'Gyors bevitel és átlátható kezelés',
    'Pénzügyi adatok modern dashboardon',
    'Zöld, fintech hangulatú felület',
    'Költségkeret és egyenleg követés egyszerűen',
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.16),_transparent_30%),linear-gradient(to_bottom_right,hsl(var(--background)),hsl(var(--background)),rgba(240,253,244,0.72))] text-foreground">
      <div className="absolute left-[-140px] top-[-120px] h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-green-400/20 blur-3xl" />

      <div className="relative container mx-auto px-4 py-6">
        <header className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-emerald-200/40 bg-card/80 px-5 py-4 shadow-sm backdrop-blur-xl">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
              SpendWise
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#funkciok"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Funkciók
            </Link>
            <Link
              href="#miert"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Miért jó?
            </Link>
            <Link
              href="/signin"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Bejelentkezés
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="hidden rounded-xl border border-emerald-200/50 px-4 py-2 text-sm font-medium transition hover:bg-muted sm:inline-flex"
            >
              Bejelentkezés
            </Link>
            <Link
              href="/signup"
              className="inline-flex rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.01] hover:from-emerald-600 hover:to-green-700"
            >
              Regisztráció
            </Link>
          </div>
        </header>

        <section className="mx-auto mt-8 grid max-w-6xl gap-10 overflow-hidden rounded-[36px] border border-emerald-200/40 bg-card/85 p-8 shadow-[0_25px_80px_rgba(16,185,129,0.10)] backdrop-blur-xl md:p-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Modern személyes pénzügyi alkalmazás
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Kezeld okosabban a pénzügyeidet a{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                SpendWise
              </span>{' '}
              segítségével.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Kövesd a bevételeidet, kiadásaidat, kategóriáidat, számláidat és
              havi budgetjeidet egy letisztult, gyors és modern fintech
              felületen. Minden fontos pénzügyi adatod egy helyen.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.01] hover:from-emerald-600 hover:to-green-700"
              >
                Kezdés most
              </Link>

              <Link
                href="/signin"
                className="inline-flex h-12 items-center rounded-2xl border border-emerald-200/50 px-6 text-sm font-medium transition hover:bg-muted"
              >
                Bejelentkezés
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center rounded-2xl border border-emerald-200/50 px-6 text-sm font-medium transition hover:bg-muted"
              >
                Dashboard
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-emerald-200/40 bg-background/80 p-4 backdrop-blur">
                <p className="text-sm text-muted-foreground">Jelenlegi egyenleg</p>
                <p className="mt-2 text-2xl font-semibold">842 300 Ft</p>
              </div>

              <div className="rounded-3xl border border-emerald-200/40 bg-background/80 p-4 backdrop-blur">
                <p className="text-sm text-muted-foreground">Havi megtakarítás</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-600">
                  +128 000 Ft
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-200/40 bg-background/80 p-4 backdrop-blur">
                <p className="text-sm text-muted-foreground">Budget állapot</p>
                <p className="mt-2 text-2xl font-semibold">78%</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-emerald-200/40 bg-background/80 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between border-b border-emerald-200/30 pb-4">
              <div>
                <p className="text-sm text-muted-foreground">Fő dashboard</p>
                <h2 className="text-xl font-semibold">Pénzügyi áttekintés</h2>
              </div>
              <div className="rounded-full border border-emerald-200/50 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700">
                Március
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-emerald-200/40 bg-card p-4">
                <p className="text-sm text-muted-foreground">Bevétel</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-600">
                  +420 000 Ft
                </p>
              </div>

              <div className="rounded-3xl border border-rose-200/40 bg-card p-4">
                <p className="text-sm text-muted-foreground">Kiadás</p>
                <p className="mt-2 text-2xl font-semibold text-rose-500">
                  -292 000 Ft
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-emerald-200/40 bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium">Legutóbbi tranzakciók</h3>
                <span className="text-sm text-muted-foreground">4 elem</span>
              </div>

              <div className="space-y-3">
                {transactions.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-2xl border border-emerald-200/30 bg-background px-3 py-3"
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                    <span
                      className={`text-sm font-medium ${
                        item.type === 'income'
                          ? 'text-emerald-600'
                          : 'text-rose-500'
                      }`}
                    >
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-emerald-200/40 bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">Havi budget</h3>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-500 to-green-500" />
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                234 000 Ft felhasználva a 300 000 Ft-os keretből
              </p>
            </div>
          </div>
        </section>

        <section
          id="funkciok"
          className="mx-auto mt-8 max-w-6xl rounded-[36px] border border-emerald-200/40 bg-card/85 p-8 shadow-sm backdrop-blur md:p-10"
        >
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Funkciók
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Minden, ami a tudatos pénzügyi kezeléshez kell
            </h2>

            <p className="mt-4 text-muted-foreground">
              A SpendWise célja, hogy egyszerűvé, gyorssá és átláthatóvá tegye a
              napi pénzügyi nyomon követést egy modern, pénzügyes hangulatú
              felületen.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-emerald-200/35 bg-background/80 p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="text-lg font-semibold">{item.title}</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="miert"
          className="mx-auto mt-8 grid max-w-6xl gap-6 rounded-[36px] border border-emerald-200/40 bg-card/85 p-8 shadow-sm backdrop-blur md:grid-cols-2 md:p-10"
        >
          <div>
            <div className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Miért SpendWise?
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Egy app, ami tényleg segít átlátni a pénzügyeidet
            </h2>

            <p className="mt-4 text-muted-foreground">
              Nem csak tárolja az adatokat, hanem segít rendszerezni és értelmezni
              is őket, így könnyebben hozhatsz jobb pénzügyi döntéseket.
            </p>
          </div>

          <div className="grid gap-4">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-emerald-200/35 bg-background/80 p-4"
              >
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-6xl rounded-[36px] border border-emerald-200/40 bg-card/85 p-8 text-center shadow-sm backdrop-blur md:p-10">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Kezdd el még ma a pénzügyeid tudatos kezelését
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Regisztrálj a SpendWise-ba, és építs fel egy átláthatóbb, rendezettebb
            pénzügyi rendszert magadnak.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.01] hover:from-emerald-600 hover:to-green-700"
            >
              Regisztráció
            </Link>

            <Link
              href="/signin"
              className="inline-flex h-12 items-center rounded-2xl border border-emerald-200/50 px-6 text-sm font-medium transition hover:bg-muted"
            >
              Bejelentkezés
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}