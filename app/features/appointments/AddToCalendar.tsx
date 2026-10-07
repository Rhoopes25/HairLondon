import { useState } from 'react';
import { buildIcs } from '@src/domain/calendar/ics';
import type { Appointment } from '@src/domain/models/appointment';
import { downloadTextFile } from '@app/lib/download';
import { useServices, useStylist } from '@app/services';
import { Button, Sheet } from '@app/ui';

/** Downloads an .ics file, then tells the person what to do with it (the download alone is easy to miss). */
export function AddToCalendar({ appointment }: { appointment: Appointment }) {
  const { catalog, clock } = useServices();
  const stylist = useStylist(appointment.stylistId);
  const [confirming, setConfirming] = useState(false);

  if (!stylist) return null;

  function download() {
    if (!stylist) return;
    const ics = buildIcs({ appointment, stylist, catalog, stamp: clock.now() });
    downloadTextFile('hair-appointment.ics', ics, 'text/calendar');
    setConfirming(true);
  }

  return (
    <>
      <Button variant="outline" fullWidth onClick={download}>
        Add to calendar
      </Button>
      <Sheet
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Calendar file saved"
        footer={
          <Button fullWidth onClick={() => setConfirming(false)}>
            Got it
          </Button>
        }
      >
        <p>
          We saved <strong>hair-appointment.ics</strong> to your downloads. Open it and your
          calendar app will add this visit.
        </p>
        <p>Nothing happened? Check your downloads folder.</p>
      </Sheet>
    </>
  );
}
