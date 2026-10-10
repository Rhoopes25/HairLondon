import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@app/test/renderApp';

const tab = (name: string) => screen.getByRole('tab', { name });

describe('stylist profile', () => {
  it('leads with the work: Portfolio is open and the photos are real', async () => {
    renderApp('/stylists/london');
    expect(await screen.findByRole('heading', { level: 1, name: 'London' })).toBeInTheDocument();
    expect(tab('Portfolio')).toHaveAttribute('aria-selected', 'true');
    const panel = screen.getByRole('tabpanel', { name: 'Portfolio' });
    expect(within(panel).getAllByRole('img')).toHaveLength(6);
    expect(screen.getByText('4.7 · 3 reviews')).toBeInTheDocument();
  });

  it('opens on Services when she has no photos yet, and says so on the Portfolio tab', async () => {
    const { user } = renderApp('/stylists/sadie');
    await screen.findByRole('heading', { level: 1, name: 'Sadie Morgan' });
    expect(tab('Services')).toHaveAttribute('aria-selected', 'true');
    await user.click(tab('Portfolio'));
    expect(
      screen.getByText('Sadie hasn’t added photos yet. Check the reviews to see what clients say.'),
    ).toBeInTheDocument();
  });

  it('opens on Services when arriving from a service filter, and the Book button keeps the service', async () => {
    renderApp('/stylists/london?service=color');
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(tab('Services')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('link', { name: 'Book' })).toHaveAttribute(
      'href',
      '/book/london?service=color',
    );
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

  it('lists services with duration and price, each linking to booking with it chosen', async () => {
    renderApp('/stylists/london/services');
    const row = await screen.findByRole('link', { name: /^Color/ });
    expect(row).toHaveTextContent('2 hr · $120');
    expect(row).toHaveAttribute('href', '/book/london?service=color');
  });

  it('redirects an unknown tab to the profile, and an unknown stylist to the list', async () => {
    const first = renderApp('/stylists/london/nonsense');
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(first.router.state.location.pathname).toBe('/stylists/london');
    first.unmount();

    const second = renderApp('/stylists/nobody');
    await screen.findByRole('heading', { level: 1, name: 'Find a stylist' });
    expect(second.router.state.location.pathname).toBe('/stylists');
  });

  it('keeps a Book action in the tab row and again at the bottom', async () => {
    renderApp('/stylists/london');
    await screen.findByRole('heading', { level: 1, name: 'London' });
    expect(screen.getByRole('link', { name: 'Book' })).toHaveAttribute('href', '/book/london');
    expect(screen.getByRole('link', { name: 'Book with London' })).toHaveAttribute(
      'href',
      '/book/london',
    );
  });
});

describe('service detail sheet', () => {
  it('shows what the service is, how long it takes, and what it costs, with a way to book it', async () => {
    const { user } = renderApp('/stylists/london/services');
    await user.click(await screen.findByRole('button', { name: 'More about Color' }));
    const sheet = await screen.findByRole('dialog', { name: 'Color' });
    expect(sheet).toHaveTextContent('All-over color, from a subtle refresh to a full change.');
    expect(sheet).toHaveTextContent('2 hr');
    expect(sheet).toHaveTextContent('$120');
    expect(within(sheet).getByRole('link', { name: 'Book Color' })).toHaveAttribute(
      'href',
      '/book/london?service=color',
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
    const saved = await screen.findByRole('link', { name: /^Kai Nakamura/ });
    expect(saved).toHaveTextContent('From $30');

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
    expect(screen.getByText('9:00 AM to 6:00 PM')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book with London' })).toBeInTheDocument();
  });
});
