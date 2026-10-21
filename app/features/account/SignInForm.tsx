import { useState } from 'react';
import type { FormEvent } from 'react';
import { isValidEmail } from '@src/domain/account/account';
import type { Account } from '@src/domain/account/account';
import { useServices } from '@app/services';
import { Button, TextButton, TextField } from '@app/ui';
import { PretendNote } from './PretendNote';
import styles from './AccountForms.module.css';

/** Sign in with the email she made her pretend account with. No password, on purpose. */
export function SignInForm({
  onSignedIn,
  onCreateInstead,
}: {
  onSignedIn: (account: Account) => void;
  onCreateInstead: () => void;
}) {
  const { accounts } = useServices();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [unknown, setUnknown] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter an email like name@example.com.');
      setUnknown(false);
      return;
    }
    const account = accounts.signIn(email);
    if (!account) {
      setError('There’s no account with that email on this device yet.');
      setUnknown(true);
      return;
    }
    onSignedIn(account);
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={error}
      />
      {unknown ? (
        <TextButton className={styles.inline} onClick={onCreateInstead}>
          Create an account with it instead
        </TextButton>
      ) : null}
      <Button type="submit" fullWidth>
        Sign in
      </Button>
      <PretendNote />
    </form>
  );
}
