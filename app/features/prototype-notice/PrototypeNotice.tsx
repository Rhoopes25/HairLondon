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
      title="This is just a prototype"
      footer={
        <Button fullWidth onClick={close}>
          Got it
        </Button>
      }
    >
      <p>
        Local Locks is an early prototype: a first version made to test an idea. It isn&rsquo;t
        supposed to look polished. We&rsquo;re testing the idea, not the visual design, and some
        things in it are pretend.
      </p>
      <h3 className={styles.heading}>What&rsquo;s pretend</h3>
      <ul className={styles.list}>
        <li>Most stylists, and all of the reviews, are samples.</li>
        <li>Nothing you book here is real. Appointments are saved only in this browser.</li>
        <li>Reminder texts and payments aren&rsquo;t real.</li>
      </ul>
      <h3 className={styles.heading}>Your goal</h3>
      <p>
        <strong>Find a stylist whose work you trust, then book a time that fits your day.</strong>{' '}
        Try booking a hair appointment and tell us what you think of the overall idea. There&rsquo;s
        no single right way to do it: browse stylists, search by service and time, or start with the
        photos.
      </p>
    </Modal>
  );
}
