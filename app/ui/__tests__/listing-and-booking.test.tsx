import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@app/test/render';
import {
  Button,
  ConfirmBar,
  Hero,
  NavBar,
  PortfolioGrid,
  ProfileHeader,
  Reviews,
  ServiceRow,
  SlotPicker,
  StylistCard,
  TabRow,
} from '..';

describe('SlotPicker', () => {
  const days = [
    { id: '2026-10-14', weekday: 'Wed', dayNum: 14, month: 'Oct', label: 'Wed, Oct 14' },
    { id: '2026-10-16', weekday: 'Fri', dayNum: 16, month: 'Oct', label: 'Fri, Oct 16' },
  ];

  it('days are toggle buttons with spoken labels', async () => {
    const onSelect = vi.fn();
    render(<SlotPicker.Days days={days} selectedId="2026-10-16" onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: 'Fri, Oct 16' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Wed, Oct 14' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Wed, Oct 14' }));
    expect(onSelect).toHaveBeenCalledWith('2026-10-14');
  });

  const times = [
    { id: 540, label: '9:00 AM', available: true },
    { id: 570, label: '9:30 AM', available: false },
  ];

  it('times disable the unavailable ones and report the chosen', async () => {
    const onSelect = vi.fn();
    render(<SlotPicker.Times times={times} selectedId={null} onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: '9:30 AM' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '9:00 AM' }));
    expect(onSelect).toHaveBeenCalledWith(540);
  });

  it('shows a placeholder instead of the grid before a day is chosen', () => {
    render(
      <SlotPicker.Times
        times={[]}
        selectedId={null}
        onSelect={() => undefined}
        placeholder="Select a day to see available times"
      />,
    );
    expect(screen.getByText('Select a day to see available times')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('can explain an empty day above the grid', () => {
    render(
      <SlotPicker.Times
        times={times}
        selectedId={null}
        onSelect={() => undefined}
        emptyMessage="No openings long enough on this day."
      />,
    );
    expect(screen.getByText('No openings long enough on this day.')).toBeInTheDocument();
  });
});

describe('StylistCard', () => {
  it('links to the stylist and shows who, where, rating, and price', () => {
    renderWithRouter(
      <StylistCard
        to="/stylists/london"
        name="London"
        photoUrl={null}
        studio="Hair by London"
        city="Provo"
        average={4.5}
        reviewCount={2}
        priceText="From $35"
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/stylists/london');
    expect(link).toHaveTextContent('Hair by London, Provo');
    expect(link).toHaveTextContent('4.5 · 2 reviews');
    expect(link).toHaveTextContent('From $35');
  });
});

describe('ServiceRow', () => {
  it('links to booking with the service, and the info button is separate', async () => {
    const onInfo = vi.fn();
    renderWithRouter(
      <ServiceRow
        to="/book/london?service=color"
        name="Color"
        description="All-over color."
        meta="2 hr · $120"
        onInfo={onInfo}
      />,
    );
    expect(screen.getByRole('link', { name: /Color/ })).toHaveAttribute(
      'href',
      '/book/london?service=color',
    );
    await userEvent.click(screen.getByRole('button', { name: 'More about Color' }));
    expect(onInfo).toHaveBeenCalled();
  });
});

describe('PortfolioGrid', () => {
  const photos = [
    { src: '/images/work-1.png', alt: 'Platinum balayage' },
    { src: '/images/work-2.png', alt: 'Jet black layers' },
  ];

  it('shows each photo with its alt text', () => {
    render(<PortfolioGrid photos={photos} />);
    expect(screen.getByAltText('Platinum balayage')).toHaveAttribute('src', '/images/work-1.png');
    expect(screen.getAllByRole('figure')).toHaveLength(2);
  });

  it('lets the browser pick a size when a photo has several', () => {
    render(
      <PortfolioGrid
        photos={[
          {
            src: '/images/work-1.jpg',
            srcSet: '/images/work-1-640.jpg 640w, /images/work-1.jpg 900w',
            alt: 'Platinum balayage',
          },
        ]}
      />,
    );
    const img = screen.getByAltText('Platinum balayage');
    expect(img).toHaveAttribute('srcset', '/images/work-1-640.jpg 640w, /images/work-1.jpg 900w');
    expect(img).toHaveAttribute('sizes');
  });

  it('makes photos buttons when they can be opened', async () => {
    const onSelect = vi.fn();
    render(<PortfolioGrid photos={photos} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /Jet black layers/ }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('falls back to the gradient if a photo fails to load', () => {
    render(<PortfolioGrid photos={photos} />);
    fireEvent.error(screen.getByAltText('Platinum balayage'));
    expect(screen.queryByAltText('Platinum balayage')).not.toBeInTheDocument();
    expect(screen.getByAltText('Jet black layers')).toBeInTheDocument();
  });
});

describe('Reviews', () => {
  const reviews = [
    { id: '1', name: 'Maren T.', stars: 5, text: 'Finally found someone I trust.' },
    { id: '2', name: 'Elise K.', stars: 4, text: 'Relaxed, no pressure.' },
  ];

  it('lists reviews with the average', () => {
    render(<Reviews reviews={reviews} average={4.5} />);
    expect(screen.getByRole('heading', { name: 'Reviews' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText(/4\.5/)).toHaveTextContent('4.5 · 2 reviews');
  });

  it('says so when there are none, and shows an action when given', () => {
    render(<Reviews reviews={[]} average={null} action={<a href="/write">Write a review</a>} />);
    expect(screen.getByText('No reviews yet.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Write a review' })).toBeInTheDocument();
  });
});

describe('ProfileHeader', () => {
  it('shows the name as the page heading with studio, bio, and tab row', () => {
    render(
      <ProfileHeader
        name="London"
        photoUrl={null}
        studio="Hair by London"
        city="Provo"
        average={null}
        reviewCount={0}
        bio="Lived-in blondes."
      >
        <TabRow>
          <span>tabs</span>
        </TabRow>
      </ProfileHeader>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'London' })).toBeInTheDocument();
    expect(screen.getByText('Hair by London, Provo')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Lived-in blondes.')).toBeInTheDocument();
    expect(screen.getByText('tabs')).toBeInTheDocument();
  });
});

describe('ConfirmBar', () => {
  it('shows the summary and total above the action', () => {
    render(
      <ConfirmBar summary="Haircut · Fri, Oct 16" total={{ value: '$65 · 1 hr' }}>
        <Button>Continue</Button>
      </ConfirmBar>,
    );
    expect(screen.getByText('Haircut · Fri, Oct 16')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$65 · 1 hr')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });
});

describe('Hero', () => {
  it('loads the photo from a srcset when it has one', () => {
    const { container } = renderWithRouter(
      <Hero
        imageUrl="/images/home.jpg"
        imageSrcSet="/images/home-640.jpg 640w, /images/home.jpg 900w"
        imageLabel="A stylist holding her shears"
        title="Hair by London"
        tagline="See their work."
        ctaLabel="Find a stylist"
        ctaTo="/stylists"
      />,
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('srcset', '/images/home-640.jpg 640w, /images/home.jpg 900w');
    // The text is on the page, so the photo is decoration.
    expect(img).toHaveAttribute('alt', '');
  });

  it('leads with the name, what it is for, and one main action', () => {
    renderWithRouter(
      <Hero
        imageUrl="/images/home.jpg"
        imageLabel="A stylist holding her shears"
        title="Hair by London"
        tagline="See their work. Read reviews. Book a time."
        ctaLabel="Find a stylist"
        ctaTo="/stylists"
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Hair by London' })).toBeInTheDocument();
    expect(screen.getByText('See their work. Read reviews. Book a time.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find a stylist' })).toHaveAttribute(
      'href',
      '/stylists',
    );
    expect(
      screen.getByRole('region', { name: 'A stylist holding her shears' }),
    ).toBeInTheDocument();
  });
});

describe('NavBar', () => {
  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/stylists', label: 'Stylists' },
  ];

  it('marks the current page and links home from the logo', () => {
    renderWithRouter(<NavBar homeTo="/" links={links} />, ['/stylists/london']);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Stylists' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Hair by London, home' })).toHaveAttribute('href', '/');
  });

  it('shows the wordmark for desktop without changing the home link name', () => {
    renderWithRouter(<NavBar homeTo="/" links={links} />);
    // Visible text from sm up (CSS), hidden from assistive tech so the link is not announced twice.
    expect(screen.getByText('Hair by London')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('link', { name: 'Hair by London, home' })).toBeInTheDocument();
  });
});
