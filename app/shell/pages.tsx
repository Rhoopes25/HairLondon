import { isRouteErrorResponse, useRouteError } from 'react-router';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { LinkButton, Narrow, PageIntro, QuietLink } from '@app/ui';
import styles from './pages.module.css';

/** Shown for any address that is not a screen. Offers the three ways back in. */
export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <Narrow>
      <PageIntro title="We couldn’t find that page">
        The link may be old or mistyped. Here are some ways back in.
      </PageIntro>
      <div className={styles.actions}>
        <LinkButton to="/stylists">Find a stylist</LinkButton>
        <QuietLink to="/">Back to home</QuietLink>
        <QuietLink to="/appointments">See my appointments</QuietLink>
      </div>
    </Narrow>
  );
}

/** Shown if a screen fails to load or crashes, instead of a blank page. */
export function RouteErrorPage() {
  const error = useRouteError();
  useDocumentTitle('Something went wrong');
  const missing = isRouteErrorResponse(error) && error.status === 404;
  if (missing) return <NotFoundPage />;
  return (
    <Narrow>
      <PageIntro title="Something went wrong">
        That screen didn’t load. Try again, or head back home.
      </PageIntro>
      <div className={styles.actions}>
        <LinkButton to="/">Back to home</LinkButton>
      </div>
    </Narrow>
  );
}
