/**
 * Looks at the built app the way a person would: opens every route and overlay at four widths,
 * saves screenshots, and checks the things jsdom cannot (overflow, tap targets, content width).
 *
 *   npm run build && npm run layout
 *   npm run layout -- --out=.layout-shots/before --widths=1280 --only=booking
 *
 * It is a manual tool, not part of `npm test` or CI: it needs a downloaded browser
 * (`npx playwright install chromium`, once). Screenshots go to the git-ignored .layout-shots/.
 */
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const PORT = 4173;

/** Phone, tablet, laptop, large desktop. Heights are typical for each. */
const VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
] as const;

const CONTAINER_MAX = 1200;
const TAP_TARGET_MIN = 44;
/** Tap targets matter on touch devices; below this width the layout is the phone/tablet one. */
const TAP_TARGET_UP_TO = 900;
const WIDE_FROM = 1280;

// ---------- seed data ----------

function localDate(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const appointment = (id: string, date: string) => ({
  id,
  stylistId: 'london',
  serviceIds: ['haircut'],
  date,
  start: 600,
  durationMin: 60,
  total: 65,
  name: 'Sample Client',
  phone: '(555) 010-0100',
  status: 'booked',
});

const UPCOMING_ID = 'apt_layout_upcoming';
const PAST_ID = 'apt_sample_past';

/** The values the app stores in localStorage, so routes that need data have it. */
function storageSeed(options: { noticeDismissed: boolean }): Record<string, string> {
  return {
    'hbl:preferences:v1': JSON.stringify({ noticeDismissed: options.noticeDismissed }),
    'hbl:appointments:v1': JSON.stringify([
      appointment(PAST_ID, localDate(-14)),
      appointment(UPCOMING_ID, localDate(3)),
    ]),
    'hbl:saved:v1': JSON.stringify(['london', 'sadie']),
  };
}

// ---------- scenarios ----------

interface Scenario {
  name: string;
  path: string;
  /** Opens an overlay or walks a flow. Runs after the page has loaded. */
  act?: (page: Page) => Promise<void>;
  noticeDismissed?: boolean;
  /** Overlays are fixed to the window, so a viewport shot shows them; pages get the full height. */
  overlay?: boolean;
}

async function pickServiceDayAndTime(page: Page) {
  await page.locator('label').first().click();
  await page.locator('button[aria-pressed]').first().click();
  await page
    .locator('button[aria-pressed]:not([disabled])')
    .filter({ hasText: /AM|PM/ })
    .first()
    .click();
}

async function continueTo(page: Page, button: string) {
  await page.getByRole('button', { name: button }).click();
  await page.waitForLoadState('networkidle');
}

async function fillDetails(page: Page) {
  await page.getByLabel('Name').fill('Jane Client');
  await page.getByLabel('Phone').fill('(555) 010-0199');
}

const SCENARIOS: Scenario[] = [
  { name: 'home', path: '/' },
  { name: 'stylists', path: '/stylists' },
  { name: 'profile-portfolio', path: '/stylists/london' },
  { name: 'profile-services', path: '/stylists/london/services' },
  { name: 'profile-reviews', path: '/stylists/london/reviews' },
  { name: 'photo-viewer', path: '/stylists/london/photos/1' },
  { name: 'about-studio', path: '/stylists/london/about' },
  { name: 'saved', path: '/saved' },
  { name: 'appointments', path: '/appointments' },
  { name: 'appointment-upcoming', path: `/appointments/${UPCOMING_ID}` },
  { name: 'appointment-past', path: `/appointments/${PAST_ID}` },
  { name: 'reschedule', path: `/appointments/${UPCOMING_ID}/reschedule` },
  { name: 'leave-review', path: `/appointments/${PAST_ID}/review` },
  { name: 'help', path: '/help' },
  { name: 'design-library', path: '/design-library' },
  { name: 'not-found', path: '/no-such-page' },
  { name: 'booking-choose', path: '/book/london' },
  {
    name: 'booking-choose-filled',
    path: '/book/london',
    act: pickServiceDayAndTime,
  },
  {
    name: 'booking-details',
    path: '/book/london',
    act: async (page) => {
      await pickServiceDayAndTime(page);
      await continueTo(page, 'Continue');
    },
  },
  {
    name: 'booking-review',
    path: '/book/london',
    act: async (page) => {
      await pickServiceDayAndTime(page);
      await continueTo(page, 'Continue');
      await fillDetails(page);
      await continueTo(page, 'Continue');
    },
  },
  {
    name: 'booking-done',
    path: '/book/london',
    act: async (page) => {
      await pickServiceDayAndTime(page);
      await continueTo(page, 'Continue');
      await fillDetails(page);
      await continueTo(page, 'Continue');
      await continueTo(page, 'Confirm booking');
    },
  },
  // Overlays count as screens.
  { name: 'overlay-notice', path: '/', noticeDismissed: false, overlay: true },
  {
    name: 'overlay-day-filter',
    path: '/stylists',
    overlay: true,
    act: async (page) => {
      await page.getByRole('button', { name: /Which day can you come/ }).click();
    },
  },
  {
    name: 'overlay-service-detail',
    path: '/stylists/london/services',
    overlay: true,
    act: async (page) => {
      await page
        .getByRole('button', { name: /More about/ })
        .first()
        .click();
    },
  },
  {
    name: 'overlay-cancel-appointment',
    path: `/appointments/${UPCOMING_ID}`,
    overlay: true,
    act: async (page) => {
      await page.getByRole('button', { name: 'Cancel appointment' }).click();
    },
  },
  {
    name: 'overlay-calendar-saved',
    path: `/appointments/${UPCOMING_ID}`,
    overlay: true,
    act: async (page) => {
      await page.getByRole('button', { name: 'Add to calendar' }).click();
    },
  },
  {
    name: 'overlay-leave-booking',
    path: '/book/london',
    overlay: true,
    act: async (page) => {
      await page.locator('label').first().click();
      await page.getByRole('link', { name: 'Exit booking' }).click();
    },
  },
  {
    name: 'overlay-sample-reminder',
    path: '/book/london',
    overlay: true,
    act: async (page) => {
      await pickServiceDayAndTime(page);
      await continueTo(page, 'Continue');
      await fillDetails(page);
      await page.getByRole('button', { name: 'See a sample reminder' }).click();
    },
  },
];

// ---------- checks (run inside the page, so they are source strings: this tooling has no DOM types) ----------

const OVERFLOW_SCRIPT = `(() => {
  const width = window.innerWidth;
  const wide = [...document.querySelectorAll('body *')]
    .filter((el) => el.checkVisibility() && el.getBoundingClientRect().right > width + 1)
    .slice(0, 4)
    .map((el) => el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]);
  return { scrollWidth: document.documentElement.scrollWidth, width, wide };
})()`;

const TAP_TARGETS_SCRIPT = `(() => {
  const selector = 'a[href], button, input:not([type=hidden]), select, textarea, [role=tab]';
  const small = [];
  for (const el of document.querySelectorAll(selector)) {
    if (!el.checkVisibility()) continue;
    // A radio or checkbox inside a label is tapped through the label, so the label is the target.
    const box = (el.tagName === 'INPUT' && el.closest('label') || el).getBoundingClientRect();
    // A visually hidden real checkbox: its label is the target.
    if (box.width <= 2 || box.height <= 2) continue;
    // Links inside running text are exempt (WCAG 2.5.8).
    if (el.tagName === 'A' && el.closest('p, li') && getComputedStyle(el).display === 'inline') continue;
    if (box.height < ${TAP_TARGET_MIN} - 0.5) {
      const label = el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || '';
      small.push(el.tagName.toLowerCase() + ' "' + label.trim().slice(0, 32) + '" ' + Math.round(box.height) + 'px');
    }
  }
  return small;
})()`;

const CONTENT_WIDTH_SCRIPT = `(() => {
  const main = document.querySelector('main');
  if (!main) return null;
  // Header bands inside main (booking) are full width on purpose; measure the page content.
  const blocks = [...main.children].filter((el) => el.tagName !== 'HEADER' && el.getBoundingClientRect().height > 0);
  if (blocks.length === 0) return null;
  const left = Math.min(...blocks.map((el) => el.getBoundingClientRect().left));
  const right = Math.max(...blocks.map((el) => el.getBoundingClientRect().right));
  return { width: right - left, left, right: window.innerWidth - right };
})()`;

const SETTLE_SCRIPT = `Promise.race([
  Promise.all([
    document.fonts.ready,
    ...[...document.images].map((img) => img.decode().catch(() => undefined)),
  ]),
  new Promise((done) => setTimeout(done, 4000)),
])`;

interface OverflowResult {
  scrollWidth: number;
  width: number;
  wide: string[];
}
interface ContentWidth {
  width: number;
  left: number;
  right: number;
}

// ---------- runner ----------

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

async function waitForServer(url: string, child: ChildProcess) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error('vite preview exited. Run `npm run build` first.');
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((done) => setTimeout(done, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startPreview(): ChildProcess {
  return spawn(
    process.execPath,
    [
      join(root, 'node_modules', 'vite', 'bin', 'vite.js'),
      'preview',
      '--port',
      String(PORT),
      '--strictPort',
    ],
    { cwd: root, stdio: 'ignore' },
  );
}

interface Failure {
  scenario: string;
  width: number;
  problem: string;
}

async function checkScenario(
  browser: Browser,
  baseUrl: string,
  scenario: Scenario,
  viewport: { width: number; height: number },
  outDir: string,
): Promise<Failure[]> {
  const failures: Failure[] = [];
  const fail = (problem: string) =>
    failures.push({ scenario: scenario.name, width: viewport.width, problem });

  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const seed = storageSeed({ noticeDismissed: scenario.noticeDismissed ?? true });
  // Seed once per page load, so the flow can write (a booking) without being reset by a re-run.
  await context.addInitScript(`(() => {
    if (sessionStorage.getItem('layout-seeded')) return;
    for (const [key, value] of Object.entries(${JSON.stringify(seed)})) localStorage.setItem(key, value);
    sessionStorage.setItem('layout-seeded', '1');
  })()`);

  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  try {
    await page.goto(`${baseUrl}/#${scenario.path}`);
    await page.waitForSelector('main');
    await page.waitForLoadState('networkidle');
    if (scenario.act) await scenario.act(page);
    await page.waitForLoadState('networkidle');
    await page.evaluate(SETTLE_SCRIPT);
    // A route change re-renders after the network goes quiet; measure the page it ends on.
    await page.waitForTimeout(300);

    mkdirSync(join(outDir, String(viewport.width)), { recursive: true });
    await page.screenshot({
      path: join(outDir, String(viewport.width), `${scenario.name}.png`),
      fullPage: !scenario.overlay,
      animations: 'disabled',
    });

    const overflow = (await page.evaluate(OVERFLOW_SCRIPT)) as OverflowResult;
    if (overflow.scrollWidth > overflow.width) {
      fail(
        `sideways scroll: page is ${overflow.scrollWidth}px in a ${overflow.width}px window (${overflow.wide.join(', ')})`,
      );
    }

    if (viewport.width <= TAP_TARGET_UP_TO) {
      const small = (await page.evaluate(TAP_TARGETS_SCRIPT)) as string[];
      for (const item of small) fail(`tap target under ${TAP_TARGET_MIN}px: ${item}`);
    }

    if (viewport.width >= WIDE_FROM) {
      const content = (await page.evaluate(CONTENT_WIDTH_SCRIPT)) as ContentWidth | null;
      if (content && content.width > CONTAINER_MAX + 1) {
        fail(
          `content is ${Math.round(content.width)}px wide, over the ${CONTAINER_MAX}px container`,
        );
      }
      if (content && Math.abs(content.left - content.right) > 2) {
        fail(
          `content is not centered (${Math.round(content.left)}px left, ${Math.round(content.right)}px right)`,
        );
      }
    }
  } catch (error) {
    fail(
      `could not capture: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`,
    );
  } finally {
    await context.close();
  }
  return failures;
}

async function main() {
  const outDir = resolve(root, option('out') ?? '.layout-shots');
  const widths = option('widths')?.split(',').map(Number);
  const only = option('only');
  // Any width can be asked for (e.g. 899 and 900, either side of a breakpoint); the four standard
  // ones use their usual height.
  const viewports = widths
    ? widths.map((width) => VIEWPORTS.find((v) => v.width === width) ?? { width, height: 900 })
    : VIEWPORTS;
  const scenarios = SCENARIOS.filter((s) => !only || s.name.includes(only));

  const external = option('url');
  const server = external ? null : startPreview();
  const baseUrl = external ?? `http://localhost:${PORT}`;
  const browser = await chromium.launch();
  const failures: Failure[] = [];
  try {
    if (server) await waitForServer(baseUrl, server);
    for (const scenario of scenarios) {
      for (const viewport of viewports) {
        failures.push(...(await checkScenario(browser, baseUrl, scenario, viewport, outDir)));
      }
      console.log(`checked ${scenario.name}`);
    }
  } finally {
    await browser.close();
    server?.kill();
  }

  const total = scenarios.length * viewports.length;
  console.log(`\n${total} screenshots in ${outDir}`);
  if (failures.length === 0) {
    console.log('No layout problems found.');
    return;
  }
  console.log(`\n${failures.length} problem(s):`);
  for (const f of failures) console.log(`  ${f.scenario} @ ${f.width}px: ${f.problem}`);
  process.exitCode = 1;
}

await main();
