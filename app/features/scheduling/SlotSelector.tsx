import { useMemo } from 'react';
import type { ServiceId } from '@src/domain/models/service';
import type { Stylist } from '@src/domain/models/stylist';
import { durationMin } from '@src/domain/models/time';
import type { IsoDate, MinuteOfDay } from '@src/domain/models/time';
import { dayParts, formatDay } from '@src/domain/format/date';
import { formatTime } from '@src/domain/format/time';
import { totalDuration } from '@src/domain/pricing/totals';
import { SALON_HOURS } from '@src/domain/scheduling/salon-hours';
import { bookableDays, listSlots } from '@src/domain/scheduling/slots';
import { useAppointments, useServices } from '@app/services';
import { Section, SlotPicker } from '@app/ui';
import type { DayOption, TimeOption } from '@app/ui';
import styles from './SlotSelector.module.css';

export interface SlotSelectorProps {
  stylist: Stylist;
  /** Their total length decides which start times fit. Empty means "show the shortest visit". */
  serviceIds: readonly ServiceId[];
  date: IsoDate | null;
  start: MinuteOfDay | null;
  onSelectDate: (date: IsoDate) => void;
  onSelectStart: (start: MinuteOfDay) => void;
  /** When rescheduling, the visit being moved, so its own slot counts as free. */
  ignoreAppointmentId?: string;
  /** A helper line under the times, e.g. "You'll be done by 3:00 PM." */
  note?: string | null;
}

function toDayOption(date: IsoDate): DayOption {
  return { id: date, ...dayParts(date), label: formatDay(date) };
}

/** Choose a day, then a time. Used for booking and for rescheduling. */
export function SlotSelector({
  stylist,
  serviceIds,
  date,
  start,
  onSelectDate,
  onSelectStart,
  ignoreAppointmentId,
  note,
}: SlotSelectorProps) {
  const { clock, catalog, availabilityFor } = useServices();
  // Subscribe, so the grid updates the moment an appointment is booked, moved, or cancelled.
  useAppointments();

  const days = useMemo(
    () => bookableDays(clock, stylist.workDays).map(toDayOption),
    [clock, stylist.workDays],
  );

  const slots = date
    ? listSlots(
        { strategy: availabilityFor(ignoreAppointmentId), clock, stylistId: stylist.id },
        date,
        totalDuration(catalog, serviceIds) || durationMin(SALON_HOURS.step),
      )
    : [];
  const times: TimeOption[] = slots.map((slot) => ({
    id: slot.start,
    label: formatTime(slot.start),
    available: slot.available,
  }));
  const hasOpening = slots.some((slot) => slot.available);

  return (
    <>
      <Section title="Choose a day">
        <SlotPicker.Days
          days={days}
          selectedId={date}
          onSelect={(id) => onSelectDate(id as IsoDate)}
        />
      </Section>
      <Section title="Choose a time">
        <SlotPicker.Times
          times={times}
          selectedId={start}
          onSelect={(id) => onSelectStart(id as MinuteOfDay)}
          placeholder={date ? undefined : 'Select a day to see available times'}
          emptyMessage={
            date && !hasOpening
              ? 'No openings long enough on this day. Try another day.'
              : undefined
          }
        />
        {note ? <p className={styles.note}>{note}</p> : null}
      </Section>
    </>
  );
}
