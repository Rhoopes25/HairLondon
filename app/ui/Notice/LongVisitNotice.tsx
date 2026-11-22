import { Notice } from './Notice';

/**
 * A gentle heads-up for a visit longer than four hours, so the total is never a surprise. The
 * caller decides when (see isLongVisit); this only says it, in the calm voice, with a way out.
 */
export function LongVisitNotice({ duration }: { duration: string }) {
  return (
    <Notice title="That’s a long visit">
      Everything you picked adds up to about {duration}. You may want to set aside the afternoon, or
      book some of it on another day. Either is fine.
    </Notice>
  );
}
