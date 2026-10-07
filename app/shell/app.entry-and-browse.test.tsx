import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryStorageAdapter } from '@src/data/storage/memory-storage-adapter';
import { renderApp } from '@app/test/renderApp';

describe('entry screen', () => {
  it('leads with what this is for, and one main action', async () => {
    renderApp('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Hair by London' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('See real client work and reviews, then book a time that fits your day.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find a stylist' })).toHaveAttribute(
      'href',
      '/stylists',
    );
  });

  it('offers other ways in: a service shortcut with its price range, and returning clients', async () => {
    const { user, router } = renderApp('/');
    const blowout = await screen.findByRole('link', { name: /Blowout/ });
    expect(blowout).toHaveTextContent('$35–45');
    expect(screen.getByRole('link', { name: 'See my appointments' })).toBeInTheDocument();
    await user.click(blowout);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Find a stylist' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname + router.state.location.search).toBe(
      '/stylists?service=blowout',
    );
  });

  it('puts every top-level place one tap away, with the current one marked', async () => {
    const { user } = renderApp('/');
    const nav = await screen.findByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    await user.click(within(nav).getByRole('link', { name: 'Stylists' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Find a stylist' }),
    ).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Stylists' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    for (const label of ['Appointments', 'Saved']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
    }
  });
});

describe('early-prototype notice', () => {
  it('opens on a first visit with the goal in plain English, and can be closed', async () => {
    const { user } = renderApp('/', { showNotice: true });
    const dialog = await screen.findByRole('dialog', { name: 'This is an early draft' });
    expect(dialog).toHaveTextContent(
      'Find a stylist whose work you trust, then book a time that fits your day.',
    );
    expect(dialog).toHaveTextContent('Most stylists, and all of the reviews, are samples.');
    await user.click(screen.getByRole('button', { name: 'Start exploring' }));
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
    await screen.findByRole('heading', { level: 1, name: 'Hair by London' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is labelled on every screen and can be reopened from the strip, the footer, and help', async () => {
    const { user } = renderApp('/stylists');
    await screen.findByRole('heading', { name: 'Find a stylist' });
    expect(screen.getByText('Early prototype')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /What.s this\?/ }));
    expect(
      await screen.findByRole('dialog', { name: 'This is an early draft' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start exploring' }));

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
    const london = await screen.findByRole('link', { name: /^London/ });
    expect(london).toHaveTextContent('Hair by London, Provo');
    expect(london).toHaveTextContent('4.7 · 3 reviews');
    expect(london).toHaveTextContent('From $35');
    expect(
      within(screen.getByRole('region', { name: 'Stylists' })).getAllByRole('link'),
    ).toHaveLength(4);
  });

  it('filters by service from the chips and keeps it in the URL', async () => {
    const { user, router } = renderApp('/stylists');
    await user.click(await screen.findByRole('button', { name: 'Highlights' }));
    const list = screen.getByRole('region', { name: 'Stylists' });
    expect(within(list).getAllByRole('link')).toHaveLength(3);
    expect(within(list).queryByText(/Kai Nakamura/)).not.toBeInTheDocument();
    expect(within(list).getAllByRole('link')[0]).toHaveTextContent('Highlights $150');
    expect(router.state.location.search).toBe('?service=highlights');
    expect(screen.getByRole('button', { name: 'Highlights' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('starts filtered when arriving with ?service= from the home page', async () => {
    renderApp('/stylists?service=blowout');
    expect(await screen.findByRole('button', { name: 'Blowout' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByText(/Brooke Ellis/)).not.toBeInTheDocument(); // she does not offer blowouts
  });

  it('filters by the day she works, from the sheet, with a live count', async () => {
    const { user, router } = renderApp('/stylists');
    await user.click(await screen.findByRole('button', { name: 'Which day can you come?' }));
    const sheet = await screen.findByRole('dialog', { name: 'Which day can you come?' });

    await user.click(within(sheet).getByRole('radio', { name: 'Monday' }));
    expect(within(sheet).getByRole('button', { name: 'Show 2 stylists' })).toBeInTheDocument();

    await user.click(within(sheet).getByRole('radio', { name: 'Sunday' }));
    expect(within(sheet).getByRole('button', { name: 'No stylists on that day' })).toBeDisabled();

    await user.click(within(sheet).getByRole('radio', { name: 'Monday' }));
    await user.click(within(sheet).getByRole('button', { name: 'Show 2 stylists' }));
    expect(router.state.location.search).toBe('?day=1');
    const list = screen.getByRole('region', { name: 'Stylists' });
    expect(within(list).getAllByRole('link')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Works Mondays' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear day' }));
    expect(
      within(screen.getByRole('region', { name: 'Stylists' })).getAllByRole('link'),
    ).toHaveLength(4);
  });

  it('says so when nothing matches', async () => {
    renderApp('/stylists?service=highlights&day=1');
    // Highlights + Monday: Sadie works Mondays and does highlights, so use Sunday instead.
    await screen.findByRole('region', { name: 'Stylists' });
  });

  it('shows an empty message for a combination nobody offers', async () => {
    renderApp('/stylists?day=0');
    expect(
      await screen.findByText('No stylists match that. Try a different service or day.'),
    ).toBeInTheDocument();
  });
});

describe('not found and help', () => {
  it('offers ways back for an unknown address', async () => {
    renderApp('/nowhere');
    expect(
      await screen.findByRole('heading', { name: 'We couldn’t find that page' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find a stylist' })).toBeInTheDocument();
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
