import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useAccount, useServices } from '@app/services';
import { Button, LinkButton, Narrow, PageIntro, QuietLink, Recap } from '@app/ui';
import { NextVisitCard } from './NextVisitCard';
import { PretendNote } from './PretendNote';
import styles from './AccountPage.module.css';

/**
 * Her account. Signed out: why it helps (her details fill in when she books) and the two ways in,
 * with browsing as a guest always fine. Signed in: what is saved, her next visit, and sign out.
 */
export function AccountPage() {
  const account = useAccount();
  const { accounts } = useServices();
  useDocumentTitle(account ? 'Your account' : 'Sign in');

  if (!account) {
    return (
      <Narrow>
        <PageIntro title="Sign in">
          Save your name and phone once, and they&rsquo;ll fill in every time you book.
        </PageIntro>
        <div className={styles.actions}>
          <LinkButton to="/account/sign-in" fullWidth>
            Sign in
          </LinkButton>
          <LinkButton to="/account/create" variant="outline" fullWidth>
            Create an account
          </LinkButton>
          <QuietLink to="/book">Keep browsing as a guest</QuietLink>
          <PretendNote />
        </div>
      </Narrow>
    );
  }

  return (
    <Narrow>
      <PageIntro title="Your account">
        Hi, {account.name}. This is what fills in when you book.
      </PageIntro>
      <Recap
        rows={[
          { label: 'Name', icon: 'user', value: account.name },
          { label: 'Phone', icon: 'phone', value: account.phone },
          { label: 'Email', icon: 'mail', value: account.email },
        ]}
      />
      <div className={styles.actions}>
        <NextVisitCard account={account} />
        <Button variant="outline" fullWidth onClick={() => accounts.signOut()}>
          Sign out
        </Button>
        <PretendNote />
      </div>
    </Narrow>
  );
}
