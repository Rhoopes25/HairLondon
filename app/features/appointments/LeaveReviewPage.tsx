import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { reviewerName } from '@src/domain/format/name';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { useServices } from '@app/services';
import {
  BackLink,
  Button,
  ConfirmBar,
  EmptyNote,
  Narrow,
  PageIntro,
  StarInput,
  TextAreaField,
} from '@app/ui';
import { servicesText, whenText } from './appointment-view';
import { useAppointmentPage } from './useAppointmentPage';
import styles from './LeaveReviewPage.module.css';

interface Errors {
  stars?: string;
  text?: string;
}

/** After a visit, add a review. It shows up on the stylist's profile, closing the trust loop for the next client. */
export function LeaveReviewPage() {
  const { appointment, stylist, phase, reviewed } = useAppointmentPage();
  const { reviews, catalog } = useServices();
  const navigate = useNavigate();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  // Once posted, "already reviewed" becomes true. Without this the guard below would redirect to the
  // appointment before the navigation to the stylist's reviews lands.
  const [posted, setPosted] = useState(false);
  useDocumentTitle('Leave a review');

  if (!appointment || !stylist) {
    return (
      <>
        <BackLink to="/appointments">My appointments</BackLink>
        <EmptyNote>We couldn&rsquo;t find that appointment.</EmptyNote>
      </>
    );
  }
  if ((phase !== 'past' || reviewed) && !posted)
    return <Navigate to={`/appointments/${appointment.id}`} replace />;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!appointment || !stylist) return;
    const next: Errors = {};
    if (stars === 0) next.stars = 'Choose a star rating.';
    if (!text.trim()) next.text = 'Write a sentence or two so others know what to expect.';
    setErrors(next);
    if (next.stars || next.text) return;

    reviews.add({
      stylistId: stylist.id,
      appointmentId: appointment.id,
      name: reviewerName(appointment.name),
      stars,
      text: text.trim(),
    });
    setPosted(true);
    navigate(`/stylists/${stylist.id}/reviews`);
  }

  return (
    <Narrow>
      <BackLink to={`/appointments/${appointment.id}`}>Back to appointment</BackLink>
      <PageIntro title={`Review ${stylist.name}`}>
        {servicesText(appointment, catalog)}, {whenText(appointment)}.
      </PageIntro>

      <form id="review-form" className={styles.form} onSubmit={onSubmit} noValidate>
        <StarInput
          legend="How was your visit?"
          value={stars}
          onChange={setStars}
          error={errors.stars}
        />
        <TextAreaField
          label="Tell others about it"
          value={text}
          onChange={(event) => setText(event.target.value)}
          error={errors.text}
          maxLength={400}
        />
      </form>

      <ConfirmBar>
        <Button type="submit" form="review-form" fullWidth>
          Post review
        </Button>
      </ConfirmBar>
    </Narrow>
  );
}
