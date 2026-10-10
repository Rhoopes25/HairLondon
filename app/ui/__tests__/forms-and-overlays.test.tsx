import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog, Modal, ServiceOption, Sheet, Tabs, TextField } from '..';

describe('TextField', () => {
  it('connects label, hint, and input', () => {
    render(<TextField label="Phone" hint="For a reminder text." />);
    const input = screen.getByLabelText('Phone');
    expect(input).toHaveAccessibleDescription('For a reminder text.');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('marks the field invalid and announces the error', () => {
    render(<TextField label="Name" error="Enter your name." />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your name.');
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Enter your name.');
  });

  it('passes input props through', async () => {
    const onChange = vi.fn();
    render(<TextField label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Mo');
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

describe('ServiceOption', () => {
  it('is a checkbox named by its label that reports changes', async () => {
    const onChange = vi.fn();
    render(
      <ServiceOption
        name="Haircut"
        description="Wash, cut, style."
        meta="1 hr · $65"
        checked={false}
        onChange={onChange}
      />,
    );
    const box = screen.getByRole('checkbox', { name: /Haircut/ });
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reflects checked', () => {
    render(
      <ServiceOption name="Color" description="d" meta="m" checked onChange={() => undefined} />,
    );
    expect(screen.getByRole('checkbox', { name: /Color/ })).toBeChecked();
  });
});

function TabsDemo() {
  const [value, setValue] = useState('portfolio');
  return (
    <Tabs value={value} onValueChange={setValue}>
      <Tabs.List label="Profile sections">
        <Tabs.Tab value="portfolio">Portfolio</Tabs.Tab>
        <Tabs.Tab value="services">Services</Tabs.Tab>
        <Tabs.Tab value="reviews">Reviews</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="portfolio">Photos here</Tabs.Panel>
      <Tabs.Panel value="services">Services here</Tabs.Panel>
      <Tabs.Panel value="reviews">Reviews here</Tabs.Panel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('shows only the selected panel and marks the selected tab', () => {
    render(<TabsDemo />);
    expect(screen.getByRole('tab', { name: 'Portfolio' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Photos here')).toBeVisible();
    expect(screen.queryByText('Services here')).not.toBeInTheDocument();
  });

  it('switches on click and links tab to panel', async () => {
    render(<TabsDemo />);
    await userEvent.click(screen.getByRole('tab', { name: 'Services' }));
    expect(screen.getByRole('tabpanel', { name: 'Services' })).toHaveTextContent('Services here');
  });

  it('moves with arrow keys, wrapping at the ends, and uses a roving tabindex', async () => {
    render(<TabsDemo />);
    screen.getByRole('tab', { name: 'Portfolio' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Services' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Services' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Portfolio' })).toHaveAttribute('tabindex', '-1');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Reviews' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Portfolio' })).toHaveFocus();
  });
});

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(
      <Modal open={false} onClose={() => undefined} title="Early prototype">
        body
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is a labelled modal dialog', () => {
    render(
      <Modal open onClose={() => undefined} title="Early prototype">
        This is a draft.
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Early prototype' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveTextContent('This is a draft.');
  });

  it('closes on Escape and on the close button', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="T">
        body
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('cannot be dismissed when dismissible is false', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="T" dismissible={false}>
        body
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('moves focus in, keeps Tab inside, and returns focus when closed', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title="T"
            footer={<button type="button">Got it</button>}
          >
            body
          </Modal>
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(opener);

    const close = screen.getByRole('button', { name: 'Close' });
    const gotIt = screen.getByRole('button', { name: 'Got it' });
    expect(close).toHaveFocus();
    await userEvent.tab();
    expect(gotIt).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus(); // wrapped, did not escape to the page behind
    await userEvent.tab({ shift: true });
    expect(gotIt).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(opener).toHaveFocus();
  });

  it('locks page scroll while open and restores it after', () => {
    const { rerender } = render(
      <Modal open onClose={() => undefined} title="T">
        body
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Modal open={false} onClose={() => undefined} title="T">
        body
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('has a bottom-sheet form', () => {
    render(
      <Sheet open onClose={() => undefined} title="Filter">
        body
      </Sheet>,
    );
    expect(screen.getByRole('dialog', { name: 'Filter' })).toBeInTheDocument();
  });
});

describe('ConfirmDialog', () => {
  it('confirms or cancels', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Leave booking?"
        message="Your choices won't be saved."
        confirmLabel="Leave"
        cancelLabel="Keep booking"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'Leave booking?' })).toHaveTextContent(
      "Your choices won't be saved.",
    );
    await userEvent.click(screen.getByRole('button', { name: 'Leave' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keep booking' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
