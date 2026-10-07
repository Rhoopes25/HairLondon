import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { isComplete } from '@src/domain/booking/draft';
import type { DetailsErrors } from '@src/domain/booking/validate-details';
import { validateDetails } from '@src/domain/booking/validate-details';
import { firstName } from '@src/domain/format/name';
import { useDocumentTitle, useFocusOnMount } from '@app/hooks/usePageBehavior';
import { useServices } from '@app/services';
import { Button, ConfirmBar, PageIntro, Recap, TextButton, TextField } from '@app/ui';
import { BookingHeader } from './BookingHeader';
import { useBooking } from './BookingProvider';
import { draftRecapRows } from './bookingRecap';
import { ReminderPreviewSheet } from './ReminderPreviewSheet';
import styles from './DetailsStep.module.css';

/** Step 2: who is coming, and where to send the reminder. */
export function DetailsStep() {
  const { stylist, draft, details, setDetails } = useBooking();
  const { catalog } = useServices();
  const navigate = useNavigate();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<DetailsErrors>({});
  const [previewing, setPreviewing] = useState(false);
  useDocumentTitle('Your details');

  // Arrived without finishing step 1 (e.g. by typing the address): send them back to choose.
  if (!isComplete(draft)) return <Navigate to={`/book/${stylist.id}`} replace />;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = validateDetails(details, firstName(stylist.name));
    if (result.ok) {
      setErrors({});
      navigate(`/book/${stylist.id}/review`);
      return;
    }
    setErrors(result.errors);
    (result.errors.name ? nameRef : phoneRef).current?.focus();
  }

  return (
    <>
      <BookingHeader confirmExit />
      <PageIntro title="Your details" titleRef={headingRef} />
      <Recap rows={draftRecapRows(draft, stylist, catalog)} />

      <form id="details-form" className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          label="Name"
          name="name"
          autoComplete="name"
          required
          value={details.name}
          onChange={(event) => setDetails({ name: event.target.value })}
          error={errors.name}
          inputRef={nameRef}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={details.phone}
          onChange={(event) => setDetails({ phone: event.target.value })}
          hint="For a reminder text the day before."
          error={errors.phone}
          inputRef={phoneRef}
        />
        <TextButton className={styles.preview} onClick={() => setPreviewing(true)}>
          See a sample reminder
        </TextButton>
      </form>

      <ConfirmBar>
        <Button type="submit" form="details-form" fullWidth>
          Continue
        </Button>
        <TextButton className={styles.back} onClick={() => navigate(`/book/${stylist.id}`)}>
          Back
        </TextButton>
      </ConfirmBar>

      <ReminderPreviewSheet
        open={previewing}
        onClose={() => setPreviewing(false)}
        draft={draft}
        stylist={stylist}
        clientName={details.name}
      />
    </>
  );
}
