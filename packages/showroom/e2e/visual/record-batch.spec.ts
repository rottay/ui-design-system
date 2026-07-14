import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-D/R -- record + workflow + form-surfaces
// (FormSections, FormFactsCard, record's five exports, edit-fields' eight
// exports, ApprovalWorkflow, GuidedDraftFormSurface, and the three
// composition-only surfaces FormSurface/WizardSurface/DetailFormSurface)
// data-part contract evidence.
//
// The pre-step stamps `data-part` (plus data-tone/data-open/data-appearance/
// data-variant/data-empty/data-mono/data-requirement/data-error/data-status/
// data-current/data-action/data-loading/data-layout/data-active/data-complete/
// data-errors and other component-specific state attributes) onto all 9
// files under this checkpoint without moving any paint. Per the checkpoint
// contract, this cluster is SIX INDEPENDENT SKINS, not one -- form-sections
// and record share two border VALUES by coincidence (never a shared
// function), and the other four maps (edit-fields' requirement dot,
// invoice-style status maps, ApprovalWorkflow's status maps, guided-draft-
// form's draft-status map) key on entirely different enums.
//
// NO HOVER PAINT IN THIS CHECKPOINT. The task brief that seeded this batch
// named "form-sections' row hover" as the checkpoint's one imperative write;
// that claim does not survive contact with the source. A full read of
// structures/record/form-sections/index.tsx plus a grep for `hover` (case-
// insensitive) across all 9 files in this checkpoint returns ZERO hits. The
// two real `.style.background =` writes the inventory documents live in
// `patterns/forms/filter-builder` (checkpoint CK-D/F, see forms-batch.spec.ts)
// -- a different checkpoint, already pinned there. Nothing here needs a
// `waitForSettled` interaction shot; every fixture below is a static,
// deterministic rest render.
//
// REST TRUTH NOTE: Playwright's toHaveScreenshot disables CSS animations by
// default, so form-sections' accordion open/close transition and
// GuidedDraftFormSurface's entrance fade both freeze to their frame-zero
// paint -- every state below is captured through controlled props (activeKeys,
// currentStep, draftStatus, adaptive.formLayout), never a live transition.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-record"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * navigation-batch.spec.ts / forms-batch.spec.ts's helper of the same name
 * (duplicated here rather than shared -- e2e/visual has no cross-spec
 * helpers module).
 */
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

async function openProbe(page: Page, fixture: Fixture, engine: Engine): Promise<Locator> {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&record=1`,
    { waitUntil: 'domcontentloaded' },
  );

  const container = page.locator(CONTAINER_SELECTOR);
  await container.waitFor({ timeout: 30_000 });
  await page.waitForFunction(
    (expected) => document.documentElement.getAttribute('data-engine') === expected,
    engine,
  );
  await page.evaluate(() => document.fonts.ready);

  const fixtureGround = FIXTURES.find((f) => f.id === fixture)?.ground ?? 'dark';
  await waitForGroundPaint(page, fixtureGround);

  // Settle any remaining transition tail beyond reducedMotion's
  // entrance-disable so the final rendered frame is what gets diffed.
  await page.waitForTimeout(300);

  return container;
}

// ---------------------------------------------------------------------------
// 4 rest shots -- both fixtures, both engines, full probe-record grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / record / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-record-${engine}.png`);
    });
  }
}
