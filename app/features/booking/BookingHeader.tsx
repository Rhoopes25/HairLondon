import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { firstName } from '@src/domain/format/name';
import { assetUrl } from '@app/config';
import { Avatar, ConfirmDialog, HeaderBar, Icon } from '@app/ui';
import { useBooking } from './BookingProvider';
import styles from './BookingHeader.module.css';

/**
 * Exit (always available), and who you are booking with. Leaving a booking you have started
 * asks first; leaving an empty one just goes.
 */
export function BookingHeader({ confirmExit }: { confirmExit: boolean }) {
  const { stylist } = useBooking();
  const navigate = useNavigate();
  const [asking, setAsking] = useState(false);
  const exitTo = `/stylists/${stylist.id}`;

  return (
    <>
      <HeaderBar>
        <Link
          to={exitTo}
          className={styles.exit}
          aria-label="Exit booking"
          onClick={(event) => {
            if (!confirmExit) return;
            event.preventDefault();
            setAsking(true);
          }}
        >
          <Icon name="close" />
        </Link>
        <span className={styles.with}>
          <Avatar
            name={stylist.name}
            photoUrl={stylist.photo ? assetUrl(stylist.photo) : null}
            size="sm"
          />
          <span>
            Booking with <strong>{firstName(stylist.name)}</strong>
          </span>
        </span>
        <span className={styles.spacer} aria-hidden="true" />
      </HeaderBar>

      <ConfirmDialog
        open={asking}
        title="Leave this booking?"
        message="Your choices won’t be saved."
        confirmLabel="Leave"
        cancelLabel="Keep booking"
        onCancel={() => setAsking(false)}
        onConfirm={() => navigate(exitTo)}
      />
    </>
  );
}
