import { isIsoDate, asMinuteOfDay } from '@src/domain/models/time';
import type { IsoDate, MinuteOfDay } from '@src/domain/models/time';
import type { ServiceId } from '@src/domain/models/service';
import { parseServiceIds, serviceIdsParam } from '@src/domain/stylists/filter';

/**
 * Links between the search, a profile, and booking carry what she has chosen so far: services,
 * a day, a time held for her. They live in the URL so a refresh, a shared link, and the back
 * button all keep working, and so no screen has to know about another's state.
 */

/** A path from the URL that stays inside the app, or the fallback. Never an outside address. */
export function safeBackPath(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

/** `?a=b&c=d`, or an empty string when nothing was set. Commas stay readable in a services list. */
export function queryString(entries: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (value) params.set(key, value);
  }
  const text = params.toString().replaceAll('%2C', ',');
  return text ? `?${text}` : '';
}

export interface BookingLink {
  stylistId: string;
  serviceIds?: readonly ServiceId[];
  date?: IsoDate | null;
  start?: MinuteOfDay | null;
  /** Where the X goes: the search or profile she came from. */
  back?: string;
}

export function bookingPath({ stylistId, serviceIds, date, start, back }: BookingLink): string {
  return `/book/${stylistId}${queryString({
    services: serviceIds?.length ? serviceIdsParam(serviceIds) : undefined,
    date: date ?? undefined,
    start: start === null || start === undefined ? undefined : String(start),
    back,
  })}`;
}

export interface ProfileLink {
  stylistId: string;
  tab?: 'portfolio' | 'services' | 'reviews';
  serviceIds?: readonly ServiceId[];
  /** A day she filtered by, so booking from the profile starts on it. */
  date?: IsoDate | null;
  start?: MinuteOfDay | null;
  back?: string;
}

export function profilePath({
  stylistId,
  tab,
  serviceIds,
  date,
  start,
  back,
}: ProfileLink): string {
  const base = tab ? `/stylists/${stylistId}/${tab}` : `/stylists/${stylistId}`;
  return `${base}${queryString({
    services: serviceIds?.length ? serviceIdsParam(serviceIds) : undefined,
    date: date ?? undefined,
    start: start === null || start === undefined ? undefined : String(start),
    back,
  })}`;
}

/** `?services=` (a list), or the older single `?service=` that earlier links used. */
export function readServiceIds(params: URLSearchParams): ServiceId[] {
  return parseServiceIds(params.get('services') ?? params.get('service'));
}

export function readDate(params: URLSearchParams): IsoDate | null {
  const value = params.get('date');
  return isIsoDate(value) ? value : null;
}

export function readStart(params: URLSearchParams): MinuteOfDay | null {
  const value = params.get('start');
  if (value === null || value === '') return null;
  const minutes = Number(value);
  return Number.isInteger(minutes) && minutes >= 0 && minutes < 24 * 60
    ? asMinuteOfDay(minutes)
    : null;
}
