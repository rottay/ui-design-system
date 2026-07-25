import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K2 lane-v (value inputs) evidence: axe + interactive states + keyboard +
// RTL/density/source-parity, on the /probe/k2-lane-v cells.
//
// Axe matrix: lane-v × governed source (bithire-static, themanagement-db) on
// the fixed cell locale=en, density=comfortable, state=rest — the
// k1-lane-axe.spec.ts pattern, including the rule|target keying, useId-token
// normalization and incremental merge-on-disk report at
// test-artifacts/rottay-design-platform/K2-K3/k2-lane-v/axe/.
//
// Interactive matrix (bithire-static/en/comfortable/rest), one entry per
// flagship control, computed values + settle-polls, never pixel baselines:
//
//   inputnumber  hover border + keyboard ring on the input; ArrowUp steps
//                50 -> 55; forced-colors frame; reduced-motion collapse;
//                coarse 44px floor.
//   slider       thumb paint via pixel-diff crops of a deterministic
//                thumb-centered clip (the two-argument getComputedStyle on
//                ::-webkit-slider-thumb returns the ELEMENT's declaration in
//                this stack — isolated proof in the pixel machinery comment):
//                hover repaint, focus ring, pressed scale; ArrowRight steps
//                40 -> 41; range-mode overlay-input focus rings its paired
//                handle; coarse 44px floor.
//   rate         hover scale on the star; roving data-focused ring; ArrowRight
//                3.5 -> 4; click-current clears to 0 (allowClear).
//   upload       trigger button hover/focus/forced-colors frame; Enter bubbles
//                to the hidden file input (click counter); remove action
//                hover/focus.
//   taginput     chip close (Tag data-part="close") hover/focus; typing lands
//                in the inline input; Enter consumes and clears it.
//   form         Tab into the email input paints the item focus-within frame;
//                forced-colors item frame.
//
// NOT-COMPUTABLE STATES (flagged, never faked): pressed postures exist only
// where the component paints one — the slider thumb (`:active` scale). Every
// other control's pressed cell is recorded in PRESSED_GAPS and printed at the
// end of the run.
//
// Screenshots (review artifacts, NOT baselines) land in
// test-artifacts/rottay-design-platform/K2-K3/k2-lane-v/captures/states/.
// ---------------------------------------------------------------------------

type Source = 'bithire-static' | 'themanagement-db';

const ROUTE = '/probe/k2-lane-v';
const ROOT_TESTID = 'lv-root';
const WITNESS = 'lv-inputnumber';
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

const axeDir = (): string =>
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K2-K3', 'k2-lane-v', 'axe');
const capturesDir = (): string =>
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K2-K3', 'k2-lane-v', 'captures', 'states');
const axeReportPath = (): string => join(axeDir(), 'k2-lane-v-axe-report.json');
const capturePath = (name: string): string => join(capturesDir(), `lane-v-${name}.png`);

function cellUrl(source: Source, extra = ''): string {
  return `${ROUTE}?source=${source}&locale=en&density=comfortable&state=rest${extra}`;
}

/** The deterministic render witness: lane testid + late lazy engines + compiled theme + fonts. */
async function gotoCell(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.getByTestId(WITNESS).waitFor({ timeout: 30_000 });
  // The lazy modern engines resolve after the shell; the value-input natives
  // are the last witnesses of a settled cell.
  await page.locator('[data-testid="lv-inputnumber-stepper"] input[type="number"]').waitFor({ timeout: 30_000 });
  await page.locator('[data-testid="lv-rate-interactive"] [data-part="star"]').first().waitFor({ timeout: 30_000 });
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

// ---------------------------------------------------------------------------
// Axe matrix (k1-lane-axe persist pattern).
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
  mkdirSync(axeDir(), { recursive: true });
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

for (const source of ['bithire-static', 'themanagement-db'] as const) {
  test(`axe lane-v × ${source}: zero serious/critical violations`, async ({ page }) => {
    await gotoCell(page, cellUrl(source));

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = collectViolations(results, BLOCKING_IMPACTS);
    const nonBlocking = collectViolations(results, new Set(['minor', 'moderate']));

    persistCell(`lane-v/${source}`, {
      source,
      url: cellUrl(source),
      blockingCount: blocking.length,
      blocking,
      nonBlockingCount: nonBlocking.length,
      nonBlocking,
    });

    if (nonBlocking.length > 0) {
      console.log(
        `lane-v/${source}: ${nonBlocking.length} minor/moderate axe finding(s) ` +
          `collected in ${axeReportPath()}:\n${formatViolations(nonBlocking)}`,
      );
    }

    expect(
      blocking,
      `lane-v/${source} has serious/critical axe violations:\n${formatViolations(blocking)}`,
    ).toEqual([]);
  });
}

// ---------------------------------------------------------------------------
// Paint sampling machinery (k1-lane-states settle-poll pattern).
// ---------------------------------------------------------------------------

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

type Sample = Record<string, string>;

async function sampleOnce(page: Page, selector: string, pseudo?: string): Promise<Sample> {
  return page
    .locator(selector)
    .first()
    .evaluate(
      (el, args) => {
        const computed = getComputedStyle(el, args.pseudo || undefined);
        const cell: Record<string, string> = {};
        for (const channel of args.channels) {
          cell[channel] = (computed as unknown as Record<string, string>)[channel] ?? '';
        }
        cell['data-state'] = el.getAttribute('data-state') ?? '';
        return cell;
      },
      { channels: CHANNELS as unknown as string[], pseudo: pseudo ?? '' },
    );
}

async function readSettled(page: Page, selector: string, pseudo?: string): Promise<Sample> {
  let previous = JSON.stringify(await sampleOnce(page, selector, pseudo));
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    await page.waitForTimeout(80);
    const current = await sampleOnce(page, selector, pseudo);
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

const SENTINEL_ID = 'k2-lane-v-sentinel';

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

async function tabUntil(page: Page, selector: string, maxTabs = 30): Promise<void> {
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

interface ForcedColorsRead {
  borderTopWidth: string;
  borderTopStyle: string;
  outlineWidth: string;
  outlineStyle: string;
  color: string;
  forcedColorAdjust: string;
}

async function readForcedColors(page: Page, selector: string): Promise<ForcedColorsRead> {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        borderTopWidth: computed.borderTopWidth,
        borderTopStyle: computed.borderTopStyle,
        outlineWidth: computed.outlineWidth,
        outlineStyle: computed.outlineStyle,
        color: computed.color,
        forcedColorAdjust: computed.forcedColorAdjust,
      };
    });
}

function hasFrame(read: ForcedColorsRead): boolean {
  const border =
    Number.parseFloat(read.borderTopWidth) > 0 && read.borderTopStyle !== 'none';
  const outline =
    Number.parseFloat(read.outlineWidth) > 0 && read.outlineStyle !== 'none';
  return border || outline;
}

const COLLAPSED_FLOOR_MS = 0.011;

function durationMs(entry: string): number {
  const value = Number.parseFloat(entry);
  if (Number.isNaN(value)) return Number.POSITIVE_INFINITY;
  if (entry.endsWith('ms')) return value;
  if (entry.endsWith('s')) return value * 1000;
  return Number.POSITIVE_INFINITY;
}

async function expectMotionCollapsed(page: Page, selector: string, label: string, pseudo?: string): Promise<void> {
  const read = await page
    .locator(selector)
    .first()
    .evaluate(
      (el, p) => {
        const computed = getComputedStyle(el, p || undefined);
        return {
          transitionDuration: computed.transitionDuration,
          animationDuration: computed.animationDuration,
        };
      },
      pseudo ?? '',
    );
  const durations = [...read.transitionDuration.split(','), ...read.animationDuration.split(',')].map(
    (entry) => entry.trim(),
  );
  for (const duration of durations) {
    expect(
      durationMs(duration) <= COLLAPSED_FLOOR_MS,
      `${label}: motion did not collapse under prefers-reduced-motion ` +
        `(transition-duration ${read.transitionDuration}, animation-duration ${read.animationDuration})`,
    ).toBe(true);
  }
}

const PRESSED_GAPS: string[] = [];

// ---------------------------------------------------------------------------
// Interactive state evidence.
// ---------------------------------------------------------------------------

test('lane-v: InputNumber hover/focus/keyboard/forced-colors/reduced-motion', async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(capturesDir(), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  await gotoCell(page, cellUrl('bithire-static'));
  await injectSentinel(page);

  const input = '[data-testid="lv-inputnumber-stepper"] input[type="number"]';
  await releasePointer(page);
  await blurEverything(page);
  const rest = await readSettled(page, input);

  await test.step('hover repaints the border', async () => {
    await page.locator(input).hover();
    const hovered = await readSettled(page, input);
    const diffs = paintDiff(rest, hovered);
    expect(diffs.length, 'InputNumber hover changed nothing visible').toBeGreaterThan(0);
    await page.locator(input).screenshot({ path: capturePath('inputnumber-hover') });
  });

  await test.step('keyboard focus paints a ring and ArrowUp steps 50 -> 55', async () => {
    await releasePointer(page);
    await blurEverything(page);
    await tabUntil(page, input);
    await expectActiveElement(page, input);
    const focused = await readSettled(page, input);
    const outlineVisible = (s: Sample): boolean =>
      s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0;
    const grewRing =
      (outlineVisible(focused) && !outlineVisible(rest)) ||
      (focused.boxShadow !== 'none' && focused.boxShadow !== rest.boxShadow);
    expect(grewRing, 'InputNumber focus paints no ring').toBe(true);
    await page.locator(input).screenshot({ path: capturePath('inputnumber-focus') });
    await expect(page.locator(input)).toHaveValue('50');
    await page.keyboard.press('ArrowUp');
    await expect(page.locator(input)).toHaveValue('55');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator(input)).toHaveValue('50');
  });

  await test.step('stepper buttons have accessible names and step on click', async () => {
    await blurEverything(page);
    const up = page.locator('[data-testid="lv-inputnumber-stepper"] [data-part="stepper-button"][data-direction="up"]');
    await expect(up).toHaveAttribute('aria-label', 'Increase');
    await up.click();
    await expect(page.locator(input)).toHaveValue('55');
    const down = page.locator('[data-testid="lv-inputnumber-stepper"] [data-part="stepper-button"][data-direction="down"]');
    await down.click();
    await expect(page.locator(input)).toHaveValue('50');
  });

  await test.step('forced-colors keeps the frame', async () => {
    await blurEverything(page);
    await page.emulateMedia({ forcedColors: 'active' });
    try {
      await page.waitForTimeout(100);
      const read = await readForcedColors(page, input);
      expect(read.forcedColorAdjust).not.toBe('none');
      expect(hasFrame(read), 'InputNumber lost its frame under forced colors').toBe(true);
      await page.locator(input).screenshot({ path: capturePath('inputnumber-forced-colors') });
    } finally {
      await page.emulateMedia({ forcedColors: 'none' });
    }
  });

  await test.step('reduced-motion collapses durations', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    try {
      await page.waitForTimeout(100);
      await expectMotionCollapsed(page, input, 'lane-v/inputnumber');
    } finally {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
  });

  PRESSED_GAPS.push(
    'lane-v/inputnumber: input.css has no :active rule for the root and the engine stamps no ' +
      'data-state — a held press changes nothing computable (same class of gap as k1 lane-b/input).',
  );
});

// ---------------------------------------------------------------------------
// Pixel-diff machinery (Slider only).
//
// WHY NOT COMPUTED STYLE: the thumb's paint lives on the shadow pseudo
// ::-webkit-slider-thumb, and in this Chromium/Playwright stack the
// two-argument getComputedStyle(el, '::-webkit-slider-thumb') returns the
// ELEMENT's own declaration, not the pseudo's (isolated proof: a thumb
// styled `background: rgb(255 0 0)` reads back rgba(0,0,0,0) and width =
// the input's width, K2-V Pass-2 falsification). These cells therefore
// compare pixel crops of a deterministic thumb-centered clip between two
// states of the SAME cell — state-difference evidence, never a pixel
// baseline (position/value are pinned, so only paint can differ).
// ---------------------------------------------------------------------------

interface PixelClip {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Clip centered on the single-mode thumb (16px thumb, value ratio pinned). */
async function thumbClip(page: Page, inputSel: string, ratio: number): Promise<PixelClip> {
  const box = await page.locator(inputSel).boundingBox();
  if (!box) throw new Error(`no bounding box for ${inputSel}`);
  const centerX = box.x + 8 + ratio * (box.width - 16);
  return { x: centerX - 14, y: box.y - 3, width: 28, height: 22 };
}

/** Absolute byte differences above noise; PNG-length drift counts too. */
function bytesChanged(a: Buffer, b: Buffer): number {
  let d = Math.abs(a.length - b.length);
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) if (Math.abs(a[i] - b[i]) > 8) d += 1;
  return d;
}

const PIXEL_DIFF_FLOOR = 40; // live-calibrated: hover 564, focus 575, pressed 98

test('lane-v: Slider thumb states (pixel-diff evidence), keyboard, range focus ring', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'pixel-diff thumb evidence is calibrated on chromium');
  test.setTimeout(120_000);
  mkdirSync(capturesDir(), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  await gotoCell(page, cellUrl('bithire-static'));
  await injectSentinel(page);

  const input = '[data-testid="lv-slider-single"] input[data-part="native-input"]';
  const clip = await thumbClip(page, input, 0.4); // defaultValue=40 of 0..100
  const thumbCenter = { x: clip.x + 14, y: clip.y + 3 + 8 };

  await releasePointer(page);
  await blurEverything(page);
  await page.waitForTimeout(150);
  const rest = await page.screenshot({ clip });

  await test.step('hover repaints the thumb', async () => {
    await page.mouse.move(thumbCenter.x, thumbCenter.y);
    await page.waitForTimeout(400);
    const hovered = await page.screenshot({ clip });
    const changed = bytesChanged(rest, hovered);
    expect(changed, `Slider thumb hover painted nothing (pixel diff ${changed})`).toBeGreaterThan(PIXEL_DIFF_FLOOR);
    await page.locator(input).screenshot({ path: capturePath('slider-hover') });
  });

  await test.step('keyboard focus paints the thumb ring and ArrowRight steps 40 -> 41', async () => {
    await releasePointer(page);
    await blurEverything(page);
    await page.waitForTimeout(150);
    const restFocus = await page.screenshot({ clip });
    await tabUntil(page, input);
    await expectActiveElement(page, input);
    await page.waitForTimeout(300);
    const focused = await page.screenshot({ clip });
    const changed = bytesChanged(restFocus, focused);
    expect(changed, `Slider thumb focus ring painted nothing (pixel diff ${changed})`).toBeGreaterThan(PIXEL_DIFF_FLOOR);
    await page.locator(input).screenshot({ path: capturePath('slider-focus') });
    await expect(page.locator(input)).toHaveValue('40');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(input)).toHaveValue('41');
  });

  await test.step('pressed thumb repaints while held (pointer ON the thumb, no value jump)', async () => {
    await releasePointer(page);
    await blurEverything(page);
    await page.waitForTimeout(150);
    // Re-read the clip at value 41 (previous step stepped the value once).
    const pressedClip = await thumbClip(page, input, 0.41);
    const center = { x: pressedClip.x + 14, y: pressedClip.y + 11 };
    const restPressed = await page.screenshot({ clip: pressedClip });
    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    try {
      await page.waitForTimeout(300);
      const pressed = await page.screenshot({ clip: pressedClip });
      const changed = bytesChanged(restPressed, pressed);
      expect(changed, `Slider thumb press painted nothing (pixel diff ${changed})`).toBeGreaterThan(PIXEL_DIFF_FLOOR);
      await page.locator(input).screenshot({ path: capturePath('slider-pressed') });
    } finally {
      await page.mouse.up();
      await releasePointer(page);
    }
  });

  await test.step('forced-colors: range handle keeps its frame; single thumb stays visible', async () => {
    await blurEverything(page);
    await page.emulateMedia({ forcedColors: 'active' });
    try {
      await page.waitForTimeout(150);
      // Real-element frame evidence: the range-mode custom handle (border-2).
      const read = await readForcedColors(page, '[data-testid="lv-slider-range"] [data-part="handle"]');
      expect(hasFrame(read), 'Slider range handle lost its frame under forced colors').toBe(true);
      // Pixel evidence the single-mode thumb still renders: its crop must
      // differ from a uniform empty region of the same page.
      const thumbShot = await page.screenshot({ clip });
      const emptyShot = await page.screenshot({ clip: { x: 2, y: 2, width: 28, height: 22 } });
      const changed = bytesChanged(thumbShot, emptyShot);
      expect(changed, 'Slider thumb vanished under forced colors').toBeGreaterThan(PIXEL_DIFF_FLOOR);
      await page.locator(input).screenshot({ path: capturePath('slider-forced-colors') });
    } finally {
      await page.emulateMedia({ forcedColors: 'none' });
    }
  });

  await test.step('reduced-motion collapses durations (range handle, real element)', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    try {
      await page.waitForTimeout(100);
      // The handle carries the skin family's interaction transitions; the
      // thumb pseudos carry the same reduced-motion rule (served-CSS
      // verified during Pass-2 falsification).
      await expectMotionCollapsed(page, '[data-testid="lv-slider-range"] [data-part="handle"]', 'lane-v/slider handle');
    } finally {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
  });

  await test.step('range mode: keyboard focus on an overlay input rings its paired handle', async () => {
    await releasePointer(page);
    await blurEverything(page);
    const startInput = '[data-testid="lv-slider-range"] input[aria-label="Minimum value"]';
    await tabUntil(page, startInput);
    await expectActiveElement(page, startInput);
    const startHandle = page.locator('[data-testid="lv-slider-range"] [data-part="handle"]').first();
    const ring = await startHandle.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(ring, 'range start handle shows no focus ring').not.toBe('none');
    await page.locator('[data-testid="lv-slider-range"]').screenshot({ path: capturePath('slider-range-focus') });
  });
});

test('lane-v: Rate hover/clear/focus/keyboard', async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(capturesDir(), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  await gotoCell(page, cellUrl('bithire-static'));
  await injectSentinel(page);

  const root = '[data-testid="lv-rate-interactive"] [data-part="root"]';
  const star = (n: number) => `[data-testid="lv-rate-interactive"] [data-part="star"]:nth-of-type(${n})`;

  await test.step('hover scales the star', async () => {
    await blurEverything(page);
    const rest = await readSettled(page, star(4));
    await page.locator(star(4)).hover();
    const hovered = await readSettled(page, star(4));
    expect(
      hovered.transform !== rest.transform,
      `Rate star hover did not transform (${hovered.transform})`,
    ).toBe(true);
    await page.locator(root).screenshot({ path: capturePath('rate-hover') });
  });

  await test.step('keyboard: Tab reaches the group, ring paints via data-focused, ArrowRight steps 3.5 -> 4', async () => {
    await releasePointer(page);
    await blurEverything(page);
    await tabUntil(page, root);
    await expectActiveElement(page, root);
    const focusedStar = page.locator('[data-testid="lv-rate-interactive"] [data-part="star"][data-focused="true"]');
    await expect(focusedStar).toHaveCount(1);
    const outline = await focusedStar.evaluate((el) => {
      const computed = getComputedStyle(el);
      return `${computed.outlineWidth} ${computed.outlineStyle}`;
    });
    expect(outline.startsWith('0px'), `Rate focused star has no outline (${outline})`).toBe(false);
    await page.locator(root).screenshot({ path: capturePath('rate-focus') });
    await expect(page.locator(root)).toHaveAttribute('data-value', '3.5');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(root)).toHaveAttribute('data-value', '4');
  });

  await test.step('allowClear: clicking the current value clears to 0', async () => {
    // Re-focus the group first: End must reach the root's keydown handler
    // (a blur here would send the key to <body> — that was the Pass-1
    // spec bug; the handler itself correctly sets newValue = count).
    await tabUntil(page, root);
    await expectActiveElement(page, root);
    await page.keyboard.press('End');
    await expect(page.locator(root)).toHaveAttribute('data-value', '5');
    await page.locator(star(5)).click();
    await expect(page.locator(root)).toHaveAttribute('data-value', '0');
  });

  PRESSED_GAPS.push(
    'lane-v/rate: rate.css paints :hover scale but no :active rule, and the engine stamps no ' +
      'pressed data-state — a held press changes nothing computable.',
  );
});

test('lane-v: Upload trigger/remove actions, keyboard activation, forced-colors', async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(capturesDir(), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  await gotoCell(page, cellUrl('bithire-static'));
  await injectSentinel(page);

  const trigger = '[data-testid="lv-upload-list"] [data-part="trigger"] button';
  const removeFirst = '[data-testid="lv-upload-list"] [data-part="file-item-action"]';
  const fileInput = '[data-testid="lv-upload-list"] input[data-part="file-input"]';

  await test.step('trigger button: hover repaint + keyboard ring', async () => {
    await releasePointer(page);
    await blurEverything(page);
    const rest = await readSettled(page, trigger);
    await page.locator(trigger).hover();
    const hovered = await readSettled(page, trigger);
    const hoverDiffs = paintDiff(rest, hovered);
    expect(
      hoverDiffs.length,
      'Upload trigger hover changed nothing visible (upload.css owns a :hover rule)',
    ).toBeGreaterThan(0);
    await tabUntil(page, trigger);
    await expectActiveElement(page, trigger);
    const focused = await readSettled(page, trigger);
    const outlineVisible = (s: Sample): boolean =>
      s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0;
    const grewRing =
      (outlineVisible(focused) && !outlineVisible(rest)) ||
      (focused.boxShadow !== 'none' && focused.boxShadow !== rest.boxShadow);
    expect(grewRing, 'Upload trigger keyboard focus paints no ring').toBe(true);
    await page.locator(trigger).screenshot({ path: capturePath('upload-trigger-focus') });
  });

  await test.step('Enter on the trigger bubbles to the hidden file input', async () => {
    await tabUntil(page, trigger);
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`file input missing: ${sel}`);
      (window as unknown as Record<string, number>).__lvClicks = 0;
      el.addEventListener('click', () => {
        (window as unknown as Record<string, number>).__lvClicks += 1;
      });
    }, fileInput);
    await page.keyboard.press('Enter');
    const clicks = await page.evaluate(() => (window as unknown as Record<string, number>).__lvClicks ?? 0);
    expect(clicks, 'Enter did not reach the hidden file input').toBe(1);
  });

  await test.step('first remove action: keyboard reachable with a ring', async () => {
    await tabUntil(page, removeFirst);
    await expectActiveElement(page, removeFirst);
    const focused = await readSettled(page, removeFirst);
    const outlineVisible = (s: Sample): boolean =>
      s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0;
    const grewRing =
      outlineVisible(focused) || (focused.boxShadow !== 'none' && focused.boxShadow !== '');
    expect(grewRing, 'Upload remove action keyboard focus paints no ring').toBe(true);
    await page.locator(removeFirst).first().screenshot({ path: capturePath('upload-remove-focus') });
  });

  await test.step('forced-colors keeps the trigger frame', async () => {
    await blurEverything(page);
    await page.emulateMedia({ forcedColors: 'active' });
    try {
      await page.waitForTimeout(100);
      const read = await readForcedColors(page, trigger);
      expect(hasFrame(read), 'Upload trigger lost its frame under forced colors').toBe(true);
      await page.locator(trigger).screenshot({ path: capturePath('upload-trigger-forced-colors') });
    } finally {
      await page.emulateMedia({ forcedColors: 'none' });
    }
  });

  PRESSED_GAPS.push(
    'lane-v/upload: no :active rule on the trigger or file-item actions and no behavior-layer ' +
      'data-state — a held press changes nothing computable.',
  );
});

test('lane-v: TagInput chip close focus, typing, Enter consumption', async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(capturesDir(), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  await gotoCell(page, cellUrl('bithire-static'));
  await injectSentinel(page);

  const root = '[data-testid="lv-taginput-field"] .ds-tag-input[data-part="root"]';
  const input = '[data-testid="lv-taginput-field"] [data-part="input"]';
  const chipClose = '[data-testid="lv-taginput-field"] .rottay-tag-shell [data-part="close"]';

  await test.step('chips are composed Tags; first close button is keyboard reachable with a ring', async () => {
    const closes = page.locator(chipClose);
    await expect(closes).toHaveCount(3);
    await tabUntil(page, chipClose);
    await expectActiveElement(page, chipClose);
    const focused = await readSettled(page, chipClose);
    const outlineVisible = (s: Sample): boolean =>
      s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0;
    const grewRing =
      outlineVisible(focused) || (focused.boxShadow !== 'none' && focused.boxShadow !== '');
    expect(grewRing, 'TagInput chip close keyboard focus paints no ring').toBe(true);
    await page.locator(chipClose).first().screenshot({ path: capturePath('taginput-close-focus') });
  });

  await test.step('typing lands in the inline input; Enter consumes and clears it', async () => {
    await tabUntil(page, input);
    await expectActiveElement(page, input);
    await page.keyboard.type('NewSkill');
    await expect(page.locator(input)).toHaveValue('NewSkill');
    // The probe wires onChange as a no-op (controlled), so the deterministic
    // contract is the engine consuming Enter and clearing its local state.
    await page.keyboard.press('Enter');
    await expect(page.locator(input)).toHaveValue('');
  });

  await test.step('forced-colors keeps the container frame', async () => {
    await blurEverything(page);
    await page.emulateMedia({ forcedColors: 'active' });
    try {
      await page.waitForTimeout(100);
      const read = await readForcedColors(page, root);
      expect(hasFrame(read), 'TagInput container lost its frame under forced colors').toBe(true);
      await page.locator(root).screenshot({ path: capturePath('taginput-forced-colors') });
    } finally {
      await page.emulateMedia({ forcedColors: 'none' });
    }
  });

  PRESSED_GAPS.push(
    'lane-v/taginput: chip close is the Tag close button (no :active rule — the k1 lane-a gap), ' +
      'and the container has no pressed posture.',
  );
});

test('lane-v: Form item focus-within frame and forced-colors', async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(capturesDir(), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  await gotoCell(page, cellUrl('bithire-static'));
  await injectSentinel(page);

  const emailInput = '[data-testid="lv-form-email"]';
  const firstItem = '[data-testid="lv-form"] [data-part="item"]';

  await test.step('Tab into the email input paints the item focus-within frame', async () => {
    await releasePointer(page);
    await blurEverything(page);
    const rest = await readSettled(page, firstItem);
    await tabUntil(page, emailInput);
    await expectActiveElement(page, emailInput);
    const focused = await readSettled(page, firstItem);
    const diffs = paintDiff(rest, focused);
    expect(
      diffs.length,
      'Form item focus-within changed no paint channel (border/box-shadow expected)',
    ).toBeGreaterThan(0);
    console.log(`lane-v/form focus-within diff:\n  ${diffs.join('\n  ')}`);
    await page.locator(firstItem).first().screenshot({ path: capturePath('form-focus-within') });
  });

  await test.step('forced-colors keeps the item frame', async () => {
    await blurEverything(page);
    await page.emulateMedia({ forcedColors: 'active' });
    try {
      await page.waitForTimeout(100);
      const read = await readForcedColors(page, firstItem);
      expect(hasFrame(read), 'Form item lost its frame under forced colors').toBe(true);
      await page.locator(firstItem).first().screenshot({ path: capturePath('form-forced-colors') });
    } finally {
      await page.emulateMedia({ forcedColors: 'none' });
    }
  });
});

// ---------------------------------------------------------------------------
// Coarse-pointer 44px floor (real mobile chromium context — the
// density-authority-matrix group-H pattern).
// ---------------------------------------------------------------------------

test('lane-v controls meet the 44px coarse-pointer floor', async ({ browser, browserName }) => {
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
    const page = await context.newPage();
    await expect
      .poll(() => page.evaluate(() => window.matchMedia('(pointer: coarse)').matches))
      .toBe(true);

    await gotoCell(page, cellUrl('bithire-static'));

    const heightOf = async (selector: string): Promise<number> => {
      const box = await page.locator(selector).first().boundingBox();
      expect(box, `no bounding box for ${selector}`).not.toBeNull();
      return (box as { height: number }).height;
    };

    // The control surfaces that must meet the physical touch floor.
    expect(await heightOf('[data-testid="lv-inputnumber-stepper"] input[type="number"]')).toBeGreaterThanOrEqual(44);
    expect(await heightOf('[data-testid="lv-slider-single"] input[data-part="native-input"]')).toBeGreaterThanOrEqual(44);
    expect(await heightOf('[data-testid="lv-rate-interactive"] [data-part="star"]')).toBeGreaterThanOrEqual(44);
    expect(await heightOf('[data-testid="lv-taginput-field"] .ds-tag-input[data-part="root"]')).toBeGreaterThanOrEqual(44);
  } finally {
    await context.close();
  }
});

// ---------------------------------------------------------------------------
// RTL + density + source-parity cells.
// ---------------------------------------------------------------------------

test('lane-v RTL: InputNumber steppers cluster flips to the inline-end (left) under dir=rtl', async ({ page }) => {
  await gotoCell(page, `${ROUTE}?source=bithire-static&locale=ar&density=comfortable&state=rest`);

  const frame = page.getByTestId('lv-frame');
  await expect(frame).toHaveAttribute('dir', 'rtl');

  const inputBox = await page.locator('[data-testid="lv-inputnumber-stepper"] input[type="number"]').boundingBox();
  const stepperBox = await page
    .locator('[data-testid="lv-inputnumber-stepper"] [data-part="stepper-button"][data-direction="up"]')
    .boundingBox();
  expect(inputBox).not.toBeNull();
  expect(stepperBox).not.toBeNull();
  // Logical `end-2` placement: in RTL the steppers sit on the LEFT half of
  // the input; in LTR they sit on the right.
  const input = inputBox as { x: number; width: number };
  const stepper = stepperBox as { x: number; width: number };
  expect(
    stepper.x < input.x + input.width / 2,
    `RTL steppers did not flip to the inline-end (stepper x=${stepper.x}, input center=${input.x + input.width / 2})`,
  ).toBe(true);
});

test('lane-v density: spacious geometry exceeds compact on the InputNumber input', async ({ page }) => {
  await gotoCell(page, `${ROUTE}?source=bithire-static&locale=en&density=compact&state=rest`);
  const compact = await page
    .locator('[data-testid="lv-inputnumber-stepper"] input[type="number"]')
    .evaluate((el) => Number.parseFloat(getComputedStyle(el).blockSize || '0'));

  await gotoCell(page, `${ROUTE}?source=bithire-static&locale=en&density=spacious&state=rest`);
  const spacious = await page
    .locator('[data-testid="lv-inputnumber-stepper"] input[type="number"]')
    .evaluate((el) => Number.parseFloat(getComputedStyle(el).blockSize || '0'));

  expect(compact, 'compact density did not resolve a block size').toBeGreaterThan(0);
  expect(
    spacious > compact,
    `density scale did not grow geometry (compact=${compact}, spacious=${spacious})`,
  ).toBe(true);
});

test('lane-v source parity: bithire-static and themanagement-db render identical part anatomy', async ({ page }) => {
  const anatomyOf = async (source: Source): Promise<string> => {
    await gotoCell(page, cellUrl(source));
    return page.evaluate(() => {
      const root = document.querySelector('[data-testid="lv-root"]');
      if (!root) return '';
      // Beyond-palette markup contract: the sorted (tag + data-part) sequence
      // must match across sources even though tokens differ.
      return Array.from(root.querySelectorAll('[data-part]'))
        .map((el) => `${el.tagName.toLowerCase()}:${el.getAttribute('data-part')}:${el.getAttribute('data-state') ?? ''}`)
        .join('|');
    });
  };

  const bithire = await anatomyOf('bithire-static');
  const tmm = await anatomyOf('themanagement-db');
  expect(bithire.length, 'no part anatomy rendered').toBeGreaterThan(0);
  expect(tmm, 'TMM DB anatomy diverges from BitHire static').toBe(bithire);
});

test.afterAll(() => {
  if (PRESSED_GAPS.length === 0) return;
  console.log(
    `\nPressed postures NOT computable (flagged for the coordinator, never faked):\n` +
      PRESSED_GAPS.map((gap) => `  - ${gap}`).join('\n'),
  );
});
