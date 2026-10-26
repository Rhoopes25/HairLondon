import { useState } from 'react';
import { firstName } from '@src/domain/format/name';
import type { Stylist } from '@src/domain/models/stylist';
import { AccountSheet } from '@app/features/account';
import type { AccountSheetMode } from '@app/features/account';
import { useAccount, useSavedIds, useServices } from '@app/services';
import { Icon } from '@app/ui';
import styles from './SaveButton.module.css';

/**
 * Save a stylist to come back to. A toggle: its state is announced, not just drawn. Saves belong
 * to her account, so a guest's tap opens sign in, and the save happens once she is in.
 */
export function SaveButton({ stylist }: { stylist: Stylist }) {
  const { saved, accounts } = useServices();
  const account = useAccount();
  const isSaved = useSavedIds().includes(stylist.id);
  const [sheet, setSheet] = useState<AccountSheetMode | null>(null);
  // She tapped Save as a guest. Kept apart from the sheet, which closes the moment she signs in.
  const [pending, setPending] = useState(false);

  if (pending && account) {
    setPending(false);
    saved.save(account.id, stylist.id);
  }

  return (
    <>
      <button
        type="button"
        className={styles.save}
        aria-pressed={isSaved}
        aria-label={`Save ${firstName(stylist.name)}`}
        onClick={() => {
          if (account) {
            saved.toggle(account.id, stylist.id);
          } else {
            setPending(true);
            setSheet('sign-in');
          }
        }}
      >
        <Icon name="heart" filled={isSaved} />
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      </button>
      <AccountSheet
        mode={sheet}
        onModeChange={setSheet}
        onClose={() => {
          setSheet(null);
          // Closed without signing in: forget the save she asked for.
          if (!accounts.current()) setPending(false);
        }}
      />
    </>
  );
}
