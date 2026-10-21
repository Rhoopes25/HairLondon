import { Sheet } from '@app/ui';
import { CreateAccountForm } from './CreateAccountForm';
import { SignInForm } from './SignInForm';

export type AccountSheetMode = 'sign-in' | 'create';

/**
 * Sign in or create an account without leaving a booking: a sheet over the details step, so the
 * service, day, and time she picked are still there when it closes.
 */
export function AccountSheet({
  mode,
  onModeChange,
  onClose,
  guestDetails,
}: {
  mode: AccountSheetMode | null;
  onModeChange: (mode: AccountSheetMode) => void;
  onClose: () => void;
  guestDetails?: { name?: string; phone?: string };
}) {
  return (
    <Sheet
      open={mode !== null}
      onClose={onClose}
      title={mode === 'create' ? 'Create an account' : 'Sign in'}
    >
      {mode === 'create' ? (
        <CreateAccountForm onCreated={onClose} initial={guestDetails} />
      ) : (
        <SignInForm onSignedIn={onClose} onCreateInstead={() => onModeChange('create')} />
      )}
    </Sheet>
  );
}
