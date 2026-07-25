import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K0.6 — first-party recipe-profile sighted evidence.
//
// Captures one identical accepted-family tree per vertical BrandTheme with
// and without its candidate governed recipe profile, so the profile decision
// (adopt / reject / document-gap) is made from rendered geometry and anatomy
// — never by blindly filling the field. Captures are review artifacts, not
// pixel baselines; mechanical assertions are limited to structural sanity
// (anatomy parity, no horizontal overflow, provider-ready state).
// ---------------------------------------------------------------------------

type Vertical = 'platform' | 'bithire' | 'evnto';
type Profile = 'none' | 'technical-sharp' | 'editorial-round';

interface Cell {
  readonly theme: Vertical;
  readonly profile: Profile;
}

const CELLS: readonly Cell[] = [
  { theme: 'platform', profile: 'none' },
  { theme: 'platform', profile: 'technical-sharp' },
  { theme: 'platform', profile: 'editorial-round' },
  { theme: 'bithire', profile: 'none' },
  { theme: 'bithire', profile: 'technical-sharp' },
  { theme: 'bithire', profile: 'editorial-round' },
  { theme: 'evnto', profile: 'none' },
  { theme: 'evnto', profile: 'editorial-round' },
  { theme: 'evnto', profile: 'technical-sharp' },
];

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
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K0-K1', 'captures');

async function gotoCell(page: Page, cell: Cell, locale = 'en'): Promise<void> {
  await page.goto(
    `/probe/k0-profiles?theme=${cell.theme}&profile=${cell.profile}&locale=${locale}`,
    { waitUntil: 'networkidle' },
  );
  await page.getByTestId('pe-title').waitFor({ timeout: 30_000 });
  await page.waitForFunction(
    () =>
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--ds-button-primary-bg')
        .trim().length > 0,
    undefined,
    { timeout: 20_000 },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

const ANATOMY_SELECTOR =
  '[data-testid="pe-root"] [data-part], [data-testid="pe-root"] button, [data-testid="pe-root"] input';

/**
 * Semantic parity excludes recipe-owned decorative parts: a recipe may add or
 * remove its own indicator/decoration DOM (DS-Q001L precedent), while the
 * semantic, focusable anatomy must stay identical across profiles.
 */
const SEMANTIC_ANATOMY_SELECTOR =
  '[data-testid="pe-root"] button, [data-testid="pe-root"] input, [data-testid="pe-root"] [role="tab"], [data-testid="pe-root"] [role="tabpanel"], [data-testid="pe-root"] a';

test.describe('K0.6 first-party recipe-profile evidence', () => {
  for (const cell of CELLS) {
    test(`capture ${cell.theme} / ${cell.profile}`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoCell(page, cell);

      // Anatomy parity: a profile changes geometry/personality, not structure.
      const partCount = await page.locator(ANATOMY_SELECTOR).count();
      expect(partCount).toBeGreaterThan(0);

      // No horizontal overflow in any cell.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);

      mkdirSync(artifactDir(), { recursive: true });
      await page.screenshot({
        path: join(artifactDir(), `k0-${cell.theme}-${cell.profile}-1280.png`),
        fullPage: true,
      });

      // One mobile capture per vertical/profile pair.
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(200);
      const mobileOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(mobileOverflow).toBeLessThanOrEqual(1);
      await page.screenshot({
        path: join(artifactDir(), `k0-${cell.theme}-${cell.profile}-390.png`),
        fullPage: true,
      });
    });
  }

  test('anatomy parity between profile none and matched profile per vertical', async ({
    page,
  }) => {
    const matched: readonly [Vertical, Profile][] = [
      ['platform', 'technical-sharp'],
      ['bithire', 'technical-sharp'],
      ['evnto', 'editorial-round'],
    ];
    for (const [theme, profile] of matched) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoCell(page, { theme, profile: 'none' });
      const withoutProfile = await page.locator(SEMANTIC_ANATOMY_SELECTOR).count();
      await gotoCell(page, { theme, profile });
      const withProfile = await page.locator(SEMANTIC_ANATOMY_SELECTOR).count();
      expect(withProfile).toBe(withoutProfile);
    }
  });
});
