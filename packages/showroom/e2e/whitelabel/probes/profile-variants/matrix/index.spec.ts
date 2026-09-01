import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K0.6 — first-party recipe-profile sighted evidence.
//
// Captures one identical accepted-family tree per first-party vertical AS IT
// SHIPS: the code-owned registry tenant with the recipe profile its own
// checked-in BrandTheme authored.
//
// The old `profile` sweep is gone and was not merely renamed. It applied the
// profile by cloning the vertical's BrandTheme onto `tenantConfig.brandTheme`
// at runtime, and the resolver refuses a runtime BrandTheme under EVERY
// declaration — the provider returns `<LoadingScreen />`, so those nine cells
// captured a spinner. The authored profile is a fact of the source tree, so
// this spec asserts it on the frame instead of parameterising it.
//
// Captures are review artifacts, not pixel baselines; mechanical assertions
// stay structural (authored-profile identity, no horizontal overflow,
// provider-ready state).
// ---------------------------------------------------------------------------

type Vertical = 'rottay' | 'bithire' | 'evnto';

interface Cell {
  readonly vertical: Vertical;
  /** What the vertical's checked-in BrandTheme authors, verified in the DOM. */
  readonly authoredProfile: string;
}

const CELLS: readonly Cell[] = [
  { vertical: 'rottay', authoredProfile: 'rottay/technical-sharp@1' },
  { vertical: 'bithire', authoredProfile: 'rottay/network-professional@1' },
  { vertical: 'evnto', authoredProfile: 'none' },
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
  join(repoRoot(), 'packages', 'core', 'artifacts', 'quality', 'captures', 'visual-regressions', 'whitelabel', 'profile-variants');

async function gotoCell(page: Page, cell: Cell, locale = 'en'): Promise<void> {
  await page.goto(
    `/probe/foundation/profile-variants?vertical=${cell.vertical}&locale=${locale}`,
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
    test(`capture ${cell.vertical}`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoCell(page, cell);

      // The tree rendered, so the visual authority resolved. A blocked
      // resolution renders `<LoadingScreen />` and `pe-root` never exists —
      // which is exactly how the previous version of this probe stayed green
      // while photographing a spinner.
      const partCount = await page.locator(ANATOMY_SELECTOR).count();
      expect(partCount).toBeGreaterThan(0);

      // The capture states its own subject: the registry tenant is the one
      // asked for, and the profile is the one its BrandTheme authored.
      const frame = page.getByTestId('pe-frame');
      await expect(frame).toHaveAttribute('data-pe-vertical', cell.vertical);
      await expect(frame).toHaveAttribute(
        'data-pe-authored-profile',
        cell.authoredProfile,
      );

      // No horizontal overflow in any cell.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);

      mkdirSync(artifactDir(), { recursive: true });
      await page.screenshot({
        path: join(artifactDir(), `k0-${cell.vertical}-1280.png`),
        fullPage: true,
      });

      // One mobile capture per vertical.
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(200);
      const mobileOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(mobileOverflow).toBeLessThanOrEqual(1);
      await page.screenshot({
        path: join(artifactDir(), `k0-${cell.vertical}-390.png`),
        fullPage: true,
      });
    });
  }

  /**
   * Anatomy parity used to be measured between `profile=none` and a matched
   * profile on the same vertical. That comparison no longer exists to be made:
   * the profile is authored per vertical, so there is no second URL to diff
   * against. What survives, and is the claim that mattered, is that a governed
   * profile changes geometry and personality without changing the semantic,
   * focusable anatomy — so the three verticals, each on its own authored
   * profile, must expose the same semantic anatomy as each other.
   */
  test('semantic anatomy is identical across the three authored profiles', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const counts: number[] = [];
    for (const cell of CELLS) {
      await gotoCell(page, cell);
      counts.push(await page.locator(SEMANTIC_ANATOMY_SELECTOR).count());
    }
    expect(counts[0]).toBeGreaterThan(0);
    for (const count of counts) expect(count).toBe(counts[0]);
  });
});
