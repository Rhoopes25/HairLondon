import type { IsoDate, MinuteOfDay } from '../models/time';
import { addDays, dayParts } from './date';
import { formatTime } from './time';

/** "Today, 1:00 PM", "Tomorrow, 9:30 AM", "Wed 14, 3:00 PM": short enough to sit on a chip. */
export function formatOpening(date: IsoDate, start: MinuteOfDay, today: IsoDate): string {
  const { weekday, dayNum } = dayParts(date);
  const day =
    date === today ? 'Today' : date === addDays(today, 1) ? 'Tomorrow' : `${weekday} ${dayNum}`;
  return `${day}, ${formatTime(start)}`;
}
