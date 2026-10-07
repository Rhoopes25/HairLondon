import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { NavBar } from '@app/ui';
import type { NavLinkItem } from '@app/ui';
import { Frame } from './Frame';

/**
 * Every top-level place is one tap away from every screen, so there is never a single path.
 * Labels match the screen titles they open (Appointments -> "My appointments"). The header has to
 * fit a 360px phone, so the NavBar tightens its gaps on narrow screens.
 */
const NAV_LINKS: readonly NavLinkItem[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/stylists', label: 'Stylists' },
  { to: '/appointments', label: 'Appointments' },
  { to: '/saved', label: 'Saved' },
];

/**
 * Prefetch (patterns.dev): booking is the most likely next step from any main screen, so its code
 * is fetched once the browser is idle and the tap on "Book" feels instant. Failure is harmless;
 * the route just loads normally when it is needed.
 */
function prefetchBooking() {
  const load = () => void import('@app/features/booking').catch(() => undefined);
  // Safari has no requestIdleCallback, though the DOM types say every browser does.
  const idle = window as unknown as {
    requestIdleCallback?: (callback: () => void) => number;
    cancelIdleCallback?: (handle: number) => void;
  };
  if (idle.requestIdleCallback && idle.cancelIdleCallback) {
    const handle = idle.requestIdleCallback(load);
    return () => idle.cancelIdleCallback?.(handle);
  }
  const handle = window.setTimeout(load, 2000);
  return () => window.clearTimeout(handle);
}

/** The standard screen: the main navigation on top. */
export function MainLayout() {
  useEffect(prefetchBooking, []);
  return (
    <Frame header={<NavBar homeTo="/" links={NAV_LINKS} />}>
      <Outlet />
    </Frame>
  );
}

/** Booking: no main navigation, so attention stays on the task. The booking header has its own exit. */
export function FocusLayout() {
  return (
    <Frame contained={false}>
      <Outlet />
    </Frame>
  );
}
