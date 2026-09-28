import { test, expect, type Page } from '@playwright/test';

import rottayPreset from '../../../core/src/foundation/presets/verticals/rottay/document/index.json' with { type: 'json' };
import bithirePreset from '../../../core/src/foundation/presets/verticals/bithire/document/index.json' with { type: 'json' };
import structuralNeutral from '../../../core/src/foundation/presets/styles/structural-neutral/document/index.json' with { type: 'json' };
import technicalDense from '../../../core/src/foundation/presets/styles/technical-dense/document/index.json' with { type: 'json' };

import { expectHydrated } from '../support/hydration';

// ---------------------------------------------------------------------------
// WO-ENG-14 — the premium surface tint is measured in pixels, not counted in files.
//
// The counter this replaces (`effects.gradientConsumers` in
// packages/core/scripts/check/engine/tokens/audit/index.mjs) is a MIN floor over the number
// of FILES that mention `var(--ds-gradient-surface)`. It was green while the
// effect was pixel-invisible on every shipped tenant: rottay's card face
// measured a luminance delta of exactly 0.000 from top to bottom.
//
// A counter that counts files cannot see a rendered pixel.
//
// HOW THIS AVOIDS THE CIRCULAR TRAP
// ---------------------------------
// Reading `--ds-gradient-surface` back off <html> would only prove the
// component consumes the variable. A later, more specific rule can overwrite
// it and the component and the read move together, so the check passes while
// the effect is gone. That is precisely the bug this WO fixes: ThemeProvider
// stamped the literal string 'none' INLINE on <html>, at the highest precedence
// CSS offers, clobbering the design system's own default tint from premium.css.
//
// So the EXPECTATION comes from the tenant's declared effect intensity, and the
// MEASUREMENT comes from decoded pixels of a screenshot. Nothing in the chain
// asks a CSS variable whether it is doing its job. For a first-party vertical
// the declaration is its style document (`surfaces.effect-intensity`), read
// here from source, so the rendered dial must equal what the document says.
//
// THE INVARIANT
// -------------
//   A surface is flat if and only if the tenant turned the dial to zero, and a
//   non-zero dial paints a tint proportional to it.
//
// `--ds-effect-intensity: 0` is the one sanctioned way to opt out of the
// premium layer. Any other route to a flat card -- an inline 'none', a dropped
// token, a component that stopped reading the gradient -- is a regression, and
// this test is how it is caught.
//
// PNG decoding without a dependency: the screenshot buffer is handed back to
// the browser as a data URL and decoded by the browser's own image decoder into
// a canvas, which we then sample. No pngjs, no new package.
// ---------------------------------------------------------------------------

type Fixture = 'torture-dark' | 'torture-light' | 'rottay' | 'bithire' | 'themanagementmiami';

const FIXTURES: readonly Fixture[] = [
  'torture-dark',
  'torture-light',
  'rottay',
  'bithire',
  'themanagementmiami',
];

/**
 * The smallest top-to-bottom luminance delta, per unit of dial, that still
 * reads as a surface tint.
 *
 * Rendering here is deterministic, so a flat fill measures exactly 0.000 --
 * there is no noise floor to clear. The design-system default tint measured
 * 4.0 at dial 1 and measures 0.785 on rottay at dial 0.2: it scales with the
 * dial. Half the measured slope keeps every real tint above the floor and the
 * flat case far below it.
 */
const MIN_TINT_DELTA_PER_UNIT = 2.0;

/** Both card variants paint `--ds-gradient-surface`; the tenant's posture picks which one renders. */
const CARD_SELECTOR = '[data-testid="probe-card"] .ds-card';

type StyleDocument = { decisions: Record<string, unknown> };
type VerticalDocument = StyleDocument & { style: { id: string } };

const STYLE_DOCUMENTS: Record<string, StyleDocument> = {
  'structural-neutral': structuralNeutral,
  'technical-dense': technicalDense,
};

const FIRST_PARTY_DOCUMENTS: Partial<Record<Fixture, VerticalDocument>> = {
  rottay: rottayPreset,
  bithire: bithirePreset,
};

/** The vertical's own decision wins over its style's; the style document is the usual author. */
function declaredIntensity(vertical: VerticalDocument, styles = STYLE_DOCUMENTS): number {
  const style = styles[vertical.style.id];
  if (!style) throw new Error(`unknown style document "${vertical.style.id}"`);
  const value =
    vertical.decisions['surfaces.effect-intensity'] ?? style.decisions['surfaces.effect-intensity'];
  if (typeof value !== 'number') throw new Error(`style "${vertical.style.id}" declares no effect intensity`);
  return value;
}

interface Sample {
  topLuma: number;
  bottomLuma: number;
  delta: number;
}

/**
 * Decodes the element's screenshot in-browser and averages Rec. 709 luminance
 * across a horizontal band at 15% and 85% of its height.
 *
 * The bands sit well inside the box so a border, a rounded corner, or the
 * top hairline highlight cannot dominate the reading, and they average across
 * the middle half of the width rather than sampling a single pixel.
 */
async function measureCardTint(page: Page): Promise<Sample> {
  const shot = await page.locator(CARD_SELECTOR).first().screenshot();
  const dataUrl = `data:image/png;base64,${shot.toString('base64')}`;

  return page.evaluate(async (url: string) => {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    ctx.drawImage(img, 0, 0);

    const luma = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

    const band = (fracY: number) => {
      const y = Math.round(canvas.height * fracY);
      const x0 = Math.round(canvas.width * 0.25);
      const x1 = Math.round(canvas.width * 0.75);
      const data = ctx.getImageData(x0, y, x1 - x0, 1).data;
      let sum = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += luma(data[i], data[i + 1], data[i + 2]);
        count++;
      }
      return sum / count;
    };

    const topLuma = band(0.15);
    const bottomLuma = band(0.85);
    return { topLuma, bottomLuma, delta: Math.abs(topLuma - bottomLuma) };
  }, dataUrl);
}

async function loadFixture(page: Page, fixture: Fixture): Promise<void> {
  await page.goto(`/probe/whitelabel-torture?fixture=${fixture}&slug=card`, {
    waitUntil: 'domcontentloaded',
  });
  await expectHydrated(page);
  await page.waitForSelector('[data-testid="probe-card"]', { timeout: 45_000 });
  // Causal readiness, not a sleep: the tenant must have taken the document.
  await page.waitForFunction(
    (slug) => document.documentElement.getAttribute('data-tenant') === slug,
    fixture,
    { timeout: 45_000 }
  );
  await page.evaluate(() => document.fonts.ready);
}

/** The dial, read from the DOM because that is what actually governs the pixels. */
async function effectIntensity(page: Page): Promise<number> {
  const raw = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--ds-effect-intensity').trim()
  );
  const parsed = Number.parseFloat(raw);
  expect(raw, 'every tenant must resolve --ds-effect-intensity').not.toBe('');
  expect(Number.isFinite(parsed), `--ds-effect-intensity is not a number: "${raw}"`).toBe(true);
  return parsed;
}

test.describe('premium surface tint renders as pixels', () => {
  test('the oracle follows the style documents', () => {
    const moved = { ...STYLE_DOCUMENTS, 'structural-neutral': { decisions: { 'surfaces.effect-intensity': 0.5 } } };
    expect(declaredIntensity(rottayPreset, moved)).toBe(0.5);
    expect(declaredIntensity(rottayPreset)).toBe(structuralNeutral.decisions['surfaces.effect-intensity']);
    expect(declaredIntensity(bithirePreset)).toBe(technicalDense.decisions['surfaces.effect-intensity']);
  });

  for (const fixture of FIXTURES) {
    test(`${fixture}: flat if and only if the intensity dial is zero`, async ({ page }) => {
      await loadFixture(page, fixture);

      const intensity = await effectIntensity(page);
      const document = FIRST_PARTY_DOCUMENTS[fixture];
      if (document) {
        expect(
          intensity,
          `${fixture} renders a dial its style document "${document.style.id}" does not declare`
        ).toBe(declaredIntensity(document));
      }

      const { topLuma, bottomLuma, delta } = await measureCardTint(page);
      const reading = `intensity=${intensity} topLuma=${topLuma.toFixed(3)} bottomLuma=${bottomLuma.toFixed(3)} delta=${delta.toFixed(3)}`;

      if (intensity === 0) {
        expect(delta, `${fixture} turned the dial to zero and must be flat. ${reading}`).toBe(0);
        return;
      }

      expect(
        delta,
        `${fixture} has a non-zero effect intensity, so its card face must carry the surface ` +
          `tint. A delta of zero means something killed it: an inline 'none' stamped over the ` +
          `premium.css default, a dropped token, or a component that stopped reading ` +
          `--ds-gradient-surface. ${reading}`
      ).toBeGreaterThanOrEqual(MIN_TINT_DELTA_PER_UNIT * intensity);
    });
  }
});
