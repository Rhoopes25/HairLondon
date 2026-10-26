import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { STYLISTS } from '@src/data/seed/stylists';
import { renderApp } from '@app/test/renderApp';

/**
 * The Book page, in two parts: say what you need and optionally when (part 1), then see who can
 * fit you in (part 2, `?step=who`). The test clock is Wednesday Oct 7, 2026, 8:00 AM.
 */
const results = () => screen.getByRole('region', { name: 'Stylists who can fit you in' });
const cards = () => within(results()).queryAllByRole('article');
/** Results sort soonest-first once a day or time is chosen, so find a stylist by name, not position. */
const londonCard = () => {
  const card = cards().find((candidate) =>
    within(candidate).queryByRole('link', { name: 'London' }),
  );
  if (!card) throw new Error('London is not in the results');
  return card;
};
const chip = (name: string) => screen.getByRole('button', { name });
const pressed = (name: string) => chip(name).getAttribute('aria-pressed') === 'true';

/** Day is optional: until she taps one, no day chip is highlighted. */
const noDayPicked = () =>
  within(screen.getByRole('group', { name: 'Day' })).queryAllByRole('button', { pressed: true })
    .length === 0;

async function ready() {
  await screen.findByRole('heading', { level: 1, name: 'Book' });
}

/** Part 1's one action: on to the stylists who can fit her in. */
async function seeWho(user: { click: (element: Element) => Promise<void> }) {
  await user.click(screen.getByRole('button', { name: 'See who can fit me in' }));
  await screen.findByRole('region', { name: 'Stylists who can fit you in' });
}

describe('Book: the page', () => {
  it('keeps her place on the page when she taps a filter', async () => {
    const { user } = renderApp('/book');
    await ready();
    vi.mocked(window.scrollTo).mockClear();
    await user.click(chip('Haircut'));
    await waitFor(() => expect(pressed('Haircut')).toBe(true));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('leads with what she needs, and marks day and time as optional', async () => {
    renderApp('/book');
    await ready();
    expect(
      screen.getByRole('heading', { level: 2, name: /What do you need\?/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Which day\? optional/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /What time\? optional/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('Pick as many as you like.')).toBeInTheDocument();
    // One decision at a time: the stylists wait for part 2.
    expect(screen.queryByRole('region', { name: 'Stylists who can fit you in' })).toBeNull();
    expect(screen.getByRole('button', { name: 'See who can fit me in' })).toBeInTheDocument();
  });

  it('shows how booking works as three icon steps, and where she is', async () => {
    const { user } = renderApp('/book');
    await ready();
    const guide = screen.getByRole('list', { name: 'How booking works' });
    const steps = within(guide).getAllByRole('listitem');
    expect(steps.map((step) => step.textContent)).toEqual([
      'Pick services',
      'Pick a day',
      'Tap a stylist’s time',
    ]);
    expect(steps[0]).toHaveAttribute('aria-current', 'step');
    await user.click(chip('Haircut'));
    expect(within(guide).getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step');
    await seeWho(user);
    expect(within(guide).getAllByRole('listitem')[2]).toHaveAttribute('aria-current', 'step');
  });

  it('opens part 2 with a summary of her picks and an Edit link back to part 1', async () => {
    const { user, router } = renderApp('/book?services=haircut&time=morning');
    await ready();
    await seeWho(user);
    expect(router.state.location.search).toBe('?services=haircut&time=morning&step=who');
    expect(screen.getByText('Haircut · Any day · Morning')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Tap a time to book/ }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Edit your search' }));
    await screen.findByRole('button', { name: 'See who can fit me in' });
    expect(router.state.location.search).toBe('?services=haircut&time=morning');
    expect(pressed('Haircut')).toBe(true);
    expect(pressed('Morning')).toBe(true);
  });

  it('goes back from part 2 to part 1 with the back button', async () => {
    const { user, router } = renderApp('/book?services=color');
    await ready();
    await seeWho(user);
    await router.navigate(-1);
    await screen.findByRole('button', { name: 'See who can fit me in' });
    expect(pressed('Color')).toBe(true);
  });

  it('shows every stylist and her next three open times when nothing is chosen', async () => {
    renderApp('/book?step=who');
    await ready();
    expect(cards()).toHaveLength(4);
    expect(screen.getByText('4 stylists')).toBeInTheDocument();
    for (const card of cards()) {
      expect(within(card).getAllByRole('link', { name: /^Book .*, .* at / })).toHaveLength(3);
      expect(within(card).getByText('Next open')).toBeInTheDocument();
    }
  });

  it('puts "See all work" on each card, and the starting price', async () => {
    renderApp('/book?step=who');
    await ready();
    const [london] = cards();
    if (!london) throw new Error('no cards');
    expect(
      within(london).getByRole('link', { name: /See all of London.s work/ }),
    ).toBeInTheDocument();
    expect(london).not.toHaveTextContent('from');
    expect(london).toHaveTextContent('$35+');
  });

  it('is in the navigation, marked as the current page', async () => {
    renderApp('/book');
    await ready();
    expect(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Book' }),
    ).toHaveAttribute('aria-current', 'page');
  });
});

describe('Book: services', () => {
  it('narrows to stylists who offer every service, and says how long it takes', async () => {
    const { user, router } = renderApp('/book');
    await ready();
    await user.click(chip('Highlights'));
    expect(pressed('Highlights')).toBe(true);
    expect(screen.getByText('Takes about 2 hr 30 min.')).toBeInTheDocument();
    expect(screen.getByText('3 stylists can fit you in')).toBeInTheDocument(); // Kai does not do highlights

    await user.click(chip('Haircut'));
    expect(screen.getByText('Together these take about 3 hr 30 min.')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?services=haircut,highlights');
    await seeWho(user);
    expect(cards()).toHaveLength(3);
  });

  it('prices the visit for each stylist and says how long it takes', async () => {
    renderApp('/book?services=haircut,color&step=who');
    await ready();
    const [london] = cards();
    if (!london) throw new Error('no cards');
    expect(london).toHaveTextContent('$185+');
    expect(london).toHaveTextContent('about 3 hr');
    expect(london).not.toHaveTextContent('from');
  });

  it('can be toggled off again, and is kept in the address', async () => {
    const { user, router } = renderApp('/book?services=color');
    await ready();
    expect(pressed('Color')).toBe(true);
    await user.click(chip('Color'));
    expect(pressed('Color')).toBe(false);
    expect(router.state.location.search).toBe('');
  });

  it('keeps only the stylists who offer every service together', async () => {
    renderApp(
      '/book?services=highlights,deep-conditioning,haircut,blowout,color,root-touch-up&step=who',
    );
    await ready();
    // Only London offers all six.
    expect(cards()).toHaveLength(1);
    expect(screen.getByText('1 stylist can fit you in')).toBeInTheDocument();
  });

  it('says so, and how to fix it, when nobody offers what she picked', async () => {
    const kai = STYLISTS.filter((stylist) => stylist.id === 'kai'); // Kai does not do highlights
    renderApp('/book?services=highlights,haircut&step=who', { stylists: kai });
    await ready();
    expect(screen.getByText('No stylists yet')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Nobody offers Highlights + Haircut together yet. Try removing one service.',
      ),
    ).toBeInTheDocument();
    expect(cards()).toHaveLength(0);
  });

  it('ignores services in the address that do not exist', async () => {
    renderApp('/book?services=haircut,nonsense');
    await ready();
    expect(pressed('Haircut')).toBe(true);
    expect(screen.getAllByRole('button', { pressed: true }).length).toBeGreaterThan(0);
  });
});

describe('Book: day and time', () => {
  it('starts with no day picked and Any time', async () => {
    renderApp('/book');
    await ready();
    expect(noDayPicked()).toBe(true);
    expect(pressed('Any time')).toBe(true);
    expect(screen.queryByRole('button', { name: /Clear filters/ })).not.toBeInTheDocument();
  });

  it('shows a strip of days someone works, soonest first, starting today', async () => {
    renderApp('/book');
    await ready();
    const days = within(screen.getByRole('group', { name: 'Day' })).getAllByRole('button');
    expect(days[0]).toHaveAccessibleName('Wed, Oct 7');
    expect(days).toHaveLength(14); // up to 14 days, none picked until she taps one
  });

  it('filters to one day, and taps again to clear it', async () => {
    const { user, router } = renderApp('/book');
    await ready();
    await user.click(chip('Fri, Oct 9'));
    expect(pressed('Fri, Oct 9')).toBe(true);
    expect(router.state.location.search).toBe('?day=2026-10-09');
    await seeWho(user);
    for (const card of cards()) {
      for (const link of within(card).getAllByRole('link', { name: /^Book / })) {
        expect(link).toHaveAccessibleName(/Fri, Oct 9 at /);
      }
    }
    await user.click(screen.getByRole('link', { name: 'Edit your search' }));
    await user.click(await screen.findByRole('button', { name: 'Fri, Oct 9' }));
    expect(noDayPicked()).toBe(true);
  });

  it('filters to a part of the day', async () => {
    const { user, router } = renderApp('/book');
    await ready();
    await user.click(chip('Evening'));
    expect(pressed('Evening')).toBe(true);
    expect(router.state.location.search).toBe('?time=evening');
    await seeWho(user);
    for (const link of within(results()).getAllByRole('link', { name: /^Book / })) {
      const time = /at (\d+):(\d+) PM/.exec(link.getAttribute('aria-label') ?? '');
      expect(Number(time?.[1] ?? 0) === 12 || Number(time?.[1]) >= 4).toBe(true);
      expect(Number(time?.[1])).toBeGreaterThanOrEqual(4);
    }
  });

  it('puts the soonest opening first once she picks a day or a time', async () => {
    renderApp('/book?time=morning&step=who');
    await ready();
    const firsts = cards().map((card) => within(card).getAllByRole('link', { name: /^Book / })[0]);
    expect(firsts.length).toBeGreaterThan(1);
    // Today, 9:30 AM or later (an hour of notice from 8:00) comes before any later day.
    expect(firsts[0]).toHaveTextContent(/^Today, /);
  });

  it('ignores a day that is not in the strip', async () => {
    renderApp('/book?day=2026-10-11'); // a Sunday: nobody works it
    await ready();
    expect(noDayPicked()).toBe(true);
    expect(screen.getByText('4 stylists')).toBeInTheDocument();
  });
});

describe('Book: nothing fits', () => {
  it('says so calmly and offers the soonest times they do have', async () => {
    renderApp('/book?services=color,highlights&time=evening&step=who'); // 4.5 hours cannot start after 4 PM
    await ready();
    expect(screen.getByText('No exact matches')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No openings in the evening');
    expect(screen.getByRole('status')).toHaveTextContent('Nobody has a long enough opening then.');
    expect(screen.getByText('Other times')).toBeInTheDocument();
    expect(cards().length).toBeGreaterThan(0);
    expect(within(results()).getAllByText('Other open times').length).toBe(cards().length);
  });

  it('offers no alternatives when nobody can do the services at all', async () => {
    const kai = STYLISTS.filter((stylist) => stylist.id === 'kai');
    renderApp('/book?services=highlights&time=morning&step=who', { stylists: kai });
    await ready();
    expect(screen.queryByText('Other times')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('Book: clearing', () => {
  it('counts the filters and clears them all at once', async () => {
    const { user, router } = renderApp('/book?services=color,haircut&day=2026-10-09&time=morning');
    await ready();
    const clear = screen.getByRole('button', { name: 'Clear filters (4)' });
    await user.click(clear);
    expect(router.state.location.search).toBe('');
    expect(screen.queryByRole('button', { name: /Clear filters/ })).not.toBeInTheDocument();
    expect(noDayPicked()).toBe(true);
    expect(pressed('Any time')).toBe(true);
    expect(pressed('Color')).toBe(false);
  });

  it('keeps focus on the control she used, so the keyboard is not thrown back to the top', async () => {
    const { user } = renderApp('/book');
    await ready();
    chip('Morning').focus();
    await user.keyboard('{Enter}');
    expect(chip('Morning')).toHaveFocus();
  });
});

describe('Book: starting a booking from a result', () => {
  it('holds the tapped time, with the services she searched for', async () => {
    const { user, router } = renderApp('/book?services=haircut&day=2026-10-08&step=who');
    await ready();
    const first = within(results()).getAllByRole('link', { name: /^Book / })[0];
    if (!first) throw new Error('no time to tap');
    const label = first.getAttribute('aria-label') ?? '';
    await user.click(first);
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });

    const params = new URLSearchParams(router.state.location.search);
    expect(router.state.location.pathname).toMatch(/^\/book\//);
    expect(params.get('services')).toBe('haircut');
    expect(params.get('date')).toBe('2026-10-08');
    expect(params.get('back')).toBe('/book?services=haircut&day=2026-10-08&step=who');
    expect(screen.getByRole('button', { name: 'Thu, Oct 8' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(label).toMatch(/Thu, Oct 8/);
    // Day, time, and a service: nothing is left to pick.
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('comes back to the same search from the X, and from the profile', async () => {
    const { user, router } = renderApp('/book?services=color&time=morning&step=who');
    await ready();
    const [first] = cards();
    if (!first) throw new Error('no cards');
    await user.click(within(first).getAllByRole('link', { name: /^Book / })[0] as HTMLElement);
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });

    await user.click(screen.getByRole('link', { name: 'Exit booking' }));
    await user.click(await screen.findByRole('button', { name: 'Leave' }));
    await ready();
    expect(router.state.location.search).toBe('?services=color&time=morning&step=who');
    expect(screen.getByText('Color · Any day · Morning')).toBeInTheDocument();

    // And the profile, from the card's name.
    const [again] = cards();
    if (!again) throw new Error('no cards');
    await user.click(within(again).getAllByRole('link')[0] as HTMLElement);
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/stylists\//));
    await user.click(await screen.findByRole('link', { name: 'Back to your search' }));
    await ready();
    expect(router.state.location.search).toBe('?services=color&time=morning&step=who');
  });

  it('opens a profile from "See all work", keeping the services and day', async () => {
    const { user, router } = renderApp('/book?services=haircut&day=2026-10-09&step=who');
    await ready();
    const london = londonCard();
    await user.click(within(london).getByRole('link', { name: /See all of London.s work/ }));
    await screen.findByRole('heading', { level: 1, name: 'London' });
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get('services')).toBe('haircut');
    expect(params.get('date')).toBe('2026-10-09');
    expect(screen.getByText('Haircut')).toBeInTheDocument();
  });
});

describe('Book: booked times disappear', () => {
  it('stops offering a time once it is booked, and offers it again when cancelled', async () => {
    const { services } = renderApp('/book?services=haircut&day=2026-10-08&step=who');
    await ready();
    const firstTime = () => within(londonCard()).getAllByRole('link', { name: /^Book / })[0];
    expect(firstTime()).toHaveAccessibleName(/Thu, Oct 8 at 9:00 AM/);

    const { id } = services.appointments.add({
      stylistId: 'london',
      serviceIds: ['haircut'],
      date: '2026-10-08' as never,
      start: 540 as never,
      durationMin: 60 as never,
      total: 65,
      name: 'Maren',
      phone: '(555) 123-4567',
    });
    await waitFor(() => expect(firstTime()).not.toHaveAccessibleName(/at 9:00 AM/));

    services.appointments.cancel(id);
    await waitFor(() => expect(firstTime()).toHaveAccessibleName(/at 9:00 AM/));
  });
});
