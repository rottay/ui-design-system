import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K3 lane A (data display) axe + keyboard evidence.
//
// Axe matrix: the lane probe (/probe/patterns/data-display) × governed source
// (bithire-static, themanagement-db) on the fixed cell locale=en,
// density=comfortable, state=rest. Each cell waits for the lane witness
// testid, document.fonts.ready, and a non-empty --ds-color-primary on <html>
// (the theme-compiled signal), then runs a full page-level
// `new AxeBuilder({ page }).analyze()` — the same usage as the K1 lane axe
// spec, including the rule|target keying and useId-token normalization.
//
//   - serious/critical violations FAIL the cell; the failure message prints
//     the full violation list.
//   - minor/moderate violations never fail; they are collected into the
//     merge-on-disk report at
//     packages/core/artifacts/quality/audits/accessibility/runs/whitelabel/patterns/data-display/.
//
// Keyboard cases (bithire-static/en/comfortable/rest), sentinel-walked with
// real Tab presses (the k1-lane-axe pattern — the sentinel stays OUTSIDE the
// lane tree):
//
//   table     the sortable Name header IS the sort control: Tab reaches it,
//             the skin paints a :focus-visible outline, and Enter/Space flip
//             aria-sort none → ascending → descending.
//   tree      the roving tab stop lands on the first visible treeitem (the
//             tree is otherwise all tabindex=-1), the skin's :focus-visible
//             outline paints on the row, ArrowDown moves DOM focus to the
//             next visible node, ArrowLeft collapses the expanded parent,
//             and Space toggles the checkable node's checkbox.
//
// NOT RUN BY THE LANE: per the wave protocol the lane delivers this spec
// written but unexecuted (no playwright in lane scope); the coordinator runs
// it at integration when the bundle is live on :7001.
// ---------------------------------------------------------------------------

type Source = 'bithire-static' | 'themanagement-db';
type Locale = 'en' | 'es' | 'ar';

const ROUTE = '/probe/patterns/data-display';
const WITNESS = 'k3a-table';
const ROOT_TESTID = 'k3a-root';
const SENTINEL_ID = 'k3a-kbd-sentinel';

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
  join(repoRoot(), 'packages', 'core', 'artifacts', 'quality', 'audits', 'accessibility', 'runs', 'whitelabel', 'patterns', 'data-display');

const reportPath = (): string => join(artifactDir(), 'index.json');

function cellUrl(source: Source, locale: Locale = 'en'): string {
  return `${ROUTE}?source=${source}&locale=${locale}&density=comfortable&state=rest`;
}

/** The deterministic render witness for one cell. */
async function gotoCell(page: Page, source: Source, locale: Locale = 'en'): Promise<void> {
  await page.goto(cellUrl(source, locale), { waitUntil: 'networkidle' });
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

for (const source of SOURCES) {
  test(`axe k3-lane-a × ${source}: zero serious/critical violations`, async ({ page }) => {
    await gotoCell(page, source);

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = collectViolations(results, BLOCKING_IMPACTS);
    const nonBlocking = collectViolations(results, new Set(['minor', 'moderate']));

    persistCell(`k3-lane-a/${source}`, {
      source,
      url: cellUrl(source),
      blockingCount: blocking.length,
      blocking,
      nonBlockingCount: nonBlocking.length,
      nonBlocking,
    });

    if (nonBlocking.length > 0) {
      console.log(
        `k3-lane-a/${source}: ${nonBlocking.length} minor/moderate axe finding(s) ` +
          `collected in ${reportPath()}:\n${formatViolations(nonBlocking)}`,
      );
    }

    expect(
      blocking,
      `k3-lane-a/${source} has serious/critical axe violations:\n${formatViolations(blocking)}`,
    ).toEqual([]);
  });
}

// ---------------------------------------------------------------------------
// Keyboard evidence.
// ---------------------------------------------------------------------------

/**
 * Inserts a focusable sentinel immediately before the lane root. It lives
 * OUTSIDE the lane tree so no lane selector shifts because it exists.
 */
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
    const key = el.getAttribute('data-tree-node-key');
    return (
      el.tagName.toLowerCase() +
      (part ? `[data-part="${part}"]` : '') +
      (key ? `[data-tree-node-key="${key}"]` : '')
    );
  });
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
    walk.push(await describeActiveElement(page));
  }
  throw new Error(
    `Tab never reached ${selector} after ${maxTabs} presses. Walk: ${walk.join(' → ')}`,
  );
}

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

test.describe('K3 lane A keyboard evidence', () => {
  test('table: Tab reaches the sortable header, ring paints, Enter/Space cycle aria-sort', async ({
    page,
  }) => {
    await gotoCell(page, 'bithire-static');
    await injectSentinel(page);

    const sortable = '[data-testid="k3a-table"] th[data-sortable="true"]';

    await tabUntil(page, sortable);
    await expectActiveElement(page, sortable);
    await expectFocusRing(page, sortable, 'k3a-table sortable header');

    const header = page.locator(sortable).first();
    await expect(header).toHaveAttribute('aria-sort', 'none');
    await page.keyboard.press('Enter');
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await page.keyboard.press(' ');
    await expect(header).toHaveAttribute('aria-sort', 'descending');
  });

  test('tree: roving tab stop, ring paints, arrows move/collapse, Space checks', async ({
    page,
  }) => {
    await gotoCell(page, 'bithire-static');
    await injectSentinel(page);

    const firstItem = '[data-testid="k3a-tree"] [role="treeitem"][data-tree-node-key="eng"]';
    const childItem = '[data-testid="k3a-tree"] [role="treeitem"][data-tree-node-key="eng-fe"]';

    await tabUntil(page, firstItem);
    await expectActiveElement(page, firstItem);
    // The roving-stop row gets the skin's :focus-visible outline (the engine's
    // state ring only exists once its focusedKey is set).
    await expectFocusRing(page, firstItem, 'k3a-tree first treeitem');

    await test.step('ArrowDown moves DOM focus to the next visible node', async () => {
      await page.keyboard.press('ArrowDown');
      await expectActiveElement(page, childItem);
    });

    await test.step('Space toggles the checkable node', async () => {
      const checkbox = page.locator(`${childItem} [data-part="checkbox"]`);
      await expect(checkbox).not.toBeChecked();
      await page.keyboard.press(' ');
      await expect(checkbox).toBeChecked();
    });

    await test.step('ArrowLeft collapses the expanded parent', async () => {
      await page.keyboard.press('ArrowUp');
      await expectActiveElement(page, firstItem);
      await expect(page.locator(firstItem)).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('ArrowLeft');
      await expect(page.locator(firstItem)).toHaveAttribute('aria-expanded', 'false');
    });
  });
});

// ---------------------------------------------------------------------------
// RTL evidence.
// ---------------------------------------------------------------------------

/**
 * Both direction-dependent facts the lane's flagship families own, read as
 * PHYSICAL values out of a real browser so a logical rule that silently
 * regressed to a physical one is visible:
 *
 *   tree indent  the row carries its depth through `--ds-tree-row-indent`, and
 *                the skin spends it as `padding-inline-start`. Physically that
 *                must resolve to padding-LEFT in LTR and padding-RIGHT in RTL,
 *                with the label geometry moving the same way. A rewrite to
 *                `padding-left` keeps LTR green and pins the RTL hierarchy to
 *                the wrong edge — this case fails on it.
 *   tree caret   the collapsed caret is a physical right-pointing glyph that
 *                the skin mirrors with a pinned `:dir(rtl)` `scaleX(-1)` (the
 *                icon opts out of the facade auto-mirror so the two never
 *                double-flip). Computed `transform` must be the mirror matrix
 *                in RTL and `none` in LTR — deleting the pinned rule, or
 *                re-enabling the auto-mirror on top of it, lands on `none` in
 *                RTL and fails.
 *   table        the columns are ordered by the inherited direction, so the
 *                first header is the leftmost cell in LTR and the rightmost in
 *                RTL. A `direction: ltr` reset leaking into the table box
 *                fails here.
 *
 * Measured on both locale cells of the same source so the assertion is a
 * SIGN FLIP, not a one-sided reading that a direction-blind layout passes.
 */
interface LaneARtlRead {
  frameDir: string | null;
  rowDir: string;
  shallowPaddingLeft: number;
  shallowPaddingRight: number;
  deepPaddingLeft: number;
  deepPaddingRight: number;
  shallowLabelLeft: number;
  shallowLabelRight: number;
  deepLabelLeft: number;
  deepLabelRight: number;
  caretTransform: string;
  firstHeaderLeft: number;
  lastHeaderLeft: number;
}

const TREE = '[data-testid="k3a-tree"]';
const SHALLOW_ROW = `${TREE} [role="treeitem"][data-tree-node-key="eng"]`;
const DEEP_ROW = `${TREE} [role="treeitem"][data-tree-node-key="eng-fe-ds"]`;

async function readLaneADirection(page: Page): Promise<LaneARtlRead> {
  return page.evaluate(
    ({ treeSel, shallowSel, deepSel }) => {
      const need = <T extends Element>(selector: string): T => {
        const el = document.querySelector<T>(selector);
        if (!el) throw new Error(`RTL evidence target is missing: ${selector}`);
        return el;
      };

      const shallow = need<HTMLElement>(shallowSel);
      const deep = need<HTMLElement>(deepSel);
      const shallowStyle = getComputedStyle(shallow);
      const deepStyle = getComputedStyle(deep);
      const shallowLabel = need<HTMLElement>(`${shallowSel} [data-part="tree-node-label"]`);
      const deepLabel = need<HTMLElement>(`${deepSel} [data-part="tree-node-label"]`);
      const caret = need<HTMLElement>(`${treeSel} [data-part="tree-node-toggle"] > span`);
      const headerScope =
        document.querySelector<HTMLElement>('[data-testid="k3a-table"] thead') ??
        need<HTMLElement>('[data-testid="k3a-table"]');
      const headers = headerScope.querySelectorAll<HTMLElement>('th');
      if (headers.length < 2) throw new Error('RTL evidence needs at least two table headers');

      return {
        frameDir: document.querySelector('[data-testid="k3a-frame"]')?.getAttribute('dir') ?? null,
        rowDir: shallowStyle.direction,
        shallowPaddingLeft: Number.parseFloat(shallowStyle.paddingLeft) || 0,
        shallowPaddingRight: Number.parseFloat(shallowStyle.paddingRight) || 0,
        deepPaddingLeft: Number.parseFloat(deepStyle.paddingLeft) || 0,
        deepPaddingRight: Number.parseFloat(deepStyle.paddingRight) || 0,
        shallowLabelLeft: shallowLabel.getBoundingClientRect().left,
        shallowLabelRight: shallowLabel.getBoundingClientRect().right,
        deepLabelLeft: deepLabel.getBoundingClientRect().left,
        deepLabelRight: deepLabel.getBoundingClientRect().right,
        caretTransform: getComputedStyle(caret).transform,
        firstHeaderLeft: headers[0].getBoundingClientRect().left,
        lastHeaderLeft: headers[headers.length - 1].getBoundingClientRect().left,
      };
    },
    { treeSel: TREE, shallowSel: SHALLOW_ROW, deepSel: DEEP_ROW },
  );
}

test('k3-lane-a RTL: tree indent, collapse caret and table column order all flip under dir=rtl', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });

  await gotoCell(page, 'bithire-static', 'en');
  const ltr = await readLaneADirection(page);

  await gotoCell(page, 'bithire-static', 'ar');
  const rtl = await readLaneADirection(page);

  await test.step('the Arabic cell actually renders under dir=rtl', async () => {
    expect(ltr.frameDir).toBe('ltr');
    expect(rtl.frameDir).toBe('rtl');
    // The direction has to REACH the tree row, not just sit on the frame.
    expect(ltr.rowDir).toBe('ltr');
    expect(
      rtl.rowDir,
      'dir=rtl on the probe frame never reached the tree row',
    ).toBe('rtl');
  });

  await test.step('the depth indent resolves to the reading-side padding', async () => {
    // Compared depth-to-depth on ONE physical side, so a constant base padding
    // can neither mask the flip nor make the assertion brittle.
    expect(
      ltr.deepPaddingLeft > ltr.shallowPaddingLeft,
      `LTR: the depth-2 row did not indent from the left ` +
        `(deep=${ltr.deepPaddingLeft}, shallow=${ltr.shallowPaddingLeft})`,
    ).toBe(true);
    expect(
      ltr.deepPaddingRight,
      'LTR: the depth indent leaked onto the trailing edge',
    ).toBe(ltr.shallowPaddingRight);
    expect(
      rtl.deepPaddingRight > rtl.shallowPaddingRight,
      `RTL: the depth-2 row indented from the wrong edge — the logical ` +
        `padding-inline-start regressed to a physical padding-left ` +
        `(deep-right=${rtl.deepPaddingRight}, shallow-right=${rtl.shallowPaddingRight}, ` +
        `deep-left=${rtl.deepPaddingLeft})`,
    ).toBe(true);
    expect(
      rtl.deepPaddingLeft,
      'RTL: the depth indent stayed on the physical left',
    ).toBe(rtl.shallowPaddingLeft);
  });

  await test.step('the hierarchy geometry mirrors', async () => {
    expect(
      ltr.deepLabelLeft > ltr.shallowLabelLeft,
      `LTR: the deep label did not sit further right than the shallow one ` +
        `(deep=${ltr.deepLabelLeft}, shallow=${ltr.shallowLabelLeft})`,
    ).toBe(true);
    expect(
      rtl.deepLabelRight < rtl.shallowLabelRight,
      `RTL: the deep label did not sit further left than the shallow one ` +
        `(deep=${rtl.deepLabelRight}, shallow=${rtl.shallowLabelRight})`,
    ).toBe(true);
  });

  await test.step('the collapse caret carries the pinned :dir(rtl) mirror', async () => {
    expect(
      ltr.caretTransform === 'none' || ltr.caretTransform === 'matrix(1, 0, 0, 1, 0, 0)',
      `LTR: the caret is mirrored when it should not be (${ltr.caretTransform})`,
    ).toBe(true);
    expect(
      rtl.caretTransform,
      'RTL: the caret lost its pinned :dir(rtl) scaleX(-1) mirror — either the ' +
        'skin rule is gone or the facade auto-mirror double-flipped it back',
    ).toBe('matrix(-1, 0, 0, 1, 0, 0)');
  });

  await test.step('the table column order follows the inherited direction', async () => {
    expect(
      ltr.firstHeaderLeft < ltr.lastHeaderLeft,
      `LTR: the first header is not the leftmost (${ltr.firstHeaderLeft} vs ${ltr.lastHeaderLeft})`,
    ).toBe(true);
    expect(
      rtl.firstHeaderLeft > rtl.lastHeaderLeft,
      `RTL: the first header is not the rightmost — a direction reset leaked ` +
        `into the table box (${rtl.firstHeaderLeft} vs ${rtl.lastHeaderLeft})`,
    ).toBe(true);
  });
});
