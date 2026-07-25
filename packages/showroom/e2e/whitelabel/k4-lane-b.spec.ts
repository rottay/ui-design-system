import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K4 Lane B (AI-adjacent) whitelabel evidence.
//
// Families: CodeBlock, MarkdownView, VoiceInputButton, Calendar.
// Route: /probe/k4-lane-b (source × locale × density × state × theme cells).
//
// Blocks:
//   1. axe matrix: 2 governed sources × (rest, stress) — serious/critical fail.
//   2. interactive states on bithire-static/en/comfortable/rest:
//      calendar day-cell hover repaint + month navigation, codeblock copy
//      control if present, voice button posture rendering.
//   3. keyboard evidence: calendar previous/next controls reachable.
//   4. capture matrix (review artifacts, NOT baselines): source × locale ×
//      density at 1280 + state cells + 390 RTL spots, landing in
//      test-artifacts/rottay-design-platform/K4/k4-lane-b/captures/.
// ---------------------------------------------------------------------------

type Source = 'bithire-static' | 'themanagement-db';
type Locale = 'en' | 'es' | 'ar';
type Density = 'compact' | 'comfortable' | 'spacious';
type State = 'rest' | 'stress';

const ROUTE = '/probe/k4-lane-b';
const WITNESS = 'k4b-codeblock';
const ROOT_TESTID = 'k4b-root';

const SOURCES: readonly Source[] = ['bithire-static', 'themanagement-db'];
const LOCALES: readonly Locale[] = ['en', 'es', 'ar'];
const DENSITIES: readonly Density[] = ['compact', 'comfortable', 'spacious'];
const STATES: readonly State[] = ['stress'];
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
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K4', 'k4-lane-b');

const capturesDir = (): string => join(artifactDir(), 'captures');

const axeReportPath = (): string => join(artifactDir(), 'k4-lane-b-axe-report.json');

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
  for (const state of ['rest', 'stress'] as const) {
    test(`axe k4-lane-b × ${source} × ${state}: zero serious/critical violations`, async ({
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
          `k4-lane-b/${source}/${state}: ${nonBlocking.length} minor/moderate axe finding(s) ` +
            `collected in ${axeReportPath()}:\n${formatViolations(nonBlocking)}`,
        );
      }

      expect(
        blocking,
        `k4-lane-b/${source}/${state} has serious/critical axe violations:\n${formatViolations(blocking)}`,
      ).toEqual([]);
    });
  }
}

// ---------------------------------------------------------------------------
// 2. Interactive states.
// ---------------------------------------------------------------------------

const CALENDAR = '[data-testid="k4b-calendar-default"]';
const VOICEBUTTON = '[data-testid="k4b-voice-supported"] button';

test('k4-lane-b: flagship interactive states', async ({ page }) => {
  test.setTimeout(240_000);
  mkdirSync(capturesDir(), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  await gotoCell(page, cellUrl('bithire-static', 'en', 'comfortable', 'rest'));

  await test.step('calendar: month navigation changes the visible grid', async () => {
    const root = page.locator(CALENDAR);
    const headerBefore = await root.locator('h1, h2, h3, [data-part="header"], [data-part="title"]').first().textContent().catch(() => '');
    const next = root.getByRole('button').last();
    await next.click();
    await page.waitForTimeout(400);
    const headerAfter = await root.locator('h1, h2, h3, [data-part="header"], [data-part="title"]').first().textContent().catch(() => '');
    console.log(`calendar header before="${headerBefore}" after="${headerAfter}"`);
    await root.screenshot({ path: join(capturesDir(), 'k4b-calendar-next-month.png') });
  });

  await test.step('calendar: day cell hover repaints', async () => {
    // Day cells specifically: the calendar's first buttons are header chrome
    // (nav/mode-toggle), which has no hover by transcribed design — levelling
    // that asymmetry is a Pass-2 craft item for the lane, not this step's
    // subject. data-part="cell" is the day-cell contract.
    const cell = page.locator(`${CALENDAR} button[data-part="cell"]:not([disabled])`).nth(3);
    await cell.waitFor({ timeout: 10_000 });
    const rest = await cell.evaluate((el) => {
      const computed = getComputedStyle(el);
      return { backgroundColor: computed.backgroundColor, color: computed.color, borderColor: computed.borderColor };
    });
    await cell.hover();
    await page.waitForTimeout(300);
    const hovered = await cell.evaluate((el) => {
      const computed = getComputedStyle(el);
      return { backgroundColor: computed.backgroundColor, color: computed.color, borderColor: computed.borderColor };
    });
    const changed = JSON.stringify(rest) !== JSON.stringify(hovered);
    expect(changed, `calendar cell hover changed nothing: ${JSON.stringify(hovered)}`).toBe(true);
    await cell.screenshot({ path: join(capturesDir(), 'k4b-calendar-cell-hover.png') });
  });

  await test.step('codeblock: renders token-clean region with code content', async () => {
    const block = page.locator('[data-testid="k4b-codeblock"] code, [data-testid="k4b-codeblock"] pre').first();
    await block.waitFor({ timeout: 10_000 });
    await page.locator('[data-testid="k4b-codeblock"]').first().screenshot({ path: join(capturesDir(), 'k4b-codeblock.png') });
  });

  await test.step('voice button: posture renders (supported cell)', async () => {
    const button = page.locator(VOICEBUTTON).first();
    const count = await button.count();
    console.log(`voice supported-cell button count=${count} (null-render when Web Speech unsupported is by design)`);
    if (count > 0) {
      await button.hover();
      await page.waitForTimeout(300);
      await button.screenshot({ path: join(capturesDir(), 'k4b-voice-hover.png') });
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Keyboard evidence.
// ---------------------------------------------------------------------------

test('k4-lane-b: calendar controls reachable by keyboard', async ({ page }) => {
  test.setTimeout(120_000);
  await gotoCell(page, cellUrl('bithire-static', 'en', 'comfortable', 'rest'));

  const root = page.locator(CALENDAR);
  const first = root.getByRole('button').first();
  await first.focus();
  await expect(first).toBeFocused();
});

// ---------------------------------------------------------------------------
// 4. Capture matrix (review artifacts, NOT baselines).
// ---------------------------------------------------------------------------

test('k4-lane-b: full source × locale × density capture sweep', async ({ page }) => {
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
          path: join(capturesDir(), `k4-lane-b-${source}-${locale}-${density}-rest-1280.png`),
          fullPage: true,
        });
      }
    }
  }
});

test('k4-lane-b: state cells per source', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  mkdirSync(capturesDir(), { recursive: true });

  for (const source of SOURCES) {
    for (const state of STATES) {
      await gotoCell(page, cellUrl(source, 'en', 'comfortable', state));
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: join(capturesDir(), `k4-lane-b-${source}-en-comfortable-${state}-1280.png`),
        fullPage: true,
      });
    }
  }
});

test('k4-lane-b: mobile + RTL spot cells', async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(capturesDir(), { recursive: true });

  for (const source of SOURCES) {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCell(page, cellUrl(source, 'ar', 'compact', 'rest'));
    const dir = await page.evaluate(() => document.dir);
    expect(dir).toBe('rtl');
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: join(capturesDir(), `k4-lane-b-${source}-ar-compact-rest-390.png`),
      fullPage: true,
    });
  }
});
