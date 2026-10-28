import { formatPhone, isValidPhone, phoneDigits } from '../format/phone';
import type { Appointment } from '../models/appointment';
import type { Clock } from '../clock';
import { appointmentPhase, byStartAscending, byStartDescending } from '../booking/appointments';

/**
 * A pretend account: it lives only on this device, so it holds what saves her typing (name,
 * phone, email) and nothing secret. There is no password, and the screens say so.
 */
export interface Account {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
}

export interface NewAccountInput {
  readonly name: string;
  readonly phone: string;
  readonly email: string;
}

export interface AccountErrors {
  name?: string;
  phone?: string;
  email?: string;
}

export type NewAccountResult =
  | { readonly ok: true; readonly value: NewAccountInput }
  | { readonly ok: false; readonly errors: AccountErrors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL.test(normalizeEmail(value));
}

export function validateNewAccount(input: NewAccountInput): NewAccountResult {
  const name = input.name.trim();
  const errors: AccountErrors = {};
  if (!name) errors.name = 'Enter your name so stylists know who’s coming.';
  if (!isValidPhone(input.phone)) errors.phone = 'Enter a 10-digit phone number.';
  if (!isValidEmail(input.email)) errors.email = 'Enter an email like name@example.com.';
  if (errors.name || errors.phone || errors.email) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      phone: formatPhone(phoneDigits(input.phone)),
      email: normalizeEmail(input.email),
    },
  };
}

/** Her visits are the ones booked with her phone number. */
export function isAccountsAppointment(account: Account, appointment: Appointment): boolean {
  return phoneDigits(account.phone) === phoneDigits(appointment.phone);
}

/**
 * The visit she booked most recently by date, past or upcoming, or null. Having one is what
 * "booked before" means on Home, and it is the visit "Book again" copies. Cancelled visits
 * don't count: she chose not to go.
 */
export function latestBooking(
  account: Account,
  appointments: readonly Appointment[],
): Appointment | null {
  return (
    appointments
      .filter(
        (appointment) =>
          isAccountsAppointment(account, appointment) && appointment.status === 'booked',
      )
      .sort(byStartDescending)[0] ?? null
  );
}

/** Her soonest upcoming visit, or null. */
export function nextVisit(
  account: Account,
  appointments: readonly Appointment[],
  clock: Clock,
): Appointment | null {
  return (
    appointments
      .filter(
        (appointment) =>
          isAccountsAppointment(account, appointment) &&
          appointmentPhase(appointment, clock) === 'upcoming',
      )
      .sort(byStartAscending)[0] ?? null
  );
}
