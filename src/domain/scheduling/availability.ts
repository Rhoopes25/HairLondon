import type { IsoDate, MinuteOfDay } from '../models/time';

/**
 * Strategy: decides whether one grid block of a stylist's day is already taken.
 * Implementations: SeededAvailability (sample data), and AppointmentAwareAvailability,
 * which decorates any other strategy with appointments the client has booked.
 */
export interface AvailabilityStrategy {
  isBlockBooked(stylistId: string, date: IsoDate, block: MinuteOfDay): boolean;
}
