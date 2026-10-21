import { useNavigate, useSearchParams } from 'react-router';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { safeBackPath } from '@app/lib/links';
import { BackLink, Narrow, PageIntro } from '@app/ui';
import { CreateAccountForm } from './CreateAccountForm';
import styles from './AccountPage.module.css';

/** Make a pretend account, then go back to wherever she came from. */
export function CreateAccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const back = safeBackPath(searchParams.get('back'), '/account');
  useDocumentTitle('Create an account');

  return (
    <Narrow>
      <BackLink to="/account">Back to sign-in options</BackLink>
      <PageIntro title="Create an account">
        Three details, once. Next time you book they&rsquo;re already there.
      </PageIntro>
      <div className={styles.actions}>
        <CreateAccountForm onCreated={() => navigate(back)} />
      </div>
    </Narrow>
  );
}
