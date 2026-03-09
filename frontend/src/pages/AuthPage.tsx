import { motion } from 'framer-motion';
import './auth.css';
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  ChartColumn,
  CreditCard,
  Lock,
  Mail,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Wallet,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const { token, login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'HUF',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Valami hiba történt. Kérlek, próbáld meg újra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell auth-shell--landing">
      <motion.section
        className="auth-hero auth-hero--landing"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
      >
        <span className="hero-pill hero-pill--accent">
          <Sparkles size={14} />
          SpendWise • tudatosabb pénzkezelés
        </span>

        <div className="auth-copy-block">
          <h1>
            Lásd át végre egyszerűen,
            <br />
            <span>mire megy el a pénzed.</span>
          </h1>

          <p className="auth-lead">
            A SpendWise egy modern pénzügyi nyilvántartó alkalmazás, amivel egy helyen követheted
            a bevételeidet, kiadásaidat, kategóriáidat és havi budgetjeidet. Segít abban, hogy ne
            csak felírd a költéseidet, hanem tényleg át is lásd a pénzügyeidet.
          </p>
        </div>

        <div className="hero-points">
          <div className="hero-point">
            <CheckCircle2 size={18} />
            <span>Gyors tranzakciórögzítés a mindennapokra</span>
          </div>
          <div className="hero-point">
            <CheckCircle2 size={18} />
            <span>Átlátható dashboard statisztikákkal és grafikonokkal</span>
          </div>
          <div className="hero-point">
            <CheckCircle2 size={18} />
            <span>Havi keretek, kategóriák és tudatosabb költéskövetés</span>
          </div>
        </div>

        <div className="hero-showcase">
          <Card className="showcase-panel showcase-panel--chart">
            <div className="showcase-head">
              <div>
                <p className="eyebrow">Dashboard előnézet</p>
                <h3>Havi pénzmozgás</h3>
              </div>
              <span className="trend-chip positive">+12.4%</span>
            </div>

            <div className="fake-chart">
              <div className="chart-grid-lines">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="chart-bars">
                <div className="bar-group">
                  <div className="bar income" style={{ height: '72%' }} />
                  <div className="bar expense" style={{ height: '48%' }} />
                  <small>Jan</small>
                </div>
                <div className="bar-group">
                  <div className="bar income" style={{ height: '90%' }} />
                  <div className="bar expense" style={{ height: '54%' }} />
                  <small>Feb</small>
                </div>
                <div className="bar-group">
                  <div className="bar income" style={{ height: '64%' }} />
                  <div className="bar expense" style={{ height: '58%' }} />
                  <small>Már</small>
                </div>
                <div className="bar-group">
                  <div className="bar income" style={{ height: '84%' }} />
                  <div className="bar expense" style={{ height: '61%' }} />
                  <small>Ápr</small>
                </div>
                <div className="bar-group">
                  <div className="bar income" style={{ height: '96%' }} />
                  <div className="bar expense" style={{ height: '67%' }} />
                  <small>Máj</small>
                </div>
                <div className="bar-group">
                  <div className="bar income" style={{ height: '78%' }} />
                  <div className="bar expense" style={{ height: '44%' }} />
                  <small>Jún</small>
                </div>
              </div>
            </div>

            <div className="chart-legend">
              <div className="legend-chip">
                <span className="legend-dot legend-dot--income" />
                Bevétel
              </div>
              <div className="legend-chip">
                <span className="legend-dot legend-dot--expense" />
                Kiadás
              </div>
            </div>
          </Card>

          <div className="showcase-side">
            <Card className="showcase-panel mini-stat">
              <div className="mini-stat-icon">
                <Wallet size={18} />
              </div>
              <div>
                <span>Aktuális egyenleg</span>
                <strong>428 500 Ft</strong>
              </div>
            </Card>

            <Card className="showcase-panel budget-preview">
              <div className="showcase-head compact">
                <div>
                  <p className="eyebrow">Budget példa</p>
                  <h3>Havi keret</h3>
                </div>
                <BadgeDollarSign size={18} />
              </div>

              <div className="budget-line">
                <div className="budget-labels">
                  <span>Élelmiszer</span>
                  <strong>41 200 / 60 000 Ft</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '69%' }} />
                </div>
              </div>

              <div className="budget-line">
                <div className="budget-labels">
                  <span>Üzemanyag</span>
                  <strong>58 000 / 70 000 Ft</strong>
                </div>
                <div className="progress-track danger">
                  <div className="progress-fill" style={{ width: '83%' }} />
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="hero-feature-grid">
          <Card className="hero-feature-card">
            <div className="hero-feature-card__icon">
              <PiggyBank size={18} />
            </div>
            <div>
              <strong>Tudatosabb pénzkezelés</strong>
              <p>
                Nem csak rögzíted a költéseidet, hanem tényleg látod is, hol tudsz javítani.
              </p>
            </div>
          </Card>

          <Card className="hero-feature-card">
            <div className="hero-feature-card__icon">
              <Target size={18} />
            </div>
            <div>
              <strong>Célok és havi keretek</strong>
              <p>
                Állíts be budgeteket, és kövesd, hogyan haladsz a saját pénzügyi céljaid felé.
              </p>
            </div>
          </Card>

          <Card className="hero-feature-card">
            <div className="hero-feature-card__icon">
              <CreditCard size={18} />
            </div>
            <div>
              <strong>Egyszerű napi használat</strong>
              <p>
                Gyors felület, átlátható adatok, felesleges bonyolítás nélkül.
              </p>
            </div>
          </Card>

          <Card className="hero-feature-card">
            <div className="hero-feature-card__icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>Biztonságos hozzáférés</strong>
              <p>
                A saját pénzügyi adataid a saját fiókodhoz kötve, védetten érhetők el.
              </p>
            </div>
          </Card>
        </div>

        <div className="hero-bottom-text">
          <p>
            A SpendWise célja, hogy egy könnyen használható, modern felületen segítsen a
            mindennapi pénzügyeid követésében. Akár csak egyszerűen vezetnéd a kiadásaidat, akár
            komolyabban figyelnéd a havi budgetedet, itt egy helyen megteheted.
          </p>
        </div>
      </motion.section>

      <motion.section
        className="auth-form-wrap"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="auth-card auth-card--landing">
          <div className="auth-card-header">
            <span className="auth-mini-badge">
              {mode === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
            </span>

            <h2>
              {mode === 'login'
                ? 'Jelentkezz be a fiókodba'
                : 'Hozd létre a SpendWise fiókodat'}
            </h2>

            <p>
              {mode === 'login'
                ? 'Folytasd ott, ahol abbahagytad, és nézd át a pénzügyeidet egy modern felületen.'
                : 'Pár adat megadásával már el is kezdheted a bevételeid, kiadásaid és budgetjeid kezelését.'}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Bejelentkezés
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Regisztráció
            </button>
          </div>

          <form className="stack-lg" onSubmit={submit}>
            {mode === 'register' && (
              <label>
                <span>Neved</span>
                <div className="input-icon">
                  <UserRound size={16} />
                  <Input
                    placeholder="Add meg a neved"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </label>
            )}

            <label>
              <span>E-mail címed</span>
              <div className="input-icon">
                <Mail size={16} />
                <Input
                  type="email"
                  placeholder="pelda@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </label>

            <label>
              <span>Jelszó</span>
              <div className="input-icon">
                <Lock size={16} />
                <Input
                  type="password"
                  placeholder="Add meg a jelszavad"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </label>

            {mode === 'register' && (
              <label>
                <span>Alapértelmezett pénznem</span>
                <Input
                  placeholder="Például: HUF"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                />
              </label>
            )}

            {error ? <div className="error-box">{String(error)}</div> : null}

            <Button type="submit" loading={loading} className="auth-submit-btn">
              {mode === 'login' ? 'Belépek a SpendWise-ba' : 'Fiók létrehozása'}
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="auth-note-list">
            <div className="auth-note-item">
              <ChartColumn size={16} />
              <span>Átlátható dashboard és statisztikák</span>
            </div>
            <div className="auth-note-item">
              <Wallet size={16} />
              <span>Bevételek és kiadások egyszerű kezelése</span>
            </div>
            <div className="auth-note-item">
              <ShieldCheck size={16} />
              <span>Biztonságos, saját fiókhoz kötött hozzáférés</span>
            </div>
          </div>

          <div className="auth-card-footer">
            <p>
              {mode === 'login'
                ? 'Még nincs fiókod? Válts át regisztrációra, és kezdd el még ma a tudatosabb pénzkezelést.'
                : 'Már van fiókod? Válts át bejelentkezésre, és folytasd ott, ahol abbahagytad.'}
            </p>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}