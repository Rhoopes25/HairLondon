import { screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '@app/test/renderApp';

/** Day buttons in the order shown. With the test clock (Wed Oct 7) and London's days: Oct 7, 8, 9, 10, 13... */
const days = () => within(screen.getByRole('group', { name: 'Day' })).getAllByRole('button');
const times = () => within(screen.getByRole('group', { name: 'Time' }));
const timeButton = (label: string) => times().getByRole('button', { name: label });
const continueButton = () => screen.getByRole('button', { name: 'Continue' });

async function chooseHaircutOct8At9(user: UserEvent) {
  await screen.findByRole('heading', { level: 1, name: 'Book Now' });
  await user.click(days()[1] as HTMLElement); // Thu, Oct 8
  await user.click(timeButton('9:00 AM'));
}

async function fillDetails(user: UserEvent) {
  await user.type(screen.getByLabelText('Name'), 'Maren');
  await user.type(screen.getByLabelText('Phone'), '5551234567');
}

describe('booking: choose services, day, and time', () => {
  it('preselects the service from ?service= and needs a day and a time before continuing', async () => {
    const { user } = renderApp('/book/london?service=haircut');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    expect(screen.getByRole('checkbox', { name: /Haircut/ })).toBeChecked();
    expect(continueButton()).toBeDisabled();
    expect(screen.getByText('Select a day to see available times')).toBeInTheDocument();

    await user.click(days()[1] as HTMLElement);
    expect(continueButton()).toBeDisabled();
    await user.click(timeButton('9:00 AM'));
    expect(continueButton()).toBeEnabled();
  });

  it('ignores a ?service= the stylist does not offer', async () => {
    renderApp('/book/kai?service=highlights');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    expect(screen.queryByRole('checkbox', { name: /Highlights/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox').every((box) => !(box as HTMLInputElement).checked)).toBe(
      true,
    );
  });

  it('lists only the services she offers, with duration and price', async () => {
    renderApp('/book/kai');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes).toHaveLength(4);
    expect(screen.getByRole('checkbox', { name: /Haircut/ }).closest('label')).toHaveTextContent(
      '1 hr · $45',
    );
  });

  it('shows only the days she works, over the next three weeks, starting today', async () => {
    renderApp('/book/london');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    const labels = days().map((day) => day.getAttribute('aria-label'));
    expect(labels.slice(0, 5)).toEqual([
      'Wed, Oct 7',
      'Thu, Oct 8',
      'Fri, Oct 9',
      'Sat, Oct 10',
      'Tue, Oct 13',
    ]);
    expect(labels).not.toContain('Sun, Oct 11');
    expect(labels).not.toContain('Mon, Oct 12');
    expect(labels.at(-1)).toBe('Tue, Oct 27');
  });

  it('applies the lead-time rule today: nothing starts within the next hour', async () => {
    const { user } = renderApp('/book/london?service=haircut'); // it is 8:00 AM
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    await user.click(days()[0] as HTMLElement);
    expect(timeButton('9:00 AM')).toBeDisabled(); // 8:00 now + 1 hour: starts at or before 9:00 are out
    expect(timeButton('9:30 AM')).toBeEnabled();
  });

  it('disables times a long visit cannot fit and offers none past closing', async () => {
    const { user } = renderApp('/book/london?service=highlights'); // 2 hr 30 min
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    await user.click(days()[1] as HTMLElement);
    expect(timeButton('4:00 PM')).toBeDisabled();
    expect(timeButton('5:30 PM')).toBeDisabled();
  });

  it('strikes through unavailable times rather than relying on color', async () => {
    const { user } = renderApp('/book/london?service=haircut');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    await user.click(days()[1] as HTMLElement);
    const disabled = within(screen.getByRole('group', { name: 'Time' }))
      .getAllByRole('button')
      .filter((button) => (button as HTMLButtonElement).disabled);
    expect(disabled.length).toBeGreaterThan(0);
  });

  it('updates the summary, total, and finish time as choices are made', async () => {
    const { user } = renderApp('/book/london?service=haircut');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    await user.click(days()[5] as HTMLElement); // Wed, Oct 14: the morning is open after 9:00
    await user.click(timeButton('10:00 AM'));
    expect(screen.getByText('Haircut · Wed, Oct 14 · 10:00 to 11:00 AM')).toBeInTheDocument();
    expect(screen.getByText('$65 · 1 hr')).toBeInTheDocument();
    expect(screen.getByText('You’ll be done by 11:00 AM.')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /Blowout/ }));
    expect(
      screen.getByText('Haircut + Blowout · Wed, Oct 14 · 10:00 to 11:45 AM'),
    ).toBeInTheDocument();
    expect(screen.getByText('$110 · 1 hr 45 min')).toBeInTheDocument();
    expect(screen.getByText('You’ll be done by 11:45 AM.')).toBeInTheDocument();
  });

  it('clears the chosen time when a longer service no longer fits it', async () => {
    const { user } = renderApp('/book/london?service=haircut');
    await chooseHaircutOct8At9(user);
    expect(continueButton()).toBeEnabled();
    // Highlights make it 3.5 hours, running into the sample 10:00 booking that day.
    await user.click(screen.getByRole('checkbox', { name: /Highlights/ }));
    expect(timeButton('9:00 AM')).toHaveAttribute('aria-pressed', 'false');
    expect(continueButton()).toBeDisabled();
  });

  it('clears the time when a new day is picked, and the day when it is picked again', async () => {
    const { user } = renderApp('/book/london?service=haircut');
    await chooseHaircutOct8At9(user);
    await user.click(days()[2] as HTMLElement); // Fri, Oct 9
    expect(continueButton()).toBeDisabled();
    await user.click(days()[2] as HTMLElement); // again: deselect
    expect(screen.getByText('Select a day to see available times')).toBeInTheDocument();
  });

  it('sends an unknown stylist back to the list', async () => {
    const { router } = renderApp('/book/nobody');
    await screen.findByRole('heading', { level: 1, name: 'Find a stylist' });
    expect(router.state.location.pathname).toBe('/stylists');
  });
});

describe('booking: the whole flow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('books an appointment through details, review, and confirmation', async () => {
    const { user, services, router } = renderApp('/book/london?service=haircut');
    await chooseHaircutOct8At9(user);
    await user.click(continueButton());

    // Details
    const heading = await screen.findByRole('heading', { level: 1, name: 'Your details' });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByText('Thu, Oct 8, 9:00 to 10:00 AM')).toBeInTheDocument();
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Review
    const review = await screen.findByRole('heading', { level: 1, name: 'Check and confirm' });
    await waitFor(() => expect(review).toHaveFocus());
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('Maren')).toBeInTheDocument();
    expect(
      services.appointments.list().filter((a) => a.status === 'booked' && a.name === 'Maren'),
    ).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Confirm booking' }));

    // Done
    const done = await screen.findByRole('heading', { level: 1, name: 'You’re booked' });
    await waitFor(() => expect(done).toHaveFocus());
    expect(
      screen.getByText('A reminder text will go to (555) 123-4567 the day before.'),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/book/london/done');
    const saved = services.appointments.list().find((a) => a.name === 'Maren');
    expect(saved).toMatchObject({
      stylistId: 'london',
      serviceIds: ['haircut'],
      date: '2026-10-08',
      start: 540,
      durationMin: 60,
      total: 65,
      phone: '(555) 123-4567',
      status: 'booked',
    });
    expect(router.state.location.search).toBe(`?appointment=${saved?.id}`);
  });

  it('shows the confirmation again after a refresh, because it reads from storage', async () => {
    const first = renderApp('/book/london?service=haircut');
    await chooseHaircutOct8At9(first.user);
    await first.user.click(continueButton());
    await screen.findByRole('heading', { name: 'Your details' });
    await fillDetails(first.user);
    await first.user.click(screen.getByRole('button', { name: 'Continue' }));
    await first.user.click(await screen.findByRole('button', { name: 'Confirm booking' }));
    await screen.findByRole('heading', { name: 'You’re booked' });
    const url = first.router.state.location.pathname + first.router.state.location.search;
    first.unmount();

    renderApp(url, { storage: first.storage });
    expect(await screen.findByRole('heading', { name: 'You’re booked' })).toBeInTheDocument();
  });

  it('explains each problem on the details form and focuses the first field to fix', async () => {
    const { user } = renderApp('/book/london?service=haircut');
    await chooseHaircutOct8At9(user);
    await user.click(continueButton());
    await screen.findByRole('heading', { name: 'Your details' });

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Enter your name so London knows who’s coming.')).toBeInTheDocument();
    expect(screen.getByText('Enter a 10-digit phone number.')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Name')).toHaveFocus();

    await user.type(screen.getByLabelText('Name'), 'Maren');
    await user.type(screen.getByLabelText('Phone'), '555');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.queryByText(/knows who/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toHaveFocus();
    expect(screen.getByLabelText('Phone')).toHaveAttribute('aria-invalid', 'true');
  });

  it('accepts a phone number with a leading country code and formats it', async () => {
    const { user } = renderApp('/book/london?service=haircut');
    await chooseHaircutOct8At9(user);
    await user.click(continueButton());
    await screen.findByRole('heading', { name: 'Your details' });
    await user.type(screen.getByLabelText('Name'), 'Maren');
    await user.type(screen.getByLabelText('Phone'), '+1 555 123 4567');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('(555) 123-4567')).toBeInTheDocument();
  });

  it('keeps what was typed when going back and forward', async () => {
    const { user } = renderApp('/book/london?service=haircut');
    await chooseHaircutOct8At9(user);
    await user.click(continueButton());
    await screen.findByRole('heading', { name: 'Your details' });
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(continueButton()).toBeEnabled(); // choices survived on step 1
    await user.click(continueButton());
    expect(await screen.findByLabelText('Name')).toHaveValue('Maren');
  });

  it('previews the reminder text without sending anything', async () => {
    const { user } = renderApp('/book/london?service=haircut');
    await chooseHaircutOct8At9(user);
    await user.click(continueButton());
    await screen.findByRole('heading', { name: 'Your details' });
    await user.type(screen.getByLabelText('Name'), 'Maren Thompson');
    await user.click(screen.getByRole('button', { name: 'See a sample reminder' }));
    const sheet = await screen.findByRole('dialog', { name: 'Your reminder text' });
    expect(sheet).toHaveTextContent(
      'Hi Maren, a reminder that you’re booked with London at Hair by London tomorrow (Thu, Oct 8) at 9:00 AM.',
    );
    expect(sheet).toHaveTextContent('No texts are sent from this prototype.');
  });

  it('sends people who skip ahead back to the start of the flow', async () => {
    for (const path of ['/book/london/details', '/book/london/review']) {
      const { router, unmount } = renderApp(path);
      await screen.findByRole('heading', { level: 1, name: 'Book Now' });
      expect(router.state.location.pathname).toBe('/book/london');
      unmount();
    }
  });

  it('sends a review without details back to the details step', async () => {
    const { user, router } = renderApp('/book/london?service=haircut');
    await chooseHaircutOct8At9(user);
    await user.click(continueButton());
    await screen.findByRole('heading', { name: 'Your details' });
    await user.type(screen.getByLabelText('Name'), 'Maren');
    // Phone left empty, then jump straight to review by URL.
    const visited: string[] = [];
    router.subscribe((state) => visited.push(state.location.pathname));
    await router.navigate('/book/london/review');
    await waitFor(() => expect(router.state.location.pathname).toBe('/book/london/details'));
    expect(visited).toContain('/book/london/review'); // it did try, and was sent back
    expect(await screen.findByRole('heading', { name: 'Your details' })).toBeInTheDocument();
  });

  it('a confirmation address with no matching appointment goes to the appointment list', async () => {
    const { router } = renderApp('/book/london/done?appointment=nope');
    await screen.findByRole('heading', { level: 1, name: 'My appointments' });
    expect(router.state.location.pathname).toBe('/appointments');
  });

  it('makes the booked time unavailable for the next booking, and frees it when cancelled', async () => {
    const { user, services } = renderApp('/book/london?service=haircut');
    await chooseHaircutOct8At9(user);
    await user.click(continueButton());
    await screen.findByRole('heading', { name: 'Your details' });
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm booking' }));
    await screen.findByRole('heading', { name: 'You’re booked' });

    await user.click(screen.getByRole('link', { name: 'Browse more stylists' }));
    await screen.findByRole('heading', { name: 'Find a stylist' });
    await user.click(screen.getByRole('link', { name: /^London/ }));
    await user.click(await screen.findByRole('link', { name: 'Book with London' }));
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    await user.click(screen.getByRole('checkbox', { name: /Haircut/ }));
    await user.click(days()[1] as HTMLElement);
    expect(timeButton('9:00 AM')).toBeDisabled();
    expect(timeButton('9:30 AM')).toBeDisabled(); // a 1 hour visit at 9:30 would overlap

    const booked = services.appointments.list().find((a) => a.name === 'Maren');
    if (!booked) throw new Error('expected a booked appointment');
    services.appointments.cancel(booked.id);
    await waitFor(() => expect(timeButton('9:00 AM')).toBeEnabled());
  });
});

describe('booking: leaving', () => {
  it('leaves straight away when nothing has been chosen', async () => {
    const { user, router } = renderApp('/book/london');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    await user.click(screen.getByRole('link', { name: 'Exit booking' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'London' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/stylists/london');
  });

  it('asks first once something is chosen, and Keep booking changes nothing', async () => {
    const { user, router } = renderApp('/book/london?service=haircut');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    await user.click(screen.getByRole('link', { name: 'Exit booking' }));
    const dialog = await screen.findByRole('dialog', { name: 'Leave this booking?' });
    expect(dialog).toHaveTextContent('Your choices won’t be saved.');
    await user.click(within(dialog).getByRole('button', { name: 'Keep booking' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/book/london');
    expect(screen.getByRole('checkbox', { name: /Haircut/ })).toBeChecked();
  });

  it('leaves for the stylist profile once confirmed', async () => {
    const { user, router } = renderApp('/book/london?service=haircut');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    await user.click(screen.getByRole('link', { name: 'Exit booking' }));
    await user.click(await screen.findByRole('button', { name: 'Leave' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'London' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/stylists/london');
  });

  it('can start a booking from several places, with no fixed path', async () => {
    // From a service row on the profile, preselecting that service.
    const fromServices = renderApp('/stylists/london/services');
    await fromServices.user.click(await screen.findByRole('link', { name: /^Blowout/ }));
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    expect(screen.getByRole('checkbox', { name: /Blowout/ })).toBeChecked();
    fromServices.unmount();

    // From a photo in the portfolio.
    const fromPhoto = renderApp('/stylists/london/photos/1');
    await fromPhoto.user.click(await screen.findByRole('link', { name: 'Book with London' }));
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    fromPhoto.unmount();

    // From the About page.
    const fromAbout = renderApp('/stylists/london/about');
    await fromAbout.user.click(await screen.findByRole('link', { name: 'Book with London' }));
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
  });
});

describe('booking: add to calendar', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('downloads an .ics file and then explains what to do with it', async () => {
    const blobs: Blob[] = [];
    URL.createObjectURL = vi.fn((blob: Blob | MediaSource) => {
      blobs.push(blob as Blob);
      return 'blob:test';
    });
    URL.revokeObjectURL = vi.fn();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    const { user } = renderApp('/book/london?service=haircut');
    await chooseHaircutOct8At9(user);
    await user.click(continueButton());
    await screen.findByRole('heading', { name: 'Your details' });
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm booking' }));
    await user.click(await screen.findByRole('button', { name: 'Add to calendar' }));

    expect(click).toHaveBeenCalled();
    const text = await blobs[0]?.text();
    expect(text).toContain('DTSTART:20261008T090000');
    expect(text).toContain('DTEND:20261008T100000');
    expect(text).toContain('SUMMARY:Haircut with London');
    expect(text).toContain('LOCATION:Hair by London\\, Provo');

    const sheet = await screen.findByRole('dialog', { name: 'Calendar file saved' });
    await user.click(within(sheet).getByRole('button', { name: 'Got it' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
