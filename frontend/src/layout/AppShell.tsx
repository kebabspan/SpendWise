import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3, LayoutDashboard, LogOut, Menu, PiggyBank,
  ReceiptText, RefreshCw, Settings, Target, UserCircle2, Wallet, X,
} from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Modal, Select } from '../components/UI';

const navItems = [
  { to: '/',            label: 'Főoldal',       icon: LayoutDashboard },
  { to: '/accounts',    label: 'Számlák',        icon: Wallet          },
  { to: '/transactions',label: 'Tranzakciók',   icon: ReceiptText     },
  { to: '/budgets',     label: 'Keretek',        icon: PiggyBank       },
  { to: '/goals',       label: 'Célok',          icon: Target          },
  { to: '/recurring',   label: 'Ismétlődők',    icon: RefreshCw       },
  { to: '/reports',     label: 'Riportok',       icon: BarChart3       },
];

export function AppShell() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isDashboard = location.pathname === '/';

  const handleHamburger = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen((v) => !v);
    } else {
      setDesktopCollapsed((v) => !v);
    }
  };

  const initials = useMemo(
    () => (user?.name || 'U').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
    [user?.name],
  );

  const handleLogout = () => { logout(); navigate('/auth'); };

  return (
    <div className="app-bg">
      {mobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''} ${desktopCollapsed ? 'desktop-collapsed' : ''}`}>
        <div className="brand">
          <div className="brand-badge"><Wallet size={20} /></div>
          <div><strong>SpendWise</strong><p>Okos pénzkezelés</p></div>
          <button className="icon-btn sidebar-close-btn" onClick={() => setMobileSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="content-shell">
        {isDashboard ? (
          <header className="topbar">
            <button className="icon-btn hamburger-btn" onClick={handleHamburger}>
              <Menu size={18} />
            </button>
            <div className="topbar-text">
              <h1>Üdvözöljük, {user?.name?.split(' ')[0] ?? ''}!</h1>
              <p>Kövesse nyomon pénzügyeit egy helyen.</p>
            </div>
            <div className="profile-chip" onClick={() => setProfileOpen(true)}>
              <div className="avatar">{initials}</div>
              <div className="profile-chip-info">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
              <UserCircle2 size={18} />
            </div>
          </header>
        ) : (
          <header className="topbar topbar-slim">
            <button className="icon-btn hamburger-btn" onClick={handleHamburger}>
              <Menu size={18} />
            </button>
            <div className="profile-chip" onClick={() => setProfileOpen(true)}>
              <div className="avatar">{initials}</div>
              <div className="profile-chip-info">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
              <UserCircle2 size={18} />
            </div>
          </header>
        )}

        <main className="page-body"><Outlet /></main>
      </div>

      <AnimatePresence>
        {profileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileModal
              onClose={() => setProfileOpen(false)}
              onLogout={handleLogout}
              onSave={updateProfile}
              user={user}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileModal({ onClose, onLogout, onSave, user }: {
  onClose: () => void;
  onLogout: () => void;
  onSave: (payload: { name?: string; currency?: string; password?: string }) => Promise<void>;
  user: { name?: string; email?: string; currency?: string } | null;
}) {
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'HUF');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await onSave({ name, currency, password: password || undefined }); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Profil beállítások" onClose={onClose}>
      <form className="stack-lg" onSubmit={submit}>
        <div className="grid-2">
          <label><span>Teljes név</span><Input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label><span>Pénznem</span>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="HUF">HUF – Magyar forint</option>
              <option value="EUR">EUR – Euró</option>
              <option value="USD">USD – Amerikai dollár</option>
              <option value="GBP">GBP – Font sterling</option>
            </Select>
          </label>
        </div>
        <label><span>Új jelszó</span>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hagyja üresen, ha nem kívánja módosítani" />
        </label>
        <div className="row between">
          <Button type="button" className="btn-secondary" onClick={onLogout}><LogOut size={16} /> Kijelentkezés</Button>
          <Button type="submit" loading={saving}><Settings size={16} /> Mentés</Button>
        </div>
      </form>
    </Modal>
  );
}
