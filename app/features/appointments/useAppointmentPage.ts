import { useParams } from 'react-router';
import { appointmentPhase } from '@src/domain/booking/appointments';
import type { Appointment, AppointmentPhase } from '@src/domain/models/appointment';
import type { Stylist } from '@src/domain/models/stylist';
import { useAppointment, useServices, useStore, useStylist } from '@app/services';

export interface AppointmentPageData {
  appointment: Appointment | null;
  stylist: Stylist | null;
  phase: AppointmentPhase | null;
  /** The client already reviewed this visit. */
  reviewed: boolean;
}

/** Everything a single-appointment screen needs, looked up from the :id in the URL. */
export function useAppointmentPage(): AppointmentPageData {
  const { id } = useParams();
  const { clock, reviews } = useServices();
  const appointment = useAppointment(id);
  const stylist = useStylist(appointment?.stylistId);
  const userReviews = useStore(reviews);

  return {
    appointment,
    stylist,
    phase: appointment ? appointmentPhase(appointment, clock) : null,
    reviewed: appointment
      ? userReviews.some((review) => review.appointmentId === appointment.id)
      : false,
  };
}
