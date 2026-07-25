import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K3 lane A (data display) axe + keyboard evidence.
//
// Axe matrix: the lane probe (/probe/k3-lane-a) × governed source
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
//     test-artifacts/rottay-design-platform/K2-K3/k3-lane-a/axe/.
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

const ROUTE = '/probe/k3-lane-a';
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
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K2-K3', 'k3-lane-a', 'axe');

const reportPath = (): string => join(artifactDir(), 'k3-lane-a-axe-report.json');

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
