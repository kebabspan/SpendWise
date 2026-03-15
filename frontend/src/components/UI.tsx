import { LoaderCircle, X } from 'lucide-react';
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type CSSProperties } from 'react';

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`glass-card ${className}`} style={style}>{children}</div>;
}

export function Button({
  children, className = '', loading, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button className={`btn ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <LoaderCircle className="spin" size={18} /> : children}
    </button>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="input" {...props} />;
}

export function Modal({
  title, children, onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Szín választó – jól elkülöníthető, élénk paletta (piros, narancs, sárga, zöld, kék, lila, rózsaszín, szürke)
const COLOR_PALETTE = [
  // Piros árnyalatok
  '#e53935', '#ff5252', '#ff8a80',
  // Narancs / barna
  '#f4511e', '#ff6d00', '#ffab40',
  // Sárga
  '#f9a825', '#ffd600', '#ffee58',
  // Zöld
  '#2e7d32', '#43a047', '#69f0ae',
  // Türkiz / cián
  '#00838f', '#00bcd4', '#80deea',
  // Kék
  '#1565c0', '#1e88e5', '#82b1ff',
  // Lila / indigó
  '#4527a0', '#7b1fa2', '#ce93d8',
  // Rózsaszín
  '#ad1457', '#e91e63', '#f48fb1',
  // Szürke / fehér
  '#546e7a', '#90a4ae', '#cfd8dc',
];

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="color-picker">
      {COLOR_PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          className={`color-swatch ${value === color ? 'selected' : ''}`}
          style={{ background: color }}
          onClick={() => onChange(color)}
          title={color}
        />
      ))}
    </div>
  );
}
