export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

export function validateEmail(email: string) {
  const value = email.trim();
  if (!value) return 'Email address is required.';
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value)) return 'Enter a valid email address.';
  return '';
}

export function validatePassword(password: string, strong = true) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!strong) return '';

  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return '';
}

export function validateName(name: string) {
  const value = name.trim();
  if (!value) return 'Name is required.';
  if (value.length < 2) return 'Name must be at least 2 characters long.';
  return '';
}

export function validatePositiveAmount(value: number | string, label = 'Amount') {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${label} must be a valid number.`;
  if (amount < 1) return `${label} must be at least 1.`;
  return '';
}