import { test, expect, type Page } from '@playwright/test';

import { expectHydrated } from '../support/hydration';

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

// The six routes of WO-DER-07 T6, with the title and tenant slug each must render: an
// unknown candidate id is sanitized to the first one, so the id alone proves nothing.
const ROUTE_CANDIDATES = [
  { id: 'editorial-quiet', title: 'Editorial quiet', slug: 'bithire-editorial-quiet' },
  { id: 'product-dense', title: 'Product dense', slug: 'bithire-product-dense' },
  { id: 'warm-humanist', title: 'Warm humanist', slug: 'bithire-warm-humanist' },
] as const;
const ROUTE_MODES = ['light', 'dark'] as const;

// Stage order. `marker` is a string only that screen renders, so a heading
// without its body cannot stand in for the region.
const SCREEN_REGIONS = [
  { screen: 'list', heading: 'Candidates', marker: { role: 'row', name: /Owen Clarke/u } },
  { screen: 'record', heading: 'Ana Ruiz', marker: { role: 'button', name: 'Advance to offer' } },
  { screen: 'form', heading: 'New role', marker: { role: 'button', name: 'Publish role' } },
  { screen: 'dashboard', heading: 'App shell', marker: { role: 'heading', name: 'Hiring overview' } },
  { screen: 'modal', heading: 'Decision overlay', marker: { role: 'button', name: 'Move to offer' } },
  { screen: 'phone', heading: 'Phone posture', marker: { role: 'button', name: 'Start debrief' } },
] as const;

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
  await expectHydrated(page);

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

  // Polled: `innerText` is one unretried read, and it is empty while a node is not rendered.
  const text = async (testId: string): Promise<string> => {
    let value = '';
    await expect
      .poll(async () => {
        value = (await page.getByTestId(testId).innerText()).replace(/\s+/gu, ' ').trim();
        return value;
      }, `${testId} on ${candidate}`)
      .not.toBe('');
    return value;
  };

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

test.describe('identity probe-ground: every candidate renders six screens in both modes', () => {
  for (const candidate of ROUTE_CANDIDATES) {
    for (const mode of ROUTE_MODES) {
      const route = `/probe-ground/identity?candidate=${candidate.id}&mode=${mode}`;

      test(`${candidate.id} / ${mode} renders the stage, the runtime proof and six screens`, async ({
        page,
      }, testInfo) => {
        const consoleErrors: string[] = [];
        const pageErrors: string[] = [];
        page.on('console', (message) => {
          if (message.type() === 'error') consoleErrors.push(message.text());
        });
        page.on('pageerror', (error) => pageErrors.push(String(error)));

        const response = await page.goto(route, { waitUntil: 'networkidle' });
        await expectHydrated(page);

        const stage = page.getByTestId('identity-probe-stage');
        await expect(stage).toBeVisible();
        await expect(page.getByTestId('identity-runtime-proof')).toBeVisible();
        await expect(page.getByTestId('identity-runtime-consumed')).toBeVisible();

        // The route rendered what was asked for, not what the page falls back to.
        await expect(stage.getByRole('heading', { level: 1 })).toHaveText(candidate.title);
        await expect(stage.getByRole('link', { name: `· ${candidate.title}`, exact: true })).toHaveCount(1);
        await expect(stage.getByRole('link', { name: `· ${mode}`, exact: true })).toHaveCount(1);
        await expect(stage.getByRole('link', { name: '· all', exact: true })).toHaveCount(1);

        const root = page.locator('html');
        await expect(root).toHaveAttribute('data-tenant', candidate.slug);
        await expect(root).toHaveAttribute('data-theme', mode);
        await expect(root).toHaveAttribute('data-tenant-theme-mode', mode);
        await expect(page.getByTestId('identity-probe-artifact-style')).toHaveCount(1);
        const mountReport = page.getByTestId('identity-mount-report');
        await expect(mountReport.getByText(/· identical$/u)).toHaveCount(7);
        await expect(mountReport).not.toContainText('DIVERGED');
        const digest = stage.getByText(/^decision digest sha256-[0-9a-f]{64}$/u);
        await expect(digest).toHaveCount(1);

        // Exactly the runtime proof and the six screens, in stage order.
        await expect(stage.getByRole('heading', { level: 2 })).toHaveText([
          'Runtime readings',
          ...SCREEN_REGIONS.map((region) => region.heading),
        ]);
        for (const region of SCREEN_REGIONS) {
          const marker = stage.getByRole(region.marker.role, { name: region.marker.name });
          await expect(marker, `${region.screen} screen body`).toHaveCount(1);
          await expect(marker, `${region.screen} screen body`).toBeVisible();
        }

        // The mode painted: ground and ink are read as pixels through a canvas because a
        // computed colour may serialize as `color(srgb ...)`, and their polarity must match.
        const paint = await stage.evaluate((node) => {
          const context = document.createElement('canvas').getContext('2d', {
            willReadFrequently: true,
          });
          if (!context) throw new Error('no 2d canvas context');
          const luminance = (color: string): number => {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
            if (alpha !== 255) throw new Error(`not an opaque colour: ${color}`);
            return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
          };
          const style = getComputedStyle(node);
          return {
            ground: style.backgroundColor,
            ink: style.color,
            groundLuminance: luminance(style.backgroundColor),
            inkLuminance: luminance(style.color),
            colorScheme: getComputedStyle(document.documentElement).colorScheme,
          };
        });
        expect(paint.colorScheme).toBe(mode);
        if (mode === 'dark') {
          expect(paint.groundLuminance, `dark ground ${paint.ground}`).toBeLessThan(paint.inkLuminance);
        } else {
          expect(paint.groundLuminance, `light ground ${paint.ground}`).toBeGreaterThan(paint.inkLuminance);
        }

        // The overlay screen is live, not only its trigger.
        const dialog = page.getByRole('dialog', { name: 'Move Ana Ruiz to offer' });
        await expect(dialog).toHaveCount(0);
        await stage.getByRole('button', { name: 'Move to offer' }).click();
        await expect(dialog).toBeVisible();
        await dialog.getByRole('button', { name: 'Cancel' }).click();
        await expect(dialog).toBeHidden();

        const authorityErrors = consoleErrors.filter((line) => line.includes('[design-system]'));
        await testInfo.attach('route-check', {
          contentType: 'application/json',
          body: JSON.stringify(
            {
              route,
              status: response?.status() ?? null,
              candidate: candidate.id,
              mode,
              screens: SCREEN_REGIONS.map((region) => region.screen),
              paint,
              digest: await digest.textContent(),
              consoleErrors,
              authorityErrors,
              pageErrors,
            },
            null,
            2,
          ),
        });
        expect(authorityErrors, `visual-authority conflict on ${route}`).toEqual([]);
        expect(pageErrors, `uncaught error on ${route}`).toEqual([]);
      });
    }
  }
});
