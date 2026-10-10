import { Button } from '../Button';
import { TextButton } from '../Button';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Replaces window.confirm: on-brand, testable, and focus-managed. Cancel is the safe, quiet option. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button fullWidth onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <TextButton onClick={onCancel}>{cancelLabel}</TextButton>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
