import { useState } from 'react';
import type { FormEvent } from 'react';
import { validateNewAccount } from '@src/domain/account/account';
import type { Account, AccountErrors } from '@src/domain/account/account';
import { useServices } from '@app/services';
import { Button, TextField } from '@app/ui';
import { PretendNote } from './PretendNote';
import styles from './AccountForms.module.css';

/** Name, phone, and email: the details every booking asks for, saved once. */
export function CreateAccountForm({
  onCreated,
  initial,
}: {
  onCreated: (account: Account) => void;
  /** What she already typed as a guest, so she does not type it twice. */
  initial?: { name?: string; phone?: string };
}) {
  const { accounts } = useServices();
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<AccountErrors>({});

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = validateNewAccount({ name, phone, email });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    const created = accounts.create(result.value);
    if (!created.ok) {
      setErrors({ email: 'That email already has an account here. Sign in with it instead.' });
      return;
    }
    onCreated(created.account);
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <TextField
        label="Name"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
      />
      <TextField
        label="Phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        hint="For reminder texts the day before."
        error={errors.phone}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        hint="You’ll sign in with this."
        error={errors.email}
      />
      <Button type="submit" fullWidth>
        Create account
      </Button>
      <PretendNote />
    </form>
  );
}
