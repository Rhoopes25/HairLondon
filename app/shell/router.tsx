import type { RouteObject } from 'react-router';
import { createBrowserRouter, createHashRouter, createMemoryRouter } from 'react-router';
import { config, routerBasename } from '@app/config';
import type { RouterMode } from '@app/config';

/**
 * Routes are defined once as data. Only the factory below changes with the host:
 * hash routing works on any static host; browser routing needs a server fallback.
 */
export function createAppRouter(
  routes: RouteObject[],
  mode: RouterMode = config.routerMode,
  basename: string = routerBasename(),
) {
  if (mode === 'browser') return createBrowserRouter(routes, { basename });
  return createHashRouter(routes);
}

/** For tests and the dev gallery: no URL involved. */
export function createTestRouter(routes: RouteObject[], initialEntries: string[] = ['/']) {
  return createMemoryRouter(routes, { initialEntries });
}
