import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K3 Lane C (layout & navigation chrome) whitelabel evidence.
//
// Families: Collapse, ScrollArea, Layout, Splitter, Affix, Anchor, BackTop.
// Route: /probe/k3-lane-c (source × locale × density × state cells — the
// k1-lane probe pattern, with the probe owning the page's single <main> and
// single <h1> so the landmark moderates the K1 probes tripped never recur).
//
// Blocks:
//   1. axe matrix: 2 governed sources × (rest, active) — serious/critical
//      fail; minor/moderate persist to axe-report.json (merge-on-disk).
//   2. interactive states (k1-lane-states settle-poll pattern) on
//      bithire-static/en/comfortable/rest for four controls:
//        collapse-header, splitter-gutter, backtop-trigger, anchor-link
//      hover / focus-visible / pressed / forced-colors / reduced-motion,
//      with NOT-COMPUTABLE states flagged in PRESSED_GAPS, never faked.
//   3. keyboard evidence: sentinel Tab walk — collapse header Enter toggle,
//      splitter gutter ArrowRight resize, backtop ring, anchor link Enter.
//   4. coarse-pointer floor (real mobile chromium): collapse header and the
//      backtop trigger meet 44px PHYSICAL px; the splitter gutter's ::before
//      hit expansion computes to a 44px reach.
//   5. capture matrix (review artifacts, NOT baselines): source × locale ×
//      density at 1280 + state cells + 390 RTL spots, landing in
//      test-artifacts/rottay-design-platform/K2-K3/k3-lane-c/captures/.
// ---------------------------------------------------------------------------

type Source = 'bithire-static' | 'themanagement-db';
type Locale = 'en' | 'es' | 'ar';
type Density = 'compact' | 'comfortable' | 'spacious';
type State = 'rest' | 'disabled' | 'active';

const ROUTE = '/probe/k3-lane-c';
const WITNESS = 'k3-collapse';
const ROOT_TESTID = 'k3-root';

const SOURCES: readonly Source[] = ['bithire-static', 'themanagement-db'];
const LOCALES: readonly Locale[] = ['en', 'es', 'ar'];
const DENSITIES: readonly Density[] = ['compact', 'comfortable', 'spacious'];
const STATES: readonly State[] = ['disabled', 'active'];
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
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K2-K3', 'k3-lane-c');

const capturesDir = (): string => join(artifactDir(), 'captures');

const axeReportPath = (): string => join(artifactDir(), 'k3-lane-c-axe-report.json');

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
  for (const state of ['rest', 'active'] as const) {
    test(`axe k3-lane-c × ${source} × ${state}: zero serious/critical violations`, async ({
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
          `k3-lane-c/${source}/${state}: ${nonBlocking.length} minor/moderate axe finding(s) ` +
            `collected in ${axeReportPath()}:\n${formatViolations(nonBlocking)}`,
        );
      }

      expect(
        blocking,
        `k3-lane-c/${source}/${state} has serious/critical axe violations:\n${formatViolations(blocking)}`,
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

interface ControlDef {
  readonly name: string;
  /** Visible control root: hover target, mouse.down target, screenshot subject. */
  readonly control: string;
  /** The Tab-walk landing target — document.activeElement must match this. */
  readonly focusTarget: string;
  readonly samples: {
    readonly hover: string;
    readonly focus: string;
    readonly pressed: string;
    readonly frame: string;
    readonly motion: string;
  };
  /** 'paint' asserts a pressed difference; 'none' flags the gap. */
  readonly pressed: 'paint' | 'none';
  readonly pressedGap?: string;
  /**
   * Forced-colors essential affordance:
   *  'frame' — a border/outline survives;
   *  'fill'  — a non-transparent background survives (the splitter gutter's
   *            ButtonFace rail IS its affordance under forced colors);
   *  'text'  — resolved system ink (the anchor link's readable label).
   */
  readonly affordance: 'frame' | 'fill' | 'text';
  /** Also assert data-dragging='true' while held (the splitter gutter). */
  readonly expectDraggingDataState: boolean;
  /** Include in the coarse-pointer 44px-floor test. */
  readonly coarseFloor: 'element' | 'pseudo' | false;
}

const CONTROLS: readonly ControlDef[] = [
  {
    name: 'collapse-header',
    control: '[data-testid="k3-collapse"] [data-part="header"]',
    focusTarget: '[data-testid="k3-collapse"] [data-part="header"]',
    samples: {
      hover: '[data-testid="k3-collapse"] [data-part="header"]',
      focus: '[data-testid="k3-collapse"] [data-part="header"]',
      pressed: '[data-testid="k3-collapse"] [data-part="header"]',
      // The header has no frame of its own; the PANEL border is the affordance.
      frame: '[data-testid="k3-collapse"] [data-part="panel"]',
      motion: '[data-testid="k3-collapse"] [data-part="header"]',
    },
    pressed: 'paint', // collapse.css :active deepens the header bg
    affordance: 'frame',
    expectDraggingDataState: false,
    coarseFloor: 'element',
  },
  {
    name: 'splitter-gutter',
    control: '[data-testid="k3-splitter-horizontal"] [data-part="gutter"]',
    focusTarget: '[data-testid="k3-splitter-horizontal"] [data-part="gutter"]',
    samples: {
      hover: '[data-testid="k3-splitter-horizontal"] [data-part="gutter"]',
      focus: '[data-testid="k3-splitter-horizontal"] [data-part="gutter"]',
      pressed: '[data-testid="k3-splitter-horizontal"] [data-part="gutter"]',
      frame: '[data-testid="k3-splitter-horizontal"] [data-part="gutter"]',
      motion: '[data-testid="k3-splitter-horizontal"] [data-part="gutter"]',
    },
    pressed: 'paint', // splitter.css [data-dragging='true'] paints the primary rail
    affordance: 'fill',
    expectDraggingDataState: true,
    coarseFloor: 'pseudo',
  },
  {
    name: 'backtop-trigger',
    control: '[data-testid="k3-backtop"] button[data-part="trigger"]',
    focusTarget: '[data-testid="k3-backtop"] button[data-part="trigger"]',
    samples: {
      hover: '[data-testid="k3-backtop"] button[data-part="trigger"]',
      focus: '[data-testid="k3-backtop"] button[data-part="trigger"]',
      pressed: '[data-testid="k3-backtop"] button[data-part="trigger"]',
      frame: '[data-testid="k3-backtop"] button[data-part="trigger"]',
      motion: '[data-testid="k3-backtop"] button[data-part="trigger"]',
    },
    pressed: 'paint', // back-top.css :active releases the hover lift
    affordance: 'frame',
    expectDraggingDataState: false,
    coarseFloor: 'element',
  },
  {
    name: 'anchor-link',
    control: '[data-testid="k3-anchor"] a[data-part="item"]',
    focusTarget: '[data-testid="k3-anchor"] a[data-part="item"]',
    samples: {
      hover: '[data-testid="k3-anchor"] a[data-part="item"]',
      focus: '[data-testid="k3-anchor"] a[data-part="item"]',
      pressed: '[data-testid="k3-anchor"] a[data-part="item"]',
      frame: '[data-testid="k3-anchor"] a[data-part="item"]',
      motion: '[data-testid="k3-anchor"] a[data-part="item"]',
    },
    pressed: 'none',
    pressedGap:
      'k3-lane-c/anchor-link: anchor.css defines :hover and :focus-visible but no :active ' +
      'rule, and the Anchor engine stamps no data-state — a press changes nothing computable.',
    affordance: 'text',
    expectDraggingDataState: false,
    coarseFloor: false,
  },
];

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
      cell['data-state'] = el.getAttribute('data-state') ?? '';
      cell['data-dragging'] = el.getAttribute('data-dragging') ?? '';
      return cell;
    }, CHANNELS as unknown as string[]);
}

/**
 * Transition-aware settled read: sample the computed channels until TWO
 * consecutive samples agree (80ms apart, 3s cap) — the k1-lane-states
 * definition of "the animation finished".
 */
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

const SENTINEL_ID = 'k3-states-sentinel';

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

async function tabUntil(page: Page, selector: string, maxTabs = 32): Promise<void> {
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
  backgroundColor: string;
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
        backgroundColor: computed.backgroundColor,
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

function hasFill(read: ForcedColorsRead): boolean {
  return read.backgroundColor !== 'rgba(0, 0, 0, 0)' && read.backgroundColor !== 'transparent';
}

interface MotionRead {
  transitionDuration: string;
  animationDuration: string;
}

async function readMotion(page: Page, selector: string): Promise<MotionRead> {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        transitionDuration: computed.transitionDuration,
        animationDuration: computed.animationDuration,
      };
    });
}

/** The governed reduced-motion floor is 0.01ms (OLA-3); threshold-based. */
const COLLAPSED_FLOOR_MS = 0.011;

function durationMs(entry: string): number {
  const value = Number.parseFloat(entry);
  if (Number.isNaN(value)) return Number.POSITIVE_INFINITY;
  if (entry.endsWith('ms')) return value;
  if (entry.endsWith('s')) return value * 1000;
  return Number.POSITIVE_INFINITY;
}

function expectDurationsCollapsed(read: MotionRead, label: string): void {
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

/** Pressed postures that are NOT computable, printed at the end of the run. */
const PRESSED_GAPS: string[] = [];

test('k3-lane-c: flagship interactive states', async ({ page }) => {
  test.setTimeout(240_000);
  mkdirSync(capturesDir(), { recursive: true });
  // The visual config defaults to reducedMotion:'reduce'; the interactive
  // cells need the real transition policy, and each media cell resets after
  // itself.
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  await gotoCell(page, cellUrl('bithire-static', 'en', 'comfortable', 'rest'));
  await injectSentinel(page);

  for (const control of CONTROLS) {
    const label = `k3-lane-c/${control.name}`;
    const subject = page.locator(control.control).first();

    // ---- rest baseline ---------------------------------------------------
    await releasePointer(page);
    await blurEverything(page);
    const restHover = await readSettled(page, control.samples.hover);
    const restFocus = await readSettled(page, control.samples.focus);
    const restPressed = await readSettled(page, control.samples.pressed);

    // ---- 1. hover ----------------------------------------------------------
    await test.step(`${label}: hover repaints at least one channel`, async () => {
      await blurEverything(page);
      await subject.hover();
      const hovered = await readSettled(page, control.samples.hover);
      const diffs = paintDiff(restHover, hovered);
      expect(
        diffs.length,
        `${label}: hover changed nothing a user can see on ${control.samples.hover}`,
      ).toBeGreaterThan(0);
      console.log(`${label} hover paint diff:\n  ${diffs.join('\n  ')}`);
      await subject.screenshot({ path: join(capturesDir(), `k3-${control.name}-hover.png`) });
    });

    // ---- 2. focus-visible --------------------------------------------------
    await test.step(`${label}: keyboard focus paints a visible indicator`, async () => {
      await releasePointer(page);
      await blurEverything(page);
      await tabUntil(page, control.focusTarget);
      await expectActiveElement(page, control.focusTarget);
      const focused = await readSettled(page, control.samples.focus);
      const outlineVisible = (s: Sample): boolean =>
        s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0;
      const grewOutline = outlineVisible(focused) && !outlineVisible(restFocus);
      const grewShadow = focused.boxShadow !== 'none' && focused.boxShadow !== restFocus.boxShadow;
      expect(
        grewOutline || grewShadow,
        `${label}: keyboard focus paints nothing on ${control.samples.focus} ` +
          `(outline ${focused.outlineWidth} ${focused.outlineStyle}, box-shadow ${focused.boxShadow})`,
      ).toBe(true);
      await subject.screenshot({ path: join(capturesDir(), `k3-${control.name}-focus.png`) });
    });

    // ---- 3. pressed --------------------------------------------------------
    if (control.pressed === 'none') {
      PRESSED_GAPS.push(control.pressedGap ?? `${label}: pressed posture not computable`);
      console.log(`${label}: pressed state NOT computable — flagged, not faked. ${control.pressedGap ?? ''}`);
    } else {
      await test.step(`${label}: press repaints the control while held`, async () => {
        await releasePointer(page);
        await blurEverything(page);
        await subject.hover();
        await page.mouse.down();
        try {
          const pressed = await readSettled(page, control.samples.pressed);
          if (control.expectDraggingDataState) {
            expect(
              pressed['data-dragging'],
              `${label}: behavior layer did not stamp data-dragging='true'`,
            ).toBe('true');
          }
          const diffs = paintDiff(restPressed, pressed);
          expect(
            diffs.length,
            `${label}: a held press changed no paint channel on ${control.samples.pressed}`,
          ).toBeGreaterThan(0);
          console.log(`${label} pressed paint diff:\n  ${diffs.join('\n  ')}`);
          await subject.screenshot({ path: join(capturesDir(), `k3-${control.name}-pressed.png`) });
        } finally {
          await page.mouse.up();
          await releasePointer(page);
        }
      });
    }

    // ---- 4. forced-colors ---------------------------------------------------
    await test.step(`${label}: forced-colors keeps the essential affordance`, async () => {
      await blurEverything(page);
      await page.emulateMedia({ forcedColors: 'active' });
      try {
        await page.waitForTimeout(100);
        const read = await readForcedColors(page, control.samples.frame);
        console.log(
          `${label} forced-colors read: color=${read.color}, forced-color-adjust=${read.forcedColorAdjust}, ` +
            `border=${read.borderTopWidth} ${read.borderTopStyle}, outline=${read.outlineWidth} ${read.outlineStyle}, ` +
            `background=${read.backgroundColor}`,
        );
        expect(read.forcedColorAdjust, `${label}: forced-color-adjust opted out`).not.toBe('none');
        if (control.affordance === 'frame') {
          expect(
            hasFrame(read),
            `${label}: no border or outline survives forced colors on ${control.samples.frame}`,
          ).toBe(true);
        } else if (control.affordance === 'fill') {
          expect(
            hasFill(read),
            `${label}: no background fill survives forced colors on ${control.samples.frame}`,
          ).toBe(true);
        } else {
          expect(
            read.color.length,
            `${label}: text color did not resolve under forced colors`,
          ).toBeGreaterThan(0);
        }
        await subject.screenshot({ path: join(capturesDir(), `k3-${control.name}-forced-colors.png`) });
      } finally {
        await page.emulateMedia({ forcedColors: 'none' });
      }
    });

    // ---- 5. reduced-motion ---------------------------------------------------
    await test.step(`${label}: reduced-motion collapses transition/animation durations`, async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      try {
        await page.waitForTimeout(100);
        const read = await readMotion(page, control.samples.motion);
        expectDurationsCollapsed(read, label);
      } finally {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 2b. Affix affixed surface (the DS-P067 fix): the advanced specimen affixes
// deterministically (inner scroll box, offsetTop 0) and the SKIN paints the
// affixed surface — background + elevation, never an inline style.
// ---------------------------------------------------------------------------

test('k3-lane-c: affixed Affix paints the token surface via the skin', async ({ page }) => {
  test.setTimeout(60_000);
  await gotoCell(page, cellUrl('bithire-static', 'en', 'comfortable', 'active'));

  const affixed = page.locator('[data-testid="k3-affix-scrollbox"] [data-sticky="true"]');
  await affixed.waitFor({ timeout: 15_000 });

  const read = await affixed.first().evaluate((el) => {
    const computed = getComputedStyle(el);
    return {
      backgroundColor: computed.backgroundColor,
      boxShadow: computed.boxShadow,
      inlineBackground: (el as HTMLElement).style.background,
      inlineBoxShadow: (el as HTMLElement).style.boxShadow,
    };
  });

  expect(
    read.inlineBackground === '' && read.inlineBoxShadow === '',
    `affixed surface leaked inline (bg "${read.inlineBackground}", shadow "${read.inlineBoxShadow}")`,
  ).toBe(true);
  expect(
    read.backgroundColor !== 'rgba(0, 0, 0, 0)' && read.backgroundColor !== 'transparent',
    `affixed bar has no token surface (computed ${read.backgroundColor})`,
  ).toBe(true);
  expect(read.boxShadow, 'affixed bar has no token elevation').not.toBe('none');
});

// ---------------------------------------------------------------------------
// 3. Keyboard evidence.
// ---------------------------------------------------------------------------

async function installClickCounter(page: Page, selector: string): Promise<void> {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`click-counter target is missing: ${sel}`);
    (window as unknown as Record<string, number>).__k3Clicks = 0;
    el.addEventListener('click', () => {
      (window as unknown as Record<string, number>).__k3Clicks += 1;
    });
  }, selector);
}

async function clickCount(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as Record<string, number>).__k3Clicks ?? 0);
}

test('k3-lane-c: keyboard evidence — collapse toggle, splitter resize, anchor activation', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await gotoCell(page, cellUrl('bithire-static', 'en', 'comfortable', 'rest'));
  await injectSentinel(page);

  await test.step('collapse header: Tab reaches it and Enter toggles aria-expanded', async () => {
    const header = '[data-testid="k3-collapse"] [data-part="header"]';
    const first = page.locator(header).first();
    await expect(first).toHaveAttribute('role', 'button');
    await expect(first).toHaveAttribute('aria-expanded', 'true'); // rest cell: panel one open
    await tabUntil(page, header);
    await expectActiveElement(page, header);
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Space');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
  });

  await test.step('splitter gutter: Tab reaches it and ArrowRight resizes', async () => {
    const gutter = '[data-testid="k3-splitter-horizontal"] [data-part="gutter"]';
    const first = page.locator(gutter).first();
    await expect(first).toHaveAttribute('role', 'separator');
    await expect(first).toHaveAttribute('aria-valuenow', '50');
    await tabUntil(page, gutter);
    await expectActiveElement(page, gutter);
    await page.keyboard.press('ArrowRight');
    await expect(first).toHaveAttribute('aria-valuenow', '52');
    await page.keyboard.press('ArrowLeft');
    await expect(first).toHaveAttribute('aria-valuenow', '50');
  });

  await test.step('backtop trigger: Tab reaches it and the ring paints', async () => {
    const trigger = '[data-testid="k3-backtop"] button[data-part="trigger"]';
    await tabUntil(page, trigger);
    await expectActiveElement(page, trigger);
    const ring = await page.locator(trigger).first().evaluate((el) => {
      const computed = getComputedStyle(el);
      return { outlineStyle: computed.outlineStyle, outlineWidth: computed.outlineWidth };
    });
    expect(
      ring.outlineStyle !== 'none' && Number.parseFloat(ring.outlineWidth) > 0,
      `backtop: keyboard focus paints no ring (outline ${ring.outlineWidth} ${ring.outlineStyle})`,
    ).toBe(true);
  });

  await test.step('anchor link: Tab reaches it and Enter activates', async () => {
    const link = '[data-testid="k3-anchor"] a[data-part="item"]';
    await tabUntil(page, link);
    await expectActiveElement(page, link);
    await installClickCounter(page, link);
    await page.keyboard.press('Enter');
    expect(await clickCount(page), 'Enter did not fire the anchor link').toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 4. Coarse-pointer floor (real mobile chromium context — the
// density-authority-matrix group-H pattern; CDP media emulation does not
// flip (pointer: coarse) in this stack).
// ---------------------------------------------------------------------------

test('k3-lane-c: collapse header, backtop and the splitter gutter meet the coarse floor', async ({
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

    // Collapse header: 44px PHYSICAL px (padding tokens are px, never rem).
    expect(
      await heightOf('[data-testid="k3-collapse"] [data-part="header"]'),
      'collapse header touch floor (44px)',
    ).toBeGreaterThanOrEqual(44);

    // BackTop trigger: the skin owns a 44px frame (was 40px).
    const backtop = '[data-testid="k3-backtop"] button[data-part="trigger"]';
    expect(await heightOf(backtop), 'backtop trigger touch floor (44px)').toBeGreaterThanOrEqual(44);

    // Splitter gutter: the 8px rail extends to a 44px reach via ::before.
    const gutterReach = await coarsePage
      .locator('[data-testid="k3-splitter-horizontal"] [data-part="gutter"]')
      .first()
      .evaluate((el) => {
        const pseudo = getComputedStyle(el, '::before');
        return { content: pseudo.content, width: pseudo.width };
      });
    expect(gutterReach.content, 'gutter ::before hit expansion missing').not.toBe('none');
    expect(
      Number.parseFloat(gutterReach.width),
      `splitter gutter coarse reach (44px via ::before, computed ${gutterReach.width})`,
    ).toBeGreaterThanOrEqual(44);
  } finally {
    await context.close();
  }
});

// ---------------------------------------------------------------------------
// 5. Capture matrix (review artifacts, NOT baselines).
// ---------------------------------------------------------------------------

test('k3-lane-c: full source × locale × density capture sweep', async ({ page }) => {
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
          path: join(capturesDir(), `k3-lane-c-${source}-${locale}-${density}-rest-1280.png`),
          fullPage: true,
        });
      }
    }
  }
});

test('k3-lane-c: state cells per source', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  mkdirSync(capturesDir(), { recursive: true });

  for (const source of SOURCES) {
    for (const state of STATES) {
      await gotoCell(page, cellUrl(source, 'en', 'comfortable', state));
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: join(capturesDir(), `k3-lane-c-${source}-en-comfortable-${state}-1280.png`),
        fullPage: true,
      });
    }
  }
});

test('k3-lane-c: mobile + RTL spot cells', async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(capturesDir(), { recursive: true });

  for (const source of SOURCES) {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCell(page, cellUrl(source, 'ar', 'compact', 'rest'));
    const dir = await page.evaluate(() => document.dir);
    expect(dir).toBe('rtl');
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: join(capturesDir(), `k3-lane-c-${source}-ar-compact-rest-390.png`),
      fullPage: true,
    });
  }
});

test.afterAll(() => {
  if (PRESSED_GAPS.length === 0) return;
  console.log(
    `\nPressed postures NOT computable (flagged for the coordinator, never faked):\n` +
      PRESSED_GAPS.map((gap) => `  - ${gap}`).join('\n'),
  );
});
