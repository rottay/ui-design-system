import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-ENG-11 — modern must be tellable apart from rustic.
//
// The spec states its own falsifiable test: "If a screenshot of modern and
// rustic side-by-side cannot be told apart, the engine is off-spec." This file
// is that sentence, executed.
//
// It runs on `rottay`, which declares `--ds-effect-intensity: 1`. bithire
// declares `0` — it opts out of the premium layer deliberately, so on bithire
// modern SHOULD converge toward rustic and asserting otherwise would be
// asserting against a tenant's own choice.
//
// WHAT THE MEASUREMENTS ARE, AND WHAT THEY ARE NOT
// -----------------------------------------------
// Four of the spec's five signature cues are measurable here. The fifth is not,
// and this file says so rather than pretending:
//
//   1. motion cadence      -> `transition-duration` on the primary button.
//                             Measured: modern 0.12s (the --ds-motion-* canon),
//                             rustic 0.3s.
//   2. dark-aware elevation -> the card's top hairline highlight, measured in
//                             decoded pixels: the first row inside the box is
//                             lighter than the rows below it. Measured: modern
//                             +11 luminance, rustic +0.
//   3. surface-tint gradient -> the card face's top-to-bottom luminance delta, in
//                             decoded pixels. NOT the `background-image` string:
//                             that still reads `linear-gradient(...)` when the
//                             intensity dial is 0, while the face goes flat.
//                             Measured: modern 4.0 at dial 1, 0.0 at dial 0.
//   4. the whole surface     -> the fraction of pixels that differ between the
//                             two engines across the flagship set. Measured on
//                             the overlapping rectangle, because two images of
//                             different heights differ for reasons that have
//                             nothing to do with a premium signature.
//   5. glass overlay backdrop -> NOT asserted here. It lives on the modal
//                             backdrop, and the flagship gallery renders only
//                             the modal's trigger button. Asserting on a closed
//                             modal would measure two buttons and call it glass.
//
// The interaction states (focus ring, hover luminance, press scale) are also
// absent: `element.focus()` does not satisfy `:focus-visible`, so a computed
// `outline-style` reads `none` in BOTH engines and would prove nothing. They are
// covered by `state.darkFocusRingDefects` and `state.inlineStateLiterals` in
// engine-token-audit, which read the source rather than the pixel.
// ---------------------------------------------------------------------------

/** The tenant that opted INTO the premium layer. */
const TENANT = 'rottay';

/**
 * Flagships whose modern and rustic renders must differ by at least
 * MIN_PIXEL_DIVERGENCE. Measured at authoring time on the overlapping rectangle:
 * button 7.4, input 5.7, card 8.3, badge 9.4, table 8.6, tabs 11.6, select 5.9.
 * `modal` is excluded: the gallery renders its trigger, not the dialog.
 */
const FLAGSHIPS: readonly string[] = ['button', 'input', 'card', 'badge', 'table', 'tabs', 'select'];

/**
 * Percent of pixels that must differ. The smallest real reading is 5.7 (input).
 * A floor of 4 sits below every measured flagship and an order of magnitude
 * above the 0.9 that a genuinely indistinct pair produces.
 */
const MIN_PIXEL_DIVERGENCE = 4;

/** Luminance the card's top row must exceed the rows below it by, in modern. */
const MIN_HAIRLINE_DELTA = 4;

/**
 * Top-to-bottom luminance delta across the card face. Measured: modern 4.0 with
 * the dial at 1, and exactly 0.0 with the dial at 0. Rustic has no gradient at
 * all and measures 0.0.
 */
const MIN_TINT_DELTA = 2;

const CARD_SELECTOR = '[data-testid="probe-card"] [class*="card"]';

async function loadProbe(page: Page, engine: string, slug?: string): Promise<void> {
  const slugParam = slug ? `&slug=${slug}` : '';
  await page.goto(`/probe/whitelabel-torture?fixture=${TENANT}&engine=${engine}${slugParam}&w=768`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector('[data-testid="probe-ground"]', { timeout: 45_000 });
  await page.waitForFunction((e) => document.documentElement.getAttribute('data-engine') === e, engine, {
    timeout: 45_000,
  });
  await page.waitForFunction((s) => document.documentElement.getAttribute('data-tenant') === s, TENANT, {
    timeout: 45_000,
  });
  await page.evaluate(() => document.fonts.ready);
}

/** Decodes the element's screenshot in-browser and returns per-row luminance. */
async function topHairlineDelta(page: Page, selector: string): Promise<number> {
  const shot = await page.locator(selector).first().screenshot();
  return page.evaluate(async (url: string) => {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    ctx.drawImage(img, 0, 0);

    const luma = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const row = (y: number) => {
      const x0 = Math.round(c.width * 0.3);
      const d = ctx.getImageData(x0, y, Math.round(c.width * 0.4), 1).data;
      let sum = 0;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) {
        sum += luma(d[i], d[i + 1], d[i + 2]);
        n++;
      }
      return sum / n;
    };
    // Row 0 is the antialiased border. Row 1 carries the inset highlight.
    return row(1) - row(6);
  }, `data:image/png;base64,${shot.toString('base64')}`);
}

/** Decodes the element and averages luminance across bands at 15% and 85% height. */
async function surfaceTint(page: Page, selector: string): Promise<number> {
  const shot = await page.locator(selector).first().screenshot();
  return page.evaluate(async (url: string) => {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    ctx.drawImage(img, 0, 0);

    const luma = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const band = (fracY: number) => {
      const y = Math.round(c.height * fracY);
      const x0 = Math.round(c.width * 0.25);
      const d = ctx.getImageData(x0, y, Math.round(c.width * 0.5), 1).data;
      let sum = 0;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) {
        sum += luma(d[i], d[i + 1], d[i + 2]);
        n++;
      }
      return sum / n;
    };
    return Math.abs(band(0.15) - band(0.85));
  }, `data:image/png;base64,${shot.toString('base64')}`);
}

test.describe('modern carries a premium signature rustic does not', () => {
  test('the motion cadence differs: modern rides the canon', async ({ page }) => {
    const read = async (engine: string) => {
      await loadProbe(page, engine, 'button');
      return page.evaluate(() => {
        const button = document.querySelector('[data-testid="probe-button"] button');
        return button ? getComputedStyle(button).transitionDuration.split(',')[0].trim() : null;
      });
    };

    const modern = await read('modern');
    const rustic = await read('rustic');
    expect(modern, 'modern must set a transition duration on its primary button').not.toBeNull();
    expect(modern, `modern (${modern}) and rustic (${rustic}) share a cadence`).not.toBe(rustic);
    // The canon's interaction step. A literal here would mean the button stopped
    // reading --ds-motion-fast.
    expect(modern).toBe('0.12s');
  });

  test('the card paints a surface tint in modern and none in rustic', async ({ page }) => {
    // Measured in pixels, not read off `background-image`. That string still says
    // `linear-gradient(...)` when `--ds-effect-intensity` is 0 -- the alphas go to
    // zero and the face goes flat while the assertion stays green. Verified in a
    // browser: intensity 1 measures a tint of 4.0 and intensity 0 measures 0.0,
    // with the same `background-image` string in both.
    await loadProbe(page, 'modern', 'card');
    const modern = await surfaceTint(page, CARD_SELECTOR);

    await loadProbe(page, 'rustic', 'card');
    const rustic = await surfaceTint(page, CARD_SELECTOR);

    expect(
      modern,
      `the modern card's face is flat (top-to-bottom luminance delta ${modern.toFixed(2)}). ` +
        `Something zeroed the surface tint: the intensity dial, an inline 'none', or a dropped token.`
    ).toBeGreaterThanOrEqual(MIN_TINT_DELTA);
    expect(
      rustic,
      `rustic's face now carries a tint of ${rustic.toFixed(2)}, so the tint is no longer modern's signature`
    ).toBeLessThan(MIN_TINT_DELTA);
  });

  test("the card's top hairline highlight is modern's, and only modern's", async ({ page }) => {
    await loadProbe(page, 'modern', 'card');
    const modern = await topHairlineDelta(page, '[data-testid="probe-card"] [class*="card"]');

    await loadProbe(page, 'rustic', 'card');
    const rustic = await topHairlineDelta(page, '[data-testid="probe-card"] [class*="card"]');

    expect(
      modern,
      `the modern card's first row is only ${modern.toFixed(2)} brighter than its face; the ` +
        `dark-aware elevation highlight is gone`
    ).toBeGreaterThanOrEqual(MIN_HAIRLINE_DELTA);
    expect(modern, `rustic (${rustic.toFixed(2)}) now shows the highlight too`).toBeGreaterThan(rustic);
  });

  for (const slug of FLAGSHIPS) {
    test(`${slug}: modern and rustic are tellable apart`, async ({ page }) => {
      const capture = async (engine: string) => {
        await loadProbe(page, engine, slug);
        const buf = await page.locator(`[data-testid="probe-${slug}"]`).screenshot();
        return `data:image/png;base64,${buf.toString('base64')}`;
      };

      const modern = await capture('modern');
      const rustic = await capture('rustic');

      const pctDiffering = await page.evaluate(
        async ({ a, b }) => {
          const load = async (url: string) => {
            const img = new Image();
            await new Promise((res, rej) => {
              img.onload = res;
              img.onerror = rej;
              img.src = url;
            });
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            c.getContext('2d')?.drawImage(img, 0, 0);
            return c;
          };
          const ca = await load(a);
          const cb = await load(b);
          // Compare the overlapping rectangle: two images of different heights
          // differ for reasons unrelated to a premium signature.
          const w = Math.min(ca.width, cb.width);
          const h = Math.min(ca.height, cb.height);
          const da = ca.getContext('2d')!.getImageData(0, 0, w, h).data;
          const db = cb.getContext('2d')!.getImageData(0, 0, w, h).data;
          let differing = 0;
          for (let i = 0; i < da.length; i += 4) {
            const d = Math.max(
              Math.abs(da[i] - db[i]),
              Math.abs(da[i + 1] - db[i + 1]),
              Math.abs(da[i + 2] - db[i + 2])
            );
            if (d > 8) differing++;
          }
          return (100 * differing) / (da.length / 4);
        },
        { a: modern, b: rustic }
      );

      expect(
        pctDiffering,
        `only ${pctDiffering.toFixed(1)}% of ${slug}'s pixels differ between modern and rustic. ` +
          `The spec's own test: if a screenshot of the two side by side cannot be told apart, ` +
          `the engine is off-spec.`
      ).toBeGreaterThanOrEqual(MIN_PIXEL_DIVERGENCE);
    });
  }
});
