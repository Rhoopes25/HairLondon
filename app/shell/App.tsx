import { useState } from 'react';
import { RouterProvider } from 'react-router/dom';
import { createBrowserStorage } from '@app/adapters/local-storage-adapter';
import { createServices } from '@app/services';
import { systemClock } from '@src/domain/clock';
import { AppProviders } from './providers';
import { createAppRouter } from './router';
import { routes } from './routes';

export function App() {
  // Created once per page load. Tests build their own with in-memory storage and a fixed clock.
  const [services] = useState(() => createServices(createBrowserStorage(), systemClock));
  const [router] = useState(() => createAppRouter(routes));

  return (
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
