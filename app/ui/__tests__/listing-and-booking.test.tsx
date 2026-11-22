import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@app/test/render';
import {
  BookBar,
  BookNowBar,
  Button,
  ConfirmBar,
  Hero,
  LongVisitNotice,
  NavBar,
  Notice,
  PortfolioGrid,
  ProfileHeader,
  Reviews,
  RunningTotal,
  ServiceRow,
  ServiceSummary,
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
  const base = {
    to: '/stylists/london',
    name: 'London',
    photoUrl: null,
    studio: 'Hair by London',
    city: 'Provo',
    average: 4.5,
    reviewCount: 2,
  };

  it('links to the stylist and shows who, where, rating, and price', () => {
    renderWithRouter(<StylistCard {...base} price={{ value: '$35+' }} />);
    expect(screen.getByRole('link', { name: 'London' })).toHaveAttribute(
      'href',
      '/stylists/london',
    );
    const card = screen.getByRole('article');
    expect(card).toHaveTextContent('Hair by London, Provo');
    expect(card).toHaveTextContent('4.5 · 2 reviews');
    expect(card).not.toHaveTextContent('from');
    expect(card).toHaveTextContent('$35+');
  });

  it('puts "See all work" on the third photo spot, and a chip per open time', () => {
    renderWithRouter(
      <StylistCard
        {...base}
        photos={[{ src: '/a.jpg' }, { src: '/b.jpg' }]}
        seeAll={{ to: '/stylists/london', label: 'See all of London’s work' }}
        slots={{
          heading: 'Next open',
          items: [
            {
              label: 'Today, 1:00 PM',
              to: '/book/london?start=780',
              ariaLabel: 'Book London, today at 1:00 PM',
            },
          ],
        }}
      />,
    );
    // Two photos, so the tile sits over an empty third spot instead of vanishing.
    expect(screen.getByRole('link', { name: 'See all of London’s work' })).toBeInTheDocument();
    expect(screen.getByText('Next open')).toBeInTheDocument();
    const chip = screen.getByRole('link', { name: 'Book London, today at 1:00 PM' });
    expect(chip).toHaveAttribute('href', '/book/london?start=780');
    expect(chip).toHaveTextContent('Today, 1:00 PM');
  });

  it('shows no photo row or chips when it has none', () => {
    const { container } = renderWithRouter(<StylistCard {...base} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByText('Next open')).toBeNull();
  });

  it('shows how far away she is', () => {
    renderWithRouter(<StylistCard {...base} distance="2.1 mi away" />);
    const card = screen.getByRole('article');
    expect(card).toHaveTextContent('Hair by London, Provo');
    expect(screen.getByText('2.1 mi away')).toBeInTheDocument();
  });

  it('has a clear "Read reviews" link that names her, straight to her reviews', () => {
    renderWithRouter(<StylistCard {...base} reviewsTo="/stylists/london/reviews" />);
    expect(screen.getByRole('link', { name: 'Read reviews for London' })).toHaveAttribute(
      'href',
      '/stylists/london/reviews',
    );
    expect(screen.getByText('Read reviews')).toBeInTheDocument();
  });

  it('has no "Read reviews" link until there is something to read', () => {
    renderWithRouter(
      <StylistCard {...base} average={null} reviewCount={0} reviewsTo="/stylists/london/reviews" />,
    );
    expect(screen.queryByText('Read reviews')).toBeNull();
  });

  describe('quick look', () => {
    const preview = {
      experience: '8 years doing hair',
      specialties: ['Lived-in blonde', 'Soft color'],
      profileTo: '/stylists/london',
    };

    it('stays closed until she opens it, then shows experience and specialty', async () => {
      renderWithRouter(<StylistCard {...base} preview={preview} />);
      const toggle = screen.getByRole('button', { name: 'Quick look at London' });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      // It is in the page but folded away, so nothing in it is seen or read out until she opens it.
      expect(screen.getByText('8 years doing hair')).not.toBeVisible();

      await userEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const region = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
      expect(region).not.toBeNull();
      expect(region).toBeVisible();
      expect(screen.getByText('8 years doing hair')).toBeInTheDocument();
      expect(screen.getByText('Lived-in blonde')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View full profile' })).toHaveAttribute(
        'href',
        '/stylists/london',
      );

      await userEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(region).not.toBeVisible();
    });

    it('does not repeat what the card already shows: no photos, no second rating', async () => {
      renderWithRouter(
        <StylistCard {...base} photos={[{ src: '/a.jpg' }, { src: '/b.jpg' }]} preview={preview} />,
      );
      const photosBefore = document.querySelectorAll('img').length;
      const toggle = screen.getByRole('button', { name: 'Quick look at London' });
      await userEvent.click(toggle);
      const region = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
      expect(region?.querySelectorAll('img')).toHaveLength(0);
      expect(document.querySelectorAll('img')).toHaveLength(photosBefore);
      expect(within(region as HTMLElement).queryByText(/reviews/)).toBeNull();
      // The rating is on the card once, where it always was.
      expect(screen.getAllByText(/4\.5 · 2 reviews/)).toHaveLength(1);
    });

    it('opens one card without closing another, so two can be compared', async () => {
      renderWithRouter(
        <>
          <StylistCard {...base} preview={preview} />
          <StylistCard {...base} name="Sadie" to="/stylists/sadie" preview={preview} />
        </>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Quick look at London' }));
      await userEvent.click(screen.getByRole('button', { name: 'Quick look at Sadie' }));
      expect(screen.getByRole('button', { name: 'Quick look at London' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(screen.getByRole('button', { name: 'Quick look at Sadie' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('has no quick look unless it is given one', () => {
      renderWithRouter(<StylistCard {...base} />);
      expect(screen.queryByRole('button', { name: /Quick look/ })).toBeNull();
    });
  });
});

describe('BookBar', () => {
  it('says what the booking starts with, and holds the time', () => {
    renderWithRouter(
      <BookBar
        title="Haircut + Color"
        meta="$185+ · about 3 hr"
        heldTime="Fri, Oct 16 at 1:00 PM"
        to="/book/london?services=haircut,color"
        label="Book with London"
      />,
    );
    expect(screen.getByText('Haircut + Color')).toBeInTheDocument();
    expect(screen.getByText('$185+ · about 3 hr')).toBeInTheDocument();
    expect(screen.getByText('Fri, Oct 16 at 1:00 PM')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book with London' })).toHaveAttribute(
      'href',
      '/book/london?services=haircut,color',
    );
  });
});

describe('ServiceSummary', () => {
  it('shows the picks as one line and toggles the list it controls', async () => {
    const onToggle = vi.fn();
    render(
      <ServiceSummary
        names="Haircut + Color"
        meta="$185+ · about 3 hr"
        expanded={false}
        onToggle={onToggle}
        controls="list"
      />,
    );
    const button = screen.getByRole('button', { name: 'Change' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'list');
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('says Done while the list is open', () => {
    render(
      <ServiceSummary
        names="Haircut"
        meta="$65+ · about 1 hr"
        expanded
        onToggle={() => undefined}
        controls="list"
      />,
    );
    expect(screen.getByRole('button', { name: 'Done' })).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Notice', () => {
  it('announces a calm explanation politely', () => {
    render(<Notice title="No openings Sat">Here are the soonest times.</Notice>);
    expect(screen.getByRole('status')).toHaveTextContent('No openings Sat');
    expect(screen.getByRole('status')).toHaveTextContent('Here are the soonest times.');
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
    {
      src: '/images/work-1.png',
      alt: 'Platinum balayage',
      caption: 'Icy platinum balayage, long wavy hair',
    },
    { src: '/images/work-2.png', alt: 'Jet black layers', caption: 'Soft layers, long dark hair' },
  ];

  it('shows each photo with its alt text', () => {
    render(<PortfolioGrid photos={photos} />);
    expect(screen.getByAltText('Platinum balayage')).toHaveAttribute('src', '/images/work-1.png');
    expect(screen.getAllByRole('figure')).toHaveLength(2);
  });

  it('puts a caption naming the hair and the service under every photo', () => {
    render(<PortfolioGrid photos={photos} />);
    const first = screen.getAllByRole('figure')[0] as HTMLElement;
    expect(within(first).getByText('Icy platinum balayage, long wavy hair')).toBeInTheDocument();
    expect(screen.getByText('Soft layers, long dark hair')).toBeInTheDocument();
  });

  it('lets the browser pick a size when a photo has several', () => {
    render(
      <PortfolioGrid
        photos={[
          {
            src: '/images/work-1.jpg',
            srcSet: '/images/work-1-640.jpg 640w, /images/work-1.jpg 900w',
            alt: 'Platinum balayage',
            caption: 'Icy platinum balayage, long wavy hair',
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

  it('shows when each review was written, as a month and year', () => {
    render(
      <Reviews
        average={5}
        reviews={[
          { id: '1', name: 'Maren T.', stars: 5, date: '2026-09-30', text: 'Lovely.' },
          { id: '2', name: 'Elise K.', stars: 5, text: 'Saved before dates existed.' },
        ]}
      />,
    );
    const [dated, undated] = screen.getAllByRole('listitem');
    expect(dated).toHaveTextContent('Sep 2026');
    // An old review with no date shows none, rather than "undefined" or a made-up one.
    expect(undated).not.toHaveTextContent(/\d{4}/);
  });

  describe('with dozens of reviews', () => {
    const many = Array.from({ length: 25 }, (_, index) => ({
      id: String(index + 1),
      name: `Client ${index + 1}`,
      stars: 5,
      text: `Review number ${index + 1}.`,
    }));

    it('shows a first page, says how many there are, and offers more', async () => {
      render(<Reviews reviews={many} average={5} />);
      expect(screen.getAllByRole('listitem')).toHaveLength(8);
      expect(screen.getByText('Showing 8 of 25 reviews')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Show 10 more reviews' }));
      expect(screen.getAllByRole('listitem')).toHaveLength(18);

      await userEvent.click(screen.getByRole('button', { name: 'Show 7 more reviews' }));
      expect(screen.getAllByRole('listitem')).toHaveLength(25);
      // Everything is showing, so there is nothing left to ask for.
      expect(screen.queryByRole('button', { name: /more reviews/ })).toBeNull();
    });

    it('keeps the newest first, in the order given', () => {
      render(<Reviews reviews={many} average={5} />);
      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Review number 1.');
    });
  });
});

describe('BookNowBar', () => {
  it('is one large link that starts booking', () => {
    renderWithRouter(<BookNowBar to="/book" />);
    const link = screen.getByRole('link', { name: 'Book Now' });
    expect(link).toHaveAttribute('href', '/book');
    expect(link.className).toMatch(/lg/);
  });

  it('can name the stylist it books with', () => {
    renderWithRouter(<BookNowBar to="/book/london" label="Book Now with London" />);
    expect(screen.getByRole('link', { name: 'Book Now with London' })).toHaveAttribute(
      'href',
      '/book/london',
    );
  });
});

describe('RunningTotal', () => {
  it('shows the estimated price and the time, announced politely', () => {
    render(<RunningTotal price="$185+" duration="about 3 hr" note="Starting price." />);
    const total = screen.getByRole('status');
    expect(total).toHaveTextContent('Estimated total');
    expect(total).toHaveTextContent('$185+');
    expect(total).toHaveTextContent('Total time');
    expect(total).toHaveTextContent('about 3 hr');
    expect(total).toHaveTextContent('Starting price.');
  });
});

describe('LongVisitNotice', () => {
  it('says how long the visit is, calmly and with a way through', () => {
    render(<LongVisitNotice duration="4 hr 30 min" />);
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('That’s a long visit');
    expect(notice).toHaveTextContent('about 4 hr 30 min');
    // No alarm words: it is a heads-up, not a warning.
    expect(notice).not.toHaveTextContent(/warning|hurry|only|limited/i);
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

  it('puts a "Read reviews" link right under the name once there are reviews', () => {
    renderWithRouter(
      <ProfileHeader
        name="London"
        photoUrl={null}
        studio="Hair by London"
        city="Provo"
        average={4.7}
        reviewCount={56}
        reviewsTo="/stylists/london/reviews"
        bio="Lived-in blondes."
      >
        <TabRow>
          <span>tabs</span>
        </TabRow>
      </ProfileHeader>,
    );
    expect(screen.getByRole('link', { name: 'Read reviews' })).toHaveAttribute(
      'href',
      '/stylists/london/reviews',
    );
    expect(screen.getByText(/4\.7 · 56 reviews/)).toBeInTheDocument();
  });
});

describe('ConfirmBar', () => {
  it('shows the summary and total above the action', () => {
    render(
      <ConfirmBar summary="Haircut · Fri, Oct 16" total={{ value: '$65+ · about 1 hr' }}>
        <Button>Continue</Button>
      </ConfirmBar>,
    );
    expect(screen.getByText('Haircut · Fri, Oct 16')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$65+ · about 1 hr')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('can show progress and a price note', () => {
    render(
      <ConfirmBar
        progress={{ label: 'Choose a time', percent: 67 }}
        total={{ label: 'Estimated total', value: '$65+' }}
        note="Starting price."
      >
        <Button>Continue</Button>
      </ConfirmBar>,
    );
    const bar = screen.getByRole('progressbar', { name: 'Booking progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '67');
    expect(bar).toHaveAttribute('aria-valuetext', 'Choose a time');
    expect(screen.getByText('Estimated total')).toBeInTheDocument();
    expect(screen.getByText('Starting price.')).toBeInTheDocument();
  });
});

describe('Hero', () => {
  it('loads the photo from a srcset when it has one', () => {
    const { container } = renderWithRouter(
      <Hero
        imageUrl="/images/home.jpg"
        imageSrcSet="/images/home-640.jpg 640w, /images/home.jpg 900w"
        imageLabel="A stylist holding her shears"
        title="Local Locks"
        tagline="See their work."
        actions={[{ label: 'Book Now', to: '/book' }]}
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
        title="Local Locks"
        tagline="Local stylists you can trust."
        actions={[
          { label: 'Book Now', to: '/book' },
          { label: 'Explore Stylists', to: '/stylists' },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Local Locks' })).toBeInTheDocument();
    expect(screen.getByText('Local stylists you can trust.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book Now' })).toHaveAttribute('href', '/book');
    expect(screen.getByRole('link', { name: 'Explore Stylists' })).toHaveAttribute(
      'href',
      '/stylists',
    );
    expect(
      screen.getByRole('region', { name: 'A stylist holding her shears' }),
    ).toBeInTheDocument();
  });
  it('fills only the primary action, so two buttons never compete', () => {
    renderWithRouter(
      <Hero
        imageUrl="/images/home.jpg"
        imageLabel="A stylist holding her shears"
        title="Local Locks"
        tagline="Local stylists you can trust."
        actions={[
          { label: 'Explore Stylists', to: '/stylists' },
          { label: 'Book Now', to: '/book', variant: 'outline' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Explore Stylists' }).className).toMatch(/primary/);
    expect(screen.getByRole('link', { name: 'Book Now' }).className).toMatch(/outline/);
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
    expect(screen.getByRole('link', { name: 'Local Locks, home' })).toHaveAttribute('href', '/');
  });

  it('shows the wordmark for desktop without changing the home link name', () => {
    renderWithRouter(<NavBar homeTo="/" links={links} />);
    // Visible text from sm up (CSS), hidden from assistive tech so the link is not announced twice.
    expect(screen.getByText('Local Locks')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('link', { name: 'Local Locks, home' })).toBeInTheDocument();
  });
});
