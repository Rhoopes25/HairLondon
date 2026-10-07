import { useNotice } from '@app/features/prototype-notice';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import { LinkButton, Narrow, PageIntro, Section, TextButton } from '@app/ui';
import styles from './HelpPage.module.css';

const STEPS = [
  'Look through a stylist’s photos and reviews until you trust her work.',
  'Choose the services you want, then a day and a time that fits.',
  'Tell her your name and phone number, check it, and confirm.',
];

const QUESTIONS: { q: string; a: string }[] = [
  {
    q: 'Can I change or cancel?',
    a: 'Yes. Open the visit in My appointments to move it to another time or cancel it. The time opens up again right away.',
  },
  {
    q: 'Do I pay here?',
    a: 'No. Payment isn’t part of this prototype, and nothing you do here costs anything.',
  },
  {
    q: 'What about the reminder text?',
    a: 'When you book, you can preview the text that would go out the day before. This prototype never actually sends one.',
  },
  {
    q: 'Where are my appointments kept?',
    a: 'Only in this browser, on this device. Clearing your browser data removes them.',
  },
];

export function HelpPage() {
  const { open } = useNotice();
  useDocumentTitle('How booking works');

  return (
    <Narrow>
      <PageIntro title="How booking works">Three steps, no account needed.</PageIntro>

      <Section title="The short version">
        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className={styles.cta}>
          <LinkButton to="/stylists">Find a stylist</LinkButton>
        </div>
      </Section>

      <Section title="Good to know">
        <div className={styles.questions}>
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className={styles.question}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <p className={styles.notice}>
          <TextButton onClick={open}>Read the early-prototype note again</TextButton>
        </p>
      </Section>
    </Narrow>
  );
}
