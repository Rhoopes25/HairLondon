import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryStorageAdapter } from '@src/data/storage/memory-storage-adapter';
import { renderApp } from '@app/test/renderApp';

describe('entry screen', () => {
  it('leads with what this is for, and two ways in', async () => {
    renderApp('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Local Locks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Local stylists you can trust.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book Now' })).toHaveAttribute('href', '/book');
    expect(screen.getByRole('link', { name: 'Explore Stylists' })).toHaveAttribute(
      'href',
      '/stylists',
    );
  });

  it('leads a first-time visitor to the stylists, with Book Now one tap away and nothing else', async () => {
    renderApp('/');
    await screen.findByRole('heading', { level: 1, name: 'Local Locks' });
    const main = screen.getByRole('main');
    // Order is the hierarchy: the filled action comes first.
    expect(
      within(main)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Explore Stylists', 'Book Now']);
  });

  it('treats a signed-in client who has never booked like a first visit', async () => {
    const { services } = renderApp('/');
    await screen.findByRole('heading', { level: 1, name: 'Local Locks' });
    services.accounts.create({ name: 'Rachel', phone: '(555) 123-4567', email: 'r@example.com' });
    const main = screen.getByRole('main');
    await waitFor(() =>
      expect(
        within(main)
          .getAllByRole('link')
          .map((link) => link.textContent),
      ).toEqual(['Explore Stylists', 'Book Now']),
    );
    expect(screen.queryByText('Nothing booked yet.', { exact: false })).not.toBeInTheDocument();
  });

  it('leads with Book Again once she has booked, and shows her next visit under the buttons', async () => {
    const { services } = renderApp('/');
    await screen.findByRole('heading', { level: 1, name: 'Local Locks' });
    services.accounts.create({ name: 'Rachel', phone: '(555) 123-4567', email: 'r@example.com' });
    services.appointments.add({
      stylistId: 'london',
      serviceIds: ['haircut'],
      date: '2026-10-09' as never,
      start: 600 as never,
      durationMin: 60 as never,
      total: 65,
      name: 'Rachel',
      phone: '(555) 123-4567',
    });
    const again = await screen.findByRole('link', { name: 'Book again: Haircut with London' });
    expect(again).toHaveTextContent('Book Again');
    expect(again).toHaveAttribute('href', '/book/london?services=haircut&back=%2F');
    expect(screen.getByRole('link', { name: 'Explore Stylists' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Book Now' })).not.toBeInTheDocument();
    const card = screen.getByRole('region', { name: 'Your next visit' });
    expect(card).toHaveTextContent('Haircut with London');
    expect(card).toHaveTextContent('Fri, Oct 9 at 10:00 AM');
  });

  it('points to her past visits when nothing is coming up', async () => {
    const { services } = renderApp('/');
    await screen.findByRole('heading', { level: 1, name: 'Local Locks' });
    services.accounts.create({ name: 'Rachel', phone: '(555) 123-4567', email: 'r@example.com' });
    services.appointments.add({
      stylistId: 'london',
      serviceIds: ['haircut', 'color'],
      date: '2026-09-15' as never,
      start: 600 as never,
      durationMin: 180 as never,
      total: 185,
      name: 'Rachel',
      phone: '(555) 123-4567',
    });
    expect(
      await screen.findByRole('link', { name: 'Book again: Haircut + Color with London' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See past visits' })).toHaveAttribute(
      'href',
      '/appointments',
    );
    expect(screen.queryByRole('region', { name: 'Your next visit' })).not.toBeInTheDocument();
  });

  it('starts either way in with one tap', async () => {
    const { user, router } = renderApp('/');
    await user.click(await screen.findByRole('link', { name: 'Explore Stylists' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Stylists' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/stylists');
  });

  it('puts every top-level place one tap away, with the current one marked', async () => {
    const { user } = renderApp('/');
    const nav = await screen.findByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    await user.click(within(nav).getByRole('link', { name: 'Stylists' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Stylists' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Stylists' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await user.click(within(nav).getByRole('link', { name: 'Book' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Book' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Book' })).toHaveAttribute('aria-current', 'page');
    for (const label of ['Appointments', 'Saved']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
    }
  });
});

describe('early-prototype notice', () => {
  it('opens on a first visit with the goal in plain English, and can be closed', async () => {
    const { user } = renderApp('/', { showNotice: true });
    const dialog = await screen.findByRole('dialog', { name: 'This is just a prototype' });
    expect(dialog).toHaveTextContent(
      'Find a stylist whose work you trust, then book a time that fits your day.',
    );
    expect(dialog).toHaveTextContent('Most stylists, and all of the reviews, are samples.');
    expect(dialog).toHaveTextContent('It isn’t supposed to look polished.');
    expect(dialog).toHaveTextContent('Nothing you book here is real.');
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('can be closed with Escape, and does not come back on the next visit', async () => {
    const storage = new MemoryStorageAdapter();
    const first = renderApp('/', { showNotice: true, storage });
    await screen.findByRole('dialog');
    await first.user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    first.unmount();

    renderApp('/', { showNotice: true, storage });
    await screen.findByRole('heading', { level: 1, name: 'Local Locks' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is labelled on every screen and can be reopened from the strip, the footer, and help', async () => {
    const { user } = renderApp('/stylists');
    await screen.findByRole('heading', { level: 1, name: 'Stylists' });
    expect(screen.getByText('Early prototype')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /What.s this\?/ }));
    expect(
      await screen.findByRole('dialog', { name: 'This is just a prototype' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Got it' }));

    await user.click(screen.getByRole('button', { name: 'About this prototype' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));

    await user.click(screen.getByRole('link', { name: 'How booking works' }));
    await screen.findByRole('heading', { level: 1, name: 'How booking works' });
    await user.click(screen.getByRole('button', { name: 'Read the early-prototype note again' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('is on the booking screens too, which have no main navigation', async () => {
    renderApp('/book/london');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    expect(screen.getByText('Early prototype')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
  });
});

describe('stylists list', () => {
  it('lists every stylist with a plain rating and a starting price', async () => {
    renderApp('/stylists');
    const list = await screen.findByRole('region', { name: 'Stylists' });
    const cards = await within(list).findAllByRole('article');
    expect(cards).toHaveLength(4);
    const london = cards[0];
    if (!london) throw new Error('no cards');
    expect(within(london).getByRole('link', { name: 'London' })).toHaveAttribute(
      'href',
      expect.stringContaining('/stylists/london'),
    );
    expect(london).toHaveTextContent('Hair by London, Provo');
    expect(london).toHaveTextContent('4.7 · 3 reviews');
    expect(london).not.toHaveTextContent('from');
    expect(london).toHaveTextContent('$35+');
  });

  it('shows her work with a "See all work" tile, and no open times (this page is for browsing)', async () => {
    renderApp('/stylists');
    const list = await screen.findByRole('region', { name: 'Stylists' });
    const [london] = await within(list).findAllByRole('article');
    if (!london) throw new Error('no cards');
    expect(london.querySelectorAll('img[loading="lazy"]')).toHaveLength(3);
    expect(within(london).queryByText('Next open')).toBeNull();
    expect(within(london).queryAllByRole('link', { name: /^Book London, / })).toHaveLength(0);
  });

  it('opens a profile from "See all work", and comes back to the list', async () => {
    const { user } = renderApp('/stylists');
    const list = await screen.findByRole('region', { name: 'Stylists' });
    await user.click(await within(list).findByRole('link', { name: /See all of London.s work/ }));
    await screen.findByRole('heading', { level: 1, name: 'London' });
    await user.click(screen.getByRole('link', { name: 'Back to stylists' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Stylists' })).toBeInTheDocument();
  });
});

/** Pretends the device answered "where am I?" with this point, or refused. */
function stubGeolocation(answer: { lat: number; lng: number } | 'denied') {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: (ok: PositionCallback, fail: PositionErrorCallback) => {
        if (answer === 'denied') {
          fail({ code: 1, message: 'User denied Geolocation' } as GeolocationPositionError);
        } else {
          ok({ coords: { latitude: answer.lat, longitude: answer.lng } } as GeolocationPosition);
        }
      },
    },
  });
}

describe('stylists: search', () => {
  it('filters as she types, by name, city, or specialty, and keeps the search in the address', async () => {
    const { user, router } = renderApp('/stylists');
    const field = await screen.findByRole('searchbox', { name: 'Search stylists' });
    await user.type(field, 'orem');
    const list = screen.getByRole('region', { name: 'Stylists' });
    expect(within(list).getAllByRole('article')).toHaveLength(1);
    expect(within(list).getByRole('link', { name: 'Sadie Morgan' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?q=orem');
  });

  it('still finds her when the spelling is off, and says what it searched for', async () => {
    renderApp('/stylists?q=londn');
    const list = await screen.findByRole('region', { name: 'Stylists' });
    const [first] = within(list).getAllByRole('article');
    expect(within(first as HTMLElement).getByRole('link', { name: 'London' })).toBeInTheDocument();
    expect(screen.getByText('Showing results for “london”')).toBeInTheDocument();
  });

  it('says so, with ideas, when nothing matches', async () => {
    renderApp('/stylists?q=qwertyuiop');
    expect(
      await screen.findByText(/No stylists match “qwertyuiop”\. Try a name, a city like Provo/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Stylists' })).toBeNull();
  });
});

describe('stylists: use my location', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'geolocation');
    vi.restoreAllMocks();
  });

  it('sorts nearest first and shows how far each one is', async () => {
    stubGeolocation({ lat: 40.39, lng: -111.85 }); // Lehi
    const { user, services } = renderApp('/stylists');
    await user.click(await screen.findByRole('button', { name: 'Use my location' }));
    expect(
      await screen.findByText('Showing how far each stylist is from you.'),
    ).toBeInTheDocument();
    const [nearest] = within(screen.getByRole('region', { name: 'Stylists' })).getAllByRole(
      'article',
    );
    expect(within(nearest as HTMLElement).getByRole('link', { name: 'Kai Nakamura' })).toBeTruthy();
    expect(nearest).toHaveTextContent(/mi away/);
    expect(services.location.getSnapshot()).toMatchObject({ source: 'device' });
  });

  it('stands in a sample spot, and says so, when she is far from every stylist', async () => {
    stubGeolocation({ lat: 51.5, lng: -0.12 }); // London, England
    const { user } = renderApp('/stylists');
    await user.click(await screen.findByRole('button', { name: 'Use my location' }));
    expect(await screen.findByText(/measuring from downtown Provo/)).toBeInTheDocument();
  });

  it('stays calm when the device will not say, and offers the sample spot', async () => {
    stubGeolocation('denied');
    const { user, services } = renderApp('/stylists');
    await user.click(await screen.findByRole('button', { name: 'Use my location' }));
    expect(await screen.findByText(/We couldn’t get your location/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Use a sample spot in Provo' }));
    expect(services.location.getSnapshot()).toMatchObject({ source: 'sample' });
    await user.click(screen.getByRole('button', { name: 'Stop using location' }));
    expect(services.location.getSnapshot()).toBeNull();
    expect(screen.getByRole('button', { name: 'Use my location' })).toBeInTheDocument();
  });
});

describe('not found and help', () => {
  it('offers ways back for an unknown address', async () => {
    renderApp('/nowhere');
    expect(
      await screen.findByRole('heading', { name: 'We couldn’t find that page' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find a stylist' })).toHaveAttribute('href', '/book');
    expect(screen.getByRole('link', { name: 'Back to home' })).toBeInTheDocument();
  });

  it('explains booking in three steps with expandable answers', async () => {
    const { user } = renderApp('/help');
    await screen.findByRole('heading', { level: 1, name: 'How booking works' });
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
    const question = screen.getByText('Do I pay here?');
    await user.click(question);
    expect(screen.getByText(/Payment isn.t part of this prototype/)).toBeVisible();
  });

  it('shows the design library on a page that is not linked from the app', async () => {
    renderApp('/design-library');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Design library' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Button' })).toBeInTheDocument();
  });
});
