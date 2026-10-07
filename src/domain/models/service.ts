import type { DurationMin } from './time';

export const SERVICE_IDS = [
  'haircut',
  'color',
  'highlights',
  'root-touch-up',
  'blowout',
  'deep-conditioning',
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

export interface Service {
  readonly id: ServiceId;
  readonly name: string;
  readonly durationMin: DurationMin;
  readonly description: string;
}

/** Every service the site offers, keyed by id. */
export type ServiceCatalog = Readonly<Record<ServiceId, Service>>;

export function isServiceId(value: unknown): value is ServiceId {
  return typeof value === 'string' && (SERVICE_IDS as readonly string[]).includes(value);
}
