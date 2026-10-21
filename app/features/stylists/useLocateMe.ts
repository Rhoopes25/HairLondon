import { useState } from 'react';
import { NEARBY_MILES, SAMPLE_LOCATION } from '@src/data/seed/sample-location';
import { nearestMiles } from '@src/domain/stylists/location';
import { locateDevice } from '@app/adapters/geolocation';
import { useServices, useStylists } from '@app/services';

export type LocateStatus = 'idle' | 'asking' | 'unavailable';

/**
 * "Use my location": asks the device, then keeps the answer in the location store. Far from every
 * stylist (most testers are not in Utah County), it stands in the sample spot and says so, so the
 * distances still mean something. If the device will not say, she can pick the sample spot herself.
 */
export function useLocateMe() {
  const { location } = useServices();
  const stylists = useStylists();
  const [status, setStatus] = useState<LocateStatus>('idle');

  function standInSample() {
    location.set({ lat: SAMPLE_LOCATION.lat, lng: SAMPLE_LOCATION.lng, source: 'sample' });
    setStatus('idle');
  }

  async function locate() {
    setStatus('asking');
    try {
      const point = await locateDevice();
      const near = nearestMiles(
        point,
        stylists.map((stylist) => stylist.location),
      );
      if (near > NEARBY_MILES) {
        standInSample();
        return;
      }
      location.set({ ...point, source: 'device' });
      setStatus('idle');
    } catch {
      setStatus('unavailable');
    }
  }

  function forget() {
    location.forget();
    setStatus('idle');
  }

  return { status, locate, standInSample, forget };
}
