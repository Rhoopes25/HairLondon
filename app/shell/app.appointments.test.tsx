import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Services } from '@app/services';
import { durationMin, minuteOfDay } from '@src/domain/models/time';
import type { IsoDate } from '@src/domain/models/time';
import { renderApp } from '@app/test/renderApp';

/** A visit on Thu, Oct 8 at 9:00 AM with London: an hour for a haircut. */
function bookUpcoming(services: Services) {
  return services.appointments.add({
    stylistId: 'london',
    serviceIds: ['haircut'],
    date: '2026-10-08' as IsoDate,
    start: minuteOfDay(9),
    durationMin: durationMin(60),
    total: 65,
    name: 'Maren Thompson',
    phone: '(555) 123-4567',
  });
}

const days = () => within(screen.getByRole('group', { name: 'Day' })).getAllByRole('button');
const timeButton = (label: string) =>
  within(screen.getByRole('group', { name: 'Time' })).getByRole('button', { name: label });

describe('my appointments', () => {
  it('starts with a sample past visit so the history has something in it, and nothing upcoming', async () => {
    renderApp('/appointments');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'My appointments' }),
    ).toBeInTheDocument();
    expect(screen.getByText('You don’t have anything booked yet.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find a stylist' })).toBeInTheDocument();
    const past = screen.getByRole('heading', { name: 'Past visits' }).parentElement as HTMLElement;
    expect(within(past).getByRole('link')).toHaveTextContent('Haircut with London');
    expect(within(past).getByRole('link')).toHaveTextContent('Completed');
  });

  it('lists upcoming visits soonest first, with cancelled ones kept separate', async () => {
    const { services } = renderApp('/appointments');
    await screen.findByRole('heading', { level: 1, name: 'My appointments' });
    const later = services.appointments.add({
      stylistId: 'sadie',
      serviceIds: ['color'],
      date: '2026-10-20' as IsoDate,
      start: minuteOfDay(11),
      durationMin: durationMin(120),
      total: 110,
      name: 'Maren',
      phone: '(555) 123-4567',
    });
    bookUpcoming(services);
    services.appointments.cancel(later.id);

    const upcoming = await screen.findByRole('heading', { name: 'Upcoming' });
    expect(within(upcoming.parentElement as HTMLElement).getAllByRole('link')).toHaveLength(1);
    const cancelled = screen.getByRole('heading', { name: 'Cancelled' })
      .parentElement as HTMLElement;
    expect(within(cancelled).getByRole('link')).toHaveTextContent('Color with Sadie Morgan');
  });
});

describe('appointment detail', () => {
  it('shows every fact about an upcoming visit, with the ways to change it', async () => {
    const { services, router } = renderApp('/appointments');
    const { id } = bookUpcoming(services);
    await router.navigate(`/appointments/${id}`);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your appointment' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'London' })).toHaveAttribute(
      'href',
      '/stylists/london',
    );
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('Thu, Oct 8, 9:00 to 10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('$65 · 1 hr')).toBeInTheDocument();
    expect(screen.getByText('Maren Thompson')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to calendar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reschedule' })).toHaveAttribute(
      'href',
      `/appointments/${id}/reschedule`,
    );
    expect(screen.getByRole('button', { name: 'Cancel appointment' })).toBeInTheDocument();
  });

  it('says plainly when an appointment cannot be found', async () => {
    renderApp('/appointments/nope');
    expect(
      await screen.findByRole('heading', { name: 'We couldn’t find that appointment' }),
    ).toBeInTheDocument();
  });
});

describe('cancelling', () => {
  it('asks first, then cancels and frees the time for booking', async () => {
    const { services, user, router } = renderApp('/appointments');
    const { id } = bookUpcoming(services);
    await router.navigate(`/appointments/${id}`);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your appointment' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Thu, Oct 8, 9:00 to 10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel appointment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Cancel this appointment?' });
    expect(dialog).toHaveTextContent('Thu, Oct 8, 9:00 to 10:00 AM');

    // The safe option leaves everything alone.
    await user.click(within(dialog).getByRole('button', { name: 'Keep my appointment' }));
    expect(services.appointments.get(id)?.status).toBe('booked');

    await user.click(screen.getByRole('button', { name: 'Cancel appointment' }));
    await user.click(await screen.findByRole('button', { name: 'Yes, cancel it' }));
    expect(services.appointments.get(id)?.status).toBe('cancelled');

    const cancelled = await screen.findByRole('heading', { name: 'Cancelled' });
    expect(within(cancelled.parentElement as HTMLElement).getByRole('link')).toHaveTextContent(
      'Cancelled',
    );

    // The slot is open again.
    await router.navigate('/book/london?service=haircut');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    await user.click(days()[1] as HTMLElement);
    expect(timeButton('9:00 AM')).toBeEnabled();
  });
});

describe('rescheduling', () => {
  it('moves the visit to a new time, and lets you keep today’s slot as an option', async () => {
    const { services, user, router } = renderApp('/appointments');
    const { id } = bookUpcoming(services);
    await router.navigate(`/appointments/${id}/reschedule`);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reschedule' }),
    ).toBeInTheDocument();
    const confirm = screen.getByRole('button', { name: 'Confirm new time' });
    expect(confirm).toBeDisabled();
    expect(screen.getByText('Choose a new day and time')).toBeInTheDocument();

    await user.click(days()[1] as HTMLElement); // Thu, Oct 8: the same day
    // Its own current slot is free to pick, because it is the visit being moved.
    expect(timeButton('9:00 AM')).toBeEnabled();

    await user.click(days()[2] as HTMLElement); // Fri, Oct 9
    await user.click(timeButton('11:00 AM'));
    expect(screen.getByText('Move to Fri, Oct 9 · 11:00 AM to 12:00 PM')).toBeInTheDocument();
    await user.click(confirm);

    expect(await screen.findByText('Fri, Oct 9, 11:00 AM to 12:00 PM')).toBeInTheDocument();
    expect(services.appointments.get(id)).toMatchObject({ date: '2026-10-09', start: 660 });

    // The old slot is open for others.
    await router.navigate('/book/london?service=haircut');
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    await user.click(days()[1] as HTMLElement);
    expect(timeButton('9:00 AM')).toBeEnabled();
  });

  it('sends a visit that is not upcoming back to its detail page', async () => {
    const { router } = renderApp('/appointments/apt_sample_past/reschedule');
    await screen.findByRole('heading', { level: 1, name: 'Past visit' });
    expect(router.state.location.pathname).toBe('/appointments/apt_sample_past');
  });
});

describe('reviewing a past visit', () => {
  it('asks for what is missing, then adds the review to the stylist’s profile, first', async () => {
    const { user, router } = renderApp('/appointments/apt_sample_past');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Past visit' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Leave a review' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Review London' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Post review' }));
    expect(screen.getByText('Choose a star rating.')).toBeInTheDocument();
    expect(
      screen.getByText('Write a sentence or two so others know what to expect.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: '5 stars' }));
    await user.type(
      screen.getByLabelText('Tell others about it'),
      'Calm, unhurried, and exactly what I asked for.',
    );
    await user.click(screen.getByRole('button', { name: 'Post review' }));

    expect(await screen.findByRole('tab', { name: 'Reviews', selected: true })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/stylists/london/reviews');
    const reviews = screen.getByRole('tabpanel', { name: 'Reviews' });
    const first = within(reviews).getAllByRole('listitem')[0] as HTMLElement;
    expect(first).toHaveTextContent('Sample C.');
    expect(first).toHaveTextContent('Calm, unhurried, and exactly what I asked for.');
    // The average now counts four reviews.
    expect(screen.getAllByText(/4\.8 · 4 reviews/).length).toBeGreaterThan(0);
  });

  it('thanks you afterwards and does not let you review the same visit twice', async () => {
    const { services, user, router } = renderApp('/appointments');
    services.reviews.add({
      stylistId: 'london',
      appointmentId: 'apt_sample_past',
      name: 'Sample C.',
      stars: 5,
      text: 'Lovely.',
    });
    await router.navigate('/appointments/apt_sample_past');
    expect(await screen.findByText('Thanks for reviewing London.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Leave a review' })).not.toBeInTheDocument();
    await router.navigate('/appointments/apt_sample_past/review');
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/appointments/apt_sample_past'),
    );
    void user;
  });

  it('does not offer a review for a visit that has not happened yet', async () => {
    const { services, router } = renderApp('/appointments');
    const { id } = bookUpcoming(services);
    await router.navigate(`/appointments/${id}/review`);
    await screen.findByRole('heading', { level: 1, name: 'Your appointment' });
    expect(router.state.location.pathname).toBe(`/appointments/${id}`);
  });

  it('offers to book again from a past visit, with the same service chosen', async () => {
    const { user } = renderApp('/appointments/apt_sample_past');
    await user.click(await screen.findByRole('link', { name: 'Book again' }));
    await screen.findByRole('heading', { level: 1, name: 'Book Now' });
    expect(screen.getByRole('checkbox', { name: /Haircut/ })).toBeChecked();
  });
});
