import type { StorageAdapter } from '@src/data/storage/storage-adapter';
import { AppointmentRepository } from '@src/data/repositories/appointment-repository';
import { PreferencesRepository } from '@src/data/repositories/preferences-repository';
import { ReviewRepository } from '@src/data/repositories/review-repository';
import { SavedStylistRepository } from '@src/data/repositories/saved-stylist-repository';
import { StylistRepository } from '@src/data/repositories/stylist-repository';
import { seedAppointments } from '@src/data/seed/appointments';
import { SERVICES } from '@src/data/seed/services';
import { STYLISTS } from '@src/data/seed/stylists';
import type { Clock } from '@src/domain/clock';
import type { ServiceCatalog } from '@src/domain/models/service';
import { AppointmentAwareAvailability } from '@src/domain/scheduling/appointment-aware-availability';
import type { AvailabilityStrategy } from '@src/domain/scheduling/availability';
import { SALON_HOURS } from '@src/domain/scheduling/salon-hours';
import { SeededAvailability } from '@src/domain/scheduling/seeded-availability';

export interface Services {
  readonly clock: Clock;
  readonly catalog: ServiceCatalog;
  readonly stylists: StylistRepository;
  readonly appointments: AppointmentRepository;
  readonly saved: SavedStylistRepository;
  readonly reviews: ReviewRepository;
  readonly preferences: PreferencesRepository;
  /**
   * Availability = sample openings, minus anything the client has booked.
   * When rescheduling, pass the appointment's id so its own slot counts as free.
   */
  availabilityFor(ignoreAppointmentId?: string): AvailabilityStrategy;
}

/** The composition root for data: builds every repository over one storage and one clock. */
export function createServices(storage: StorageAdapter, clock: Clock): Services {
  const appointments = new AppointmentRepository(storage, clock, seedAppointments(clock));
  const sample = new SeededAvailability();

  return {
    clock,
    catalog: SERVICES,
    stylists: new StylistRepository(STYLISTS),
    appointments,
    saved: new SavedStylistRepository(storage),
    reviews: new ReviewRepository(storage, clock),
    preferences: new PreferencesRepository(storage),
    availabilityFor: (ignoreAppointmentId) =>
      new AppointmentAwareAvailability(
        sample,
        (stylistId, date) =>
          appointments.listOn(stylistId, date).filter((a) => a.id !== ignoreAppointmentId),
        SALON_HOURS.step,
      ),
  };
}
