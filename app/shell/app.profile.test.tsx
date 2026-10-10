import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { STYLISTS } from '@src/data/seed/stylists';
import { renderApp } from '@app/test/renderApp';

const tab = (name: string) => screen.getByRole('tab', { name });

/** Sadie as she is in the sample data, but with no photos yet. */
const sadieWithoutPhotos = () => {
  const sadie = STYLISTS.find((stylist) => stylist.id === 'sadie');
  if (!sadie) throw new Error('seed stylist missing');
  return STYLISTS.map((stylist) => (stylist === sadie ? { ...sadie, portfolio: [] } : stylist));
};

const bookLink = (name: string) => screen.getByRole('link', { name });
const hrefOf = (name: string) => new URL(bookLink(name).getAttribute('href') ?? '', 'http://x');

describe('stylist profile', () => {
  it('leads with the work: Portfolio is open and the photos are real', async () => {
    renderApp('/stylists/london');
    expect(await screen.findByRole('heading', { level: 1, name: 'London' })).toBeInTheDocument();
    expect(tab('Portfolio')).toHaveAttribute('aria-selected', 'true');
    const panel = screen.getByRole('tabpanel', { name: 'Portfolio' });
    expect(within(panel).getAllByRole('img')).toHaveLength(6);
    expect(screen.getByText('4.7 · 3 reviews')).toBeInTheDocument();
  });

  it('shows the photos the teammates added for Sadie, Kai and Brooke too', async () => {
    for (const [id, name] of [
      ['sadie', 'Sadie Morgan'],
      ['kai', 'Kai Nakamura'],
      ['brooke', 'Brooke Ellis'],
    ] as const) {
      const { unmount } = renderApp(`/stylists/${id}`);
      await screen.findByRole('heading', { level: 1, name });
      const panel = screen.getByRole('tabpanel', { name: 'Portfolio' });
      expect(within(panel).getAllByRole('img')).toHaveLength(2);
      unmount();
    }
  });

  it('opens on Reviews when she has no photos yet, and says so on the Portfolio tab', async () => {
    const { user } = renderApp('/stylists/sadie', { stylists: sadieWithoutPhotos() });
    await screen.findByRole('heading', { level: 1, name: 'Sadie Morgan' });
    expect(tab('Reviews')).toHaveAttribute('aria-selected', 'true');
    await user.click(tab('Portfolio'));
    expect(
      screen.getByText('Sadie hasn’t added photos yet. Check the reviews to see what clients say.'),
    ).toBeInTheDocument();
  });

  it('keeps the tab in the URL so it can be shared and survives refresh', async () => {
    const { user, router } = renderApp('/stylists/london');
    await screen.findByRole('heading', { level: 1, name: 'London' });
    await user.click(tab('Reviews'));
    expect(router.state.location.pathname).toBe('/stylists/london/reviews');
    expect(
      screen.getByText(
        'Finally found someone I trust with my hair. Booked during nap time and it took two minutes.',
      ),
    ).toBeInTheDocument();
  });

  it('lists services with duration and starting price, each linking to booking with it chosen', async () => {
    renderApp('/stylists/london/services');
    const row = await screen.findByRole('link', { name: /^Color/ });
    expect(row).toHaveTextContent('2 hr · $120+');
    const href = new URL(row.getAttribute('href') ?? '', 'http://x');
    expect(href.pathname).toBe('/book/london');
    expect(href.searchParams.get('services')).toBe('color');
    expect(screen.getByText(/Prices are starting points/)).toBeInTheDocument();
  });

  it('adds a tapped service to the ones she already picked', async () => {
    renderApp('/stylists/london/services?services=haircut');
    const row = await screen.findByRole('link', { name: /^Color/ });
    const href = new URL(row.getAttribute('href') ?? '', 'http://x');
    expect(href.searchParams.get('services')).toBe('haircut,color');
  });

  it('redirects an unknown tab to the profile, and an unknown stylist to the list', async () => {
    const first = renderApp('/stylists/london/nonsense');
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(first.router.state.location.pathname).toBe('/stylists/london');
    first.unmount();

    const second = renderApp('/stylists/nobody');
    await screen.findByRole('heading', { level: 1, name: 'Stylists' });
    expect(second.router.state.location.pathname).toBe('/stylists');
  });
});

describe('the Book bar', () => {
  it('is the one Book action, always in reach, and says what happens next', async () => {
    renderApp('/stylists/london');
    await screen.findByRole('heading', { level: 1, name: 'London' });
    // The page itself has one Book action; the "Book" in the header is the navigation.
    expect(within(screen.getByRole('main')).getAllByRole('link', { name: /^Book/ })).toHaveLength(1);
    expect(screen.getByText('Services from $35+')).toBeInTheDocument();
    expect(screen.getByText('Pick services, a day, and a time next')).toBeInTheDocument();
    const href = hrefOf('Book with London');
    expect(href.pathname).toBe('/book/london');
    // The X in booking returns to this profile.
    expect(href.searchParams.get('back')).toBe('/stylists/london');
  });

  it('shows the services she searched for, their starting price, and how long they take', async () => {
    renderApp('/stylists/london?services=haircut,color');
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(screen.getByText('Haircut + Color')).toBeInTheDocument();
    expect(screen.getByText('$185+ · about 3 hr')).toBeInTheDocument();
    expect(hrefOf('Book with London').searchParams.get('services')).toBe('haircut,color');
  });

  it('holds a time she tapped, if it is still open', async () => {
    renderApp('/stylists/london?services=haircut&date=2026-10-08&start=540');
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(screen.getByText('Thu, Oct 8 at 9:00 AM')).toBeInTheDocument();
    const params = hrefOf('Book with London').searchParams;
    expect(params.get('date')).toBe('2026-10-08');
    expect(params.get('start')).toBe('540');
  });

  it('does not hold a time that is already taken, but keeps the day', async () => {
    renderApp('/stylists/london?services=haircut&date=2026-10-08&start=630');
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(screen.queryByText(/Thu, Oct 8 at/)).not.toBeInTheDocument();
    const params = hrefOf('Book with London').searchParams;
    expect(params.get('date')).toBe('2026-10-08');
    expect(params.get('start')).toBeNull();
  });
});

describe('the way back', () => {
  it('goes back to the stylists list by default', async () => {
    renderApp('/stylists/london');
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(bookLink('Back to stylists')).toHaveAttribute('href', '/stylists');
  });

  it('goes back to the exact search she came from', async () => {
    const back = encodeURIComponent('/book?services=color&time=evening');
    renderApp(`/stylists/london?back=${back}`);
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(bookLink('Back to your search')).toHaveAttribute(
      'href',
      '/book?services=color&time=evening',
    );
  });

  it('says where it goes back to: saved stylists, for one', async () => {
    renderApp(`/stylists/london?back=${encodeURIComponent('/saved')}`);
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(bookLink('Back to saved stylists')).toHaveAttribute('href', '/saved');
  });

  it('will not go back to an address outside the app', async () => {
    renderApp(`/stylists/london?back=${encodeURIComponent('https://example.com')}`);
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(bookLink('Back to stylists')).toHaveAttribute('href', '/stylists');
  });
});

describe('service detail sheet', () => {
  it('shows what the service is, how long it takes, and what it costs, with a way to book it', async () => {
    const { user } = renderApp('/stylists/london/services');
    await user.click(await screen.findByRole('button', { name: 'More about Color' }));
    const sheet = await screen.findByRole('dialog', { name: 'Color' });
    expect(sheet).toHaveTextContent('All-over color, from a subtle refresh to a full change.');
    expect(sheet).toHaveTextContent('2 hr');
    expect(sheet).toHaveTextContent('Starting price with London');
    expect(sheet).toHaveTextContent('$120+');
    expect(within(sheet).getByRole('link', { name: 'Book Color' })).toHaveAttribute(
      'href',
      '/book/london?services=color',
    );
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('photo viewer', () => {
  it('opens a photo from the portfolio and steps through them, wrapping around', async () => {
    const { user, router } = renderApp('/stylists/london');
    const first = await screen.findByRole('button', { name: /View larger: Glossy jet black hair/ });
    await user.click(first);

    expect(await screen.findByText('1 of 6')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/stylists/london/photos/0');
    expect(screen.getByAltText('Glossy jet black hair in long, soft layers')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Next' }));
    expect(await screen.findByText('2 of 6')).toBeInTheDocument();
    expect(screen.getByAltText('Icy platinum balayage on long, loose waves')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Previous' }));
    await user.click(screen.getByRole('link', { name: 'Previous' }));
    expect(await screen.findByText('6 of 6')).toBeInTheDocument();
  });

  it('responds to the arrow keys', async () => {
    const { user } = renderApp('/stylists/london/photos/0');
    await screen.findByText('1 of 6');
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByText('2 of 6')).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(await screen.findByText('1 of 6')).toBeInTheDocument();
  });

  it('offers booking from the photo, and a way back to the portfolio', async () => {
    renderApp('/stylists/london/photos/2');
    await screen.findByText('3 of 6');
    expect(screen.getByRole('link', { name: 'Book with London' })).toHaveAttribute(
      'href',
      '/book/london',
    );
    expect(screen.getByRole('link', { name: /Back to London.s work/ })).toHaveAttribute(
      'href',
      '/stylists/london/portfolio',
    );
  });

  it('redirects a photo number that does not exist', async () => {
    const { router } = renderApp('/stylists/london/photos/99');
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(router.state.location.pathname).toBe('/stylists/london');
  });
});

describe('saving a stylist', () => {
  it('toggles, announces its state, and lists her under Saved', async () => {
    const { user } = renderApp('/stylists/kai');
    const save = await screen.findByRole('button', { name: 'Save Kai' });
    expect(save).toHaveAttribute('aria-pressed', 'false');
    await user.click(save);
    expect(screen.getByRole('button', { name: 'Save Kai' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Save Kai' })).toHaveTextContent('Saved');

    await user.click(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Saved' }),
    );
    const saved = await screen.findByRole('link', { name: 'Kai Nakamura' });
    expect(saved.closest('article')).toHaveTextContent('from');
    expect(saved.closest('article')).toHaveTextContent('$30+');

    await user.click(saved);
    await user.click(await screen.findByRole('button', { name: 'Save Kai' }));
    await user.click(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Saved' }),
    );
    expect(await screen.findByText(/Nobody saved yet/)).toBeInTheDocument();
  });
});

describe('about the studio', () => {
  it('gives the practical facts: where, which days, which hours', async () => {
    renderApp('/stylists/london/about');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Hair by London' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Provo')).toBeInTheDocument();
    expect(
      screen.getByText('Tuesday, Wednesday, Thursday, Friday, and Saturday'),
    ).toBeInTheDocument();
    expect(screen.getByText('9:00 AM to 7:00 PM')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book with London' })).toBeInTheDocument();
  });
});
