import { Minus, Plus } from 'lucide-react';
import { Input } from './UI';

type Props = {
  value: number | string;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
};

export function NumberInput({
  value,
  onChange,
  min = 1,
  step = 1,
  placeholder,
  disabled,
}: Props) {
  const parsed = Math.max(min, Number(value) || min);

  const commit = (raw: string) => {
    const normalized = raw.replace(',', '.');
    const next = Number(normalized);
    if (!Number.isFinite(next)) return onChange(min);
    onChange(Math.max(min, next));
  };

  return (
    <div className="number-input-wrap">
      <button
        type="button"
        className="icon-btn"
        disabled={disabled}
        onClick={() => onChange(Math.max(min, parsed - step))}
      >
        <Minus size={16} />
      </button>

      <Input
        type="number"
        min={min}
        step={step}
        value={parsed}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => commit(e.target.value)}
        onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
      />

      <button
        type="button"
        className="icon-btn"
        disabled={disabled}
        onClick={() => onChange(parsed + step)}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}