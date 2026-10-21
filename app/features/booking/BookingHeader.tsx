import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { firstName } from '@src/domain/format/name';
import { assetUrl, photoSrcSet } from '@app/config';
import { Avatar, ConfirmDialog, HeaderBar, Icon, StepGuide } from '@app/ui';
import type { GuideStep } from '@app/ui';
import { useBooking } from './BookingProvider';
import styles from './BookingHeader.module.css';

/** The whole booking at a glance, so she always knows how close she is to done. */
export const BOOKING_STEPS: readonly GuideStep[] = [
  { label: 'Pick a time', icon: 'calendar' },
  { label: 'Your details', icon: 'user' },
  { label: 'Review', icon: 'list' },
  { label: 'Booked', icon: 'check' },
];

/**
 * Exit on the left, who you are booking with in the middle, and the logo home on the right. Both
 * ways out ask first once you have started, so a stray tap cannot lose your choices; leaving an
 * empty booking just goes.
 */
export function BookingHeader({
  confirmExit,
  step,
}: {
  confirmExit: boolean;
  /** Index into BOOKING_STEPS. */
  step: number;
}) {
  const { stylist, exitTo } = useBooking();
  const navigate = useNavigate();
  const [leavingTo, setLeavingTo] = useState<string | null>(null);

  function leave(to: string) {
    return (event: { preventDefault: () => void }) => {
      if (!confirmExit) return;
      event.preventDefault();
      setLeavingTo(to);
    };
  }

  return (
    <>
      <HeaderBar>
        <Link to={exitTo} className={styles.exit} aria-label="Exit booking" onClick={leave(exitTo)}>
          <Icon name="close" />
        </Link>
        <span className={styles.with}>
          <Avatar
            name={stylist.name}
            photoUrl={stylist.photo ? assetUrl(stylist.photo) : null}
            photoSrcSet={stylist.photo ? photoSrcSet(stylist.photo) : undefined}
            size="sm"
          />
          <span>
            Booking with <strong>{firstName(stylist.name)}</strong>
          </span>
        </span>
        <Link to="/" className={styles.home} aria-label="Local Locks, home" onClick={leave('/')}>
          <Icon name="scissors" />
        </Link>
      </HeaderBar>
      <div className={styles.progress}>
        <StepGuide label="Booking progress" steps={BOOKING_STEPS} current={step} />
      </div>

      <ConfirmDialog
        open={leavingTo !== null}
        title="Leave this booking?"
        message="Your choices won’t be saved."
        confirmLabel="Leave"
        cancelLabel="Keep booking"
        onCancel={() => setLeavingTo(null)}
        onConfirm={() => navigate(leavingTo ?? exitTo)}
      />
    </>
  );
}
