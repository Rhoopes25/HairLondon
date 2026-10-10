import { describe, expect, it } from 'vitest';
import { createAppRouter } from './router';

const routes = [{ path: '/stylists', element: null }];

function matchedPath(router: ReturnType<typeof createAppRouter>) {
  return router.state.matches.at(-1)?.route.path;
}

describe('createAppRouter', () => {
  it('builds a hash router that reads the route from the hash', () => {
    window.location.hash = '#/stylists';
    const router = createAppRouter(routes, 'hash');
    expect(matchedPath(router)).toBe('/stylists');
    router.dispose();
  });

  it('builds a browser router that strips the base path before matching', () => {
    window.history.replaceState(null, '', '/HairLondon/stylists');
    const router = createAppRouter(routes, 'browser', '/HairLondon');
    expect(matchedPath(router)).toBe('/stylists');
    router.dispose();
  });

  it('does not match when the browser path is outside the base', () => {
    window.history.replaceState(null, '', '/Elsewhere/stylists');
    const router = createAppRouter(routes, 'browser', '/HairLondon');
    expect(router.state.errors).not.toBeNull();
    expect(Object.values(router.state.errors ?? {})[0]).toMatchObject({ status: 404 });
    router.dispose();
    window.history.replaceState(null, '', '/');
  });
});
