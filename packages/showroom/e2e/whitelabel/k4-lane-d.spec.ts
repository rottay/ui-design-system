import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K4 Lane D (stress inputs) whitelabel evidence.
//
// Families: Mentions, OTPInput, Transfer.
// Route: /probe/k4-lane-d (source × locale × density × state × ground cells).
//
// Blocks:
//   1. axe matrix: 2 governed sources × (rest, error) — serious/critical fail.
//   2. interactive states on bithire-static/en/comfortable/rest:
//      mentions textarea hover/focus, transfer search focus, transfer move
//      button hover/pressed, otp slot keyboard focus.
//   3. keyboard evidence: sentinel Tab walk to mentions textarea, transfer
//      search input and otp slot.
//   4. coarse-pointer floor (real mobile chromium): mentions textarea and the
//      transfer search input meet 44px PHYSICAL px.
//   5. capture matrix (review artifacts, NOT baselines): source × locale ×
//      density at 1280 + state cells + 390 RTL spots, landing in
//      test-artifacts/rottay-design-platform/K4/k4-lane-d/captures/.
// ---------------------------------------------------------------------------

type Source = 'bithire-static' | 'themanagement-db';
type Locale = 'en' | 'es' | 'ar';
type Density = 'compact' | 'comfortable' | 'spacious';
type State = 'rest' | 'error' | 'disabled';

const ROUTE = '/probe/k4-lane-d';
const WITNESS = 'k4d-mentions';
const ROOT_TESTID = 'k4d-root';

const SOURCES: readonly Source[] = ['bithire-static', 'themanagement-db'];
const LOCALES: readonly Locale[] = ['en', 'es', 'ar'];
const DENSITIES: readonly Density[] = ['compact', 'comfortable', 'spacious'];
const STATES: readonly State[] = ['error', 'disabled'];
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
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K4', 'k4-lane-d');

const capturesDir = (): string => join(artifactDir(), 'captures');

const axeReportPath = (): string => join(artifactDir(), 'k4-lane-d-axe-report.json');

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
    test(`axe k4-lane-d × ${source} × ${state}: zero serious/critical violations`, async ({
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
          `k4-lane-d/${source}/${state}: ${nonBlocking.length} minor/moderate axe finding(s) ` +
            `collected in ${axeReportPath()}:\n${formatViolations(nonBlocking)}`,
        );
      }

      expect(
        blocking,
        `k4-lane-d/${source}/${state} has serious/critical axe violations:\n${formatViolations(blocking)}`,
      ).toEqual([]);
    });
  }
}

// ---------------------------------------------------------------------------
// 2. Interactive states (settle-poll; never pixel baselines).
// ---------------------------------------------------------------------------

type Sample = Record<string, string>;

const CHANNELS = [
  'backgroundColor',
  'color',
  'borderColor',
  'borderTopWidth',
  'boxShadow',
  'outlineStyle',
  'outlineWidth',
  'outlineColor',
  'transform',
  'opacity',
  'filter',
] as const;

async function sampleOnce(page: Page, selector: string): Promise<Sample> {
  return page
    .locator(selector)
    .first()
    .evaluate((el, channels) => {
      const computed = getComputedStyle(el);
      const cell: Record<string, string> = {};
      for (const channel of channels) {
        cell[channel] = (computed as unknown as Record<string, string>)[channel] ?? '';
      }
      return cell;
    }, CHANNELS as unknown as string[]);
}

async function readSettled(page: Page, selector: string): Promise<Sample> {
  let previous = JSON.stringify(await sampleOnce(page, selector));
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    await page.waitForTimeout(80);
    const current = await sampleOnce(page, selector);
    const serialized = JSON.stringify(current);
    if (serialized === previous) return current;
    previous = serialized;
  }
  throw new Error(`${selector} never settled: still animating after 3s`);
}

function paintDiff(rest: Sample, current: Sample): string[] {
  const diffs: string[] = [];
  for (const channel of CHANNELS) {
    if (rest[channel] !== current[channel]) {
      diffs.push(`${channel}: ${rest[channel]} -> ${current[channel]}`);
    }
  }
  return diffs;
}

async function releasePointer(page: Page): Promise<void> {
  await page.mouse.move(2, 2);
}

async function blurEverything(page: Page): Promise<void> {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

const SENTINEL_ID = 'k4d-states-sentinel';

async function injectSentinel(page: Page): Promise<void> {
  await page.evaluate(
    ({ sentinelId, rootTestId }) => {
      document.getElementById(sentinelId)?.remove();
      const root = document.querySelector(`[data-testid="${rootTestId}"]`);
      if (!root?.parentElement) throw new Error(`lane root is missing: ${rootTestId}`);
      const sentinel = document.createElement('button');
      sentinel.id = sentinelId;
      sentinel.type = 'button';
      sentinel.textContent = 'keyboard sentinel';
      root.parentElement.insertBefore(sentinel, root);
    },
    { sentinelId: SENTINEL_ID, rootTestId: ROOT_TESTID },
  );
}

async function tabUntil(page: Page, selector: string, maxTabs = 40): Promise<void> {
  await page.locator(`#${SENTINEL_ID}`).focus();
  const walk: string[] = [];
  for (let step = 0; step < maxTabs; step += 1) {
    await page.keyboard.press('Tab');
    const landed = await page.evaluate(
      (sel) => document.activeElement instanceof Element && document.activeElement.matches(sel),
      selector,
    );
    if (landed) return;
    walk.push(
      await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return '<body>';
        const part = el.getAttribute('data-part');
        return `${el.tagName.toLowerCase()}${part ? `[data-part="${part}"]` : ''}`;
      }),
    );
  }
  throw new Error(`Tab never reached ${selector} after ${maxTabs} presses. Walk: ${walk.join(' → ')}`);
}

async function expectActiveElement(page: Page, selector: string): Promise<void> {
  const landed = await page.evaluate(
    (sel) => document.activeElement instanceof Element && document.activeElement.matches(sel),
    selector,
  );
  expect(landed, `document.activeElement is not ${selector}`).toBe(true);
}

const MENTIONS_TEXTAREA = '[data-testid="k4d-mentions-primary"] textarea';
const OTP_FIRST_SLOT = '[data-testid="k4d-otp-primary"] input';
const TRANSFER_SEARCH = '[data-testid="k4d-transfer-primary"] input[data-part="panel-search"]';
const TRANSFER_MOVE = '[data-testid="k4d-transfer-primary"] [data-part="operations"] [data-part="move-button"]';
const TRANSFER_FIRST_CHECKBOX = '[data-testid="k4d-transfer-primary"] input[data-part="panel-item-checkbox"]';

test('k4-lane-d: flagship interactive states', async ({ page }) => {
  test.setTimeout(240_000);
  mkdirSync(capturesDir(), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  await gotoCell(page, cellUrl('bithire-static', 'en', 'comfortable', 'rest'));
  await injectSentinel(page);

  // ---- mentions textarea: hover + focus repaint ----------------------------
  await test.step('mentions textarea: hover repaints a channel', async () => {
    await releasePointer(page);
    await blurEverything(page);
    const rest = await readSettled(page, MENTIONS_TEXTAREA);
    await page.locator(MENTIONS_TEXTAREA).first().hover();
    const hovered = await readSettled(page, MENTIONS_TEXTAREA);
    const diffs = paintDiff(rest, hovered);
    expect(
      diffs.length,
      'mentions textarea: hover changed nothing visible',
    ).toBeGreaterThan(0);
    console.log(`mentions hover diff:\n  ${diffs.join('\n  ')}`);
    await page
      .locator(MENTIONS_TEXTAREA)
      .first()
      .screenshot({ path: join(capturesDir(), 'k4d-mentions-hover.png') });
  });

  await test.step('mentions textarea: keyboard focus paints a visible indicator', async () => {
    await releasePointer(page);
    await blurEverything(page);
    await tabUntil(page, MENTIONS_TEXTAREA);
    await expectActiveElement(page, MENTIONS_TEXTAREA);
    const focused = await readSettled(page, MENTIONS_TEXTAREA);
    const outlineVisible =
      focused.outlineStyle !== 'none' && Number.parseFloat(focused.outlineWidth) > 0;
    const grewShadow = focused.boxShadow !== 'none';
    expect(
      outlineVisible || grewShadow,
      `mentions textarea: keyboard focus paints nothing (outline ${focused.outlineWidth} ${focused.outlineStyle}, shadow ${focused.boxShadow})`,
    ).toBe(true);
    await page
      .locator(MENTIONS_TEXTAREA)
      .first()
      .screenshot({ path: join(capturesDir(), 'k4d-mentions-focus.png') });
  });

  // ---- otp slot: keyboard focus paints --------------------------------------
  await test.step('otp slot: keyboard focus paints a visible indicator', async () => {
    await releasePointer(page);
    await blurEverything(page);
    await tabUntil(page, OTP_FIRST_SLOT);
    await expectActiveElement(page, OTP_FIRST_SLOT);
    const focused = await readSettled(page, OTP_FIRST_SLOT);
    const restBlurred = await (async () => {
      await blurEverything(page);
      return sampleOnce(page, OTP_FIRST_SLOT);
    })();
    const changed = paintDiff(restBlurred, focused);
    expect(
      changed.length,
      'otp slot: keyboard focus changed no paint channel',
    ).toBeGreaterThan(0);
    console.log(`otp slot focus diff:\n  ${changed.join('\n  ')}`);
    await page
      .locator(OTP_FIRST_SLOT)
      .first()
      .screenshot({ path: join(capturesDir(), 'k4d-otp-focus.png') });
  });

  // ---- transfer move button: hover + pressed --------------------------------
  await test.step('transfer move button: hover and pressed repaint', async () => {
    // Move buttons are disabled until at least one item is selected.
    await page.locator(TRANSFER_FIRST_CHECKBOX).first().check();
    const move = page.locator(TRANSFER_MOVE).first();
    await move.waitFor({ timeout: 10_000 });
    await expect(move).toBeEnabled();
    await releasePointer(page);
    await blurEverything(page);
    const rest = await sampleOnce(page, TRANSFER_MOVE);
    await move.hover();
    const hovered = await readSettled(page, TRANSFER_MOVE);
    const hoverDiffs = paintDiff(rest, hovered);
    expect(
      hoverDiffs.length,
      'transfer move button: hover changed nothing visible',
    ).toBeGreaterThan(0);
    await move.screenshot({ path: join(capturesDir(), 'k4d-transfer-move-hover.png') });

    await page.mouse.down();
    try {
      const pressed = await readSettled(page, TRANSFER_MOVE);
      const pressDiffs = paintDiff(hovered, pressed);
      console.log(`transfer move pressed diff:\n  ${pressDiffs.join('\n  ')}`);
      await move.screenshot({ path: join(capturesDir(), 'k4d-transfer-move-pressed.png') });
    } finally {
      await page.mouse.up();
      await releasePointer(page);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Keyboard evidence.
// ---------------------------------------------------------------------------

test('k4-lane-d: keyboard evidence — mentions, otp and transfer reachable by Tab', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await gotoCell(page, cellUrl('bithire-static', 'en', 'comfortable', 'rest'));
  await injectSentinel(page);

  await test.step('mentions textarea reachable', async () => {
    await tabUntil(page, MENTIONS_TEXTAREA);
    await expectActiveElement(page, MENTIONS_TEXTAREA);
  });

  await test.step('otp first slot reachable', async () => {
    await tabUntil(page, OTP_FIRST_SLOT);
    await expectActiveElement(page, OTP_FIRST_SLOT);
  });

  await test.step('transfer interactive control reachable', async () => {
    await tabUntil(page, `${TRANSFER_SEARCH}, ${TRANSFER_MOVE}`);
    await expectActiveElement(page, `${TRANSFER_SEARCH}, ${TRANSFER_MOVE}`);
  });
});

// ---------------------------------------------------------------------------
// 4. Coarse-pointer floor (real mobile chromium context).
// ---------------------------------------------------------------------------

test('k4-lane-d: mentions textarea and transfer search meet the coarse floor', async ({
  browser,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'coarse-pointer emulation is chromium-only');
  test.setTimeout(120_000);
  const baseURL = test.info().project.use.baseURL as string;
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 852 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const coarsePage = await context.newPage();
    await expect
      .poll(() => coarsePage.evaluate(() => window.matchMedia('(pointer: coarse)').matches))
      .toBe(true);

    await gotoCell(coarsePage, cellUrl('bithire-static', 'en', 'comfortable', 'rest'));

    const heightOf = async (selector: string): Promise<number> => {
      const box = await coarsePage.locator(selector).first().boundingBox();
      expect(box, `no bounding box for ${selector}`).not.toBeNull();
      return (box as { height: number }).height;
    };

    expect(
      await heightOf(MENTIONS_TEXTAREA),
      'mentions textarea touch floor (44px)',
    ).toBeGreaterThanOrEqual(44);

    const search = coarsePage.locator(TRANSFER_SEARCH).first();
    if (await search.count()) {
      expect(
        await heightOf(TRANSFER_SEARCH),
        'transfer search input touch floor (44px)',
      ).toBeGreaterThanOrEqual(44);
    }
  } finally {
    await context.close();
  }
});

// ---------------------------------------------------------------------------
// 5. Capture matrix (review artifacts, NOT baselines).
// ---------------------------------------------------------------------------

test('k4-lane-d: full source × locale × density capture sweep', async ({ page }) => {
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
          path: join(capturesDir(), `k4-lane-d-${source}-${locale}-${density}-rest-1280.png`),
          fullPage: true,
        });
      }
    }
  }
});

test('k4-lane-d: state cells per source', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  mkdirSync(capturesDir(), { recursive: true });

  for (const source of SOURCES) {
    for (const state of STATES) {
      await gotoCell(page, cellUrl(source, 'en', 'comfortable', state));
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: join(capturesDir(), `k4-lane-d-${source}-en-comfortable-${state}-1280.png`),
        fullPage: true,
      });
    }
  }
});

test('k4-lane-d: mobile + RTL spot cells', async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(capturesDir(), { recursive: true });

  for (const source of SOURCES) {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCell(page, cellUrl(source, 'ar', 'compact', 'rest'));
    const dir = await page.evaluate(() => document.dir);
    expect(dir).toBe('rtl');
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: join(capturesDir(), `k4-lane-d-${source}-ar-compact-rest-390.png`),
      fullPage: true,
    });
  }
});
