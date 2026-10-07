/**
 * The only file allowed to read import.meta.env (enforced by lint).
 * Everything host-specific (base path, router mode, API url) comes through here,
 * so changing hosts is a configuration change, never a code change.
 */

export type RouterMode = 'hash' | 'browser';

export interface AppConfig {
  /** Public path the app is served from. Always starts and ends with "/". */
  readonly base: string;
  readonly routerMode: RouterMode;
  /** Unused until a real backend exists. */
  readonly apiUrl: string | null;
}

type Env = Readonly<Record<string, string | boolean | undefined>>;

function parseRouterMode(value: unknown): RouterMode {
  if (value === undefined || value === '') return 'hash';
  if (value === 'hash' || value === 'browser') return value;
  throw new Error(`VITE_ROUTER_MODE must be "hash" or "browser", received "${String(value)}"`);
}

function normalizeBase(value: unknown): string {
  const raw = typeof value === 'string' && value.trim() !== '' ? value.trim() : '/';
  const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

/** Pure so it can be tested with any environment. */
export function createConfig(env: Env): AppConfig {
  const apiUrl = env.VITE_API_URL;
  return {
    base: normalizeBase(env.BASE_URL),
    routerMode: parseRouterMode(env.VITE_ROUTER_MODE),
    apiUrl: typeof apiUrl === 'string' && apiUrl !== '' ? apiUrl : null,
  };
}

export const config: AppConfig = createConfig(import.meta.env);

/** Builds a URL for a file in app/public, honoring the deployed base path. */
export function assetUrl(path: string, base: string = config.base): string {
  return `${base}${path.replace(/^\/+/, '')}`;
}

/** React Router basename: the base without its trailing slash ("" for the root). */
export function routerBasename(base: string = config.base): string {
  return base === '/' ? '' : base.replace(/\/$/, '');
}
