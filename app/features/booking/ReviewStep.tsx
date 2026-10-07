import { Navigate, useNavigate } from 'react-router';
import { isComplete } from '@src/domain/booking/draft';
import { validateDetails } from '@src/domain/booking/validate-details';
import { firstName } from '@src/domain/format/name';
import { totalDuration, totalPrice } from '@src/domain/pricing/totals';
import { useDocumentTitle, useFocusOnMount } from '@app/hooks/usePageBehavior';
import { useServices } from '@app/services';
import { Button, ConfirmBar, PageIntro, Recap, TextButton } from '@app/ui';
import { BookingHeader } from './BookingHeader';
import { useBooking } from './BookingProvider';
import { draftRecapRows } from './bookingRecap';
import styles from './ReviewStep.module.css';

/** Step 3: one last look before it is final. Nothing is booked until "Confirm booking". */
export function ReviewStep() {
  const { stylist, draft, details } = useBooking();
  const { catalog, appointments } = useServices();
  const navigate = useNavigate();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  useDocumentTitle('Review your booking');

  const validated = validateDetails(details, firstName(stylist.name));
  if (!isComplete(draft)) return <Navigate to={`/book/${stylist.id}`} replace />;
  if (!validated.ok) return <Navigate to={`/book/${stylist.id}/details`} replace />;
  const { name, phone } = validated.value;

  function confirm() {
    if (!isComplete(draft)) return;
    const appointment = appointments.add({
      stylistId: stylist.id,
      serviceIds: draft.serviceIds,
      date: draft.date,
      start: draft.start,
      durationMin: totalDuration(catalog, draft.serviceIds),
      total: totalPrice(stylist, draft.serviceIds),
      name,
      phone,
    });
    // The draft is cleared by the confirmation screen once it is showing. Clearing it here would
    // let this step's guard redirect to the start before the navigation below lands.
    navigate(`/book/${stylist.id}/done?appointment=${appointment.id}`, { replace: true });
  }

  return (
    <>
      <BookingHeader confirmExit />
      <PageIntro title="Check and confirm" titleRef={headingRef}>
        Everything look right? You can still go back and change it.
      </PageIntro>
      <Recap
        rows={draftRecapRows(draft, stylist, catalog, [
          { label: 'Name', value: name },
          { label: 'Phone', value: phone },
        ])}
      />

      <ConfirmBar>
        <Button fullWidth onClick={confirm}>
          Confirm booking
        </Button>
        <TextButton className={styles.back} onClick={() => navigate(`/book/${stylist.id}/details`)}>
          Back
        </TextButton>
      </ConfirmBar>
    </>
  );
}
