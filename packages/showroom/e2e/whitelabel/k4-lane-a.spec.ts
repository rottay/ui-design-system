import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K4 Lane A (feedback/overlay) whitelabel evidence.
//
// Families: Toast, Notification, Dropdown, ContextMenu, HoverCard, Tour.
// Route: /probe/k4-lane-a (source × locale × density × state × theme cells).
//
// Blocks:
//   1. axe matrix: 2 governed sources × (rest, error) — serious/critical fail.
//   2. interactive overlays on bithire-static/en/comfortable/rest:
//      dropdown open/item-hover/escape, contextmenu open, hovercard hover,
//      tour surface, notification live trigger.
//   3. keyboard evidence: dropdown trigger Enter opens, Escape closes.
//   4. capture matrix (review artifacts, NOT baselines): source × locale ×
//      density at 1280 + state cells + 390 RTL spots, landing in
//      test-artifacts/rottay-design-platform/K4/k4-lane-a/captures/.
// ---------------------------------------------------------------------------

type Source = 'bithire-static' | 'themanagement-db';
type Locale = 'en' | 'es' | 'ar';
type Density = 'compact' | 'comfortable' | 'spacious';
type State = 'rest' | 'loading' | 'error';

const ROUTE = '/probe/k4-lane-a';
const WITNESS = 'k4a-toast';
const ROOT_TESTID = 'k4a-root';

const SOURCES: readonly Source[] = ['bithire-static', 'themanagement-db'];
const LOCALES: readonly Locale[] = ['en', 'es', 'ar'];
const DENSITIES: readonly Density[] = ['compact', 'comfortable', 'spacious'];
const STATES: readonly State[] = ['loading', 'error'];
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

function repoRoot(): string {
  let dir = test.info().project.testDir;
  while (!existsSync(join(dir, 'pnpm-workspace.yaml'))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error('pnpm-workspace.yaml not found above testDir');
    dir = parent;
  }
  return dir;
}

const artifactDir = (): string =>
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K4', 'k4-lane-a');

const capturesDir = (): string => join(artifactDir(), 'captures');

const axeReportPath = (): string => join(artifactDir(), 'k4-lane-a-axe-report.json');

function cellUrl(source: Source, locale: Locale, density: Density, state: State): string {
  return `${ROUTE}?source=${source}&locale=${locale}&density=${density}&state=${state}`;
}

/** The deterministic render witness: lane testid + compiled theme + fonts. */
async function gotoCell(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.getByTestId(WITNESS).waitFor({ timeout: 30_000 });
  await page.waitForFunction(
    () =>
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--ds-color-primary')
        .trim().length > 0,
    undefined,
    { timeout: 20_000 },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

// ---------------------------------------------------------------------------
// 1. Axe matrix.
// ---------------------------------------------------------------------------

function normalizeTarget(target: string): string {
  return target.replace(/_[Rr]_[a-z0-9]+_/g, '_id_');
}

interface ViolationEntry {
  rule: string;
  impact: string;
  help: string;
  targets: string[];
}

interface CellReport {
  source: Source;
  state: State;
  url: string;
  blockingCount: number;
  blocking: ViolationEntry[];
  nonBlockingCount: number;
  nonBlocking: ViolationEntry[];
}

interface AxeReport {
  generatedAt: string;
  blockingImpacts: string[];
  cells: Record<string, CellReport>;
}

function persistCell(cellKey: string, cell: CellReport): void {
  mkdirSync(artifactDir(), { recursive: true });
  const onDisk: AxeReport = existsSync(axeReportPath())
    ? (JSON.parse(readFileSync(axeReportPath(), 'utf8')) as AxeReport)
    : { generatedAt: '', blockingImpacts: [...BLOCKING_IMPACTS], cells: {} };
  const cells = { ...onDisk.cells, [cellKey]: cell };
  const ordered: Record<string, CellReport> = {};
  for (const key of Object.keys(cells).sort()) ordered[key] = cells[key];
  const next: AxeReport = {
    generatedAt: new Date().toISOString(),
    blockingImpacts: [...BLOCKING_IMPACTS],
    cells: ordered,
  };
  writeFileSync(axeReportPath(), `${JSON.stringify(next, null, 2)}\n`);
}

function collectViolations(
  results: Awaited<ReturnType<AxeBuilder['analyze']>>,
  impacts: ReadonlySet<string>,
): ViolationEntry[] {
  const entries: ViolationEntry[] = [];
  for (const violation of results.violations) {
    if (!impacts.has(violation.impact ?? '')) continue;
    entries.push({
      rule: violation.id,
      impact: violation.impact ?? 'unknown',
      help: violation.help,
      targets: violation.nodes.map((node) =>
        normalizeTarget(
          (Array.isArray(node.target) ? node.target.join(' ') : String(node.target)).trim(),
        ),
      ),
    });
  }
  return entries;
}

function formatViolations(entries: readonly ViolationEntry[]): string {
  return entries
    .map(
      (entry) =>
        `  ${entry.impact.toUpperCase()} ${entry.rule} — ${entry.help}\n` +
        entry.targets.map((target) => `    ${target}`).join('\n'),
    )
    .join('\n');
}

for (const source of SOURCES) {
  for (const state of ['rest', 'error'] as const) {
    test(`axe k4-lane-a × ${source} × ${state}: zero serious/critical violations`, async ({
      page,
    }) => {
      const url = cellUrl(source, 'en', 'comfortable', state);
      await gotoCell(page, url);

      const results = await new AxeBuilder({ page }).analyze();
      const blocking = collectViolations(results, BLOCKING_IMPACTS);
      const nonBlocking = collectViolations(results, new Set(['minor', 'moderate']));

      persistCell(`${source}/${state}`, {
        source,
        state,
        url,
        blockingCount: blocking.length,
        blocking,
        nonBlockingCount: nonBlocking.length,
        nonBlocking,
      });

      if (nonBlocking.length > 0) {
        console.log(
          `k4-lane-a/${source}/${state}: ${nonBlocking.length} minor/moderate axe finding(s) ` +
            `collected in ${axeReportPath()}:\n${formatViolations(nonBlocking)}`,
        );
      }

      expect(
        blocking,
        `k4-lane-a/${source}/${state} has serious/critical axe violations:\n${formatViolations(blocking)}`,
      ).toEqual([]);
    });
  }
}

// ---------------------------------------------------------------------------
// 2. Interactive overlays.
// ---------------------------------------------------------------------------

const DROPDOWN_TRIGGER = '[data-testid="k4a-dropdown-start"] button';
const CONTEXTMENU_AREA = '[data-testid="k4a-contextmenu"]';
const HOVERCARD_TRIGGER = '[data-testid="k4a-hovercard-start"] button, [data-testid="k4a-hovercard-start"] a, [data-testid="k4a-hovercard-start"] [data-part="trigger"]';
const TOUR_SURFACE = '[data-part="surface"], .rottay-tour--modern';
const NOTIFICATION_LIVE = '[data-testid="k4a-notification-live"] button';

test('k4-lane-a: interactive overlays open and respond', async ({ page }) => {
  test.setTimeout(240_000);
  mkdirSync(capturesDir(), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  await gotoCell(page, cellUrl('bithire-static', 'en', 'comfortable', 'rest'));

  await test.step('dropdown: click opens a menu surface, Escape closes it', async () => {
    const trigger = page.locator(DROPDOWN_TRIGGER).first();
    await trigger.click();
    const menu = page.locator('[role="menu"]').first();
    await menu.waitFor({ timeout: 10_000 });
    await page.screenshot({ path: join(capturesDir(), 'k4a-dropdown-open.png') });
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden({ timeout: 10_000 });
  });

  await test.step('dropdown: keyboard Enter opens the menu', async () => {
    const trigger = page.locator(DROPDOWN_TRIGGER).first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    const menu = page.locator('[role="menu"]').first();
    await menu.waitFor({ timeout: 10_000 });
    await page.keyboard.press('Escape');
  });

  await test.step('contextmenu: right-click opens the panel', async () => {
    const area = page.locator(CONTEXTMENU_AREA).first();
    await area.click({ button: 'right' });
    const menu = page.locator('[role="menu"]').first();
    await menu.waitFor({ timeout: 10_000 });
    await page.screenshot({ path: join(capturesDir(), 'k4a-contextmenu-open.png') });
    await page.keyboard.press('Escape');
  });

  await test.step('hovercard: hover reveals the card', async () => {
    const trigger = page.locator(HOVERCARD_TRIGGER).first();
    await trigger.hover();
    // HoverCard open delay is governed; poll for any floating card content.
    const card = page.locator('.rottay-hover-card--modern, [data-part="card"]').first();
    await card.waitFor({ timeout: 10_000 });
    await page.screenshot({ path: join(capturesDir(), 'k4a-hovercard-open.png') });
  });

  await test.step('tour: surface and navigation render', async () => {
    const surface = page.locator(TOUR_SURFACE).first();
    await surface.waitFor({ timeout: 10_000 });
    await page.screenshot({ path: join(capturesDir(), 'k4a-tour-surface.png') });
  });

  await test.step('notification: live trigger adds an item', async () => {
    const before = await page.locator('[data-part="item"], .rottay-notification--modern').count();
    const trigger = page.locator(NOTIFICATION_LIVE).first();
    await trigger.click();
    await expect
      .poll(() => page.locator('[data-part="item"], .rottay-notification--modern').count())
      .toBeGreaterThan(before);
    await page.screenshot({ path: join(capturesDir(), 'k4a-notification-live.png') });
  });
});

// ---------------------------------------------------------------------------
// 3. Capture matrix (review artifacts, NOT baselines).
// ---------------------------------------------------------------------------

test('k4-lane-a: full source × locale × density capture sweep', async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  mkdirSync(capturesDir(), { recursive: true });

  for (const source of SOURCES) {
    for (const locale of LOCALES) {
      for (const density of DENSITIES) {
        await gotoCell(page, cellUrl(source, locale, density, 'rest'));
        if (locale === 'ar') {
          const dir = await page.evaluate(() => document.dir);
          expect(dir).toBe('rtl');
        }
        await expectNoHorizontalOverflow(page);
        await page.screenshot({
          path: join(capturesDir(), `k4-lane-a-${source}-${locale}-${density}-rest-1280.png`),
          fullPage: true,
        });
      }
    }
  }
});

test('k4-lane-a: state cells per source', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  mkdirSync(capturesDir(), { recursive: true });

  for (const source of SOURCES) {
    for (const state of STATES) {
      await gotoCell(page, cellUrl(source, 'en', 'comfortable', state));
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: join(capturesDir(), `k4-lane-a-${source}-en-comfortable-${state}-1280.png`),
        fullPage: true,
      });
    }
  }
});

test('k4-lane-a: mobile + RTL spot cells', async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(capturesDir(), { recursive: true });

  for (const source of SOURCES) {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCell(page, cellUrl(source, 'ar', 'compact', 'rest'));
    const dir = await page.evaluate(() => document.dir);
    expect(dir).toBe('rtl');
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: join(capturesDir(), `k4-lane-a-${source}-ar-compact-rest-390.png`),
      fullPage: true,
    });
  }
});
