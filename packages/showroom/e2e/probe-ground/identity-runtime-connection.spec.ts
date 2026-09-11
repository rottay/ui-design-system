import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// The client runtime consumes the artifact the server mounted.
//
// This suite runs on the DEV harness (playwright.config.ts), not on the
// production one the pixel suites need, and for two reasons that are properties
// of the proof rather than of the schedule: every assertion below reads TEXT, so
// the pre-theme paint timing that makes a dev-server screenshot useless cannot
// reach it; and a development build THROWS on a visual-authority refusal where a
// production build only logs it, so a blocked runtime fails loudly here.
//
// The identity probe-ground used to prove only that a stylesheet loaded: the
// server mounted the candidate's compiled CSS while the client provider
// received no declaration at all, so `resolveVisualAuthority` returned
// `artifact: null` and every runtime reading fell back to the DS baseline. This
// spec is the floor that keeps the two halves connected, and it deliberately
// asserts on values that are NOT in the artifact's CSS:
//
//   1. the page renders the stage rather than the provider's loading screen --
//      an admission that fails on the server pass is invisible in a DOM diff
//      and fatal here;
//   2. no visual-authority conflict reaches the console (the production build
//      reports a refusal there instead of throwing);
//   3. two candidates differ on the RUNTIME readings: the responsive posture's
//      container ladder, the resolved motion policy, the density posture, the
//      governed recipe profile and the JS token layer. None of those is a CSS
//      variable. The modal recipe is READ but not compared: this harness runs
//      under `prefers-reduced-motion`, where the device policy settles every
//      recipe to 0ms for every tenant -- which is the correct answer and a
//      useless discriminator;
//   4. the negative control holds on both: the seed each document authored is
//      a paint decision, so it must be absent from `useTokens()` and the colour
//      token must still be the variable REFERENCE it is for every tenant;
//   5. the saved and unsaved doors resolved one payload (R2), reported by the
//      mount report the server filled in.
// ---------------------------------------------------------------------------

const CANDIDATES = ['editorial-quiet', 'product-dense'] as const;

interface Readings {
  consumed: string;
  control: string;
  mountReport: string;
  posture: string;
  motion: string;
  modal: string;
  density: string;
  recipeProfile: string;
  tokens: string;
  primary: string;
  negativeControl: string;
}

async function readingsFor(page: Page, candidate: string): Promise<Readings> {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(
    `/probe-ground/identity?candidate=${candidate}&mode=light&screen=list`,
    { waitUntil: 'networkidle' },
  );

  // (1) The stage, not the loading screen. The provider blocks by rendering
  // `LoadingScreen` when an artifact cannot be admitted, so its absence is the
  // whole admission asserted in one line.
  await expect(page.getByTestId('identity-probe-stage')).toBeVisible();
  await expect(page.getByTestId('identity-runtime-proof')).toBeVisible();

  // (2) A refusal after hydration is reported, not thrown, in a production
  // build. Reading it here is what stops a silently-blocked runtime from
  // passing as a rendered one.
  const authorityErrors = errors.filter((line) => line.includes('[design-system]'));
  expect(authorityErrors, `visual-authority conflict on ${candidate}`).toEqual([]);

  const text = async (testId: string): Promise<string> =>
    (await page.getByTestId(testId).innerText()).replace(/\s+/gu, ' ').trim();

  return {
    consumed: await text('identity-runtime-consumed'),
    control: await text('identity-runtime-control'),
    mountReport: await text('identity-mount-report'),
    posture: await text('runtime-proof-responsive.posture'),
    motion: await text('runtime-proof-motion.dial'),
    modal: await text('runtime-proof-overlay.modal'),
    density: await text('runtime-proof-density posture'),
    recipeProfile: await text('runtime-proof-recipe profile'),
    tokens: await text('runtime-proof-token layer'),
    primary: await text('runtime-proof-colors.primary'),
    negativeControl: await text('identity-runtime-negative-control'),
  };
}

test.describe('identity probe-ground: the mounted artifact reaches the runtime', () => {
  test('two candidates differ on readings that are not in the CSS', async ({ page }) => {
    const first = await readingsFor(page, CANDIDATES[0]);
    const second = await readingsFor(page, CANDIDATES[1]);

    // (3) The axes the acceptance names, each asserted on its own so a single
    // shared difference cannot carry the claim.
    expect(first.posture).not.toBe(second.posture);
    expect(first.motion).not.toBe(second.motion);
    expect(first.density).not.toBe(second.density);
    expect(first.recipeProfile).not.toBe(second.recipeProfile);
    expect(first.tokens).not.toBe(second.tokens);

    // The device policy outranks both tenants, which is why the recipe is read
    // and not compared. Asserting the AGREEMENT keeps the row honest: a future
    // tenant dial that started overriding a reduced-motion preference would
    // redden here rather than silently pass an inequality check.
    expect(first.modal).toBe(second.modal);
    expect(first.modal).toContain('0ms');

    // ...and they are the candidates' own postures, not merely two strings.
    expect(first.posture).toContain('expansive');
    expect(second.posture).toContain('compact');

    // (4) The negative control, on both. A paint decision stays in the CSS.
    for (const readings of [first, second]) {
      expect(readings.negativeControl).toContain('paint stayed in CSS');
      expect(readings.control).toContain('absent');
      expect(readings.control).not.toContain('LEAKED');
      expect(readings.primary).toBe('var(--ds-color-primary)');
    }

    // (5) R2: preview and publication resolved one payload.
    for (const readings of [first, second]) {
      expect(readings.mountReport).not.toContain('DIVERGED');
      expect(readings.mountReport).toContain('tenant-document');
      expect(readings.mountReport).toContain('preview');
    }
  });
});
