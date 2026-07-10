import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-ENG-22 — a control must be readable against its own background, in every
// mode its tenant declares a ground for.
//
// This gate exists because `a11y.apcaPairings` in engine-token-audit.mjs reads
// SOLID tokens out of the compiled theme and pairs them by name. It cannot see
// a light-authored chrome landing on a dark ground, because nothing in the
// token names says which mode a value was authored for. It reported 6 pairings
// below threshold while the evnto badge was painting `rgb(232,232,224)` under
// `rgb(255,255,255)` and its native select `rgb(255,255,255)` under
// `rgb(232,232,224)` — white on white, twice, unreadable, and not among the 6.
//
// So this reads the COMPUTED background and the COMPUTED text of the same
// element, in the browser, and compares them. Nothing is inferred from a token
// name and nothing asks a `--ds-*` variable whether it is doing its job.
//
// THRESHOLD
// ---------
// Rec. 709 luminance delta on 0..255 channels, not a WCAG ratio: this is a
// coarse "can a human see the glyph at all" floor, deliberately far below any
// accessibility standard, so it catches catastrophes and never argues about
// taste. The two real defects measured 23.6. The healthy controls on the same
// page measure 213.4, 215.4 and 220.8. A floor of 60 sits an order of magnitude
// above the defect and far below every healthy reading, so it cannot be tuned
// past by a small palette change in either direction.
//
// It is a floor, not a ratchet: a tenant is free to be low-contrast on purpose
// down to 60. Below that it is not a style, it is a bug.
// ---------------------------------------------------------------------------

const MIN_LUMINANCE_DELTA = 60;

/** The first-party tenants, and the mode each one's probe surface renders in. */
const TENANTS: readonly string[] = ['rottay', 'bithire', 'evnto', 'themanagementmiami'];

/**
 * Controls whose background and text both come from the tenant, and which paint
 * from a different channel each. `probe-*` testids are owned by the probe page.
 */
const CONTROLS: readonly { name: string; selector: string }[] = [
  { name: 'native select', selector: '[data-testid="probe-select"] select' },
  { name: 'primary badge', selector: '[data-testid="probe-extras"] [class*="badge"]' },
  { name: 'primary button', selector: '[data-testid="probe-button"] .rottay-button--primary' },
  { name: 'text input', selector: '[data-testid="probe-input"] input' },
];

interface Reading {
  found: boolean;
  background: string;
  color: string;
  delta: number;
}

async function readControl(page: Page, selector: string): Promise<Reading> {
  return page.evaluate((sel) => {
    const luminance = (css: string): number => {
      const parts = css.match(/[\d.]+/g);
      if (!parts || parts.length < 3) return Number.NaN;
      const [r, g, b] = parts.map(Number);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const element = document.querySelector(sel);
    if (!element) return { found: false, background: '', color: '', delta: Number.NaN };

    const style = getComputedStyle(element);
    const backgroundLuma = luminance(style.backgroundColor);
    const colorLuma = luminance(style.color);

    return {
      found: true,
      background: style.backgroundColor,
      color: style.color,
      delta: Math.abs(backgroundLuma - colorLuma),
    };
  }, selector);
}

test.describe('every control is readable against its own background', () => {
  for (const tenant of TENANTS) {
    for (const control of CONTROLS) {
      test(`${tenant}: ${control.name}`, async ({ page }) => {
        await page.goto(`/probe/whitelabel-torture?fixture=${tenant}`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('[data-testid="probe-ground"]', { timeout: 45_000 });
        await page.waitForFunction(
          (slug) => document.documentElement.getAttribute('data-tenant') === slug,
          tenant,
          { timeout: 45_000 }
        );
        await page.evaluate(() => document.fonts.ready);

        const reading = await readControl(page, control.selector);

        // A control the probe cannot find has silently stopped being measured.
        // That is worse than a red gate, so it is a hard failure and never a
        // passing skip.
        expect(reading.found, `${tenant}: no element matched ${control.selector}`).toBe(true);
        expect(Number.isFinite(reading.delta), `${tenant}: could not read colours`).toBe(true);

        const mode = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        expect(
          reading.delta,
          `${tenant} (${mode}) ${control.name} is unreadable against itself: ` +
            `background ${reading.background}, text ${reading.color}, luminance delta ` +
            `${reading.delta.toFixed(1)}. A light-authored chrome value has landed on a dark ` +
            `ground, or a foreground token was hardcoded instead of derived from what it sits on.`
        ).toBeGreaterThanOrEqual(MIN_LUMINANCE_DELTA);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// The classic engine's primary button.
//
// The suite above never selects an engine, so it measures the probe's default,
// `modern`. The classic engine is Ant Design, and the DS hands antd a theme
// through `runtime/engines/AntdConfigProvider.tsx`, which maps `colorPrimary`
// from `--ds-color-primary` and -- until this gate existed -- mapped nothing to
// `colorTextLightSolid`, the colour antd paints ON a solid primary. antd's own
// default for it is `#fff`.
//
// On a tenant whose primary IS white, that is white text on a white button. It
// shipped on rottay, the platform's own brand: measured at a contrast ratio of
// exactly 1.00:1, a button with an invisible label, while all 118 gate tests
// were green.
//
// Only the primary button is covered here. The classic engine's select, badge
// and input have antd handles of their own (`.ant-select-selector`, `.ant-input`)
// and are NOT measured yet -- that is a named gap, filed as P-53, not a silent
// one.
// ---------------------------------------------------------------------------

const CLASSIC_PRIMARY_BUTTON = '[data-testid="probe-button"] .ant-btn-primary';

test.describe("the classic engine's primary button is readable on every tenant", () => {
  for (const tenant of TENANTS) {
    test(`${tenant}: classic primary button`, async ({ page }) => {
      await page.goto(`/probe/whitelabel-torture?fixture=${tenant}&engine=classic`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForSelector('[data-testid="probe-ground"]', { timeout: 45_000 });
      await page.waitForFunction(
        (slug) => document.documentElement.getAttribute('data-tenant') === slug,
        tenant,
        { timeout: 45_000 }
      );
      await page.waitForFunction(
        () => document.documentElement.getAttribute('data-engine') === 'classic',
        undefined,
        { timeout: 45_000 }
      );
      await page.evaluate(() => document.fonts.ready);

      const reading = await readControl(page, CLASSIC_PRIMARY_BUTTON);

      expect(reading.found, `${tenant}: no element matched ${CLASSIC_PRIMARY_BUTTON}`).toBe(true);
      expect(Number.isFinite(reading.delta), `${tenant}: could not read colours`).toBe(true);
      expect(
        reading.delta,
        `${tenant}: the classic primary button is unreadable against itself: background ` +
          `${reading.background}, text ${reading.color}, luminance delta ${reading.delta.toFixed(1)}. ` +
          `antd paints ON a solid primary with \`colorTextLightSolid\`; if the DS does not map it to ` +
          `--ds-color-text-on-primary, antd keeps its own #fff and a light-primary tenant gets an ` +
          `invisible label.`
      ).toBeGreaterThanOrEqual(MIN_LUMINANCE_DELTA);
    });
  }
});
