import { expect, test, type Locator, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// W6-D subgrid record-alignment fixture.
//
// /probe/record-subgrid renders two adjacent vertical Descriptions sections
// whose label lengths differ wildly (Identity: ID/Name/Role -- Compliance: a
// long "Data processing agreement reference identifier" beside Status/Owner).
// The W6-D skin puts a shared 2-track grid on [data-part='rows'] and re-exposes
// it to each row via `grid-template-columns: subgrid` under @supports, so every
// value column aligns to the widest label in its section. This spec captures
// that alignment for both engines (modern, rustic) on both grounds (rottay =
// dark, bithire = light): 2 engines x 2 fixtures = 4 screenshots.
//
// Snapshots are committed under e2e/visual/__screenshots__/ and are created by
// the orchestrated production-build capture pass (same as misc-h1-prestep),
// never by a source-only lane. This spec runs against the production build
// (playwright.visual.config.ts's webServer runs `next start`).
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const ROOT_SELECTOR = '[data-testid="probe-record-subgrid"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and polling strategy as misc-h1-prestep.spec.ts's
 * helper of the same name (duplicated here rather than shared -- e2e/visual has
 * no cross-spec helpers module).
 */
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

/**
 * Polls with requestAnimationFrame until the container's rendered signature
 * (text + opacity/transform + colors) holds for three consecutive frames, so
 * the final frame is what gets diffed. No fixed-duration wait: entrance motion
 * length varies with engine and reduced-motion policy.
 */
async function waitForSettled(page: Page, locator: Locator): Promise<void> {
  const handle = await locator.elementHandle();
  if (!handle) return;
  await page.waitForFunction(
    (element) => {
      const style = getComputedStyle(element as Element);
      const key = `${(element as Element).textContent}|${style.opacity}|${style.transform}|${style.color}|${
        style.backgroundColor
      }|${style.borderColor}`;
      const state = window as unknown as {
        __recordSubgridSettle?: { key: string; hits: number };
      };
      if (!state.__recordSubgridSettle || state.__recordSubgridSettle.key !== key) {
        state.__recordSubgridSettle = { key, hits: 1 };
        return false;
      }
      state.__recordSubgridSettle.hits += 1;
      return state.__recordSubgridSettle.hits >= 3;
    },
    handle,
    { timeout: 10_000, polling: 'raf' }
  );
}

async function openProbe(page: Page, fixture: Fixture, engine: Engine, ground: 'dark' | 'light'): Promise<Locator> {
  await page.setViewportSize({ width: 800, height: 1200 });
  await page.goto(`/probe/record-subgrid?fixture=${fixture}&engine=${engine}`, {
    waitUntil: 'domcontentloaded',
  });

  const root = page.locator(ROOT_SELECTOR);
  await root.waitFor({ timeout: 30_000 });
  await page.waitForFunction((expected) => document.documentElement.getAttribute('data-engine') === expected, engine);
  await page.evaluate(() => document.fonts.ready);
  await waitForGroundPaint(page, ground);
  await waitForSettled(page, root);
  return root;
}

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / record subgrid / ${engine}`, async ({ page }) => {
      test.setTimeout(90_000);
      const root = await openProbe(page, fixture.id, engine, fixture.ground);

      // Both sections render in the requested engine and carry the vertical
      // subgrid scope hook the W6-D skin targets.
      const sections = root.locator(
        `.rottay-descriptions--${engine}[data-part='root'][data-layout='vertical']`
      );
      await expect(sections).toHaveCount(2);
      // Each section's rows are the subgrid items (label + value per row).
      await expect(sections.first().locator("[data-part='rows'] > [data-part='row']")).toHaveCount(3);
      await expect(sections.last().locator("[data-part='rows'] > [data-part='row']")).toHaveCount(3);

      await waitForSettled(page, root);
      await expect(root).toHaveScreenshot(`${fixture.id}-record-subgrid-${engine}.png`, {
        maxDiffPixelRatio: 0.0005,
      });
    });
  }
}
