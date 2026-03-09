import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  ReceiptText,
  Settings,
  UserCircle2,
  Wallet,
} from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Modal } from '../components/UI';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export function AppShell() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = useMemo(
    () =>
      (user?.name || 'U')
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [user?.name],
  );

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="app-bg">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-badge">
            <Wallet size={20} />
          </div>
          <div>
            <strong>FinanceTracker</strong>
            <p>Smart expense hub</p>
          </div>
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
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <button className="icon-btn mobile-only" onClick={() => setOpen((prev) => !prev)}>
            <Menu size={18} />
          </button>
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0] ?? 'there'}!</h1>
            <p>Track every move of your money in one polished workspace.</p>
          </div>
          <div className="profile-chip" onClick={() => setProfileOpen(true)}>
            <div className="avatar">{initials}</div>
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <UserCircle2 size={18} />
          </div>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {profileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileModal onClose={() => setProfileOpen(false)} onLogout={handleLogout} onSave={updateProfile} user={user} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileModal({
  onClose,
  onLogout,
  onSave,
  user,
}: {
  onClose: () => void;
  onLogout: () => void;
  onSave: (payload: { name?: string; currency?: string; imageUrl?: string; password?: string }) => Promise<void>;
  user: { name?: string; email?: string; currency?: string; imageUrl?: string | null } | null;
}) {
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'HUF');
  const [imageUrl, setImageUrl] = useState(user?.imageUrl || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, currency, imageUrl, password: password || undefined });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Profile settings" onClose={onClose}>
      <form className="stack-lg" onSubmit={submit}>
        <div className="grid-2">
          <label>
            <span>Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            <span>Currency</span>
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </label>
        </div>
        <label>
          <span>Avatar URL</span>
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        </label>
        <label>
          <span>New password</span>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 karakter" />
        </label>
        <div className="row between">
          <Button type="button" className="btn-secondary" onClick={onLogout}>
            <LogOut size={16} /> Logout
          </Button>
          <Button type="submit" loading={saving}>
            <Settings size={16} /> Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
