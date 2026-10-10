import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@app/test/render';
import {
  Avatar,
  Button,
  Chip,
  Container,
  EmptyNote,
  Icon,
  LinkButton,
  Narrow,
  PageIntro,
  QuietLink,
  RatingLine,
  Recap,
  Section,
  SplitLayout,
  Stars,
  TextButton,
} from '..';

describe('Icon', () => {
  it('is hidden from screen readers unless it stands alone with a label', () => {
    const { container, rerender } = render(<Icon name="scissors" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    rerender(<Icon name="scissors" label="Scissors" />);
    expect(screen.getByRole('img', { name: 'Scissors' })).toBeInTheDocument();
  });
});

describe('Button', () => {
  it('is a real button that fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Continue</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Continue
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('defaults to type=button so it never submits a form by accident', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('renders navigation as links', () => {
    renderWithRouter(
      <>
        <LinkButton to="/stylists">Find a stylist</LinkButton>
        <QuietLink to="/">Back to home</QuietLink>
      </>,
    );
    expect(screen.getByRole('link', { name: 'Find a stylist' })).toHaveAttribute(
      'href',
      '/stylists',
    );
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  });

  it('has a quiet text variant', async () => {
    const onClick = vi.fn();
    render(<TextButton onClick={onClick}>Back</TextButton>);
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('Avatar', () => {
  it('shows initials when there is no photo', () => {
    render(<Avatar name="Sadie Morgan" />);
    expect(screen.getByText('SM')).toBeInTheDocument();
  });

  it('shows a decorative photo when there is one', () => {
    const { container } = render(<Avatar name="London" photoUrl="/images/home.jpg" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', '/images/home.jpg');
    expect(img).toHaveAttribute('alt', '');
  });

  it('offers the smaller photo sizes only when it is given them', () => {
    const { container, rerender } = render(<Avatar name="London" photoUrl="/images/home.jpg" />);
    expect(container.querySelector('img')).not.toHaveAttribute('srcset');
    rerender(
      <Avatar
        name="London"
        photoUrl="/images/home.jpg"
        photoSrcSet="/images/home-640.jpg 640w, /images/home.jpg 900w"
      />,
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('srcset', '/images/home-640.jpg 640w, /images/home.jpg 900w');
    expect(img).toHaveAttribute('sizes');
  });
});

describe('Stars and RatingLine', () => {
  it('speaks the rating', () => {
    render(<Stars stars={4} />);
    expect(screen.getByRole('img', { name: '4 out of 5 stars' })).toBeInTheDocument();
  });

  it('shows the average and count', () => {
    render(<RatingLine average={14 / 3} count={3} />);
    expect(screen.getByText(/4\.7/)).toHaveTextContent('4.7 · 3 reviews');
    expect(screen.getByRole('img', { name: '4.7 out of 5 stars' })).toBeInTheDocument();
  });

  it('says New instead of inventing a rating', () => {
    render(<RatingLine average={null} count={0} />);
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('Chip', () => {
  it('exposes selected state with aria-pressed and toggles on click', async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Chip selected={false} onClick={onClick}>
        Color
      </Chip>,
    );
    const chip = screen.getByRole('button', { name: 'Color' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    expect(onClick).toHaveBeenCalled();
    rerender(
      <Chip selected onClick={onClick}>
        Color
      </Chip>,
    );
    expect(screen.getByRole('button', { name: 'Color' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('layout pieces', () => {
  it('PageIntro renders one h1 and optional text', () => {
    render(<PageIntro title="Find a stylist">Browse their work.</PageIntro>);
    expect(screen.getByRole('heading', { level: 1, name: 'Find a stylist' })).toBeInTheDocument();
    expect(screen.getByText('Browse their work.')).toBeInTheDocument();
  });

  it('Section renders an h2 and its content', () => {
    render(
      <Section title="Choose a day">
        <p>content</p>
      </Section>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Choose a day' })).toBeInTheDocument();
  });

  it('Container and Narrow hold their content and take a class from the caller', () => {
    render(
      <Container className="page">
        <Narrow className="column">
          <p>inside</p>
        </Narrow>
      </Container>,
    );
    const column = screen.getByText('inside').parentElement;
    expect(column).toHaveClass('column');
    expect(column?.parentElement).toHaveClass('page');
  });

  it('Container can be the page main landmark', () => {
    render(
      <Container as="main">
        <p>page</p>
      </Container>,
    );
    expect(screen.getByRole('main')).toHaveTextContent('page');
  });

  it('SplitLayout puts the choices before the panel, so keyboard order matches reading order', () => {
    render(
      <SplitLayout aside={<button type="button">Continue</button>}>
        <button type="button">Choose a time</button>
      </SplitLayout>,
    );
    const [first, second] = screen.getAllByRole('button');
    expect(first).toHaveTextContent('Choose a time');
    expect(second).toHaveTextContent('Continue');
  });

  it('EmptyNote renders its message', () => {
    render(<EmptyNote>Nothing here yet.</EmptyNote>);
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('Recap lists label and value pairs', () => {
    render(
      <Recap
        rows={[
          { label: 'Stylist', value: 'London' },
          { label: 'Total', value: '$65' },
        ]}
      />,
    );
    expect(screen.getByText('Stylist').tagName).toBe('DT');
    expect(screen.getByText('$65').tagName).toBe('DD');
  });
});
