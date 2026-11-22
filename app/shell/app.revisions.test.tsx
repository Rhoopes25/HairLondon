import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@app/test/renderApp';

/**
 * Round 2 of the user-test revisions, end to end: trust (reviews, photos), speed (quick look,
 * Book Now, distance and sorting), calm (the Book page's text and running total), and a site for
 * everyone (men's and kids' services, barbers).
 */

const cardList = () => screen.getByRole('region', { name: 'Stylists' });
const cards = () => within(cardList()).getAllByRole('article');
const cardNames = () =>
  cards().map((card) => within(card).getAllByRole('link')[0]?.textContent ?? '');
const card = (name: string) => {
  const found = cards().find((c) => within(c).queryByRole('link', { name }));
  if (!found) throw new Error(`no card for ${name}`);
  return found;
};

async function openStylists(route = '/stylists') {
  const utils = renderApp(route);
  await screen.findByRole('heading', { level: 1, name: 'Stylists' });
  return utils;
}

const filterChip = (group: string, name: string) =>
  within(screen.getByRole('group', { name: group })).getByRole('button', { name });

async function openSortAndFilter(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: /^Sort and filter/ }));
}

describe('trust: reviews on every card', () => {
  it('shows a star rating and review count on each stylist card, and a Read reviews link', async () => {
    await openStylists();
    expect(cards()).toHaveLength(6);
    for (const c of cards()) {
      expect(c).toHaveTextContent(/\d\.\d · \d+ reviews/);
      expect(within(c).getByRole('link', { name: /^Read reviews for / })).toBeInTheDocument();
    }
  });

  it('opens that stylist’s reviews, with plenty of them to read', async () => {
    const { user, router } = await openStylists();
    await user.click(within(card('London')).getByRole('link', { name: 'Read reviews for London' }));
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(router.state.location.pathname).toBe('/stylists/london/reviews');
    const panel = screen.getByRole('tabpanel', { name: 'Reviews' });
    expect(within(panel).getByText('Showing 8 of 56 reviews')).toBeInTheDocument();
    expect(within(panel).getAllByRole('listitem')).toHaveLength(8);
    // Each review says when it was written, newest first.
    expect(within(panel).getAllByRole('listitem')[0]).toHaveTextContent('Oct 2026');
  });

  it('lets her keep reading, ten at a time, until they are all showing', async () => {
    const { user } = renderApp('/stylists/london/reviews');
    const panel = await screen.findByRole('tabpanel', { name: 'Reviews' });
    await user.click(within(panel).getByRole('button', { name: 'Show 10 more reviews' }));
    expect(within(panel).getAllByRole('listitem')).toHaveLength(18);
    for (let i = 0; i < 4; i++) {
      await user.click(within(panel).getByRole('button', { name: /^Show \d+ more reviews$/ }));
    }
    expect(within(panel).getAllByRole('listitem')).toHaveLength(56);
    expect(within(panel).queryByRole('button', { name: /more reviews/ })).toBeNull();
  });

  it('has at least fifty reviews for every stylist, so nobody’s profile feels thin', async () => {
    for (const id of ['london', 'sadie', 'kai', 'brooke', 'marcus', 'diego']) {
      const { unmount } = renderApp(`/stylists/${id}/reviews`);
      const panel = await screen.findByRole('tabpanel', { name: 'Reviews' });
      const [, total] = /of (\d+) reviews/.exec(panel.textContent ?? '') ?? [];
      expect(Number(total)).toBeGreaterThanOrEqual(50);
      unmount();
    }
  });
});

describe('trust: bigger galleries with captions', () => {
  it('shows at least six photos for every stylist, each with a caption', async () => {
    for (const id of ['london', 'sadie', 'kai', 'brooke', 'marcus', 'diego']) {
      const { unmount } = renderApp(`/stylists/${id}`);
      const panel = await screen.findByRole('tabpanel', { name: 'Portfolio' });
      const figures = within(panel).getAllByRole('figure');
      expect(figures.length).toBeGreaterThanOrEqual(6);
      for (const figure of figures) {
        expect(within(figure).getByRole('img')).toBeInTheDocument();
        expect(figure.querySelector('figcaption')?.textContent?.length).toBeGreaterThan(8);
      }
      unmount();
    }
  });

  it('names the hair type and the service in each caption', async () => {
    renderApp('/stylists/brooke');
    const panel = await screen.findByRole('tabpanel', { name: 'Portfolio' });
    expect(within(panel).getByText('Icy platinum balayage, long wavy hair')).toBeInTheDocument();
  });
});

describe('speed: a quick look from the list', () => {
  it('opens in place with what the card does not already show: years of experience and specialty', async () => {
    const { user, router } = await openStylists();
    const london = card('London');
    await user.click(within(london).getByRole('button', { name: 'Quick look at London' }));
    const preview = within(london).getByText('8 years doing hair').closest('dl');
    expect(preview).not.toBeNull();
    expect(within(london).getByText('8 years doing hair')).toBeVisible();
    expect(within(london).getByText('Lived-in blonde')).toBeVisible();
    // It does not repeat the rating or the photos, which are already on the card.
    expect(within(london).getAllByText(/4\.7 · 56 reviews/)).toHaveLength(1);
    expect(london.querySelectorAll('img[loading="lazy"]')).toHaveLength(3); // her three thumbnails
    // She never left the list.
    expect(router.state.location.pathname).toBe('/stylists');
  });

  it('can have two open at once, so they can be compared', async () => {
    const { user } = await openStylists();
    await user.click(within(card('London')).getByRole('button', { name: 'Quick look at London' }));
    await user.click(
      within(card('Marcus Bell')).getByRole('button', { name: 'Quick look at Marcus Bell' }),
    );
    expect(within(card('London')).getByText('8 years doing hair')).toBeVisible();
    expect(within(card('Marcus Bell')).getByText('9 years doing hair')).toBeVisible();
    expect(within(card('Marcus Bell')).getByText('Skin fades')).toBeVisible();
  });

  it('has a way on to the full profile', async () => {
    const { user, router } = await openStylists();
    await user.click(within(card('Kai Nakamura')).getByRole('button', { name: /Quick look/ }));
    await user.click(within(card('Kai Nakamura')).getByRole('link', { name: 'View full profile' }));
    await screen.findByRole('heading', { level: 1, name: 'Kai Nakamura' });
    expect(router.state.location.pathname).toBe('/stylists/kai');
  });
});

describe('speed: Book Now at the top of every main page', () => {
  it.each([
    ['/stylists', 'Stylists', 'Book Now', '/book'],
    ['/saved', 'Saved stylists', 'Book Now', '/book'],
    ['/appointments', 'My appointments', 'Book Now', '/book'],
  ])('%s opens with a large Book Now', async (route, heading, label, href) => {
    renderApp(route);
    await screen.findByRole('heading', { level: 1, name: heading });
    const link = within(screen.getByRole('main')).getByRole('link', { name: label });
    expect(link).toHaveAttribute('href', href);
    expect(link.className).toMatch(/lg/);
    // It is the first thing in the page, above the title.
    const main = screen.getByRole('main');
    const first = main.querySelector('a, h1');
    expect(first).toBe(link);
  });

  it('on a stylist’s page, books with that stylist', async () => {
    renderApp('/stylists/sadie');
    await screen.findByRole('heading', { level: 1, name: 'Sadie Morgan' });
    const link = within(screen.getByRole('main')).getByRole('link', {
      name: 'Book Now with Sadie',
    });
    expect(new URL(link.getAttribute('href') ?? '', 'http://x').pathname).toBe('/book/sadie');
  });

  it('is already the filled, large action on Home', async () => {
    renderApp('/');
    const link = await screen.findByRole('link', { name: 'Book Now' });
    expect(link.className).toMatch(/primary/);
    expect(link.className).toMatch(/lg/);
  });
});

describe('speed: distance, sorting, and filters', () => {
  it('shows how far away every stylist is, even before she shares where she is', async () => {
    await openStylists();
    for (const c of cards()) expect(c).toHaveTextContent(/\d+(\.\d)? mi away/);
    expect(screen.getByText(/Distances are measured from downtown Provo/)).toBeInTheDocument();
  });

  it('puts the nearest first by default, and says so in the sort choices', async () => {
    const { user } = await openStylists();
    expect(cardNames()[0]).toBe('London');
    expect(cardNames().at(-1)).toBe('Kai Nakamura');
    await openSortAndFilter(user);
    expect(filterChip('Sort by', 'Nearest')).toHaveAttribute('aria-pressed', 'true');
  });

  it('sorts by lowest starting price, and keeps the sort in the address', async () => {
    const { user, router } = await openStylists();
    await openSortAndFilter(user);
    await user.click(filterChip('Sort by', 'Lowest price'));
    expect(cardNames()[0]).toBe('Diego Ramirez');
    expect(cardNames().at(-1)).toBe('Brooke Ellis');
    expect(router.state.location.search).toBe('?sort=price');
    expect(filterChip('Sort by', 'Lowest price')).toHaveAttribute('aria-pressed', 'true');
  });

  it('filters by starting price', async () => {
    const { user, router } = await openStylists();
    await openSortAndFilter(user);
    await user.click(filterChip('Starting price', 'Up to $25'));
    expect(cardNames().sort()).toEqual(['Diego Ramirez', 'Kai Nakamura', 'Marcus Bell']);
    expect(router.state.location.search).toBe('?price=25');
    expect(screen.getByText('3 stylists found')).toBeInTheDocument();
  });

  it('filters by distance from where she is', async () => {
    const { user } = await openStylists();
    await openSortAndFilter(user);
    await user.click(filterChip('Distance', 'Within 5 mi'));
    expect(cardNames().sort()).toEqual(['London', 'Marcus Bell', 'Sadie Morgan']);
  });

  it('filters by specialty', async () => {
    const { user } = await openStylists();
    await openSortAndFilter(user);
    await user.click(filterChip('Specialty', 'Men’s cuts & beards'));
    expect(cardNames().sort()).toEqual(['Diego Ramirez', 'Kai Nakamura', 'Marcus Bell']);
    await user.click(filterChip('Specialty', 'Men’s cuts & beards')); // tapping it again turns it off
    expect(cards()).toHaveLength(6);
  });

  it('combines filters, counts them on the button, and clears them in one tap', async () => {
    const { user, router } = await openStylists();
    await openSortAndFilter(user);
    await user.click(filterChip('Specialty', 'Men’s cuts & beards'));
    await user.click(filterChip('Distance', 'Within 10 mi'));
    expect(cardNames()).toEqual(['Marcus Bell']);
    expect(screen.getByRole('button', { name: 'Sort and filter (2)' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters (2)' }));
    expect(cards()).toHaveLength(6);
    expect(router.state.location.search).toBe('');
  });

  it('says so calmly when nothing matches, and offers to clear', async () => {
    const { user } = await openStylists('/stylists?area=cuts&price=25&within=5');
    expect(
      await screen.findByText('No stylists match these filters. Try a wider distance or price.'),
    ).toBeInTheDocument();
    // Clear is in the folded-open panel and under the message; either one does it.
    await user.click(
      screen.getAllByRole('button', { name: 'Clear filters (3)' })[0] as HTMLElement,
    );
    expect(cards()).toHaveLength(6);
  });

  it('opens already narrowed when the address says so, and ignores values it does not know', async () => {
    await openStylists('/stylists?area=blonde&sort=price&within=forever');
    expect(cardNames().sort()).toEqual(['Brooke Ellis', 'London']);
    expect(screen.getByRole('button', { name: 'Sort and filter (1)' })).toBeInTheDocument();
  });

  it('keeps her search when she sorts and filters', async () => {
    const { user, router } = await openStylists('/stylists?q=color');
    await openSortAndFilter(user);
    await user.click(filterChip('Sort by', 'Lowest price'));
    expect(router.state.location.search).toBe('?q=color&sort=price');
  });
});

describe('calm: the Book page', () => {
  const pressed = (name: string) =>
    within(screen.getByRole('group', { name: 'Services' }))
      .getByRole('button', { name })
      .getAttribute('aria-pressed') === 'true';

  it('has the larger helper text and headings', async () => {
    renderApp('/book');
    await screen.findByRole('heading', { level: 1, name: 'Book' });
    expect(screen.getByText('Pick as many as you like.')).toBeInTheDocument();
    for (const name of ['What do you need?', 'Which day? optional', 'What time? optional']) {
      const heading = screen.getByRole('heading', { level: 2, name });
      expect(heading.closest('section')?.className).toMatch(/large/);
    }
  });

  it('offers men’s haircut, beard trim, and kids’ cut next to the others', async () => {
    const { user } = renderApp('/book');
    await screen.findByRole('heading', { level: 1, name: 'Book' });
    const group = within(screen.getByRole('group', { name: 'Services' }));
    expect(group.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Haircut',
      'Color',
      'Highlights',
      'Root Touch-Up',
      'Blowout',
      'Deep Conditioning',
      'Men’s Haircut',
      'Beard Trim',
      'Kids’ Cut',
    ]);
    await user.click(group.getByRole('button', { name: 'Beard Trim' }));
    expect(pressed('Beard Trim')).toBe(true);
    // Beard trims are done by Kai, Marcus, and Diego.
    expect(screen.getByText('3 stylists can fit you in')).toBeInTheDocument();
  });

  it('shows nothing to total until a service is picked', async () => {
    renderApp('/book');
    await screen.findByRole('heading', { level: 1, name: 'Book' });
    expect(screen.queryByText('Estimated total')).toBeNull();
  });

  it('keeps a running price and time as services are added', async () => {
    const { user } = renderApp('/book');
    await screen.findByRole('heading', { level: 1, name: 'Book' });
    const group = within(screen.getByRole('group', { name: 'Services' }));

    await user.click(group.getByRole('button', { name: 'Haircut' }));
    expect(screen.getByText('Estimated total')).toBeInTheDocument();
    // Four stylists do a haircut, from $45 to $65.
    expect(screen.getByText('$45–65+')).toBeInTheDocument();
    expect(screen.getByText('about 1 hr')).toBeInTheDocument();

    await user.click(group.getByRole('button', { name: 'Color' }));
    // Haircut + color: London $185, Sadie $165, Kai $140, Brooke $190.
    expect(screen.getByText('$140–190+')).toBeInTheDocument();
    expect(screen.getByText('about 3 hr')).toBeInTheDocument();

    await user.click(group.getByRole('button', { name: 'Haircut' }));
    expect(screen.getByText('about 2 hr')).toBeInTheDocument();
  });

  it('gives one price when only one stylist does the combination', async () => {
    const { user } = renderApp('/book');
    await screen.findByRole('heading', { level: 1, name: 'Book' });
    const group = within(screen.getByRole('group', { name: 'Services' }));
    await user.click(group.getByRole('button', { name: 'Highlights' }));
    await user.click(group.getByRole('button', { name: 'Men’s Haircut' }));
    // Only London does both: $150 + $50.
    expect(screen.getByText('$200+')).toBeInTheDocument();
    expect(screen.getByText(/Starting price\. Longer or thicker hair/)).toBeInTheDocument();
  });

  it('says so when nobody does everything picked together, instead of a price', async () => {
    const { user } = renderApp('/book?services=highlights,beard-trim');
    await screen.findByRole('heading', { level: 1, name: 'Book' });
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(
      screen.getByText('Nobody does all of these together yet. Try removing one.'),
    ).toBeInTheDocument();
    void user;
  });

  it('is a status the screen reader hears change, not a pop-up', async () => {
    renderApp('/book?services=haircut');
    await screen.findByRole('heading', { level: 1, name: 'Book' });
    const total = screen.getByText('Estimated total').closest('[role="status"]');
    expect(total).not.toBeNull();
    expect(total).toHaveTextContent('about 1 hr');
  });

  it('gives a gentle notice when the visit is longer than four hours', async () => {
    const { user } = renderApp('/book');
    await screen.findByRole('heading', { level: 1, name: 'Book' });
    expect(screen.queryByText('That’s a long visit')).toBeNull();
    const group = within(screen.getByRole('group', { name: 'Services' }));

    await user.click(group.getByRole('button', { name: 'Color' })); // 2 hr
    await user.click(group.getByRole('button', { name: 'Highlights' })); // + 2 hr 30 min = 4 hr 30 min
    const notice = screen.getByText('That’s a long visit').closest('[role="status"]');
    expect(notice).toHaveTextContent('about 4 hr 30 min');

    await user.click(group.getByRole('button', { name: 'Highlights' }));
    expect(screen.queryByText('That’s a long visit')).toBeNull();
  });

  it('does not call exactly four hours long', async () => {
    renderApp('/book?services=color,root-touch-up,deep-conditioning'); // 120 + 90 + 30 = 240
    await screen.findByRole('heading', { level: 1, name: 'Book' });
    expect(screen.getByText('about 4 hr')).toBeInTheDocument();
    expect(screen.queryByText('That’s a long visit')).toBeNull();
  });

  it('shows distance and a Read reviews link on each result card', async () => {
    renderApp('/book?step=who');
    await screen.findByRole('heading', { level: 2, name: 'Tap a time to book' });
    const list = screen.getByRole('region', { name: 'Stylists who can fit you in' });
    const results = within(list).getAllByRole('article');
    expect(results).toHaveLength(6);
    for (const result of results) {
      expect(result).toHaveTextContent(/\d+(\.\d)? mi away/);
      expect(within(result).getByRole('link', { name: /^Read reviews for / })).toBeInTheDocument();
    }
  });
});

describe('calm: the total is clear before the final confirm step', () => {
  /** Chooses a day and the first open time, as a guest, and ends on the review step. */
  async function toReview(route: string) {
    const { user } = renderApp(route);
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    const day = within(screen.getByRole('group', { name: 'Day' })).getAllByRole('button')[5];
    await user.click(day as HTMLElement); // Wed, Oct 14
    const open = within(screen.getByRole('group', { name: 'Time' }))
      .getAllByRole('button')
      .find((button) => !(button as HTMLButtonElement).disabled);
    await user.click(open as HTMLElement);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Your details' });
    await user.click(screen.getByRole('button', { name: 'Continue as guest' }));
    await user.type(screen.getByLabelText('Name'), 'Maren');
    await user.type(screen.getByLabelText('Phone'), '5551234567');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Check and confirm' });
    return user;
  }

  it('shows the estimated total, price and time, right above Confirm booking', async () => {
    await toReview('/book/london?services=haircut,blowout');
    expect(screen.getByText('Estimated total')).toBeInTheDocument();
    expect(screen.getByText('$110+ · about 1 hr 45 min')).toBeInTheDocument();
    expect(
      screen.getByText(/Starting price\. Longer or thicker hair can cost more/),
    ).toBeInTheDocument();
    // Said once, not twice: the recap leaves its own total row out here.
    expect(screen.getAllByText('Estimated total')).toHaveLength(1);
    expect(screen.queryByText('That’s a long visit')).toBeNull();
  });

  it('repeats the long-visit notice before she confirms', async () => {
    await toReview('/book/london?services=color,highlights');
    expect(screen.getByText('That’s a long visit')).toBeInTheDocument();
    expect(screen.getByText('$270+ · about 4 hr 30 min')).toBeInTheDocument();
  });

  it('also shows the running total, and the notice, while choosing', async () => {
    renderApp('/book/london?services=color,highlights');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    expect(screen.getByText('$270+')).toBeInTheDocument();
    expect(screen.getByText('about 4 hr 30 min')).toBeInTheDocument();
    expect(screen.getByText('That’s a long visit')).toBeInTheDocument();
  });
});

describe('a site for everyone', () => {
  it('has at least two barbers in the list, who do the men’s and kids’ services', async () => {
    await openStylists();
    const names = cardNames();
    expect(names).toContain('Marcus Bell');
    expect(names).toContain('Diego Ramirez');
  });

  it('shows a barber’s men’s, beard, and kids’ services with starting prices', async () => {
    renderApp('/stylists/marcus/services');
    const panel = await screen.findByRole('tabpanel', { name: 'Services' });
    expect(within(panel).getByText('Men’s Haircut')).toBeInTheDocument();
    expect(within(panel).getByText('Beard Trim')).toBeInTheDocument();
    expect(within(panel).getByText('Kids’ Cut')).toBeInTheDocument();
    expect(within(panel).queryByText('Color')).toBeNull();
    expect(panel).toHaveTextContent('$35+');
  });

  it('puts men’s cut photos in other stylists’ galleries too', async () => {
    renderApp('/stylists/kai');
    const panel = await screen.findByRole('tabpanel', { name: 'Portfolio' });
    expect(within(panel).getByText('Men’s textured crop, short wavy hair')).toBeInTheDocument();
    expect(
      within(panel).getByText('Beard trim and neckline, short full beard'),
    ).toBeInTheDocument();
  });

  it('says on Home that it is for everyone', async () => {
    renderApp('/');
    expect(await screen.findByText(/for everyone: women, men, and kids/)).toBeInTheDocument();
    expect(screen.getByText('Local stylists and barbers you can trust.')).toBeInTheDocument();
  });

  it('books a men’s haircut with a barber', async () => {
    const { user } = renderApp('/book/marcus?services=mens-haircut');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    expect(screen.getByText('$35+')).toBeInTheDocument();
    expect(screen.getByText('about 30 min')).toBeInTheDocument();
    const day = within(screen.getByRole('group', { name: 'Day' })).getAllByRole('button')[0];
    await user.click(day as HTMLElement);
    expect(screen.getByRole('group', { name: 'Time' })).toBeInTheDocument();
  });
});
