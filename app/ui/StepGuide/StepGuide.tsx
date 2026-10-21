import { cx } from '@app/lib/cx';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';
import styles from './StepGuide.module.css';

export interface GuideStep {
  label: string;
  icon: IconName;
}

export interface StepGuideProps {
  /** Names the list for screen readers, e.g. "How booking works". */
  label: string;
  steps: readonly GuideStep[];
  /** Index of the step she is on. Steps before it show as done. */
  current: number;
}

/**
 * A short row of icon steps: what to do, in order, and how far along she is. It answers "how long
 * is this going to take?" before she has to ask, which keeps the flow calm. It is not navigation;
 * the steps are not links.
 */
export function StepGuide({ label, steps, current }: StepGuideProps) {
  return (
    <ol className={styles.guide} aria-label={label}>
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'now' : 'next';
        return (
          <li
            key={step.label}
            className={cx(styles.step, styles[state])}
            aria-current={state === 'now' ? 'step' : undefined}
          >
            <span className={styles.dot}>
              <Icon name={state === 'done' ? 'check' : step.icon} />
            </span>
            <span className={styles.label}>
              {step.label}
              {state === 'done' ? <span className="visually-hidden"> (done)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
