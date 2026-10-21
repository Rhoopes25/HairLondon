import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

  it('keeps everything else quiet: the only actions in the page are the two ways in', async () => {
    renderApp('/');
    await screen.findByRole('heading', { level: 1, name: 'Local Locks' });
    const main = screen.getByRole('main');
    expect(within(main).getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Book Now',
      'Explore Stylists',
    ]);
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
    await user.click(
      await within(list).findByRole('link', { name: /See all of London.s work/ }),
    );
    await screen.findByRole('heading', { level: 1, name: 'London' });
    await user.click(screen.getByRole('link', { name: 'Back to stylists' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Stylists' })).toBeInTheDocument();
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
