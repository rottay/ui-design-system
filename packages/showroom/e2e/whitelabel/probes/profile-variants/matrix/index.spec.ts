import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K0.6 — first-party recipe-profile sighted evidence.
//
// Captures one identical accepted-family tree per first-party vertical AS IT
// SHIPS: the code-owned registry tenant with the recipe profile its own
// checked-in FlatTheme authored.
//
// The old `profile` sweep is gone and was not merely renamed. It applied the
// profile by cloning the vertical's FlatTheme onto `tenantConfig.brandTheme`
// at runtime, and the resolver refuses a runtime FlatTheme under EVERY
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
  /** What the vertical's checked-in FlatTheme authors, verified in the DOM. */
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
      // asked for, and the profile is the one its FlatTheme authored.
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

// ---------------------------------------------------------------------------
// RTL evidence.
// ---------------------------------------------------------------------------

/**
 * A recipe profile is allowed to change geometry and personality; it is NOT
 * allowed to change which way the page reads. This case runs the direction
 * claim over ALL THREE authored profiles, because the profile is what differs
 * between the cells — a mirror that only survives on one vertical's authored
 * geometry is exactly the regression the single-vertical version would miss.
 *
 * Read as PHYSICAL values out of a real browser, both locale cells of the same
 * vertical, so every assertion is a SIGN FLIP rather than a one-sided reading
 * a direction-blind layout would also pass:
 *
 *   button row  the primary Button is DOM-first, so it must sit LEFT of the
 *               quiet one in LTR and RIGHT of it in RTL. A row pinned with a
 *               physical `left`/`float`, or a `direction: ltr` reset carried in
 *               a compiled artifact, keeps LTR green and fails here.
 *   tab list    the first tab is the leftmost in LTR and the rightmost in RTL.
 *   input       `direction` must resolve to rtl ON THE CONTROL. Form controls
 *               are the classic place a direction reset gets pinned (numeric
 *               fields), which would leave the placeholder and caret
 *               left-anchored inside an otherwise mirrored page.
 */
interface ProfileRtlRead {
  frameDir: string | null;
  frameLocale: string | null;
  primaryLeft: number;
  primaryRight: number;
  quietLeft: number;
  quietRight: number;
  firstTabLeft: number;
  lastTabLeft: number;
  inputDirection: string;
  overflow: number;
}

async function readProfileDirection(page: Page): Promise<ProfileRtlRead> {
  return page.evaluate(() => {
    const need = (selector: string): HTMLElement => {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) throw new Error(`RTL evidence target is missing: ${selector}`);
      return el;
    };

    // Addressed by DOM ORDER inside the probe's own wrappers rather than by a
    // testid on the DS component, so the evidence does not depend on a
    // primitive forwarding arbitrary data attributes.
    const actions = document.querySelectorAll<HTMLElement>('[data-testid="pe-buttons"] button');
    if (actions.length < 2) throw new Error('RTL evidence needs at least two action buttons');
    const primary = actions[0].getBoundingClientRect();
    const quiet = actions[actions.length - 1].getBoundingClientRect();
    const tabs = document.querySelectorAll<HTMLElement>('[data-testid="pe-tabs"] [role="tab"]');
    if (tabs.length < 2) throw new Error('RTL evidence needs at least two tabs');
    const frame = document.querySelector('[data-testid="pe-frame"]');

    return {
      frameDir: frame?.getAttribute('dir') ?? null,
      frameLocale: frame?.getAttribute('data-pe-locale') ?? null,
      primaryLeft: primary.left,
      primaryRight: primary.right,
      quietLeft: quiet.left,
      quietRight: quiet.right,
      firstTabLeft: tabs[0].getBoundingClientRect().left,
      lastTabLeft: tabs[tabs.length - 1].getBoundingClientRect().left,
      inputDirection: getComputedStyle(need('[data-testid="pe-field"] input')).direction,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

test('k0.6 RTL: every authored profile mirrors under dir=rtl', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 900 });

  for (const cell of CELLS) {
    await gotoCell(page, cell, 'en');
    const ltr = await readProfileDirection(page);

    await gotoCell(page, cell, 'ar');
    const rtl = await readProfileDirection(page);

    await test.step(`${cell.vertical}: the Arabic cell renders under dir=rtl`, async () => {
      expect(ltr.frameDir).toBe('ltr');
      expect(rtl.frameLocale).toBe('ar');
      expect(rtl.frameDir).toBe('rtl');
      expect(rtl.overflow, `${cell.vertical}: the RTL cell overflows horizontally`).toBeLessThanOrEqual(1);
    });

    await test.step(`${cell.vertical}: the action row mirrors`, async () => {
      expect(
        ltr.primaryLeft < ltr.quietLeft,
        `${cell.vertical} LTR: the primary action is not first from the left ` +
          `(primary=${ltr.primaryLeft}, quiet=${ltr.quietLeft})`,
      ).toBe(true);
      expect(
        rtl.primaryRight > rtl.quietRight,
        `${cell.vertical} RTL: the primary action did not move to the inline ` +
          `start — this profile's action row is pinned to a physical edge ` +
          `(primary=${rtl.primaryRight}, quiet=${rtl.quietRight})`,
      ).toBe(true);
    });

    await test.step(`${cell.vertical}: the tab list mirrors`, async () => {
      expect(
        ltr.firstTabLeft < ltr.lastTabLeft,
        `${cell.vertical} LTR: the first tab is not the leftmost ` +
          `(${ltr.firstTabLeft} vs ${ltr.lastTabLeft})`,
      ).toBe(true);
      expect(
        rtl.firstTabLeft > rtl.lastTabLeft,
        `${cell.vertical} RTL: the first tab is not the rightmost — a direction ` +
          `reset leaked into the tab list (${rtl.firstTabLeft} vs ${rtl.lastTabLeft})`,
      ).toBe(true);
    });

    await test.step(`${cell.vertical}: the direction reaches the form control`, async () => {
      expect(ltr.inputDirection).toBe('ltr');
      expect(
        rtl.inputDirection,
        `${cell.vertical} RTL: the Input kept a physical ltr direction, so its ` +
          `placeholder and caret stay left-anchored inside a mirrored page`,
      ).toBe('rtl');
    });
  }
});
