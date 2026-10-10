import { Button, Modal } from '@app/ui';
import { useNotice } from './NoticeProvider';
import styles from './PrototypeNotice.module.css';

/** The plain-English "this is an early draft" message, and the goal for the person trying it. */
export function PrototypeNotice() {
  const { isOpen, close } = useNotice();
  return (
    <Modal
      open={isOpen}
      onClose={close}
      title="This is an early draft"
      footer={
        <Button fullWidth onClick={close}>
          Start exploring
        </Button>
      }
    >
      <p>
        Hair by London is a prototype: a first version made to test an idea. It isn&rsquo;t
        finished, and some things in it are pretend.
      </p>
      <h3 className={styles.heading}>What&rsquo;s pretend</h3>
      <ul className={styles.list}>
        <li>Most stylists, and all of the reviews, are samples.</li>
        <li>Appointments are saved only in this browser. No one will actually do your hair.</li>
        <li>Reminder texts and payments aren&rsquo;t real.</li>
      </ul>
      <h3 className={styles.heading}>Your goal</h3>
      <p>
        <strong>Find a stylist whose work you trust, then book a time that fits your day.</strong>{' '}
        There&rsquo;s no single right way to do it. Browse stylists, jump straight to a service, or
        start with the photos.
      </p>
    </Modal>
  );
}
