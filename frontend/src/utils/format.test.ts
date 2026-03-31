import { describe, it, expect } from 'vitest';
import { toNumber, formatCurrency, formatShortDate, monthKey } from './format';

describe('toNumber', () => {
  it('számot változatlanul ad vissza', () => {
    expect(toNumber(1234)).toBe(1234);
  });

  it('string számot számmá alakít', () => {
    expect(toNumber('57500.00')).toBe(57500);
  });

  it('null esetén 0-t ad vissza', () => {
    expect(toNumber(null)).toBe(0);
  });

  it('undefined esetén 0-t ad vissza', () => {
    expect(toNumber(undefined)).toBe(0);
  });

  it('Infinity esetén 0-t ad vissza', () => {
    expect(toNumber(Infinity)).toBe(0);
  });
});

describe('formatCurrency', () => {
  it('HUF összeget ezres elválasztóval formáz', () => {
    const result = formatCurrency(150000);
    expect(result).toContain('150');
    expect(result).toContain('000');
    expect(result).toContain('Ft');
  });

  it('0 Ft-ot helyesen jelenít meg', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('Ft');
  });

  it('EUR pénznemet kezel', () => {
    const result = formatCurrency(100, 'EUR');
    // jsdom-ban 'EUR' szöveg, böngészőben '€' – mindkettő elfogadott
    expect(result.includes('€') || result.includes('EUR')).toBe(true);
  });

  it('nincs tizedes jegy HUF esetén', () => {
    const result = formatCurrency(1500);
    expect(result).not.toContain(',');
    expect(result).not.toMatch(/\d\.\d/);
  });
});

describe('formatShortDate', () => {
  it('dátumot hu-HU rövid formátumban adja vissza', () => {
    const result = formatShortDate('2025-03-15');
    expect(result).toContain('2025');
    expect(result).toMatch(/márc/i);
    expect(result).toContain('15');
  });
});

describe('monthKey', () => {
  it('január kulcsa helyes', () => {
    expect(monthKey(new Date('2025-01-10'))).toBe('2025-1');
  });

  it('december kulcsa helyes', () => {
    expect(monthKey(new Date('2025-12-01'))).toBe('2025-12');
  });

  it('március kulcsa helyes', () => {
    expect(monthKey(new Date('2025-03-20'))).toBe('2025-3');
  });
});
