import { act, screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@app/test/renderApp';

/**
 * Pretend accounts: made and kept on this device, no passwords. Signing in saves her typing; being
 * a guest is always fine. The test clock is Wednesday Oct 7, 2026, 8:00 AM.
 */
const rachel = { name: 'Rachel', phone: '(801) 555-0142', email: 'rachel@example.com' };

async function toDetails(user: UserEvent) {
  await screen.findByRole('heading', { level: 1, name: 'Book Now' });
  const days = within(screen.getByRole('group', { name: 'Day' })).getAllByRole('button');
  await user.click(days[1] as HTMLElement); // Thu, Oct 8
  await user.click(
    within(screen.getByRole('group', { name: 'Time' })).getByRole('button', { name: '9:00 AM' }),
  );
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await screen.findByRole('heading', { level: 1, name: 'Your details' });
}

describe('account pages', () => {
  it('offers sign in, create, or keep browsing as a guest, and says the accounts are pretend', async () => {
    renderApp('/account');
    await screen.findByRole('heading', { level: 1, name: 'Sign in' });
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/account/sign-in');
    expect(main.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/account/create',
    );
    expect(screen.getByRole('link', { name: 'Keep browsing as a guest' })).toBeInTheDocument();
    expect(screen.getByText(/accounts are pretend/)).toBeInTheDocument();
  });

  it('creates an account, shows what is saved, and signs out', async () => {
    const { user, router, services } = renderApp('/account/create');
    await screen.findByRole('heading', { level: 1, name: 'Create an account' });
    await user.type(screen.getByLabelText('Name'), rachel.name);
    await user.type(screen.getByLabelText('Phone'), '8015550142');
    await user.type(screen.getByLabelText('Email'), rachel.email);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await screen.findByRole('heading', { level: 1, name: 'Your account' });
    expect(router.state.location.pathname).toBe('/account');
    expect(screen.getByText('(801) 555-0142')).toBeInTheDocument();
    expect(services.accounts.current()?.email).toBe(rachel.email);

    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    const dialog = await screen.findByRole('dialog', { name: 'Sign out?' });
    await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
    await screen.findByRole('heading', { level: 1, name: 'Sign in' });
    expect(services.accounts.current()).toBeNull();
  });

  it('explains each missing detail when creating an account', async () => {
    const { user } = renderApp('/account/create');
    await user.click(await screen.findByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Enter your name so stylists know who’s coming.')).toBeInTheDocument();
    expect(screen.getByText('Enter a 10-digit phone number.')).toBeInTheDocument();
    expect(screen.getByText('Enter an email like name@example.com.')).toBeInTheDocument();
  });

  it('signs in by email, and offers to create one when the email is new here', async () => {
    const { user, router, services } = renderApp('/account/sign-in');
    services.accounts.create(rachel);
    services.accounts.signOut();
    const email = await screen.findByLabelText('Email');

    await user.type(email, 'someone@example.com');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(
      screen.getByText('There’s no account with that email on this device yet.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create an account with it instead' }),
    ).toBeInTheDocument();

    await user.clear(email);
    await user.type(email, 'Rachel@Example.com');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await screen.findByRole('heading', { level: 1, name: 'Your account' });
    expect(router.state.location.pathname).toBe('/account');
  });

  it('is linked from the footer on every page, named for whether she is signed in', async () => {
    const { services } = renderApp('/stylists');
    const footer = await screen.findByRole('navigation', { name: 'More' });
    expect(within(footer).getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/account',
    );
    services.accounts.create(rachel);
    expect(await within(footer).findByRole('link', { name: 'Your account' })).toBeInTheDocument();
  });
});

describe('account while booking', () => {
  it('lets a guest keep going without signing in', async () => {
    const { user } = renderApp('/book/london?services=haircut');
    await toDetails(user);
    expect(
      screen.getByRole('heading', { name: 'How would you like to book?' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue as guest' }));
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('signs in from a sheet without losing the booking, and fills in her details', async () => {
    const { user, services } = renderApp('/book/london?services=haircut');
    services.accounts.create(rachel);
    services.accounts.signOut();
    await toDetails(user);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    const sheet = await screen.findByRole('dialog', { name: 'Sign in' });
    await user.type(within(sheet).getByLabelText('Email'), rachel.email);
    await user.click(within(sheet).getByRole('button', { name: 'Sign in' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: 'Your details' })).toBeInTheDocument();
    expect(screen.getByText('Thu, Oct 8, 9:00 to 10:00 AM')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Rachel');
    expect(screen.getByLabelText('Phone')).toHaveValue('(801) 555-0142');
    expect(screen.getByText(/Booking as/)).toHaveTextContent(/^Booking as Rachel$/);
    expect(screen.queryByRole('button', { name: /Not you/ })).not.toBeInTheDocument();
  });

  it('creates an account from the sheet with what she already typed as a guest', async () => {
    const { user, services } = renderApp('/book/london?services=haircut');
    await toDetails(user);
    await user.click(screen.getByRole('button', { name: 'Continue as guest' }));
    await user.type(screen.getByLabelText('Name'), 'Maren');
    await user.type(screen.getByLabelText('Phone'), '5551234567');

    await user.click(screen.getByRole('button', { name: 'Create an account' }));
    const sheet = await screen.findByRole('dialog', { name: 'Create an account' });
    expect(within(sheet).getByLabelText('Name')).toHaveValue('Maren');
    await user.type(within(sheet).getByLabelText('Email'), 'maren@example.com');
    await user.click(within(sheet).getByRole('button', { name: 'Create account' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(services.accounts.current()?.name).toBe('Maren');
  });

  it('arrives already filled in when she signed in before booking', async () => {
    const { user, services } = renderApp('/book/london?services=haircut');
    services.accounts.create(rachel);
    await toDetails(user);
    expect(screen.getByLabelText('Name')).toHaveValue('Rachel');
    // Signed in already: no sign in or guest choice to make.
    expect(screen.queryByRole('button', { name: 'Continue as guest' })).not.toBeInTheDocument();
    expect(services.accounts.current()?.name).toBe('Rachel');
  });
});

describe('account control in the header', () => {
  const header = () => within(screen.getByRole('banner'));

  it('offers Sign in at the top right, and comes back to the same screen after', async () => {
    const { user, router, services } = renderApp('/stylists');
    await screen.findByRole('heading', { level: 1, name: 'Stylists' });
    services.accounts.create(rachel);
    act(() => services.accounts.signOut());
    await user.click(header().getByRole('link', { name: 'Sign in' }));
    await screen.findByRole('heading', { level: 1, name: 'Welcome back' });
    expect(new URLSearchParams(router.state.location.search).get('back')).toBe('/stylists');
  });

  it('shows her initials when signed in, with My account and Sign out', async () => {
    const { user, services } = renderApp('/stylists');
    await screen.findByRole('heading', { level: 1, name: 'Stylists' });
    act(() => {
      services.accounts.create(rachel);
    });
    const avatar = await header().findByRole('button', { name: 'Account: Rachel' });
    expect(avatar).toHaveAttribute('aria-expanded', 'false');
    await user.click(avatar);
    expect(avatar).toHaveAttribute('aria-expanded', 'true');
    expect(header().getByRole('link', { name: 'My account' })).toHaveAttribute('href', '/account');

    await user.click(header().getByRole('button', { name: 'Sign out' }));
    // Asks first; Stay signed in changes nothing.
    let dialog = await screen.findByRole('dialog', { name: 'Sign out?' });
    await user.click(within(dialog).getByRole('button', { name: 'Stay signed in' }));
    expect(services.accounts.current()?.name).toBe('Rachel');

    await user.click(header().getByRole('button', { name: 'Account: Rachel' }));
    await user.click(header().getByRole('button', { name: 'Sign out' }));
    dialog = await screen.findByRole('dialog', { name: 'Sign out?' });
    await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
    expect(services.accounts.current()).toBeNull();
    expect(screen.queryByText('Signed out')).not.toBeInTheDocument();
    expect(header().getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('closes the menu with Escape', async () => {
    const { user, services } = renderApp('/stylists');
    await screen.findByRole('heading', { level: 1, name: 'Stylists' });
    act(() => {
      services.accounts.create(rachel);
    });
    await user.click(await header().findByRole('button', { name: 'Account: Rachel' }));
    await user.keyboard('{Escape}');
    expect(header().queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
  });
});
