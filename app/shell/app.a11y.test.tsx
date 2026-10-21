import { screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { durationMin, minuteOfDay } from '@src/domain/models/time';
import type { IsoDate } from '@src/domain/models/time';
import { renderApp } from '@app/test/renderApp';

/**
 * Automated accessibility checks on every screen and overlay, using axe-core.
 * jsdom has no layout, so color contrast is checked by hand against the design tokens
 * (docs/usability-audit.md) and switched off here. Everything else is on.
 */
async function violations() {
  const results = await axe.run(document.body, {
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(' | ')})`,
  );
}

const SCREENS: [string, string | RegExp][] = [
  ['/', 'Local Locks'],
  ['/book', 'Book'],
  ['/book?step=who', 'Book'], // part 2: the stylists
  ['/book?services=color,highlights&time=evening&step=who', 'Book'], // nothing fits: the calm notice
  ['/stylists?q=londn', 'Stylists'], // a typo, still found
  ['/stylists', 'Stylists'],
  ['/stylists/london', 'London'],
  ['/stylists/london/services', 'London'],
  ['/stylists/london/reviews', 'London'],
  ['/stylists/london/about-me', 'London'],
  ['/stylists/sadie', 'Sadie Morgan'],
  ['/stylists/london/photos/0', /London’s work, photo 1 of 6/],
  ['/stylists/london/about', 'Hair by London'],
  ['/saved', 'Saved stylists'],
  ['/appointments', 'My appointments'],
  ['/appointments/apt_sample_past', 'Past visit'],
  ['/appointments/apt_sample_past/review', 'Review London'],
  ['/help', 'How booking works'],
  ['/account', 'Sign in'],
  ['/account/sign-in', 'Welcome back'],
  ['/account/create', 'Create an account'],
  ['/book/london?services=haircut', 'Book Now'],
  ['/book/london?services=haircut&date=2026-10-08&start=540', 'Book Now'], // a held time
  ['/design-library', 'Design library'],
  ['/nowhere', 'We couldn’t find that page'],
];

describe('accessibility: every screen', () => {
  it.each(SCREENS)('%s has no automated accessibility violations', async (route, heading) => {
    renderApp(route);
    await screen.findByRole('heading', { level: 1, name: heading });
    expect(await violations()).toEqual([]);
  });
});

describe('accessibility: the booking steps', () => {
  it('details, review, and confirmation have no violations', async () => {
    const { user } = renderApp('/book/london?services=haircut');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    const days = within(screen.getByRole('group', { name: 'Day' })).getAllByRole('button');
    await user.click(days[1] as HTMLElement);
    await user.click(
      within(screen.getByRole('group', { name: 'Time' })).getByRole('button', { name: '9:00 AM' }),
    );
    expect(await violations()).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Your details' });
    await user.click(screen.getByRole('button', { name: 'Continue' })); // shows both errors
    expect(await violations()).toEqual([]);

    await user.type(screen.getByLabelText('Name'), 'Maren');
    await user.type(screen.getByLabelText('Phone'), '5551234567');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Check and confirm' });
    expect(await violations()).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Confirm booking' }));
    await screen.findByRole('heading', { name: 'You’re booked' });
    expect(await violations()).toEqual([]);
  });
});

describe('accessibility: overlays', () => {
  it('the early-prototype notice', async () => {
    renderApp('/', { showNotice: true });
    await screen.findByRole('dialog', { name: 'This is just a prototype' });
    expect(await violations()).toEqual([]);
  });

  it('the service detail sheet', async () => {
    const { user } = renderApp('/stylists/london/services');
    await user.click(await screen.findByRole('button', { name: 'More about Color' }));
    await screen.findByRole('dialog');
    expect(await violations()).toEqual([]);
  });

  it('the cancel confirmation', async () => {
    const { services, user, router } = renderApp('/appointments');
    const { id } = services.appointments.add({
      stylistId: 'london',
      serviceIds: ['haircut'],
      date: '2026-10-08' as IsoDate,
      start: minuteOfDay(9),
      durationMin: durationMin(60),
      total: 65,
      name: 'Maren',
      phone: '(555) 123-4567',
    });
    await router.navigate(`/appointments/${id}`);
    await user.click(await screen.findByRole('button', { name: 'Cancel appointment' }));
    await screen.findByRole('dialog');
    expect(await violations()).toEqual([]);
  });

  it('the leave-booking confirmation', async () => {
    const { user } = renderApp('/book/london?services=haircut');
    await screen.findByRole('heading', { name: 'Book Now' });
    await user.click(screen.getByRole('link', { name: 'Exit booking' }));
    await screen.findByRole('dialog');
    expect(await violations()).toEqual([]);
  });
});
