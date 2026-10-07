import { formatPhone, isValidPhone, phoneDigits } from '../format/phone';

export interface DetailsInput {
  readonly name: string;
  readonly phone: string;
}

export interface DetailsErrors {
  readonly name?: string;
  readonly phone?: string;
}

export type DetailsResult =
  | { readonly ok: true; readonly value: DetailsInput }
  | { readonly ok: false; readonly errors: DetailsErrors };

/** `stylistFirstName` personalizes the name error ("...so Sadie knows who's coming"). */
export function validateDetails(input: DetailsInput, stylistFirstName: string): DetailsResult {
  const name = input.name.trim();
  const errors: { name?: string; phone?: string } = {};

  if (!name) errors.name = `Enter your name so ${stylistFirstName} knows who’s coming.`;
  if (!isValidPhone(input.phone)) errors.phone = 'Enter a 10-digit phone number.';

  if (errors.name || errors.phone) return { ok: false, errors };
  return { ok: true, value: { name, phone: formatPhone(phoneDigits(input.phone)) } };
}
