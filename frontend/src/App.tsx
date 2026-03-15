import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AccountsPage } from './pages/AccountsPage';
import { GoalsPage } from './pages/GoalsPage';
import { RecurringPage } from './pages/RecurringPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { ToastProvider } from './context/ToastContext';
import { AppShell } from './layout/AppShell';

function ProtectedApp() {
  const { token, loading } = useAuth();
  if (loading) return (
    <div className="center-screen">
      <div className="loading-spinner" />
    </div>
  );
  if (!token) return <Navigate to="/auth" replace />;

  return (
    <FinanceProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/"             element={<DashboardPage />} />
          <Route path="/accounts"     element={<AccountsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets"      element={<BudgetsPage />} />
          <Route path="/goals"        element={<GoalsPage />} />
          <Route path="/recurring"    element={<RecurringPage />} />
          <Route path="/reports"      element={<ReportsPage />} />
        </Route>
      </Routes>
    </FinanceProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={<ProtectedApp />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
