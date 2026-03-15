import { useState } from 'react';
import { ArrowRight, CheckCircle2, CreditCard, FolderOpen, PiggyBank, X } from 'lucide-react';
import { Button, ColorPicker, Input, Modal, Select } from './UI';
import { useFinance } from '../context/FinanceContext';

interface Props {
  onDismiss: () => void;
}

type Step = 'welcome' | 'account' | 'category' | 'done';

const DEFAULT_CATEGORIES = [
  { name: 'Élelmiszer', type: 'EXPENSE', color: '#3ad6b5', icon: 'shopping-cart' },
  { name: 'Közlekedés', type: 'EXPENSE', color: '#5b8cff', icon: 'car' },
  { name: 'Szórakozás', type: 'EXPENSE', color: '#c084fc', icon: 'film' },
  { name: 'Fizetés', type: 'INCOME', color: '#34d399', icon: 'briefcase' },
];

export function OnboardingBanner({ onDismiss }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="onboarding-banner">
        <div className="onboarding-banner__icon">
          <PiggyBank size={22} />
        </div>
        <div className="onboarding-banner__text">
          <strong>Üdvözöljük a SpendWise-ban!</strong>
          <p>A kezdéshez hozzon létre egy számlát és néhány kategóriát. Ez csak pár percet vesz igénybe.</p>
        </div>
        <div className="onboarding-banner__actions">
          <Button onClick={() => setOpen(true)}>
            Első lépések <ArrowRight size={15} />
          </Button>
          <button className="icon-btn" onClick={onDismiss} title="Elrejtés">
            <X size={16} />
          </button>
        </div>
      </div>

      {open && <OnboardingModal onClose={() => { setOpen(false); onDismiss(); }} />}
    </>
  );
}

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const { addAccount, addCategory } = useFinance();
  const [step, setStep] = useState<Step>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Számla form
  const [accountName, setAccountName] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [accountColor, setAccountColor] = useState('#5b8cff');

  // Kategória kiválasztás
  const [selectedCats, setSelectedCats] = useState<typeof DEFAULT_CATEGORIES>([...DEFAULT_CATEGORIES]);

  const toggleCat = (name: string) => {
    setSelectedCats((prev) =>
      prev.find((c) => c.name === name)
        ? prev.filter((c) => c.name !== name)
        : [...prev, DEFAULT_CATEGORIES.find((c) => c.name === name)!],
    );
  };

  const handleAccountNext = async () => {
    if (!accountName.trim()) { setError('Adja meg a számla nevét.'); return; }
    setError('');
    setLoading(true);
    try {
      await addAccount({
        name: accountName.trim(),
        balance: accountBalance ? Number(accountBalance) : 0,
        color: accountColor,
      });
      setStep('category');
    } catch {
      setError('Hiba a számla létrehozásakor. Kérjük, próbálja újra.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDone = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all(selectedCats.map((c) => addCategory({ name: c.name, type: c.type as any, color: c.color })));
      setStep('done');
    } catch {
      setError('Néhány kategória már létezik, vagy hiba történt.');
      setStep('done');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Kezdeti beállítás" onClose={onClose}>
      <div className="onboarding-steps">
        {/* Lépésjelző */}
        <div className="step-indicator">
          {(['welcome', 'account', 'category', 'done'] as Step[]).map((s, i) => (
            <div key={s} className={`step-dot ${step === s ? 'active' : i < (['welcome','account','category','done'] as Step[]).indexOf(step) ? 'done' : ''}`} />
          ))}
        </div>

        {step === 'welcome' && (
          <div className="stack-lg onboarding-step">
            <div className="onboarding-icon-big"><PiggyBank size={40} /></div>
            <h3>Köszönjük, hogy csatlakozott!</h3>
            <p>A SpendWise használatához először hozzon létre egy <strong>bankszámlát vagy készpénz tárcát</strong>, majd állítson be <strong>kategóriákat</strong> a kiadások és bevételek rendszerezéséhez.</p>
            <div className="onboarding-steps-list">
              <div className="onboarding-step-item">
                <CreditCard size={18} /><span><strong>1. Számla létrehozása</strong> – pl. OTP Bankszámla, Készpénz</span>
              </div>
              <div className="onboarding-step-item">
                <FolderOpen size={18} /><span><strong>2. Kategóriák kiválasztása</strong> – előre javasolt listából</span>
              </div>
              <div className="onboarding-step-item">
                <CheckCircle2 size={18} /><span><strong>3. Kész!</strong> – Kezdheti a tranzakciók rögzítését</span>
              </div>
            </div>
            <Button onClick={() => setStep('account')}>Kezdjük el <ArrowRight size={15} /></Button>
          </div>
        )}

        {step === 'account' && (
          <div className="stack-lg onboarding-step">
            <div>
              <h3>Hozza létre első számláját</h3>
              <p className="muted">Ez lehet bankszámla, készpénz tárca vagy bármilyen pénzügyi eszköz.</p>
            </div>
            <label>
              <span>Számla neve</span>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="pl. OTP Bankszámla, Készpénz"
                autoFocus
              />
            </label>
            <label>
              <span>Jelenlegi egyenleg (opcionális)</span>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
              />
            </label>
            <label>
              <span>Szín</span>
              <ColorPicker value={accountColor} onChange={setAccountColor} />
            </label>
            {error && <div className="error-box">{error}</div>}
            <div className="row between">
              <Button className="btn-secondary" onClick={() => setStep('welcome')}>Vissza</Button>
              <Button onClick={handleAccountNext} loading={loading}>Következő <ArrowRight size={15} /></Button>
            </div>
          </div>
        )}

        {step === 'category' && (
          <div className="stack-lg onboarding-step">
            <div>
              <h3>Válasszon kategóriákat</h3>
              <p className="muted">Jelölje be a kívánt kategóriákat. Ezeket később bármikor módosíthatja.</p>
            </div>
            <div className="cat-select-grid">
              {DEFAULT_CATEGORIES.map((cat) => {
                const isSelected = selectedCats.some((c) => c.name === cat.name);
                return (
                  <button
                    key={cat.name}
                    type="button"
                    className={`cat-select-item ${isSelected ? 'selected' : ''}`}
                    style={{ '--cat-color': cat.color } as React.CSSProperties}
                    onClick={() => toggleCat(cat.name)}
                  >
                    <span className="cat-dot" style={{ background: cat.color }} />
                    <span>{cat.name}</span>
                    <span className="cat-type">{cat.type === 'EXPENSE' ? 'Kiadás' : 'Bevétel'}</span>
                    {isSelected && <CheckCircle2 size={14} className="cat-check" />}
                  </button>
                );
              })}
            </div>
            {error && <div className="error-box">{error}</div>}
            <div className="row between">
              <Button className="btn-secondary" onClick={() => setStep('account')}>Vissza</Button>
              <Button onClick={handleCategoryDone} loading={loading}>
                {selectedCats.length > 0 ? `${selectedCats.length} kategória létrehozása` : 'Kihagyás'}
                <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="stack-lg onboarding-step onboarding-done">
            <div className="onboarding-icon-big success"><CheckCircle2 size={40} /></div>
            <h3>Minden készen áll!</h3>
            <p>Sikeresen beállította a SpendWise-t. Most már rögzíthet tranzakciókat, állíthat be kereteket és követheti nyomon pénzügyeit.</p>
            <Button onClick={onClose}>Irány az irányítópult! <ArrowRight size={15} /></Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
