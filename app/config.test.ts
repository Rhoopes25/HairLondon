import { describe, expect, it } from 'vitest';
import { assetUrl, createConfig, photoSrcSet, routerBasename } from './config';

describe('createConfig', () => {
  it('defaults to hash routing at the root', () => {
    expect(createConfig({})).toEqual({ base: '/', routerMode: 'hash', apiUrl: null });
  });

  it('reads the router mode and api url', () => {
    const config = createConfig({
      VITE_ROUTER_MODE: 'browser',
      VITE_API_URL: 'https://api.example.com',
    });
    expect(config.routerMode).toBe('browser');
    expect(config.apiUrl).toBe('https://api.example.com');
  });

  it('rejects an unknown router mode', () => {
    expect(() => createConfig({ VITE_ROUTER_MODE: 'memory' })).toThrow(/VITE_ROUTER_MODE/);
  });

  it('normalizes the base path', () => {
    expect(createConfig({ BASE_URL: 'HairLondon' }).base).toBe('/HairLondon/');
    expect(createConfig({ BASE_URL: '/HairLondon' }).base).toBe('/HairLondon/');
    expect(createConfig({ BASE_URL: '' }).base).toBe('/');
  });
});

describe('assetUrl', () => {
  it('prefixes the deployed base', () => {
    expect(assetUrl('images/home.jpg', '/HairLondon/')).toBe('/HairLondon/images/home.jpg');
    expect(assetUrl('/images/home.jpg', '/')).toBe('/images/home.jpg');
  });
});

describe('photoSrcSet', () => {
  it('lists the three widths of a photo, each with its own width descriptor', () => {
    expect(photoSrcSet('images/work-1.jpg', '/')).toBe(
      '/images/work-1-640.jpg 640w, /images/work-1.jpg 900w, /images/work-1-1160.jpg 1160w',
    );
  });

  it('keeps the deployed base path on every variant', () => {
    const urls = photoSrcSet('images/home.jpg', '/HairLondon/')
      .split(', ')
      .map((entry) => entry.split(' ')[0]);
    expect(urls).toHaveLength(3);
    for (const url of urls) expect(url).toMatch(/^\/HairLondon\/images\/home/);
  });
});

describe('routerBasename', () => {
  it('drops the trailing slash and is empty at the root', () => {
    expect(routerBasename('/HairLondon/')).toBe('/HairLondon');
    expect(routerBasename('/')).toBe('');
  });
});
