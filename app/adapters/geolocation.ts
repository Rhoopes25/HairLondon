import type { GeoPoint } from '@src/domain/stylists/location';

/**
 * Asks the browser where the device is. The browser shows its own permission prompt. Rejects when
 * she says no, the device cannot tell, or it takes too long, and the caller falls back calmly.
 */
export function locateDevice(timeoutMs = 10_000): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => reject(new Error(error.message || 'unavailable')),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60_000 },
    );
  });
}
