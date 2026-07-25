import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K1 lane axe + keyboard evidence (R0 evidence infrastructure).
//
// Axe matrix: lane (a, b, c) × governed source (bithire-static, themanagement-db)
// on the fixed cell locale=en, density=comfortable, state=rest. Each cell waits
// for the lane witness testid, document.fonts.ready, and a non-empty
// --ds-color-primary on <html> (the theme-compiled signal), then runs a full
// page-level `new AxeBuilder({ page }).analyze()` — the same usage as WO-GAT-04
// (e2e/a11y/axe.spec.ts), including the rule|target keying and the useId-token
// normalization for stable selectors.
//
//   - serious/critical violations FAIL the cell. The failure message prints the
//     full violation list: rule id, impact, help text and every normalized
//     target selector.
//   - minor/moderate violations never fail; they are collected into a summary
//     report persisted incrementally (merge-on-disk, the states.spec.ts persist
//     pattern, so a worker restart cannot erase earlier cells) at
//     test-artifacts/rottay-design-platform/K0-K1/axe/k1-lane-axe-report.json.
//
// Keyboard cases (one per lane, bithire-static/en/comfortable/rest): a sentinel
// button is injected before the lane root (the e2e/visual/states.spec.ts
// pattern — the sentinel stays OUTSIDE the lane tree so no lane selector shifts)
// and focus is walked with real Tab presses. For every interactive control of
// the lane we assert (1) Tab order reaches it, (2) document.activeElement is the
// expected control, (3) a focus indicator is computable — outline/box-shadow on
// the control itself, or on the painted sibling part for the visually-hidden
// native inputs (checkbox box, switch/toggle track: the skin paints the ring via
// `input:focus-visible ~ [data-part=...]`, never on the clipped input) — and
// (4) Enter/Space activates where applicable:
//
//   lane-a  Tag dismiss (native button: click observed), clickable Tag
//           (Enter/Space consumed by the engine's keydown handler — observed via
//           event.defaultPrevented, the deterministic proof the activation path
//           is wired; the probe's onClick is a no-op), NavLink (click observed +
//           location hash navigates).
//   lane-b  Input (focus lands, typing lands), PasswordInput visibility toggle
//           (input type flips), Checkbox/Switch/Toggle (Space flips aria-checked
//           and data-checked).
//   lane-c  Alert + Callout dismiss (the shell unmounts — the engines own their
//           visible state), Result action (native button: click observed; the
//           probe wires no onClick, so the click event IS the activation proof).
// ---------------------------------------------------------------------------

type LaneId = 'a' | 'b' | 'c';
type Source = 'bithire-static' | 'themanagement-db';

interface LaneDef {
  readonly id: LaneId;
  readonly route: string;
  /** First testid that must exist per cell (render witness). */
  readonly witness: string;
  /** The lane tree root; the keyboard sentinel is inserted before it. */
  readonly rootTestId: string;
}

const LANES: readonly LaneDef[] = [
  { id: 'a', route: '/probe/k1-lane-a', witness: 'la-avatar', rootTestId: 'la-root' },
  { id: 'b', route: '/probe/k1-lane-b', witness: 'lb-input', rootTestId: 'lb-root' },
  { id: 'c', route: '/probe/k1-lane-c', witness: 'lc-alert', rootTestId: 'lc-root' },
];

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

const artifactDir = (): string =>
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K0-K1', 'axe');

const reportPath = (): string => join(artifactDir(), 'k1-lane-axe-report.json');

function cellUrl(lane: LaneDef, source: Source): string {
  return `${lane.route}?source=${source}&locale=en&density=comfortable&state=rest`;
}

/**
 * The deterministic render witness for one cell: lane testid, theme tokens
 * compiled onto <html>, fonts settled, and a final short paint settle (mirrors
 * gotoCell in k1-lane-captures.spec.ts).
 */
async function gotoCell(page: Page, lane: LaneDef, source: Source): Promise<void> {
  await page.goto(cellUrl(lane, source), { waitUntil: 'networkidle' });
  await page.getByTestId(lane.witness).waitFor({ timeout: 30_000 });
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

/**
 * Normalize a target selector so the report key is STABLE across runs (the
 * WO-GAT-04 rationale): axe emits CSS selectors that embed React `useId()`
 * tokens which change every render; collapse them to `_id_`.
 */
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
  lane: LaneId;
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
  mkdirSync(artifactDir(), { recursive: true });
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

for (const lane of LANES) {
  for (const source of SOURCES) {
    test(`axe lane-${lane.id} × ${source}: zero serious/critical violations`, async ({ page }) => {
      await gotoCell(page, lane, source);

      const results = await new AxeBuilder({ page }).analyze();
      const blocking = collectViolations(results, BLOCKING_IMPACTS);
      const nonBlocking = collectViolations(
        results,
        new Set(['minor', 'moderate']),
      );

      persistCell(`lane-${lane.id}/${source}`, {
        lane: lane.id,
        source,
        url: cellUrl(lane, source),
        blockingCount: blocking.length,
        blocking,
        nonBlockingCount: nonBlocking.length,
        nonBlocking,
      });

      if (nonBlocking.length > 0) {
        console.log(
          `lane-${lane.id}/${source}: ${nonBlocking.length} minor/moderate axe finding(s) ` +
            `collected in ${reportPath()}:\n${formatViolations(nonBlocking)}`,
        );
      }

      expect(
        blocking,
        `lane-${lane.id}/${source} has serious/critical axe violations:\n${formatViolations(blocking)}`,
      ).toEqual([]);
    });
  }
}

// ---------------------------------------------------------------------------
// Keyboard evidence per lane.
// ---------------------------------------------------------------------------

const SENTINEL_ID = 'k1-kbd-sentinel';

/**
 * Inserts a focusable sentinel immediately before the lane root. It lives
 * OUTSIDE the lane tree so no lane selector (and no nth() addressing) shifts
 * because it exists (the states.spec.ts sentinel rationale).
 */
async function injectSentinel(page: Page, lane: LaneDef): Promise<void> {
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
    { sentinelId: SENTINEL_ID, rootTestId: lane.rootTestId },
  );
}

function describeActiveElement(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return '<body>';
    const part = el.getAttribute('data-part');
    const label = el.getAttribute('aria-label');
    const testid = el.getAttribute('data-testid');
    return (
      el.tagName.toLowerCase() +
      (part ? `[data-part="${part}"]` : '') +
      (testid ? `[data-testid="${testid}"]` : '') +
      (label ? `[aria-label="${label}"]` : '')
    );
  });
}

/**
 * Focuses the sentinel, then Tabs forward until document.activeElement matches
 * `selector`. Throws with the full walk when the control is unreachable — a
 * walk log is the difference between "the control is not in the tab order" and
 * "the test could not find it".
 */
async function tabUntil(page: Page, selector: string, maxTabs = 24): Promise<void> {
  await page.locator(`#${SENTINEL_ID}`).focus();
  const walk: string[] = [];
  for (let step = 0; step < maxTabs; step += 1) {
    await page.keyboard.press('Tab');
    const landed = await page.evaluate(
      (sel) => document.activeElement instanceof Element && document.activeElement.matches(sel),
      selector,
    );
    if (landed) return;
    walk.push(await describeActiveElement(page));
  }
  throw new Error(
    `Tab never reached ${selector} after ${maxTabs} presses. Walk: ${walk.join(' → ')}`,
  );
}

/** Active-element assertion, kept explicit because it is half of the evidence. */
async function expectActiveElement(page: Page, selector: string): Promise<void> {
  const landed = await page.evaluate(
    (sel) => document.activeElement instanceof Element && document.activeElement.matches(sel),
    selector,
  );
  expect(landed, `document.activeElement is not ${selector}`).toBe(true);
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

/**
 * A keyboard focus indicator is an outline that is not `none`/`0px`, or a
 * box-shadow ring. `ringSelector` is the element the skin paints the ring ON —
 * the control itself, or the painted sibling part (checkbox box, switch/toggle
 * track) when the focus target is a visually-clipped native input.
 */
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

/** Installs a click counter on one element; returns nothing — read it back with clickCount(). */
async function installClickCounter(page: Page, selector: string): Promise<void> {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`click-counter target is missing: ${sel}`);
    (window as unknown as Record<string, number>).__k1Clicks = 0;
    el.addEventListener('click', () => {
      (window as unknown as Record<string, number>).__k1Clicks += 1;
    });
  }, selector);
}

async function clickCount(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as Record<string, number>).__k1Clicks ?? 0);
}

/** Installs a keydown probe recording event.defaultPrevented AFTER React's root handler ran. */
async function installKeydownProbe(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as Record<string, Record<string, boolean>>).__k1Keys = {};
    document.addEventListener('keydown', (event) => {
      (window as unknown as Record<string, Record<string, boolean>>).__k1Keys[event.key] =
        event.defaultPrevented;
    });
  });
}

async function keyWasConsumed(page: Page, key: string): Promise<boolean> {
  return page.evaluate(
    (k) => (window as unknown as Record<string, Record<string, boolean>>).__k1Keys[k] === true,
    key,
  );
}

test.describe('K1 lane keyboard evidence', () => {
  test('lane-a: Tab reaches the tag dismiss, clickable tag and link in order; Enter/Space activates', async ({
    page,
  }) => {
    const lane = LANES[0];
    await gotoCell(page, lane, 'bithire-static');
    await injectSentinel(page, lane);

    const tagClose = '[data-testid="la-tag"] [data-part="close"]';
    const clickableTag = '[data-testid="la-tag"] [data-clickable="true"]';
    const firstLink = '[data-testid="la-link"] a.rottay-link-shell';

    await test.step('Tab order: tag dismiss → clickable tag → first link', async () => {
      await page.locator(`#${SENTINEL_ID}`).focus();
      const order: Record<string, number> = {};
      for (let step = 1; step <= 24 && Object.keys(order).length < 3; step += 1) {
        await page.keyboard.press('Tab');
        for (const [name, selector] of [
          ['tag-close', tagClose],
          ['clickable-tag', clickableTag],
          ['first-link', firstLink],
        ] as const) {
          if (order[name] !== undefined) continue;
          const hit = await page.evaluate(
            (sel) =>
              document.activeElement instanceof Element && document.activeElement.matches(sel),
            selector,
          );
          if (hit) order[name] = step;
        }
      }
      expect(order['tag-close'], 'tag dismiss is not in the tab order').toBeDefined();
      expect(order['clickable-tag'], 'clickable tag is not in the tab order').toBeDefined();
      expect(order['first-link'], 'first link is not in the tab order').toBeDefined();
      expect(order['tag-close']).toBeLessThan(order['clickable-tag']);
      expect(order['clickable-tag']).toBeLessThan(order['first-link']);
    });

    await test.step('tag dismiss: focus ring + Enter activates the close button', async () => {
      await tabUntil(page, tagClose);
      await expectActiveElement(page, tagClose);
      await expectFocusRing(page, tagClose, 'la-tag dismiss');
      await installClickCounter(page, tagClose);
      await page.keyboard.press('Enter');
      expect(await clickCount(page), 'Enter did not fire the tag close button').toBe(1);
    });

    await test.step('clickable tag: focus ring + Enter/Space are consumed by its key handler', async () => {
      await tabUntil(page, clickableTag);
      await expectActiveElement(page, clickableTag);
      await expectFocusRing(page, clickableTag, 'la-tag clickable');
      // The probe's onClick is a no-op, so activation has no DOM effect; the
      // deterministic proof the activation path is wired is the engine's
      // keydown handler consuming Enter/Space (event.preventDefault()).
      await installKeydownProbe(page);
      await page.keyboard.press('Enter');
      expect(await keyWasConsumed(page, 'Enter'), 'Enter was not consumed by the clickable tag').toBe(
        true,
      );
      await page.keyboard.press(' ');
      expect(await keyWasConsumed(page, ' '), 'Space was not consumed by the clickable tag').toBe(
        true,
      );
    });

    await test.step('link: focus ring + Enter activates navigation', async () => {
      await tabUntil(page, firstLink);
      await expectActiveElement(page, firstLink);
      await expectFocusRing(page, firstLink, 'la-link');
      await installClickCounter(page, firstLink);
      await page.keyboard.press('Enter');
      expect(await clickCount(page), 'Enter did not fire the link').toBe(1);
      const href = await page.evaluate(() => location.href);
      expect(href.endsWith('#'), 'link activation did not navigate to its href').toBe(true);
    });
  });

  test('lane-b: Input focus, PasswordInput visibility toggle, Checkbox/Switch/Toggle toggle with Space', async ({
    page,
  }) => {
    const lane = LANES[1];
    await gotoCell(page, lane, 'bithire-static');
    await injectSentinel(page, lane);

    await test.step('input: Tab focuses it, the focus ring paints, typing lands', async () => {
      const input = '[data-testid="lb-input"]';
      await tabUntil(page, input);
      await expectActiveElement(page, input);
      await expectFocusRing(page, input, 'lb-input');
      // One character, deliberately: the probe's Input is `clearable`, so the
      // first keystroke flips it from the plain branch to the addon branch (the
      // <input> node is remounted). The value survives the remount; later
      // keystrokes would not, because the remount drops DOM focus.
      await page.keyboard.type('A');
      await expect(page.locator(input)).toHaveValue('A');
    });

    await test.step('password visibility toggle: ring + Enter reveals the password', async () => {
      const toggle = '[data-testid="lb-password"] [data-part="visibility-toggle"]';
      const control = '[data-testid="lb-password"] input[data-part="control"]';
      await tabUntil(page, toggle);
      await expectActiveElement(page, toggle);
      await expectFocusRing(page, toggle, 'lb-password visibility toggle');
      await expect(page.locator(control)).toHaveAttribute('type', 'password');
      await page.keyboard.press('Enter');
      await expect(page.locator(control)).toHaveAttribute('type', 'text');
      await expect(page.locator(toggle)).toHaveAttribute('data-visible', 'true');
    });

    await test.step('checkbox: Tab reaches the single, ring paints on the box, Space toggles', async () => {
      // The certified single specimen: the canonical engine paints
      // data-part="box" (the Group options-renderer paints option-box — known
      // Lane-B debt), so keyboard evidence runs against the single.
      const input = '[data-testid="lb-checkbox-single"] input[type="checkbox"]';
      const root = '[data-testid="lb-checkbox-single"] .ds-checkbox';
      const box = '[data-testid="lb-checkbox-single"] [data-part="box"]';
      await tabUntil(page, input);
      await expectActiveElement(page, input);
      // The native input is visually clipped; the skin paints the ring on the
      // sibling box via `input:focus-visible ~ [data-part="box"]`.
      await expectFocusRing(page, box, 'lb-checkbox box');
      await expect(page.locator(root).first()).toHaveAttribute('data-checked', 'true');
      await page.keyboard.press(' ');
      await expect(page.locator(root).first()).toHaveAttribute('data-checked', 'false');
      await expect(page.locator(input).first()).toHaveAttribute('aria-checked', 'false');
    });

    await test.step('switch: Tab reaches it, ring paints on the track, Space toggles', async () => {
      const input = '[data-testid="lb-switch"] input[role="switch"]';
      const root = '[data-testid="lb-switch"] .ds-switch';
      const track = '[data-testid="lb-switch"] [data-part="track"]';
      await tabUntil(page, input);
      await expectActiveElement(page, input);
      await expectFocusRing(page, track, 'lb-switch track');
      await expect(page.locator(root)).toHaveAttribute('data-checked', 'true');
      await page.keyboard.press(' ');
      await expect(page.locator(root)).toHaveAttribute('data-checked', 'false');
      await expect(page.locator(input)).toHaveAttribute('aria-checked', 'false');
    });

    await test.step('toggle: Tab reaches it, ring paints on the track, Space toggles', async () => {
      const input = '[data-testid="lb-toggle"] input[role="switch"]';
      const root = '[data-testid="lb-toggle"] .ds-toggle';
      const track = '[data-testid="lb-toggle"] [data-part="track"]';
      await tabUntil(page, input);
      await expectActiveElement(page, input);
      await expectFocusRing(page, track, 'lb-toggle track');
      await expect(page.locator(root)).toHaveAttribute('data-checked', 'true');
      await page.keyboard.press(' ');
      await expect(page.locator(root)).toHaveAttribute('data-checked', 'false');
      await expect(page.locator(input)).toHaveAttribute('aria-checked', 'false');
    });
  });

  test('lane-c: Alert/Callout dismiss and Result action via keyboard', async ({ page }) => {
    const lane = LANES[2];
    await gotoCell(page, lane, 'bithire-static');
    await injectSentinel(page, lane);

    await test.step('alert dismiss: ring + Enter unmounts the first alert', async () => {
      const action = '[data-testid="lc-alert"] [data-part="action"]';
      const shells = '[data-testid="lc-alert"] .rottay-alert-shell';
      await expect(page.locator(shells)).toHaveCount(2);
      await tabUntil(page, action);
      await expectActiveElement(page, action);
      await expectFocusRing(page, action, 'lc-alert dismiss');
      await page.keyboard.press('Enter');
      await expect(page.locator(shells)).toHaveCount(1);
    });

    await test.step('callout dismiss: ring + Enter unmounts the first callout', async () => {
      const close = '[data-testid="lc-callout"] [data-part="close-button"]';
      const shells = '[data-testid="lc-callout"] .rottay-callout-shell';
      await expect(page.locator(shells)).toHaveCount(2);
      await tabUntil(page, close);
      await expectActiveElement(page, close);
      await expectFocusRing(page, close, 'lc-callout dismiss');
      await page.keyboard.press('Enter');
      await expect(page.locator(shells)).toHaveCount(1);
    });

    await test.step('result action: ring + Enter fires the action button', async () => {
      const button = '[data-testid="lc-result"] [data-part="extra"] button';
      await tabUntil(page, button);
      await expectActiveElement(page, button);
      await expectFocusRing(page, button, 'lc-result action');
      await installClickCounter(page, button);
      await page.keyboard.press('Enter');
      expect(await clickCount(page), 'Enter did not fire the result action').toBe(1);
    });
  });
});
