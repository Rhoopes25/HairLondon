import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { isComplete } from '@src/domain/booking/draft';
import type { DetailsErrors } from '@src/domain/booking/validate-details';
import { validateDetails } from '@src/domain/booking/validate-details';
import { firstName } from '@src/domain/format/name';
import { useDocumentTitle, useFocusOnMount } from '@app/hooks/usePageBehavior';
import { AccountSheet } from '@app/features/account';
import type { AccountSheetMode } from '@app/features/account';
import { useAccount, useServices } from '@app/services';
import { Button, ConfirmBar, Container, PageIntro, Recap, TextButton, TextField } from '@app/ui';
import { BookingHeader } from './BookingHeader';
import { useBooking } from './BookingProvider';
import { draftRecapRows } from './bookingRecap';
import { ReminderPreviewSheet } from './ReminderPreviewSheet';
import styles from './DetailsStep.module.css';

/**
 * Step 2: who is coming, and where to send the reminder. Signed in, her saved details are already
 * filled in. Signed out, she can sign in or make an account in a sheet (so nothing she picked is
 * lost), or just keep going as a guest.
 */
export function DetailsStep() {
  const { stylist, draft, details, setDetails, skippedChoose, exitTo } = useBooking();
  const { catalog } = useServices();
  const account = useAccount();
  const [sheet, setSheet] = useState<AccountSheetMode | null>(null);
  const navigate = useNavigate();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<DetailsErrors>({});
  const [previewing, setPreviewing] = useState(false);
  // Signed out, she first chooses: sign in, or go on as a guest. Coming back with details already
  // typed counts as having chosen guest.
  const [asGuest, setAsGuest] = useState(() => Boolean(details.name || details.phone));
  const showForm = Boolean(account) || asGuest;
  useDocumentTitle('Your details');

  // Signing in (now, or before she started) fills in her saved details. They stay editable, and
  // coming back to this step does not overwrite what she already changed.
  const filledFor = useRef<string | null>(
    account && (details.name || details.phone) ? account.id : null,
  );
  useEffect(() => {
    if (!account || filledFor.current === account.id) return;
    filledFor.current = account.id;
    setDetails({ name: account.name, phone: account.phone });
  }, [account, setDetails]);

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
      <BookingHeader confirmExit step={1} />
      <Container>
        <PageIntro title="Your details" titleRef={headingRef} />

        <div className={styles.layout}>
          <div className={styles.recap}>
            <Recap rows={draftRecapRows(draft, stylist, catalog)} />
          </div>

          <form id="details-form" className={styles.form} onSubmit={onSubmit} noValidate>
            {account ? (
              <p className={styles.signedIn}>
                Booking as <strong>{account.name}</strong>
              </p>
            ) : asGuest ? null : (
              <div className={styles.choice}>
                <h2 className={styles.choiceTitle}>How would you like to book?</h2>
                <p>Sign in and your details fill in, or keep going as a guest.</p>
                <div className={styles.choiceActions}>
                  <Button type="button" onClick={() => setSheet('sign-in')}>
                    Sign in
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAsGuest(true);
                      // Straight to the first field, so the choice is one tap, not two.
                      requestAnimationFrame(() => nameRef.current?.focus());
                    }}
                  >
                    Continue as guest
                  </Button>
                </div>
                <TextButton onClick={() => setSheet('create')}>
                  New here? Create an account
                </TextButton>
              </div>
            )}
            {showForm ? (
              <>
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
                {account ? null : (
                  <TextButton className={styles.preview} onClick={() => setSheet('create')}>
                    Create an account
                  </TextButton>
                )}
              </>
            ) : null}
          </form>

          <div className={styles.bar}>
            <ConfirmBar sticky>
              {showForm ? (
                <Button type="submit" form="details-form" fullWidth>
                  Continue
                </Button>
              ) : null}
              <TextButton
                className={styles.back}
                onClick={() => navigate(skippedChoose ? exitTo : `/book/${stylist.id}`)}
              >
                Back
              </TextButton>
            </ConfirmBar>
          </div>
        </div>

        <AccountSheet
          mode={sheet}
          onModeChange={setSheet}
          onClose={() => setSheet(null)}
          guestDetails={details}
        />

        <ReminderPreviewSheet
          open={previewing}
          onClose={() => setPreviewing(false)}
          draft={draft}
          stylist={stylist}
          clientName={details.name}
        />
      </Container>
    </>
  );
}
