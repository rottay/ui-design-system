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
// Three differentiating cues and one shared elevation invariant are measurable
// here. The fifth signature cue is not, and this file says so rather than
// pretending:
//
//   1. motion cadence      -> `transition-duration` on the primary button.
//                             Measured: modern 0.12s (the --ds-motion-* canon),
//                             rustic 0.3s.
//   2. dark-aware elevation -> a SHARED engine invariant, not a differentiator.
//                             The card's top hairline is measured by removing
//                             the shadow in an A/B control and decoding the
//                             first three rows; its computed inset alpha is
//                             checked separately against the contract.
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

/** Minimum pixel contribution and normative alpha range of the shared hairline. */
const MIN_HAIRLINE_CONTRIBUTION = 4;
const MIN_HAIRLINE_ALPHA = 0.04;
const MAX_HAIRLINE_ALPHA = 0.08;

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

function extractWhiteInsetAlpha(boxShadow: string): number | null {
  const inset = boxShadow.match(/rgba?\([^)]+\)[^,]*\binset\b/i)?.[0];
  const rawChannels = inset?.match(/rgba?\(([^)]+)\)/i)?.[1];
  if (!rawChannels) return null;

  // Supports Chromium's current comma serialization and the modern slash form.
  const channels = rawChannels
    .replace(/\//g, ' ')
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);

  if (channels.length < 3 || channels.slice(0, 3).some((channel) => channel !== 255)) {
    return null;
  }

  const alpha = channels.length >= 4 ? channels[3] : 1;
  return Number.isFinite(alpha) ? alpha : null;
}

/** Compares the painted top edge with a same-element, shadow-free control. */
async function measureTopHairline(
  page: Page,
  selector: string
): Promise<{ contribution: number; alpha: number | null; boxShadow: string }> {
  const card = page.locator(selector).first();
  const boxShadow = await card.evaluate((element) => getComputedStyle(element).boxShadow);

  const capture = async () => {
    const shot = await card.screenshot();
    return `data:image/png;base64,${shot.toString('base64')}`;
  };

  const paintedUrl = await capture();
  const priorInline = await card.evaluate((element) => {
    const style = (element as HTMLElement).style;
    return {
      shadow: {
        value: style.getPropertyValue('--ds-card-shadow'),
        priority: style.getPropertyPriority('--ds-card-shadow'),
      },
      transition: {
        value: style.getPropertyValue('transition'),
        priority: style.getPropertyPriority('transition'),
      },
    };
  });

  let controlUrl = '';

  try {
    await card.evaluate((element) => {
      const style = (element as HTMLElement).style;
      style.setProperty('transition', 'none', 'important');
      style.setProperty('--ds-card-shadow', 'none', 'important');
    });
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );
    controlUrl = await capture();
  } finally {
    await card.evaluate((element, prior) => {
      const style = (element as HTMLElement).style;
      const restore = (name: string, entry: { value: string; priority: string }) => {
        if (entry.value) style.setProperty(name, entry.value, entry.priority);
        else style.removeProperty(name);
      };

      restore('--ds-card-shadow', prior.shadow);
      restore('transition', prior.transition);
    }, priorInline);
  }

  const contribution = await page.evaluate(
    async ({ paintedUrl: paintedSource, controlUrl: controlSource }) => {
      const load = async (url: string) => {
        const image = new Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = reject;
          image.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('no 2d context');
        context.drawImage(image, 0, 0);
        return context;
      };

      const painted = await load(paintedSource);
      const control = await load(controlSource);
      const width = Math.min(painted.canvas.width, control.canvas.width);
      const height = Math.min(painted.canvas.height, control.canvas.height);
      const rowLuma = (context: CanvasRenderingContext2D, y: number) => {
        const x = Math.round(width * 0.3);
        const sampleWidth = Math.max(1, Math.round(width * 0.4));
        const data = context.getImageData(x, y, sampleWidth, 1).data;
        let sum = 0;
        for (let index = 0; index < data.length; index += 4) {
          sum +=
            0.2126 * data[index] +
            0.7152 * data[index + 1] +
            0.0722 * data[index + 2];
        }
        return sum / (data.length / 4);
      };

      // Fractional crop alignment can move the inset among these edge rows.
      let maximum = Number.NEGATIVE_INFINITY;
      for (let y = 0; y < Math.min(3, height); y++) {
        maximum = Math.max(maximum, rowLuma(painted, y) - rowLuma(control, y));
      }
      return maximum;
    },
    { paintedUrl, controlUrl }
  );

  return {
    contribution,
    alpha: extractWhiteInsetAlpha(boxShadow),
    boxShadow,
  };
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

test.describe('the shared dark-elevation contract', () => {
  for (const engine of ['modern', 'rustic'] as const) {
    test(`${engine} paints the normative card hairline`, async ({ page }) => {
      await loadProbe(page, engine, 'card');
      const sample = await measureTopHairline(page, CARD_SELECTOR);
      const alpha = sample.alpha ?? Number.NaN;

      expect(
        sample.alpha,
        `${engine}: no white inset hairline found in: ${sample.boxShadow}`
      ).not.toBeNull();
      expect(alpha).toBeGreaterThanOrEqual(MIN_HAIRLINE_ALPHA);
      expect(alpha).toBeLessThanOrEqual(MAX_HAIRLINE_ALPHA);
      expect(
        sample.contribution,
        `${engine}: removing --ds-card-shadow changed the top edge by only ` +
          `${sample.contribution.toFixed(2)} luminance`
      ).toBeGreaterThanOrEqual(MIN_HAIRLINE_CONTRIBUTION);
    });
  }
});

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
