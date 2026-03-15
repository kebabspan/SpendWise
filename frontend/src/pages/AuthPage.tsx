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
  const [form, setForm] = useState({ name: '', email: '', password: '', currency: 'HUF' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
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
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Valami hiba történt. Kérjük, próbálja újra.');
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
            Lássa át végre egyszerűen,<br />
            <span>mire megy el a pénze.</span>
          </h1>
          <p className="auth-lead">
            A SpendWise egy modern pénzügyi nyilvántartó alkalmazás, amellyel egy helyen követheti
            bevételeit, kiadásait, kategóriáit és havi kereteit. Segít abban, hogy ne csak felírja
            a költéseit, hanem tényleg át is lássa pénzügyeit.
          </p>
        </div>

        <div className="hero-points">
          <div className="hero-point"><CheckCircle2 size={18} /><span>Gyors tranzakcióbejegyzés a mindennapokra</span></div>
          <div className="hero-point"><CheckCircle2 size={18} /><span>Átlátható irányítópult statisztikákkal és grafikonokkal</span></div>
          <div className="hero-point"><CheckCircle2 size={18} /><span>Havi keretek, kategóriák és tudatosabb költéskövetés</span></div>
        </div>

        <div className="hero-showcase">
          <Card className="showcase-panel showcase-panel--chart">
            <div className="showcase-head">
              <div>
                <p className="eyebrow">Irányítópult előnézet</p>
                <h3>Havi pénzforgalom</h3>
              </div>
              <span className="trend-chip positive">+12,4%</span>
            </div>
            <div className="fake-chart">
              <div className="chart-grid-lines"><span /><span /><span /><span /></div>
              <div className="chart-bars">
                {[
                  { h1: '72%', h2: '48%', l: 'Jan' },
                  { h1: '90%', h2: '54%', l: 'Feb' },
                  { h1: '64%', h2: '58%', l: 'Már' },
                  { h1: '84%', h2: '61%', l: 'Ápr' },
                  { h1: '96%', h2: '67%', l: 'Máj' },
                  { h1: '78%', h2: '44%', l: 'Jún' },
                ].map((bar) => (
                  <div key={bar.l} className="bar-group">
                    <div className="bar income" style={{ height: bar.h1 }} />
                    <div className="bar expense" style={{ height: bar.h2 }} />
                    <small>{bar.l}</small>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-legend">
              <div className="legend-chip"><span className="legend-dot legend-dot--income" />Bevétel</div>
              <div className="legend-chip"><span className="legend-dot legend-dot--expense" />Kiadás</div>
            </div>
          </Card>

          <div className="showcase-side">
            <Card className="showcase-panel mini-stat">
              <div className="mini-stat-icon"><Wallet size={18} /></div>
              <div><span>Aktuális egyenleg</span><strong>428 500 Ft</strong></div>
            </Card>
            <Card className="showcase-panel budget-preview">
              <div className="showcase-head compact">
                <div><p className="eyebrow">Keret példa</p><h3>Havi limit</h3></div>
                <BadgeDollarSign size={18} />
              </div>
              <div className="budget-line">
                <div className="budget-labels"><span>Élelmiszer</span><strong>41 200 / 60 000 Ft</strong></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: '69%' }} /></div>
              </div>
              <div className="budget-line">
                <div className="budget-labels"><span>Üzemanyag</span><strong>58 000 / 70 000 Ft</strong></div>
                <div className="progress-track danger"><div className="progress-fill" style={{ width: '83%' }} /></div>
              </div>
            </Card>
          </div>
        </div>

        <div className="hero-feature-grid">
          {[
            { icon: <PiggyBank size={18} />, title: 'Tudatosabb pénzkezelés', desc: 'Nem csak rögzíti a költéseit, hanem tényleg látja, hol tud javítani.' },
            { icon: <Target size={18} />, title: 'Célok és havi keretek', desc: 'Állítson be kereteket, és kövesse nyomon pénzügyi céljait.' },
            { icon: <CreditCard size={18} />, title: 'Egyszerű napi használat', desc: 'Gyors felület, átlátható adatok, felesleges bonyolítás nélkül.' },
            { icon: <ShieldCheck size={18} />, title: 'Biztonságos hozzáférés', desc: 'Pénzügyi adatai saját fiókjához kötve, védetten érhetők el.' },
          ].map((f) => (
            <Card key={f.title} className="hero-feature-card">
              <div className="hero-feature-card__icon">{f.icon}</div>
              <div><strong>{f.title}</strong><p>{f.desc}</p></div>
            </Card>
          ))}
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
              {mode === 'login' ? 'Lépjen be fiókjába' : 'Hozza létre SpendWise fiókját'}
            </h2>
            <p>
              {mode === 'login'
                ? 'Folytassa ott, ahol abbahagyta, és tekintse át pénzügyeit.'
                : 'Néhány adat megadásával máris elkezdheti a pénzügyi nyilvántartást.'}
            </p>
          </div>

          <div className="auth-tabs">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>
              Bejelentkezés
            </button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>
              Regisztráció
            </button>
          </div>

          <form className="stack-lg" onSubmit={submit}>
            {mode === 'register' && (
              <label>
                <span>Teljes neve</span>
                <div className="input-icon">
                  <UserRound size={16} />
                  <Input placeholder="Adja meg nevét" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
              </label>
            )}
            <label>
              <span>E-mail cím</span>
              <div className="input-icon">
                <Mail size={16} />
                <Input type="email" placeholder="pelda@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </label>
            <label>
              <span>Jelszó</span>
              <div className="input-icon">
                <Lock size={16} />
                <Input type="password" placeholder="Legalább 6 karakter" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            </label>
            {mode === 'register' && (
              <label>
                <span>Pénznem</span>
                <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="HUF">HUF – Magyar forint</option>
                  <option value="EUR">EUR – Euró</option>
                  <option value="USD">USD – Amerikai dollár</option>
                  <option value="GBP">GBP – Font sterling</option>
                </select>
              </label>
            )}
            {error && <div className="error-box">{error}</div>}
            <Button type="submit" loading={loading} className="auth-submit-btn">
              {mode === 'login' ? 'Belépés a SpendWise-ba' : 'Fiók létrehozása'}
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="auth-note-list">
            <div className="auth-note-item"><ChartColumn size={16} /><span>Átlátható irányítópult és statisztikák</span></div>
            <div className="auth-note-item"><Wallet size={16} /><span>Bevételek és kiadások egyszerű kezelése</span></div>
            <div className="auth-note-item"><ShieldCheck size={16} /><span>Biztonságos, saját fiókhoz kötött hozzáférés</span></div>
          </div>

          <div className="auth-card-footer">
            <p>
              {mode === 'login'
                ? 'Még nincs fiókja? Váltson regisztrációra és kezdje el a tudatosabb pénzkezelést.'
                : 'Már van fiókja? Váltson bejelentkezésre és folytassa ott, ahol abbahagyta.'}
            </p>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}
