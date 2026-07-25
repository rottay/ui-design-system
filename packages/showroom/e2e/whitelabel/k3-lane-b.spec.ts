import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K3 lane B (navigation) axe + keyboard + interactive-state evidence.
//
// Axe matrix: the lane probe (/probe/k3-lane-b) × governed source
// (bithire-static, themanagement-db) on the fixed cell locale=en,
// density=comfortable, state=rest. Each cell waits for the lane witness
// testid, document.fonts.ready, and a non-empty --ds-color-primary on <html>
// (the theme-compiled signal), then runs a full page-level
// `new AxeBuilder({ page }).analyze()` — the same usage as the K1/K3-A lane
// axe specs, including rule|target keying and useId-token normalization.
//
//   - serious/critical violations FAIL the cell.
//   - minor/moderate violations never fail; they are collected into the
//     merge-on-disk report at
//     test-artifacts/rottay-design-platform/K2-K3/k3-lane-b/axe/.
//
// Keyboard cases (bithire-static/en/comfortable/rest), sentinel-walked with
// real Tab presses (the k1-lane-axe pattern — the sentinel stays OUTSIDE the
// lane tree):
//
//   menu        Tab reaches the first item (real <a role="menuitem">), the
//               skin's :focus-visible outline paints, Enter selects it
//               (data-selected flips); the submenu trigger toggles
//               aria-expanded on Enter.
//   breadcrumb  Tab reaches the first crumb link; the ring paints.
//   pagination  Tab reaches the named prev button; Enter on page 7 moves
//               aria-current="page" (the probe holds `current`).
//   segmented   one roving tab stop (the selected radio); ArrowRight skips
//               the disabled option and moves focus+selection; ArrowLeft
//               returns.
//   steps       Tab reaches the first clickable step trigger (a real
//               <button>); Enter moves aria-current="step".
//   stepper     same contract through the vertical clickable stepper.
//
// Interactive-state cells (rest cell): the six flagship controls — menu item,
// breadcrumb crumb, pagination page button, segmented option, steps trigger,
// stepper trigger — each asserted on hover (a paint channel changes), real
// keyboard focus-visible (outline or box-shadow grows), pressed (paint
// changes while held), forced-colors (a frame survives, forced-color-adjust
// not opted out) and reduced-motion (durations collapse to the 0.01ms
// floor). Steps/Stepper sample the skin-owned circle through the `::after`
// pseudo-element — the circle IS a pseudo-element by design (the drained
// DaisyUI paint reborn in the skin), so the evidence reads it as one.
// Screenshots (review artifacts, NOT baselines) land in
// test-artifacts/rottay-design-platform/K2-K3/k3-lane-b/captures/states/.
//
// Coarse floor: a real mobile chromium context (390px, the group-H pattern —
// CDP media emulation does not flip (pointer: coarse) in this stack) asserts
// all six touch targets meet the physical 44px floor.
//
// NOT RUN BY THE LANE: per the wave protocol the lane delivers this spec
// written but unexecuted (no playwright in lane scope); the coordinator runs
// it at integration when the bundle is live on :7001.
// ---------------------------------------------------------------------------

type Source = 'bithire-static' | 'themanagement-db';

const ROUTE = '/probe/k3-lane-b';
const WITNESS = 'k3b-menu';
const ROOT_TESTID = 'k3b-root';
const SENTINEL_ID = 'k3b-kbd-sentinel';

const SOURCES: readonly Source[] = ['bithire-static', 'themanagement-db'];
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
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K2-K3', 'k3-lane-b', 'axe');

const capturesDir = (): string =>
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K2-K3', 'k3-lane-b', 'captures', 'states');

const reportPath = (): string => join(axeDir(), 'k3-lane-b-axe-report.json');

function cellUrl(source: Source): string {
  return `${ROUTE}?source=${source}&locale=en&density=comfortable&state=rest`;
}

/** The deterministic render witness for one cell. */
async function gotoCell(page: Page, source: Source): Promise<void> {
  await page.goto(cellUrl(source), { waitUntil: 'networkidle' });
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

/** Normalize a target selector so the report key is STABLE across runs. */
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

/** Merge one cell's results into the on-disk report, immediately. */
function persistCell(cellKey: string, cell: CellReport): void {
  mkdirSync(axeDir(), { recursive: true });
  const onDisk: AxeReport = existsSync(reportPath())
    ? (JSON.parse(readFileSync(reportPath(), 'utf8')) as AxeReport)
    : { generatedAt: '', blockingImpacts: [...BLOCKING_IMPACTS], cells: {} };
  const cells = { ...onDisk.cells, [cellKey]: cell };
  const ordered: Record<string, CellReport> = {};
  for (const key of Object.keys(cells).sort()) ordered[key] = cells[key];
  const next: AxeReport = {
    generatedAt: new Date().toISOString(),
    blockingImpacts: [...BLOCKING_IMPACTS],
    cells: ordered,
  };
  writeFileSync(reportPath(), `${JSON.stringify(next, null, 2)}\n`);
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

// ---------------------------------------------------------------------------
// Axe matrix: lane × governed source, zero serious/critical violations.
// ---------------------------------------------------------------------------

for (const source of SOURCES) {
  test(`axe k3-lane-b × ${source}: zero serious/critical violations`, async ({ page }) => {
    await gotoCell(page, source);

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = collectViolations(results, BLOCKING_IMPACTS);
    const nonBlocking = collectViolations(results, new Set(['minor', 'moderate']));

    persistCell(`k3-lane-b/${source}`, {
      source,
      url: cellUrl(source),
      blockingCount: blocking.length,
      blocking,
      nonBlockingCount: nonBlocking.length,
      nonBlocking,
    });

    if (nonBlocking.length > 0) {
      console.log(
        `k3-lane-b/${source}: ${nonBlocking.length} minor/moderate axe finding(s) ` +
          `collected in ${reportPath()}:\n${formatViolations(nonBlocking)}`,
      );
    }

    expect(
      blocking,
      `k3-lane-b/${source} has serious/critical axe violations:\n${formatViolations(blocking)}`,
    ).toEqual([]);
  });
}

// ---------------------------------------------------------------------------
// Keyboard evidence helpers (the k1-lane-axe sentinel pattern).
// ---------------------------------------------------------------------------

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

function describeActiveElement(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return '<body>';
    const part = el.getAttribute('data-part');
    const label = el.getAttribute('aria-label');
    return (
      el.tagName.toLowerCase() +
      (part ? `[data-part="${part}"]` : '') +
      (label ? `[aria-label="${label}"]` : '')
    );
  });
}

/**
 * Native-CSS-only matcher: Playwright's `:text-is()` pseudo is a selector-
 * engine extension and is INVALID inside `Element.matches()` — pass the
 * expected text separately and compare textContent instead.
 */
async function tabUntil(page: Page, selector: string, maxTabs = 40, text?: string): Promise<void> {
  await page.locator(`#${SENTINEL_ID}`).focus();
  const walk: string[] = [];
  for (let step = 0; step < maxTabs; step += 1) {
    await page.keyboard.press('Tab');
    const landed = await page.evaluate(
      ({ sel, expectedText }) => {
        if (!(document.activeElement instanceof Element)) return false;
        if (!document.activeElement.matches(sel)) return false;
        if (expectedText === undefined) return true;
        return (document.activeElement.textContent || '').trim() === expectedText;
      },
      { sel: selector, expectedText: text },
    );
    if (landed) return;
    walk.push(await describeActiveElement(page));
  }
  throw new Error(
    `Tab never reached ${selector}${text ? ` (text "${text}")` : ''} after ${maxTabs} presses. Walk: ${walk.join(' → ')}`,
  );
}

async function expectActiveElement(page: Page, selector: string, text?: string): Promise<void> {
  const landed = await page.evaluate(
    ({ sel, expectedText }) => {
      if (!(document.activeElement instanceof Element)) return false;
      if (!document.activeElement.matches(sel)) return false;
      if (expectedText === undefined) return true;
      return (document.activeElement.textContent || '').trim() === expectedText;
    },
    { sel: selector, expectedText: text },
  );
  expect(landed, `document.activeElement is not ${selector}${text ? ` (text "${text}")` : ''}`).toBe(true);
}

interface RingRead {
  outlineStyle: string;
  outlineWidth: string;
  boxShadow: string;
}

async function readRing(page: Page, selector: string): Promise<RingRead> {
  return page.locator(selector).first().evaluate((el) => {
    const computed = getComputedStyle(el);
    return {
      outlineStyle: computed.outlineStyle,
      outlineWidth: computed.outlineWidth,
      boxShadow: computed.boxShadow,
    };
  });
}

async function expectFocusRing(page: Page, ringSelector: string, label: string): Promise<void> {
  const ring = await readRing(page, ringSelector);
  const outlineVisible =
    ring.outlineStyle !== 'none' && Number.parseFloat(ring.outlineWidth) > 0;
  const shadowVisible = ring.boxShadow !== 'none';
  expect(
    outlineVisible || shadowVisible,
    `${label}: keyboard focus paints no indicator ` +
      `(outline ${ring.outlineWidth} ${ring.outlineStyle}, box-shadow ${ring.boxShadow})`,
  ).toBe(true);
}

test.describe('K3 lane B keyboard evidence', () => {
  test('menu: Tab reaches the first item, ring paints, Enter selects; the submenu trigger toggles', async ({
    page,
  }) => {
    await gotoCell(page, 'bithire-static');
    await injectSentinel(page);

    const firstItem = '[data-testid="k3b-menu"] [data-part="item"]';
    await tabUntil(page, firstItem);
    await expectActiveElement(page, firstItem);
    await expectFocusRing(page, firstItem, 'k3b-menu first item');

    await test.step('Enter selects the focused item', async () => {
      await page.keyboard.press('Enter');
      await expect(page.locator(firstItem).first()).toHaveAttribute('data-selected', 'true');
    });

    await test.step('the submenu trigger toggles aria-expanded with Enter', async () => {
      const trigger = '[data-testid="k3b-menu"] [data-part="trigger"]';
      await tabUntil(page, trigger);
      await expectActiveElement(page, trigger);
      await expectFocusRing(page, trigger, 'k3b-menu submenu trigger');
      // The probe opens the settings submenu by default: Enter closes it.
      await expect(page.locator(trigger).first()).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Enter');
      await expect(page.locator(trigger).first()).toHaveAttribute('aria-expanded', 'false');
      await page.keyboard.press(' ');
      await expect(page.locator(trigger).first()).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test('breadcrumb: Tab reaches the first crumb link and the ring paints', async ({ page }) => {
    await gotoCell(page, 'bithire-static');
    await injectSentinel(page);

    const crumb = '[data-testid="k3b-breadcrumb"] a[data-part="crumb"]';
    await tabUntil(page, crumb);
    await expectActiveElement(page, crumb);
    await expectFocusRing(page, crumb, 'k3b-breadcrumb first crumb');
    await expect(page.locator(crumb).first()).toHaveAttribute('data-clickable', 'true');
  });

  test('pagination: Tab reaches the named prev button; Enter moves aria-current', async ({
    page,
  }) => {
    await gotoCell(page, 'bithire-static');
    await injectSentinel(page);

    const prev = '[data-testid="k3b-pagination"] [data-direction="prev"]';
    await tabUntil(page, prev);
    await expectActiveElement(page, prev);
    await expectFocusRing(page, prev, 'k3b-pagination prev');

    const pageSeven = '[data-testid="k3b-pagination"] [data-part="pagination-page-button"]';
    await tabUntil(page, pageSeven, 40, '7');
    await page.keyboard.press('Enter');
    await expect(
      page.locator('[data-testid="k3b-pagination"] [data-part="pagination-page-button"][data-current="true"]'),
    ).toHaveText('7');
    await expect(
      page.locator('[data-testid="k3b-pagination"] [aria-current="page"]'),
    ).toHaveText('7');
  });

  test('segmented: one roving tab stop; arrows move focus and selection, skipping disabled', async ({
    page,
  }) => {
    await gotoCell(page, 'bithire-static');
    await injectSentinel(page);

    const selected = '[data-testid="k3b-segmented"] [data-part="option"][data-selected="true"]';
    await expect(page.locator(selected)).toHaveText('Grid');

    await tabUntil(page, selected);
    await expectActiveElement(page, selected);
    await expectFocusRing(page, selected, 'k3b-segmented selected option');

    // ArrowRight skips the disabled "Cards" option and wraps to "List".
    await page.keyboard.press('ArrowRight');
    const options = '[data-testid="k3b-segmented"] [data-part="option"]';
    await expectActiveElement(page, options, 'List');
    await expect(page.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
    await expect(
      page.locator('[data-testid="k3b-segmented"] [data-part="option"][data-selected="true"]'),
    ).toHaveText('List');

    // ArrowLeft wraps back over the disabled option to "Grid".
    await page.keyboard.press('ArrowLeft');
    await expectActiveElement(page, options, 'Grid');
    await expect(page.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');
  });

  test('steps: Tab reaches the first clickable trigger; Enter moves aria-current="step"', async ({
    page,
  }) => {
    await gotoCell(page, 'bithire-static');
    await injectSentinel(page);

    const firstTrigger = '[data-testid="k3b-steps"] [data-part="trigger"]';
    await tabUntil(page, firstTrigger);
    await expectActiveElement(page, firstTrigger);
    await expectFocusRing(page, firstTrigger, 'k3b-steps first trigger');

    // The third step (Payment) is clickable; Enter moves the current step.
    const paymentTrigger = '[data-testid="k3b-steps"] [data-part="item"]:nth-child(3) [data-part="trigger"]';
    await tabUntil(page, paymentTrigger);
    await page.keyboard.press('Enter');
    await expect(
      page.locator('[data-testid="k3b-steps"] [data-part="item"]:nth-child(3)'),
    ).toHaveAttribute('aria-current', 'step');
    await expect(
      page.locator('[data-testid="k3b-steps"] [data-part="item"]:nth-child(3)'),
    ).toHaveAttribute('data-status', 'process');
  });

  test('stepper: Tab reaches the first clickable trigger; Enter moves the current step', async ({
    page,
  }) => {
    await gotoCell(page, 'bithire-static');
    await injectSentinel(page);

    const firstTrigger = '[data-testid="k3b-stepper"] [data-part="trigger"]';
    await tabUntil(page, firstTrigger);
    await expectActiveElement(page, firstTrigger);
    await expectFocusRing(page, firstTrigger, 'k3b-stepper first trigger');

    // Uncontrolled stepper at defaultCurrent=1: activating Draft moves the
    // process marker back to the first step.
    await page.keyboard.press('Enter');
    await expect(
      page.locator('[data-testid="k3b-stepper"] [data-part="item"]:nth-child(1)'),
    ).toHaveAttribute('aria-current', 'step');
  });
});

// ---------------------------------------------------------------------------
// Interactive-state evidence (the k1-lane-states machinery + pseudo support).
// ---------------------------------------------------------------------------

interface ControlDef {
  /** Artifact/log name: k3b-<name>-<state>.png. */
  readonly name: string;
  /** Visible control root: hover target, mouse.down target, screenshot subject. */
  readonly control: string;
  /** The Tab-walk landing target — document.activeElement must match this. */
  readonly focusTarget: string;
  /** The element (or pseudo-element) whose computed paint is settle-polled. */
  readonly samples: {
    readonly hover: string;
    readonly focus: string;
    readonly pressed: string;
    readonly frame: string;
    readonly motion: string;
  };
  /** Pseudo-element to read instead of the element itself (Steps/Stepper circle). */
  readonly pseudo?: '::after';
  /** Which samples read the pseudo-element. */
  readonly pseudoSamples: readonly ('hover' | 'focus' | 'pressed' | 'frame' | 'motion')[];
}

const CONTROLS: readonly ControlDef[] = [
  {
    name: 'menu-item',
    control: '[data-testid="k3b-menu"] [data-part="item"]',
    focusTarget: '[data-testid="k3b-menu"] [data-part="item"]',
    samples: {
      hover: '[data-testid="k3b-menu"] [data-part="item"]',
      focus: '[data-testid="k3b-menu"] [data-part="item"]',
      pressed: '[data-testid="k3b-menu"] [data-part="item"]',
      frame: '[data-testid="k3b-menu"] [data-part="item"]',
      motion: '[data-testid="k3b-menu"] [data-part="item"]',
    },
    pseudoSamples: [],
  },
  {
    name: 'breadcrumb-crumb',
    control: '[data-testid="k3b-breadcrumb"] a[data-part="crumb"]',
    focusTarget: '[data-testid="k3b-breadcrumb"] a[data-part="crumb"]',
    samples: {
      hover: '[data-testid="k3b-breadcrumb"] a[data-part="crumb"]',
      focus: '[data-testid="k3b-breadcrumb"] a[data-part="crumb"]',
      pressed: '[data-testid="k3b-breadcrumb"] a[data-part="crumb"]',
      frame: '[data-testid="k3b-breadcrumb"] a[data-part="crumb"]',
      motion: '[data-testid="k3b-breadcrumb"] a[data-part="crumb"]',
    },
    pseudoSamples: [],
  },
  {
    name: 'pagination-page',
    control:
      '[data-testid="k3b-pagination"] [data-part="pagination-page-button"][data-current="false"]',
    focusTarget:
      '[data-testid="k3b-pagination"] [data-part="pagination-page-button"][data-current="false"]',
    samples: {
      hover: '[data-testid="k3b-pagination"] [data-part="pagination-page-button"][data-current="false"]',
      focus: '[data-testid="k3b-pagination"] [data-part="pagination-page-button"][data-current="false"]',
      pressed: '[data-testid="k3b-pagination"] [data-part="pagination-page-button"][data-current="false"]',
      frame: '[data-testid="k3b-pagination"] [data-part="pagination-page-button"][data-current="false"]',
      motion: '[data-testid="k3b-pagination"] [data-part="pagination-page-button"][data-current="false"]',
    },
    pseudoSamples: [],
  },
  {
    name: 'segmented-option',
    control: '[data-testid="k3b-segmented"] [data-part="option"][data-selected="false"]',
    focusTarget: '[data-testid="k3b-segmented"] [data-part="option"][data-selected="true"]',
    samples: {
      hover: '[data-testid="k3b-segmented"] [data-part="option"][data-selected="false"]',
      focus: '[data-testid="k3b-segmented"] [data-part="option"][data-selected="true"]',
      pressed: '[data-testid="k3b-segmented"] [data-part="option"][data-selected="false"]',
      frame: '[data-testid="k3b-segmented"] [data-part="option"][data-selected="false"]',
      motion: '[data-testid="k3b-segmented"] [data-part="option"][data-selected="false"]',
    },
    pseudoSamples: [],
  },
  {
    name: 'steps-trigger',
    control: '[data-testid="k3b-steps"] [data-part="trigger"]',
    focusTarget: '[data-testid="k3b-steps"] [data-part="trigger"]',
    samples: {
      // Hover speaks through the label ink (real element) AND the circle
      // (pseudo); the label is the robust channel, the circle is sampled in
      // the pressed/frame/motion cells where it is the ONLY painted surface.
      hover: '[data-testid="k3b-steps"] [data-part="trigger"] [data-part="label"]',
      focus: '[data-testid="k3b-steps"] [data-part="trigger"]',
      pressed: '[data-testid="k3b-steps"] [data-part="item"][data-clickable="true"]',
      frame: '[data-testid="k3b-steps"] [data-part="item"][data-clickable="true"]',
      motion: '[data-testid="k3b-steps"] [data-part="item"][data-clickable="true"]',
    },
    pseudo: '::after',
    pseudoSamples: ['pressed', 'frame', 'motion'],
  },
  {
    name: 'stepper-trigger',
    control: '[data-testid="k3b-stepper"] [data-part="trigger"]',
    focusTarget: '[data-testid="k3b-stepper"] [data-part="trigger"]',
    samples: {
      hover: '[data-testid="k3b-stepper"] [data-part="trigger"] [data-part="label"]',
      focus: '[data-testid="k3b-stepper"] [data-part="trigger"]',
      pressed: '[data-testid="k3b-stepper"] [data-part="item"][data-clickable="true"]',
      frame: '[data-testid="k3b-stepper"] [data-part="item"][data-clickable="true"]',
      motion: '[data-testid="k3b-stepper"] [data-part="item"][data-clickable="true"]',
    },
    pseudo: '::after',
    pseudoSamples: ['pressed', 'frame', 'motion'],
  },
];

/** The paint channels a state can speak through (the k1-lane-states vocabulary). */
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

function pseudoFor(control: ControlDef, sample: 'hover' | 'focus' | 'pressed' | 'frame' | 'motion'): string | null {
  return control.pseudo && control.pseudoSamples.includes(sample) ? control.pseudo : null;
}

async function sampleOnce(page: Page, selector: string, pseudo: string | null): Promise<Sample> {
  return page
    .locator(selector)
    .first()
    .evaluate(
      (el, { channels, pseudoElt }) => {
        const computed = getComputedStyle(el, pseudoElt);
        const cell: Record<string, string> = {};
        for (const channel of channels) {
          cell[channel] = (computed as unknown as Record<string, string>)[channel] ?? '';
        }
        return cell;
      },
      { channels: CHANNELS as unknown as string[], pseudoElt: pseudo },
    );
}

/**
 * Transition-aware settled read: sample the computed channels until TWO
 * consecutive samples agree (80ms apart, 3s cap).
 */
async function readSettled(page: Page, selector: string, pseudo: string | null): Promise<Sample> {
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

/** Per-channel paint differences for assertion messages. */
function paintDiff(rest: Sample, current: Sample): string[] {
  const diffs: string[] = [];
  for (const channel of CHANNELS) {
    if (rest[channel] !== current[channel]) {
      diffs.push(`${channel}: ${rest[channel]} -> ${current[channel]}`);
    }
  }
  return diffs;
}

/** Parks the pointer off every control so no subject is left hovered. */
async function releasePointer(page: Page): Promise<void> {
  await page.mouse.move(2, 2);
}

async function blurEverything(page: Page): Promise<void> {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

interface ForcedColorsRead {
  borderTopWidth: string;
  borderTopStyle: string;
  outlineWidth: string;
  outlineStyle: string;
  color: string;
  forcedColorAdjust: string;
}

async function readForcedColors(page: Page, selector: string, pseudo: string | null): Promise<ForcedColorsRead> {
  return page
    .locator(selector)
    .first()
    .evaluate((el, pseudoElt) => {
      const computed = getComputedStyle(el, pseudoElt);
      return {
        borderTopWidth: computed.borderTopWidth,
        borderTopStyle: computed.borderTopStyle,
        outlineWidth: computed.outlineWidth,
        outlineStyle: computed.outlineStyle,
        color: computed.color,
        forcedColorAdjust: computed.forcedColorAdjust,
      };
    }, pseudo);
}

function hasFrame(read: ForcedColorsRead): boolean {
  const border =
    Number.parseFloat(read.borderTopWidth) > 0 && read.borderTopStyle !== 'none';
  const outline =
    Number.parseFloat(read.outlineWidth) > 0 && read.outlineStyle !== 'none';
  return border || outline;
}

interface MotionRead {
  transitionDuration: string;
  animationDuration: string;
}

async function readMotion(page: Page, selector: string, pseudo: string | null): Promise<MotionRead> {
  return page
    .locator(selector)
    .first()
    .evaluate((el, pseudoElt) => {
      const computed = getComputedStyle(el, pseudoElt);
      return {
        transitionDuration: computed.transitionDuration,
        animationDuration: computed.animationDuration,
      };
    }, pseudo);
}

/**
 * The governed reduced-motion floor is 0.01ms (OLA-3): motion must collapse to
 * it, not to a literal 0. Browsers serialize that floor as `1e-05s`, so the
 * check is threshold-based.
 */
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

test('k3-lane-b: flagship interactive states', async ({ page }) => {
  test.setTimeout(180_000);
  mkdirSync(capturesDir(), { recursive: true });
  // The visual config defaults to reducedMotion:'reduce'; the interactive
  // cells need the real transition policy, and each media cell resets after
  // itself.
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  await gotoCell(page, 'bithire-static');
  await injectSentinel(page);

  for (const control of CONTROLS) {
    const label = `k3b/${control.name}`;
    const subject = page.locator(control.control).first();

    // ---- rest baseline ---------------------------------------------------
    await releasePointer(page);
    await blurEverything(page);
    const restHover = await readSettled(page, control.samples.hover, pseudoFor(control, 'hover'));
    const restFocus = await readSettled(page, control.samples.focus, pseudoFor(control, 'focus'));
    const restPressed = await readSettled(page, control.samples.pressed, pseudoFor(control, 'pressed'));

    // ---- 1. hover ----------------------------------------------------------
    await test.step(`${label}: hover repaints at least one channel`, async () => {
      await blurEverything(page);
      await subject.hover();
      const hovered = await readSettled(page, control.samples.hover, pseudoFor(control, 'hover'));
      const diffs = paintDiff(restHover, hovered);
      expect(
        diffs.length,
        `${label}: hover changed nothing a user can see on ${control.samples.hover}`,
      ).toBeGreaterThan(0);
      console.log(`${label} hover paint diff:\n  ${diffs.join('\n  ')}`);
      await subject.screenshot({ path: join(capturesDir(), `k3b-${control.name}-hover.png`) });
    });

    // ---- 2. focus-visible --------------------------------------------------
    await test.step(`${label}: keyboard focus paints a visible indicator`, async () => {
      await releasePointer(page);
      await blurEverything(page);
      await tabUntil(page, control.focusTarget);
      await expectActiveElement(page, control.focusTarget);
      const focused = await readSettled(page, control.samples.focus, pseudoFor(control, 'focus'));
      const outlineVisible = (s: Sample): boolean =>
        s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0;
      const grewOutline = outlineVisible(focused) && !outlineVisible(restFocus);
      const grewShadow = focused.boxShadow !== 'none' && focused.boxShadow !== restFocus.boxShadow;
      expect(
        grewOutline || grewShadow,
        `${label}: keyboard focus paints nothing on ${control.samples.focus} ` +
          `(outline ${focused.outlineWidth} ${focused.outlineStyle}, box-shadow ${focused.boxShadow})`,
      ).toBe(true);
      await subject.screenshot({ path: join(capturesDir(), `k3b-${control.name}-focus.png`) });
    });

    // ---- 3. pressed ----------------------------------------------------------
    await test.step(`${label}: press repaints the control while held`, async () => {
      await releasePointer(page);
      await blurEverything(page);
      await subject.hover();
      await page.mouse.down();
      try {
        const pressed = await readSettled(page, control.samples.pressed, pseudoFor(control, 'pressed'));
        const diffs = paintDiff(restPressed, pressed);
        expect(
          diffs.length,
          `${label}: a held press changed no paint channel on ${control.samples.pressed}`,
        ).toBeGreaterThan(0);
        console.log(`${label} pressed paint diff:\n  ${diffs.join('\n  ')}`);
        await subject.screenshot({ path: join(capturesDir(), `k3b-${control.name}-pressed.png`) });
      } finally {
        await page.mouse.up();
        await releasePointer(page);
      }
    });

    // ---- 4. forced-colors ---------------------------------------------------
    await test.step(`${label}: forced-colors keeps a frame`, async () => {
      await blurEverything(page);
      await page.emulateMedia({ forcedColors: 'active' });
      try {
        await page.waitForTimeout(100);
        const read = await readForcedColors(page, control.samples.frame, pseudoFor(control, 'frame'));
        console.log(
          `${label} forced-colors read: color=${read.color}, forced-color-adjust=${read.forcedColorAdjust}, ` +
            `border=${read.borderTopWidth} ${read.borderTopStyle}, outline=${read.outlineWidth} ${read.outlineStyle}`,
        );
        expect(read.forcedColorAdjust, `${label}: forced-color-adjust opted out`).not.toBe('none');
        expect(read.color.length, `${label}: text color did not resolve under forced colors`).toBeGreaterThan(0);
        expect(
          hasFrame(read),
          `${label}: no border or outline survives forced colors on ${control.samples.frame}`,
        ).toBe(true);
        await subject.screenshot({ path: join(capturesDir(), `k3b-${control.name}-forced-colors.png`) });
      } finally {
        await page.emulateMedia({ forcedColors: 'none' });
      }
    });

    // ---- 5. reduced-motion ---------------------------------------------------
    await test.step(`${label}: reduced-motion collapses transition/animation durations`, async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      try {
        await page.waitForTimeout(100);
        const read = await readMotion(page, control.samples.motion, pseudoFor(control, 'motion'));
        expectDurationsCollapsed(read, label);
      } finally {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 6. coarse-pointer 44px floor (real mobile chromium — the group-H pattern).
// ---------------------------------------------------------------------------

test('k3-lane-b controls meet the 44px coarse-pointer floor', async ({ browser, browserName }) => {
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

    const heightOf = async (selector: string): Promise<number> => {
      const box = await coarsePage.locator(selector).first().boundingBox();
      expect(box, `no bounding box for ${selector}`).not.toBeNull();
      return (box as { height: number }).height;
    };

    await gotoCell(coarsePage, 'bithire-static');

    const FLOOR_CONTROLS: readonly [string, string][] = [
      ['menu-item', '[data-testid="k3b-menu"] [data-part="item"]'],
      ['breadcrumb-crumb', '[data-testid="k3b-breadcrumb"] a[data-part="crumb"]'],
      ['pagination-page', '[data-testid="k3b-pagination"] [data-part="pagination-page-button"]'],
      ['segmented-option', '[data-testid="k3b-segmented"] [data-part="option"]'],
      ['steps-trigger', '[data-testid="k3b-steps"] [data-part="trigger"]'],
      ['stepper-trigger', '[data-testid="k3b-stepper"] [data-part="trigger"]'],
    ];

    for (const [name, selector] of FLOOR_CONTROLS) {
      expect(await heightOf(selector), `k3b/${name} touch floor (44px)`).toBeGreaterThanOrEqual(44);
    }
  } finally {
    await context.close();
  }
});
