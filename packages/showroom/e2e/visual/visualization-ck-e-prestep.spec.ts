import { expect, test, type Locator, type Page } from '@playwright/test';

// WO-SKIN-06 CK-E inert baseline. The same deterministic catalog is captured
// before and after static paint moves so selector/anatomy work cannot hide a
// visual, responsive or cross-engine regression.

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];
const ROOT_SELECTOR = '[data-testid="probe-ck-e"]';

const PATTERN_SCOPES = [
  'calendar-view',
  'kanban-board',
  'map-view',
  'timeline',
  'tree-view',
] as const;

const CHART_SCOPES = [
  'bar',
  'line',
  'area',
  'pie',
  'funnel',
  'radar',
  'treemap',
  'heatmap',
  'calendar-heatmap',
  'gantt',
  'gauge',
  'histogram',
  'scatter',
  'waterfall',
  'bullet',
  'sankey',
  'network-graph',
] as const;
const LOADING_FIXTURES = ['calendar', 'kanban', 'map', 'timeline', 'tree'] as const;

async function waitForGroundPaint(page: Page, ground: 'dark' | 'light'): Promise<void> {
  await page.waitForFunction(
    (isDark) => {
      const channels = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g);
      if (!channels || channels.length < 3) return false;
      const [r, g, b] = channels.map(Number);
      const luminance = (r + g + b) / 3;
      return isDark ? luminance < 40 : luminance > 200;
    },
    ground === 'dark',
    { timeout: 10_000 }
  );
}

async function waitForSvgSettled(page: Page, root: Locator): Promise<void> {
  const handle = await root.elementHandle();
  if (!handle) return;
  await page.waitForFunction(
    (element) => {
      const signature = [...(element as Element).querySelectorAll('svg *')]
        .map((node) =>
          ['x', 'y', 'x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'd', 'transform', 'width', 'height']
            .map((name) => node.getAttribute(name) ?? '')
            .join('|')
        )
        .join('\n');
      const state = window as unknown as { __ckESettle?: { signature: string; hits: number } };
      if (!state.__ckESettle || state.__ckESettle.signature !== signature) {
        state.__ckESettle = { signature, hits: 1 };
        return false;
      }
      state.__ckESettle.hits += 1;
      return state.__ckESettle.hits >= 4;
    },
    handle,
    { timeout: 30_000, polling: 'raf' }
  );
}

async function openProbe(
  page: Page,
  fixture: Fixture,
  engine: Engine,
  ground: 'dark' | 'light',
  width: '360' | '1280' = '1280'
): Promise<Locator> {
  await page.setViewportSize({ width: width === '360' ? 430 : 1440, height: 9000 });
  await page.clock.setFixedTime(new Date('2026-07-14T12:00:00Z'));
  await page.goto(`/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=${width}&slug=button&ckE=1`, {
    waitUntil: 'domcontentloaded',
  });
  const root = page.locator(ROOT_SELECTOR);
  await root.waitFor({ timeout: 30_000 });
  await page.waitForFunction((expected) => document.documentElement.getAttribute('data-engine') === expected, engine);
  await page.evaluate(() => document.fonts.ready);
  await waitForGroundPaint(page, ground);
  await waitForSvgSettled(page, root);
  return root;
}

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / CK-E visualization patterns / ${engine}`, async ({ page }) => {
      test.setTimeout(120_000);
      const root = await openProbe(page, fixture.id, engine, fixture.ground);
      const band = root.locator('[data-testid="probe-ck-e-patterns"]');

      for (const scope of PATTERN_SCOPES) {
        await expect(
          band.locator(`.ds-pattern-${scope}.ds-engine-${engine}[data-part="root"][data-loading="false"]`)
        ).toHaveCount(1);
      }
      await expect(band.locator('.ds-pattern-kanban-board [data-part="column"][data-empty="true"]')).toHaveCount(0);
      await expect(band.locator('.ds-pattern-kanban-board [data-part="column-body"][data-empty="true"]')).toHaveCount(1);
      await expect(band.locator('.ds-pattern-map-view [data-part="marker-row"][data-selected="true"]')).toHaveCount(1);
      await expect(band.locator('.ds-pattern-tree-view [data-part="node"][data-selected="true"]')).toHaveCount(1);
      for (const state of LOADING_FIXTURES) {
        await expect(band.locator(`[data-loading-fixture="${state}"]`)).toHaveCount(1);
      }
      await expect(band.locator('[data-testid="probe-ck-e-loading"] [data-part="root"][data-loading="true"]')).toHaveCount(5);

      await expect(band).toHaveScreenshot(`${fixture.id}-ck-e-${engine}-patterns-prestep.png`, {
        maxDiffPixelRatio: 0.0005,
      });
    });

    test(`${fixture.id} (${fixture.ground}) / CK-E chart catalog / ${engine}`, async ({ page }) => {
      test.setTimeout(120_000);
      const root = await openProbe(page, fixture.id, engine, fixture.ground);
      const band = root.locator('[data-testid="probe-ck-e-charts"]');

      await expect(band.locator('.ds-chart-scaffold[data-part="chart-scaffold"][data-state="ready"]')).toHaveCount(17);
      for (const scope of CHART_SCOPES) {
        await expect(band.locator(`.ds-chart-${scope}`)).toHaveCount(scope === 'bar' ? 2 : 1);
      }
      await expect(band.locator('.ds-chart-scaffold[data-part="chart-scaffold"][data-state="loading"]')).toHaveCount(1);
      await expect(band.locator('.ds-chart-sparkline[data-part="sparkline"][data-state="ready"]')).toHaveCount(1);
      await expect(band.locator('.ds-chart-brush[data-part="chart-brush"][data-state="idle"]')).toHaveCount(1);
      await expect(band.locator('[data-part="plot-area"]')).not.toHaveCount(0);
      await expect(band.locator('[data-part="legend"]')).not.toHaveCount(0);

      await expect(band).toHaveScreenshot(`${fixture.id}-ck-e-${engine}-charts-prestep.png`, {
        maxDiffPixelRatio: 0.0005,
      });
    });
  }
}

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / CK-E mobile composition / ${engine}`, async ({ page }) => {
      test.setTimeout(120_000);
      const root = await openProbe(page, fixture.id, engine, fixture.ground, '360');
      const patterns = root.locator('[data-testid="probe-ck-e-patterns"]');
      const charts = root.locator('[data-testid="probe-ck-e-charts"]');
      await expect(patterns).toBeVisible();
      await expect(charts.locator('[data-chart-fixture]')).toHaveCount(19);
      await expect(patterns).toHaveScreenshot(`${fixture.id}-ck-e-${engine}-patterns-mobile-prestep.png`, {
        maxDiffPixelRatio: 0.0005,
      });
      await expect(charts).toHaveScreenshot(`${fixture.id}-ck-e-${engine}-charts-mobile-prestep.png`, {
        maxDiffPixelRatio: 0.0005,
      });
    });
  }
}

test('CK-E interactive tooltip, crosshair, sankey hover and brush selection', async ({ page }) => {
  test.setTimeout(120_000);
  const root = await openProbe(page, 'rottay', 'modern', 'dark');
  const charts = root.locator('[data-testid="probe-ck-e-charts"]');

  const barCell = charts.locator('[data-chart-fixture="bar"]');
  await barCell.locator('[data-part="bar"]').first().hover();
  // W5 CLASS-R-BAR migration: the bar family now delegates to the React-owned
  // renderer interaction model (the one system). Hovering a bar activates its
  // mark and shows the anchored tooltip; the interaction halo replaces the
  // retired imperative crosshair. The hover PNG re-baselines in this W8 visual
  // session (pending-rebaseline).
  await expect(barCell.locator('[data-part="interaction-tooltip"]')).toHaveCount(1);
  await expect(barCell.locator('[data-part="bar-mark"][data-active="true"]')).toHaveCount(1);
  await expect(barCell.locator('[data-part="interaction-halo"]').first()).toBeVisible();
  await expect(barCell).toHaveScreenshot('rottay-ck-e-modern-bar-hover-prestep.png');

  const sankeyCell = charts.locator('[data-chart-fixture="sankey"]');
  // Sankey links intentionally have a very wide interactive stroke and may
  // overlap the narrow node mark. Dispatch the native D3 event directly so
  // this baseline isolates the node-hover paint contract deterministically.
  await sankeyCell.locator('[data-part="node"]').first().dispatchEvent('mouseenter');
  await expect(sankeyCell.locator('[data-part="node"][data-state="hovered"]')).toHaveCount(1);
  await expect(sankeyCell).toHaveScreenshot('rottay-ck-e-modern-sankey-hover-prestep.png');

  const brushCell = charts.locator('[data-chart-fixture="sparkline-brush"]');
  const hitTarget = brushCell.locator('[data-part="brush-interaction"]');
  const box = await hitTarget.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.72, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
  }
  await expect(brushCell.locator('.ds-chart-brush[data-state="selected"]')).toHaveCount(1);
  await expect(brushCell.locator('[data-part="brush-selection"]')).toHaveCount(1);
  await expect(brushCell).toHaveScreenshot('rottay-ck-e-modern-brush-selected-prestep.png');
});

test('CK-E rustic Kanban and Timeline interactive paint states', async ({ page }) => {
  test.setTimeout(120_000);
  const root = await openProbe(page, 'rottay', 'rustic', 'dark');
  const patterns = root.locator('[data-testid="probe-ck-e-patterns"]');
  const kanban = patterns.locator('.ds-pattern-kanban-board').first();

  const card = kanban.locator('[data-part="card"]').first();
  await card.hover();
  await expect(card).toHaveAttribute('data-clickable', 'true');
  await expect(kanban).toHaveScreenshot('rottay-ck-e-rustic-kanban-card-hover-prestep.png');

  const addItem = kanban.locator('[data-part="add-item"]').first();
  await addItem.hover();
  await expect(kanban).toHaveScreenshot('rottay-ck-e-rustic-kanban-add-hover-prestep.png');

  const dropTarget = kanban.locator('[data-part="column-body"][data-empty="true"]');
  await page.evaluate(
    ({ cardSelector, targetSelector }) => {
      const source = document.querySelector(cardSelector);
      const target = document.querySelector(targetSelector);
      if (!source || !target) throw new Error('CK-E drag fixture did not render');
      const dataTransfer = new DataTransfer();
      source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
      target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer }));
    },
    {
      cardSelector: '[data-testid="probe-ck-e-patterns"] .ds-pattern-kanban-board [data-part="card"]',
      targetSelector:
        '[data-testid="probe-ck-e-patterns"] .ds-pattern-kanban-board [data-part="column-body"][data-empty="true"]',
    }
  );
  await expect(dropTarget).toHaveAttribute('data-dropping', 'true');
  await expect(kanban).toHaveScreenshot('rottay-ck-e-rustic-kanban-drop-target-prestep.png');

  const timeline = patterns.locator('.ds-pattern-timeline').first();
  const timelineCard = timeline.locator('[data-part="item-card"]').first();
  await timelineCard.hover();
  await expect(timelineCard).toHaveAttribute('data-clickable', 'true');
  await expect(timeline).toHaveScreenshot('rottay-ck-e-rustic-timeline-hover-prestep.png');
});
