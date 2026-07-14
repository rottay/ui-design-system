import { test, expect, type Locator, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-I -- long-tail patterns + surfaces visual evidence.
//
// `?longTail=1` mounts 38 isolated component cases representing 39 source
// renderables (CollectionWorkspaceSurface owns one case and deliberately
// exercises its private CollectionRenderDispatch too). The complete family is
// photographed under both real tenant grounds and both engines. Assertions
// run before every screenshot so an empty/lazy/error fixture can never become
// an accepted baseline.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];

const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const FAMILY_IDS = [
  'patterns',
  'foundation',
  'layout',
  'workspace',
  'admin',
  'data',
  'experience',
  'operations',
] as const;

const CASE_IDS = [
  'patterns-stats',
  'patterns-gallery',
  'patterns-grid',
  'patterns-cell-renderers',
  'patterns-bulk-select',
  'foundation-shared',
  'foundation-personality',
  'foundation-states-core',
  'foundation-states-lifecycle',
  'layout-collection-shell',
  'layout-header',
  'layout-sidebar',
  'workspace-collection',
  'workspace-command-center',
  'workspace-decision-inbox',
  'workspace-record-workbench',
  'admin-audit',
  'admin-billing',
  'admin-import-export',
  'admin-integration',
  'admin-profile',
  'admin-settings',
  'admin-team',
  'data-compare',
  'data-dashboard',
  'data-list',
  'data-report',
  'data-search',
  'data-visualization',
  'experience-notification',
  'experience-auth',
  'experience-marketing',
  'experience-media',
  'experience-chat',
  'experience-editor',
  'experience-pricing',
  'operations-activity',
  'operations-kanban',
] as const;

const SURFACE_ROOTS: ReadonlyArray<readonly [caseId: string, selector: string]> = [
  ['foundation-states-core', '.ds-loading-state'],
  ['foundation-states-lifecycle', '.ds-loading-skeleton'],
  ['layout-collection-shell', '.ds-collection-shell'],
  ['layout-header', '.ds-header'],
  ['layout-sidebar', '.ds-sidebar'],
  ['workspace-collection', '.ds-collection-workspace'],
  ['workspace-command-center', '.ds-command-center'],
  ['workspace-decision-inbox', '.ds-decision-inbox'],
  ['workspace-record-workbench', '.ds-record-workbench'],
  ['admin-audit', '.ds-audit'],
  ['admin-billing', '.ds-billing'],
  ['admin-import-export', '.ds-import-export'],
  ['admin-integration', '.ds-integration'],
  ['admin-profile', '.ds-profile'],
  ['admin-settings', '.ds-settings'],
  ['admin-team', '.ds-team'],
  ['data-compare', '.ds-compare'],
  ['data-dashboard', '.ds-dashboard'],
  ['data-list', '.ds-list'],
  ['data-report', '.ds-report'],
  ['data-search', '.ds-search'],
  ['data-visualization', '.ds-visualization'],
  ['experience-notification', '.ds-notification'],
  ['experience-auth', '.ds-auth'],
  ['experience-marketing', '.ds-marketing'],
  ['experience-media', '.ds-media'],
  ['experience-chat', '.ds-chat'],
  ['experience-editor', '.ds-editor'],
  ['experience-pricing', '.ds-pricing'],
  ['operations-activity', '.ds-activity'],
  ['operations-kanban', '.ds-kanban'],
];

async function waitForGroundPaint(page: Page, ground: 'dark' | 'light'): Promise<void> {
  await page.waitForFunction(
    (isDark) => {
      const bg = getComputedStyle(document.body).backgroundColor;
      const channels = bg.match(/[\d.]+/g);
      if (!channels || channels.length < 3) return false;
      const [r, g, b] = channels.map(Number);
      const luminance = (r + g + b) / 3;
      return isDark ? luminance < 40 : luminance > 200;
    },
    ground === 'dark',
    { timeout: 10_000 },
  );
}

async function waitForSettled(page: Page, locator: Locator): Promise<void> {
  const handle = await locator.elementHandle();
  if (!handle) return;

  await page.waitForFunction(
    (element) => {
      const el = element as HTMLElement;
      const style = getComputedStyle(el);
      const key = [
        el.textContent,
        el.scrollWidth,
        el.scrollHeight,
        style.opacity,
        style.transform,
        style.color,
        style.backgroundColor,
        style.borderColor,
      ].join('|');
      const runtime = window as unknown as {
        __longTailSettle?: { key: string; hits: number };
      };

      if (!runtime.__longTailSettle || runtime.__longTailSettle.key !== key) {
        runtime.__longTailSettle = { key, hits: 1 };
        return false;
      }

      runtime.__longTailSettle.hits += 1;
      return runtime.__longTailSettle.hits >= 3;
    },
    handle,
    { timeout: 15_000, polling: 'raf' },
  );
}

async function assertFixtureCoverage(root: Locator, engine: Engine): Promise<void> {
  const cases = root.locator('[data-long-tail-case]');
  await expect(cases).toHaveCount(CASE_IDS.length);

  for (const caseId of CASE_IDS) {
    const componentCase = root.locator(`[data-long-tail-case="${caseId}"]`);
    await expect(componentCase, `${caseId} must exist exactly once`).toHaveCount(1);
    await expect(componentCase, `${caseId} must not be an empty fixture wrapper`).not.toBeEmpty();
  }

  const representedSources = await cases.evaluateAll((nodes) =>
    nodes.reduce((sum, node) => sum + Number((node as HTMLElement).dataset.sourceCount ?? 0), 0),
  );
  expect(representedSources).toBe(39);
  expect(await root.locator('[data-part="muted-text"]').count()).toBeGreaterThan(0);
  expect(await root.locator('[data-part="divider"]').count()).toBeGreaterThan(0);
  expect(await root.locator('button:disabled').count()).toBeGreaterThan(0);

  for (const [caseId, selector] of SURFACE_ROOTS) {
    await expect(
      root.locator(`[data-long-tail-case="${caseId}"] ${selector}`).first(),
      `${caseId} must render its real surface root`,
    ).toBeVisible();
  }

  const stats = root.locator('[data-long-tail-case="patterns-stats"]');
  await expect(stats.locator(`.ds-pattern-stats-grid.ds-engine-${engine}`)).toHaveCount(1);
  for (const change of ['increase', 'decrease', 'neutral']) {
    await expect(stats.locator(`[data-part="trend"][data-change="${change}"]`)).toHaveCount(1);
  }

  const gallery = root.locator('[data-long-tail-case="patterns-gallery"]');
  await expect(gallery.locator('[data-part="card"][data-selected="true"]')).toHaveCount(1);
  await expect(gallery.locator('[data-part="card"][data-selected="false"]')).toHaveCount(2);
  await expect(gallery.locator('[data-part="image-placeholder"]')).toHaveCount(3);

  const grid = root.locator('[data-long-tail-case="patterns-grid"]');
  await expect(grid.locator('[data-part="card-shell"][data-selected="true"]')).toHaveCount(1);
  await expect(grid.locator('[data-part="card-shell"][data-selected="false"]')).toHaveCount(2);

  const cells = root.locator('[data-long-tail-case="patterns-cell-renderers"]');
  for (const part of [
    'avatar-name',
    'name-stack',
    'status-badge',
    'simple-badge',
    'mono',
    'icon-text',
    'count-with-icon',
    'date',
    'tags',
    'score',
    'boolean',
    'truncated',
  ]) {
    await expect(cells.locator(`[data-part="${part}"]`).first()).toBeVisible();
  }

  const bulk = root.locator('[data-long-tail-case="patterns-bulk-select"]');
  await expect(bulk.locator('[data-part="root"][data-active="true"]')).toHaveCount(2);
  await expect(bulk.locator('[data-part="root"][data-active="false"]')).toHaveCount(1);

  const shared = root.locator('[data-long-tail-case="foundation-shared"]');
  await expect(shared.locator('.ds-section-card').first()).toBeVisible();
  await expect(shared.locator('[data-surface-action]').first()).toBeVisible();
  await expect(shared.locator('[role="tab"]').first()).toBeVisible();

  await expect(
    root.locator('[data-long-tail-case="foundation-personality"] .ds-accent-bar'),
  ).toHaveCount(1);
  await expect(
    root.locator('[data-long-tail-case="foundation-states-lifecycle"] .ds-stale-banner[data-refreshing="true"]'),
  ).toHaveCount(1);
  await expect(
    root.locator('[data-long-tail-case="foundation-states-lifecycle"] .ds-offline-banner'),
  ).toHaveCount(1);

  await expect(
    root.locator('[data-long-tail-case="layout-collection-shell"] .ds-collection-shell[data-focus-active="true"][data-preview-active="true"]'),
  ).toHaveCount(1);
  await expect(root.locator('[data-long-tail-case="layout-sidebar"] .ds-sidebar[data-collapsed="false"]')).toHaveCount(1);

  const collection = root.locator('[data-long-tail-case="workspace-collection"]');
  await expect(collection.locator('.ds-collection-render-dispatch[data-view-mode="cards"]')).toHaveCount(1);
  await expect(collection.locator('.ds-pattern-data-table[data-part="root"]')).toHaveCount(1);
  await expect(collection.locator('.ds-collection-workspace__content[data-part="root"]')).toHaveCount(0);
  await expect(collection.locator('.ds-collection-workspace__content[data-part="content"]')).toHaveCount(2);
  await expect(collection.getByText('Preview: Beta workspace')).toBeVisible();
  const previewResize = collection.locator('.ds-collection-preview-rail__resize[data-part="preview-rail-resize"]');
  await expect(previewResize).toHaveCount(1);
  await expect(collection.locator('.ds-collection-preview-rail__resize-bar[data-part="preview-rail-resize-bar"]')).toHaveCount(1);
  await previewResize.focus();
  await expect(previewResize).toBeFocused();
  await expect.poll(() => previewResize.evaluate((element) => element.matches(':focus-visible'))).toBe(true);

  const command = root.locator('[data-long-tail-case="workspace-command-center"]');
  for (const tone of ['info', 'warning', 'success', 'error']) {
    await expect(command.locator(`[data-part="insight-tile"][data-tone="${tone}"]`)).toHaveCount(1);
  }
  await expect(
    root.locator('[data-long-tail-case="workspace-decision-inbox"] .ds-decision-inbox__selection-bar'),
  ).toHaveCount(1);
  await expect(
    root.locator('[data-long-tail-case="workspace-record-workbench"] [data-part="status-badge"][data-variant="success"]'),
  ).toHaveCount(1);

  const notifications = root.locator('[data-long-tail-case="experience-notification"]');
  await expect(notifications.getByText('Deployment complete')).toBeVisible();
  await expect(notifications.getByText('Payment failed')).toBeVisible();

  const media = root.locator('[data-long-tail-case="experience-media"]');
  await expect(media.locator('[data-part="media-item"][data-selected="true"]')).toHaveCount(1);
  await expect(media.locator('[data-part="media-item"][data-selected="false"]')).toHaveCount(1);

  const kanban = root.locator('[data-long-tail-case="operations-kanban"]');
  await expect(kanban.getByText('Design mockups')).toBeVisible();
  await expect(kanban.getByText('Done')).toBeVisible();
}

async function openProbe(page: Page, fixture: Fixture, engine: Engine): Promise<Locator> {
  await page.setViewportSize({ width: 1440, height: 1800 });

  // ActivityLog and the decision-inbox SLA helper derive labels from the
  // current time. Freeze Date before navigation so their server/client paint
  // cannot drift across a minute, day, or hydration boundary.
  await page.clock.setFixedTime(new Date('2026-07-14T12:00:00.000Z'));

  // WorkspaceShell's reduced-motion ParticleField paints one static frame but
  // its initial positions are random. A seeded generator makes that static
  // frame byte-stable without altering production component code.
  await page.addInitScript(() => {
    let seed = 0x4c4f4e47;
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
  });

  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&longTail=1`,
    { waitUntil: 'domcontentloaded' },
  );

  const root = page.locator('[data-testid="probe-long-tail"]');
  await root.waitFor({ timeout: 30_000 });
  await page.waitForFunction(
    (expected) => document.documentElement.getAttribute('data-engine') === expected,
    engine,
  );
  await page.evaluate(() => document.fonts.ready);

  const ground = FIXTURES.find((candidate) => candidate.id === fixture)?.ground ?? 'dark';
  await waitForGroundPaint(page, ground);
  await expect(root.locator('.ds-kanban')).toBeVisible({ timeout: 30_000 });
  await assertFixtureCoverage(root, engine);
  await waitForSettled(page, root);
  return root;
}

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / CK-I long tail / ${engine}: isolated family evidence`, async ({ page }) => {
      test.setTimeout(180_000);
      const root = await openProbe(page, fixture.id, engine);

      for (const familyId of FAMILY_IDS) {
        const family = root.locator(`[data-testid="probe-long-tail-${familyId}"]`);
        await family.scrollIntoViewIfNeeded();
        await waitForSettled(page, family);
        await expect(family).toHaveScreenshot(`${fixture.id}-surfaces-long-tail-${engine}-${familyId}.png`, {
          maxDiffPixelRatio: 0.0005,
        });
      }
    });
  }
}
