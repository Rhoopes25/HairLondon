import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { fixedClock } from '@src/domain/clock';
import { MemoryStorageAdapter } from '@src/data/storage/memory-storage-adapter';
import type { StorageAdapter } from '@src/data/storage/storage-adapter';
import { createServices } from '@app/services';
import { AppProviders } from '@app/shell/providers';
import { routes } from '@app/shell/routes';

/** Wednesday, October 7, 2026, 8:00 AM local. */
export const TEST_NOW = new Date(2026, 9, 7, 8, 0);

export interface RenderAppOptions {
  now?: Date;
  /** Share one storage between renders to simulate coming back later. */
  storage?: StorageAdapter;
  /** Leave the early-prototype notice open, as on a first visit. */
  showNotice?: boolean;
}

/**
 * Renders the real app (real routes, real pages) with an in-memory store and a fixed clock.
 * This is how the integration tests exercise whole flows the way a person would.
 */
export function renderApp(route = '/', options: RenderAppOptions = {}) {
  const storage = options.storage ?? new MemoryStorageAdapter();
  const services = createServices(storage, fixedClock(options.now ?? TEST_NOW));
  if (!options.showNotice) services.preferences.dismissNotice();

  const router = createMemoryRouter(routes, { initialEntries: [route] });
  const user = userEvent.setup();
  const utils = render(
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { ...utils, services, router, user, storage };
}
