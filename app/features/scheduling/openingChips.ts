import { formatDay, toIsoDate } from '@src/domain/format/date';
import { formatOpening } from '@src/domain/format/opening';
import { formatTime } from '@src/domain/format/time';
import type { Clock } from '@src/domain/clock';
import type { ServiceId } from '@src/domain/models/service';
import type { Stylist } from '@src/domain/models/stylist';
import type { Opening } from '@src/domain/scheduling/search';
import type { CardSlot } from '@app/ui';
import { bookingPath } from '@app/lib/links';

/**
 * One chip per open time on a stylist card. Tapping it starts her booking with that day and time
 * already held, and the services she searched for already chosen.
 */
export function openingChips(
  stylist: Stylist,
  openings: readonly Opening[],
  options: { clock: Clock; serviceIds: readonly ServiceId[]; back: string },
): CardSlot[] {
  const today = toIsoDate(options.clock.now());
  return openings.map((opening) => ({
    label: formatOpening(opening.date, opening.start, today),
    ariaLabel: `Book ${stylist.name}, ${formatDay(opening.date)} at ${formatTime(opening.start)}`,
    to: bookingPath({
      stylistId: stylist.id,
      serviceIds: options.serviceIds,
      date: opening.date,
      start: opening.start,
      back: options.back,
      // She already chose the stylist, day and time here, so booking opens on Your details.
      toDetails: true,
    }),
  }));
}
