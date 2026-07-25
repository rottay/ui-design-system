/**
 * OLA-5 F2 — density same-tree proof (compiler ↔ CSS ↔ DOM ↔ JS ↔ geometry).
 *
 * The /probe/density-authority route renders ONE identical public DS tree for
 * every cell, sweeping theme source (static BitHire BrandTheme vs The
 * Management Miami DB Appearance vs DB-over-static) × semantic density
 * posture (compact | comfortable | spacious, always through
 * `appearance.general.density` — the only channel the root provider derives
 * `data-density` from) × locale (en | es | ar). This spec proves the five
 * density planes agree in every cell:
 *
 *   1. compiler output   — computed `--ds-density-mode-factor` on <html>;
 *   2. DOM plane         — root `data-density` attribute;
 *   3. CSS plane         — `--ds-density-effective-scale` (numeric read via
 *                          the px probe, see group C) and the structural
 *                          `--ds-density-scale`;
 *   4. JS plane          — `useDensity()` context readouts;
 *   5. geometry plane    — rendered Button/Input block sizes.
 *
 * No screenshot baselines: this spec asserts DOM attributes, computed styles
 * and measured geometry only (it takes no entries from snapshotPathTemplate).
 *
 * Project matrix note: playwright.visual.config.ts runs whitelabel specs on
 * Desktop Chromium only (the mobile-chromium project matches
 * *.mobile.spec.ts exclusively), so the CDP coarse-pointer group H needs no
 * browserName skip.
 */
import { expect, test, type Page } from "@playwright/test";

type Source = "bithire-static" | "themanagement-db" | "db-over-static";
type Density = "compact" | "comfortable" | "spacious";
type Locale = "en" | "es" | "ar";

/** Sources swept by the posture matrix (A/C) and the geometry groups (D/H). */
const MATRIX_SOURCES: readonly Source[] = ["bithire-static", "themanagement-db"];
/** Sources carrying the static BitHire BrandTheme (structural scale axis, B). */
const STATIC_CARRYING_SOURCES: readonly Source[] = [
  "bithire-static",
  "db-over-static",
];
const DENSITIES: readonly Density[] = ["compact", "comfortable", "spacious"];
const LOCALES: readonly Locale[] = ["en", "es", "ar"];

/**
 * Canonical semantic factors — DENSITY_MODE_FACTORS in
 * packages/core/src/foundation/tokens/ts/foundation/base/density/index.ts
 * (`normal` is the tenant-facing alias of `comfortable` and never appears in
 * this matrix). The appearance compiler emits String(factor) as
 * `--ds-density-mode-factor`.
 */
const MODE_FACTORS: Record<Density, { factor: number; css: string }> = {
  compact: { factor: 0.85, css: "0.85" },
  comfortable: { factor: 1, css: "1" },
  spacious: { factor: 1.15, css: "1.15" },
};

/**
 * BitHire structural scale, authored at
 * packages/core/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts
 * (`surfaces.densityScale: 0.9`). It reaches <html> through the bundled
 * bithire artifact (bithire-static) or the runtime-generated tenant CSS
 * (db-over-static) and is an independent axis from the semantic posture.
 *
 * The Management Miami fixture authors `surfaces.densityScale: 1.05`, but the
 * bounded DB projection (`brandThemeToTenantAppearance`) deliberately has no
 * density-scale channel, so the pure-DB source compiles to NO structural
 * override: `--ds-density-scale` is unset on <html> and the CSS clamp math
 * falls back to 1.
 */
const BITHIRE_STRUCTURAL_SCALE = 0.9;
const STRUCTURAL_TOLERANCE = 0.001;
const EFFECTIVE_TOLERANCE = 0.01;

interface Cell {
  source: Source;
  density: Density;
  locale?: Locale;
  profile?: string;
}

function cellUrl(cell: Cell): string {
  const params = new URLSearchParams({ source: cell.source });
  params.set("density", cell.density);
  if (cell.locale) params.set("locale", cell.locale);
  if (cell.profile) params.set("profile", cell.profile);
  return `/probe/density-authority?${params.toString()}`;
}

async function openCell(page: Page, cell: Cell): Promise<void> {
  await page.goto(cellUrl(cell), { waitUntil: "networkidle" });
  await expect(page.getByTestId("da-frame")).toHaveAttribute(
    "data-da-source",
    cell.source
  );
  await expect(page.getByTestId("da-button")).toBeVisible();
  // RootDensityProvider stamps the root attribute in an effect after mount;
  // polling for it also covers the ThemeProvider inline-variable flush, so
  // every computed read below is taken from the settled tree.
  await expect(page.locator("html")).toHaveAttribute(
    "data-density",
    cell.density
  );
}

/** Computed custom-property value on <html>, trimmed ("" when unset). */
async function rootComputedVar(page: Page, name: string): Promise<string> {
  return page.evaluate(
    (prop) =>
      getComputedStyle(document.documentElement).getPropertyValue(prop).trim(),
    name
  );
}

async function heightOf(page: Page, testId: string): Promise<number> {
  const box = await page.getByTestId(testId).boundingBox();
  expect(box, `${testId} bounding box`).not.toBeNull();
  return box!.height;
}

/**
 * Numeric effective-scale read. `--ds-density-effective-scale` IS exposed on
 * <html> (declared by foundation/themes/default.css :root), but computed
 * custom properties keep calc()/clamp() unevaluated, so the spec reads the
 * resolved used width of the probe element
 * (`calc(var(--ds-density-effective-scale, 1) * 100px)`) and divides by 100.
 * All matrix products stay inside the clamp bounds (0.5..3), so the effective
 * scale equals structural scale × mode factor exactly.
 */
async function effectiveScale(page: Page): Promise<number> {
  const width = await page
    .getByTestId("da-scale-probe")
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element as HTMLElement).width)
    );
  return width / 100;
}

async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      doc: doc.scrollWidth - doc.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    };
  });
  expect(overflow.doc, "document horizontal overflow").toBeLessThanOrEqual(1);
  expect(overflow.body, "body horizontal overflow").toBeLessThanOrEqual(1);
}

test.describe("OLA-5 F2: density authority over one identical tree", () => {
  test.describe("A. posture sweep: compiler ↔ DOM ↔ JS agreement", () => {
    for (const source of MATRIX_SOURCES) {
      for (const density of DENSITIES) {
        for (const locale of LOCALES) {
          test(`${source} / ${density} / ${locale}`, async ({ page }) => {
            await openCell(page, { source, density, locale });

            // 1. DOM plane: the root attribute mirrors the semantic posture.
            await expect(page.locator("html")).toHaveAttribute(
              "data-density",
              density
            );

            // 2. Compiler plane: appearance compilation emitted the canonical
            // semantic factor (inline-stamped by ThemeProvider; polled).
            await expect
              .poll(() => rootComputedVar(page, "--ds-density-mode-factor"))
              .toBe(MODE_FACTORS[density].css);

            // 3. JS plane: useDensity() context agrees with the attribute.
            await expect(page.getByTestId("da-context")).toHaveAttribute(
              "data-density-context",
              density
            );

            // 4. The root boundary must NOT apply a local factor: the
            // `--ds-density-local-factor` cascade law only declares it under
            // `[data-density]:not(:root)`, so on <html> it is unset (or the
            // identity factor if a default ever lands).
            const localFactor = await rootComputedVar(
              page,
              "--ds-density-local-factor"
            );
            expect(
              localFactor === "" || localFactor === "1",
              `root local factor must be unset or 1, got "${localFactor}"`
            ).toBe(true);

            // 5. RTL cells: direction contract. The overflow guard runs in
            // every cell (the overlong string is always on); the brief
            // requires it at minimum for ar.
            if (locale === "ar") {
              await expect(page.getByTestId("da-frame")).toHaveAttribute(
                "dir",
                "rtl"
              );
              expect(await page.evaluate(() => document.dir)).toBe("rtl");
            }
            await assertNoHorizontalOverflow(page);
          });
        }
      }
    }
  });

  test.describe("B. structural scale invariance across postures", () => {
    for (const source of STATIC_CARRYING_SOURCES) {
      test(`structural scale is posture-independent: ${source}`, async ({
        page,
      }) => {
        const readings: string[] = [];
        for (const density of DENSITIES) {
          await openCell(page, { source, density, locale: "en" });
          readings.push(await rootComputedVar(page, "--ds-density-scale"));
        }
        for (const value of readings) {
          expect(
            value,
            `${source} must emit the BitHire structural scale`
          ).not.toBe("");
          expect(
            Math.abs(Number.parseFloat(value) - BITHIRE_STRUCTURAL_SCALE)
          ).toBeLessThanOrEqual(STRUCTURAL_TOLERANCE);
        }
        expect(
          new Set(readings).size,
          `structural scale must not move with posture: ${readings.join(", ")}`
        ).toBe(1);
      });
    }
  });

  test.describe("C. CSS effective scale = structural × semantic factor", () => {
    for (const source of MATRIX_SOURCES) {
      test(`effective scale agreement: ${source}`, async ({ page }) => {
        for (const density of DENSITIES) {
          for (const locale of LOCALES) {
            await openCell(page, { source, density, locale });
            const structuralRaw = await rootComputedVar(
              page,
              "--ds-density-scale"
            );
            // Unset (pure-DB source) falls back to the identity scale 1,
            // exactly like the CSS clamp math's var(--ds-density-scale, 1).
            const structural =
              structuralRaw === "" ? 1 : Number.parseFloat(structuralRaw);
            const expected = structural * MODE_FACTORS[density].factor;
            const actual = await effectiveScale(page);
            expect(
              Math.abs(actual - expected),
              `${source} ${density} ${locale}: effective ${actual} vs expected ${expected}`
            ).toBeLessThanOrEqual(EFFECTIVE_TOLERANCE);
          }
        }
      });
    }
  });

  test.describe("D. rendered geometry is monotonic in the posture", () => {
    for (const source of MATRIX_SOURCES) {
      for (const locale of LOCALES) {
        test(`geometry monotonic: ${source} / ${locale}`, async ({ page }) => {
          const buttonHeights: number[] = [];
          const inputHeights: number[] = [];
          for (const density of DENSITIES) {
            await openCell(page, { source, density, locale });
            buttonHeights.push(await heightOf(page, "da-button"));
            inputHeights.push(await heightOf(page, "da-input"));
          }
          for (const [label, heights] of [
            ["da-button", buttonHeights],
            ["da-input", inputHeights],
          ] as const) {
            expect(
              heights[1] - heights[0],
              `${label} compact -> comfortable: ${heights.join(", ")}`
            ).toBeGreaterThanOrEqual(1);
            expect(
              heights[2] - heights[1],
              `${label} comfortable -> spacious: ${heights.join(", ")}`
            ).toBeGreaterThanOrEqual(1);
          }
        });
      }
    }
  });

  test.describe("E. nested DensityScope applies and restores", () => {
    test("compact scope inside a spacious cell", async ({ page }) => {
      await openCell(page, {
        source: "bithire-static",
        density: "spacious",
        locale: "en",
      });

      const nested = await heightOf(page, "da-nested-button");
      const rootScoped = await heightOf(page, "da-root-button");
      const unscoped = await heightOf(page, "da-button");

      expect(
        rootScoped - nested,
        `nested compact button (${nested}) must be smaller than the root-scope spacious one (${rootScoped})`
      ).toBeGreaterThanOrEqual(1);

      await expect(page.getByTestId("da-context-nested")).toHaveAttribute(
        "data-density-context",
        "compact"
      );
      await expect(page.getByTestId("da-context-after")).toHaveAttribute(
        "data-density-context",
        "spacious"
      );

      // An element outside the boundary is unchanged: the root-scope pair
      // renders with exactly the posture-sweep geometry of da-button in this
      // same cell (both are 36px chrome height × 0.9 structural × 1.15 mode).
      expect(Math.abs(rootScoped - unscoped)).toBeLessThanOrEqual(0.01);
    });
  });

  test.describe("F. density never changes layout structure", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("grid-template-columns identical across postures", async ({
      page,
    }) => {
      const templates: string[] = [];
      for (const density of DENSITIES) {
        await openCell(page, { source: "bithire-static", density, locale: "en" });
        templates.push(
          await page
            .getByTestId("da-layout")
            .evaluate(
              (element) =>
                getComputedStyle(element as HTMLElement).gridTemplateColumns
            )
        );
      }
      expect(templates[0], "layout witness must be a rendered grid").not.toBe(
        "none"
      );
      expect(
        new Set(templates).size,
        `layout structure must be posture-independent: ${templates.join(" | ")}`
      ).toBe(1);
    });
  });

  test.describe("G. DB appearance precedence over the static theme", () => {
    test("db-over-static paints the TMM palette and posture", async ({
      page,
    }) => {
      await openCell(page, {
        source: "db-over-static",
        density: "spacious",
        locale: "en",
      });

      await expect(page.locator("html")).toHaveAttribute(
        "data-density",
        "spacious"
      );

      // The DB appearance layer is layered last by the runtime: TMM's
      // general.palette.primary (#0F766E, projected from the fixture palette)
      // must win over the static BitHire brandTheme primary (#3A6FB0).
      // Chromium serializes computed custom properties either as the literal
      // hex or as rgb(); accept both serializations of the same value.
      const normalizeColor = (value: string) =>
        value.toLowerCase().replace(/\s/g, "");
      await expect
        .poll(async () =>
          normalizeColor(await rootComputedVar(page, "--ds-color-primary"))
        )
        .toMatch(/^(#0f766e|rgb\(15,118,110\))$/);
      const primary = normalizeColor(
        await rootComputedVar(page, "--ds-color-primary")
      );
      expect(primary).not.toBe("#3a6fb0");
      expect(primary).not.toBe("rgb(58,111,176)");

      await expect(page.getByTestId("da-context")).toHaveAttribute(
        "data-density-context",
        "spacious"
      );
    });
  });

  test.describe("H. coarse-pointer 44px floor", () => {
    test("compact geometry never shrinks below the touch floor", async ({
      browser,
    }) => {
      // CDP Emulation.setEmulatedMedia does not flip pointer media queries in
      // this Chromium/Playwright stack (proven twice in this wave); real
      // coarse-pointer media comes from Playwright's mobile+touch emulation.
      const baseURL = test.info().project.use.baseURL as string;
      const context = await browser.newContext({
        baseURL,
        viewport: { width: 393, height: 852 },
        hasTouch: true,
        isMobile: true,
      });
      try {
        const coarsePage = await context.newPage();
        for (const source of MATRIX_SOURCES) {
          await openCell(coarsePage, { source, density: "compact", locale: "en" });
          // The skins enforce the floor with min-block-size under
          // @media (pointer: coarse) — deliberately outside the density scale.
          await expect
            .poll(() =>
              coarsePage.evaluate(() =>
                window.matchMedia("(pointer: coarse)").matches
              )
            )
            .toBe(true);
          expect(
            await heightOf(coarsePage, "da-button"),
            `${source} da-button touch floor`
          ).toBeGreaterThanOrEqual(44);
          expect(
            await heightOf(coarsePage, "da-input"),
            `${source} da-input touch floor`
          ).toBeGreaterThanOrEqual(44);
        }
      } finally {
        await context.close();
      }
    });
  });
});
