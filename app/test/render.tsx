import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

/** Renders a component inside a router, for anything that contains links. */
export function renderWithRouter(ui: ReactElement, initialEntries: string[] = ['/']): RenderResult {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}
