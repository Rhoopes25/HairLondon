import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));

export const aliases = {
  '@app': fileURLToPath(new URL('./app', import.meta.url)),
  '@src': fileURLToPath(new URL('./src', import.meta.url)),
};

/** Always ends with a slash, so asset and router base paths compose predictably. */
function normalizeBase(base: string | undefined): string {
  const value = base && base.trim() !== '' ? base.trim() : '/';
  const withLeading = value.startsWith('/') ? value : `/${value}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, 'VITE_');
  return {
    root: 'app',
    envDir: repoRoot,
    base: normalizeBase(env.VITE_BASE),
    plugins: [react()],
    resolve: { alias: aliases },
    build: { outDir: '../dist', emptyOutDir: true },
  };
});
