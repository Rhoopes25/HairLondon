/** Digits only; a leading US country code ("1") on an 11-digit number is dropped. */
export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

export function isValidPhone(value: string): boolean {
  return phoneDigits(value).length === 10;
}

/** "5551234567" -> "(555) 123-4567" */
export function formatPhone(digits: string): string {
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
