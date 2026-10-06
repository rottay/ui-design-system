import { readFileSync } from 'node:fs';

import { test, expect, type Locator, type Page } from '@playwright/test';

import { expectHydrated } from '../support/hydration';

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
  'patterns-data-table-cell-helpers',
  'patterns-bulk-select',
  'foundation-shared',
  'foundation-personality',
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

// The fixture's own <Case> declarations are the second reader of the roster:
// dcadb8474 folded `foundation-states-core` into `foundation-states-lifecycle`,
// and a hand-typed list alone could not see that.
const FIXTURE_SOURCE = readFileSync(
  new URL('../../src/components/fixtures/surfaces/long-tail/index.tsx', import.meta.url),
  'utf8',
);
const DECLARED_CASES = [...FIXTURE_SOURCE.matchAll(/<Case\s+id="([^"]+)"([\s\S]*?)>/g)].map((match) => ({
  id: match[1],
  sourceCount: Number(/sourceCount=\{(\d+)\}/.exec(match[2])?.[1] ?? 1),
}));
const DECLARED_SOURCE_TOTAL = DECLARED_CASES.reduce((sum, entry) => sum + entry.sourceCount, 0);

const SURFACE_ROOTS: ReadonlyArray<readonly [caseId: string, selector: string]> = [
  ['foundation-states-lifecycle', '.ds-loading-skeleton'],
  ['layout-collection-shell', '.ds-collection-shell'],
  ['layout-header', '.ds-header'],
  // A structure since the FAM-05 sidebar-surface cut (1ddfd6198).
  ['layout-sidebar', '.ds-structure.ds-sidebar-surface'],
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

const TABLE_POSTURE_CASES = ['admin-audit', 'data-list', 'data-report'] as const;

// `w=1280` hints desktop, so the first paint already carries the table; this wait is the guard
// that an unhinted regression (phone first, desktop seconds later) cannot shoot cards.
async function waitForDesktopPosture(root: Locator): Promise<void> {
  await expect(
    root.locator('[data-posture^="phone"]'),
    'the viewport posture must be corrected from the unhinted phone snapshot',
  ).toHaveCount(0, { timeout: 30_000 });

  for (const caseId of TABLE_POSTURE_CASES) {
    const scene = root.locator(`[data-long-tail-case="${caseId}"]`);
    await expect(
      scene.locator('table [data-part="header-row"]'),
      `${caseId} must present its rows as the table`,
    ).toHaveCount(1, { timeout: 30_000 });
    await expect(scene.locator('[data-part="mobile-root"]'), `${caseId} must not present cards`).toHaveCount(0);
  }
}

async function assertFixtureCoverage(root: Locator, engine: Engine): Promise<void> {
  expect([...CASE_IDS].sort(), 'CASE_IDS must name exactly the cases the fixture declares').toEqual(
    DECLARED_CASES.map((entry) => entry.id).sort(),
  );
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
  expect(representedSources).toBe(DECLARED_SOURCE_TOTAL);
  expect(await root.locator('[data-part="section-description"]').count()).toBeGreaterThan(0);
  expect(await root.locator('button:disabled').count()).toBeGreaterThan(0);

  // Compare stamps its divider only in the stacked (phone) layout; at this desktop posture the
  // part survives only in the modern PageShell header, and the rustic tree carries none.
  const compare = root.locator('[data-long-tail-case="data-compare"]');
  await expect(compare.locator('.ds-compare[data-layout="table"]')).toHaveCount(1);
  await expect(compare.locator('.ds-compare__divider[data-part="divider"]')).toHaveCount(0);
  if (engine === 'modern') {
    await expect(root.locator('.ds-pattern-page-shell [data-part="header"] > [data-part="divider"]').first()).toBeVisible();
  } else {
    await expect(root.locator('[data-part="divider"]')).toHaveCount(0);
  }

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

  const cellHelpers = root.locator('[data-long-tail-case="patterns-data-table-cell-helpers"]');
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
    await expect(cellHelpers.locator(`[data-part="${part}"]`).first()).toBeVisible();
  }

  const bulk = root.locator('[data-long-tail-case="patterns-bulk-select"]');
  await expect(bulk.locator('[data-part="root"][data-active="true"]')).toHaveCount(2);
  await expect(bulk.locator('[data-part="root"][data-active="false"]')).toHaveCount(1);

  const shared = root.locator('[data-long-tail-case="foundation-shared"]');
  await expect(shared.locator('.ds-section-card').first()).toBeVisible();
  await expect(shared.locator('[data-surface-action]').first()).toBeVisible();
  await expect(shared.locator('[role="tab"]').first()).toBeVisible();

  // The decorative accent rail is retired (a33b4dddf): SurfaceAccentBar is an
  // inert compatibility export that renders nothing.
  await expect(
    root.locator('[data-long-tail-case="foundation-personality"] .ds-accent-bar'),
  ).toHaveCount(0);
  await expect(
    root.locator('[data-long-tail-case="foundation-states-lifecycle"] .ds-stale-banner[data-refreshing="true"]'),
  ).toHaveCount(1);
  await expect(
    root.locator('[data-long-tail-case="foundation-states-lifecycle"] .ds-offline-banner'),
  ).toHaveCount(1);

  await expect(
    root.locator('[data-long-tail-case="layout-collection-shell"] .ds-collection-shell[data-focus-active="true"][data-preview-active="true"]'),
  ).toHaveCount(1);
  await expect(root.locator('[data-long-tail-case="layout-sidebar"] .ds-sidebar-surface[data-collapsed="false"]')).toHaveCount(1);

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

/**
 * Pins the MessageBubble geometry the screenshot's colour tolerance cannot see
 * (W26-CAPTURE): the card fills its measure -- the private
 * `--_ds-assistant-bubble-measure` channel, 80% of the bubble root when
 * unauthored -- and sits on the edge its `data-align` names. The measure is
 * resolved by a real browser layout (a probe in the card's own place, carrying
 * the card's box model and channel), never a literal width, so the shrink-
 * wrapped ~178px card of the pre-b1f6e9be6 baselines fails red here even when
 * its pixels pass at threshold 0.2.
 */
async function expectBubbleFillsMeasure(scope: Locator): Promise<readonly ('start' | 'end')[]> {
  const bubbles = scope.locator('.ds-assistant-message-bubble[data-part="root"]');
  await expect(bubbles.first(), 'the scene must render a MessageBubble').toBeVisible();
  const geometry = await bubbles.evaluateAll((roots) =>
    roots.map((root) => {
      const card = root.querySelector<HTMLElement>(':scope > .ds-assistant-message-bubble-card[data-part="root"]');
      if (!card) return null;
      const cardStyle = getComputedStyle(card);
      const probe = (inlineSize: string): number => {
        const element = document.createElement('div');
        element.setAttribute('aria-hidden', 'true');
        element.style.cssText = `display:block;block-size:0;margin:0;box-sizing:${cardStyle.boxSizing};padding-inline:${cardStyle.paddingInlineStart} ${cardStyle.paddingInlineEnd};border-inline-style:solid;border-inline-width:${cardStyle.borderInlineStartWidth} ${cardStyle.borderInlineEndWidth};inline-size:${inlineSize}`;
        const channel = cardStyle.getPropertyValue('--_ds-assistant-bubble-measure').trim();
        if (channel) element.style.setProperty('--_ds-assistant-bubble-measure', channel);
        root.append(element);
        const width = element.getBoundingClientRect().width;
        element.remove();
        return width;
      };
      const rtl = getComputedStyle(root).direction === 'rtl';
      const rootBox = root.getBoundingClientRect();
      const cardBox = card.getBoundingClientRect();
      const align: 'start' | 'end' = root.getAttribute('data-align') === 'end' ? 'end' : 'start';
      const atEnd = (align === 'end') !== rtl;
      return {
        align,
        rootWidth: rootBox.width,
        // the @container cut (30rem): below it the bubble takes the full row
        cut: probe('30rem'),
        measure: probe('var(--_ds-assistant-bubble-measure, 80%)'),
        cardWidth: cardBox.width,
        edgeGap: atEnd ? Math.abs(rootBox.right - cardBox.right) : Math.abs(cardBox.left - rootBox.left),
      };
    }),
  );
  for (const bubble of geometry) {
    expect(bubble, 'every MessageBubble root must carry its card').not.toBeNull();
    if (!bubble) continue;
    expect(bubble.rootWidth, 'the scene must hold the bubble above the 30rem cut').toBeGreaterThanOrEqual(bubble.cut);
    expect(Math.abs(bubble.cardWidth - bubble.measure), `the ${bubble.align} bubble card (${bubble.cardWidth}px) must fill its measure (${bubble.measure}px of ${bubble.rootWidth}px)`).toBeLessThanOrEqual(1);
    expect(bubble.edgeGap, `the ${bubble.align} bubble card must sit on its inline-${bubble.align} edge`).toBeLessThanOrEqual(1);
  }
  return geometry.flatMap((bubble) => (bubble ? [bubble.align] : []));
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
  await expectHydrated(page);

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
  await waitForDesktopPosture(root);
  await assertFixtureCoverage(root, engine);
  // experience-chat renders the scene's one (start-aligned) bubble.
  await expectBubbleFillsMeasure(root.locator('[data-long-tail-case="experience-chat"]'));
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

// ---------------------------------------------------------------------------
// WO-ARC-23 -- opened-state evidence for the collection workspace's tablet
// filter disclosure (the anchored Popover). Modern only: a forced frozen
// engine keeps the filters inline, a declared absence pinned by unit tests.
// Both ceremony grounds, LTR and RTL. The geometry and in-tree assertions run
// before the capture, so a portalled or mis-measured panel cannot be accepted.
// ---------------------------------------------------------------------------

const DISCLOSURE_DIRECTIONS = ['ltr', 'rtl'] as const;

async function openFilterDisclosure(
  page: Page,
  fixture: Fixture,
  direction: (typeof DISCLOSURE_DIRECTIONS)[number],
): Promise<Locator> {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.clock.setFixedTime(new Date('2026-07-14T12:00:00.000Z'));
  const rtl = direction === 'rtl' ? '&rtl=1' : '';
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=modern&w=768&filterDisclosure=1${rtl}`,
    { waitUntil: 'domcontentloaded' },
  );
  await expectHydrated(page);
  await page.waitForFunction(() => document.documentElement.getAttribute('data-engine') === 'modern');
  await page.evaluate(() => document.fonts.ready);
  const ground = FIXTURES.find((candidate) => candidate.id === fixture)?.ground ?? 'dark';
  await waitForGroundPaint(page, ground);

  const section = page.locator('[data-testid="probe-collection-filter-disclosure"]');
  await section.waitFor({ timeout: 30_000 });
  const trigger = section.locator('button[aria-haspopup="dialog"][aria-controls]').first();
  const disclosure = section.locator('[data-anchor-scope="external"] > [role="dialog"]');

  // The probe may hydrate in the phone posture first (sheet) and settle into
  // the tablet posture later; retry until the anchored disclosure is the one open.
  await expect(async () => {
    if (await page.locator('[role="dialog"]').first().isVisible()) {
      await page.keyboard.press('Escape');
    }
    await trigger.click();
    await expect(disclosure).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  return disclosure;
}

for (const fixture of FIXTURES) {
  for (const direction of DISCLOSURE_DIRECTIONS) {
    test(`${fixture.id} (${fixture.ground}) / WO-ARC-23 filter disclosure / modern / ${direction}: opened in-tree`, async ({ page }) => {
      test.setTimeout(120_000);
      const disclosure = await openFilterDisclosure(page, fixture.id, direction);

      await expect(disclosure).toHaveAttribute('data-part', 'surface');
      await expect(disclosure).toHaveAttribute('data-layer-kind', 'dropdown');
      await expect(disclosure).toHaveClass(/ds-collection-workspace__filter-dropdown/);
      const posture = await disclosure.evaluate((element) => {
        const surface = element as HTMLElement;
        const style = getComputedStyle(surface);
        return {
          portalled: surface.closest('[data-rottay-portal]') !== null,
          tenantRoot: surface.closest('[data-tenant]') === document.querySelector('[data-tenant]'),
          inlineSize: surface.getBoundingClientRect().width,
          // The workspace lands its measure as the popover minimum and the
          // instance maximum, so the surface is fixed at the computed minimum.
          expectedInlineSize: Number.parseFloat(style.minInlineSize),
          maxInlineSize: Number.parseFloat(style.maxInlineSize),
          dir: surface.getAttribute('dir'),
          strategy: surface.getAttribute('data-ds-position-strategy'),
          ...(() => {
            // The action row must clear the last filter control by the governed
            // spacing channel; a 0 px collision must never become a baseline.
            const actions = surface.querySelector<HTMLElement>('[data-part="filter-dropdown-actions"]');
            const controls = Array.from(
              surface.querySelectorAll<HTMLElement>('input, select, [role="combobox"]'),
            ).filter((control) => !actions?.contains(control));
            const last = controls[controls.length - 1];
            const probe = document.createElement('div');
            probe.style.blockSize = 'var(--ds-spacing-md)';
            surface.append(probe);
            const spacing = probe.getBoundingClientRect().height;
            probe.remove();
            return {
              actionsGap:
                actions && last
                  ? actions.getBoundingClientRect().top - last.getBoundingClientRect().bottom
                  : null,
              spacing,
            };
          })(),
        };
      });
      expect(posture.portalled, 'the anchored disclosure never crosses a portal').toBe(false);
      expect(posture.tenantRoot, 'the surface inherits the tenant root it is mounted under').toBe(true);
      expect(posture.strategy).toMatch(/^(anchor-css|js)$/);
      expect(posture.expectedInlineSize).toBeGreaterThan(0);
      expect(Math.abs(posture.maxInlineSize - posture.expectedInlineSize)).toBeLessThanOrEqual(1);
      expect(Math.abs(posture.inlineSize - posture.expectedInlineSize)).toBeLessThanOrEqual(1);
      expect(posture.dir).toBe(direction);
      expect(posture.spacing).toBeGreaterThan(0);
      expect(posture.actionsGap, 'the action row clears the last filter control').not.toBeNull();
      expect(Math.abs((posture.actionsGap ?? 0) - posture.spacing)).toBeLessThanOrEqual(1);

      await waitForSettled(page, disclosure);
      await expect(page).toHaveScreenshot(
        `${fixture.id}-collection-filter-disclosure-modern-${direction}.png`,
        { maxDiffPixelRatio: 0.0005 },
      );
    });
  }
}
