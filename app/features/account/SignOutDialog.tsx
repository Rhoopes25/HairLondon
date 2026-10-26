import { ConfirmDialog } from '@app/ui';

/** Asks before signing out, so a stray tap does not drop her saved details mid-visit. */
export function SignOutDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      title="Sign out?"
      message="Your account stays on this device, so you can sign back in anytime. You can still book as a guest."
      confirmLabel="Sign out"
      cancelLabel="Stay signed in"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
