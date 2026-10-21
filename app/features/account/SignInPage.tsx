import { useNavigate, useSearchParams } from 'react-router';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { queryString, safeBackPath } from '@app/lib/links';
import { BackLink, Narrow, PageIntro } from '@app/ui';
import { SignInForm } from './SignInForm';
import styles from './AccountPage.module.css';

/** Sign in, then go back to wherever she came from (her account page by default). */
export function SignInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const back = safeBackPath(searchParams.get('back'), '/account');
  useDocumentTitle('Sign in');

  return (
    <Narrow>
      <BackLink to="/account">Back to sign-in options</BackLink>
      <PageIntro title="Welcome back">Sign in with the email you used before.</PageIntro>
      <div className={styles.actions}>
        <SignInForm
          onSignedIn={() => navigate(back)}
          onCreateInstead={() =>
            navigate(
              `/account/create${queryString({ back: searchParams.get('back') ?? undefined })}`,
            )
          }
        />
      </div>
    </Narrow>
  );
}
