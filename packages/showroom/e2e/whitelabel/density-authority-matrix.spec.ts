/**
 * OLA-5 F2 — density same-tree proof (compiler ↔ CSS ↔ DOM ↔ JS ↔ geometry).
 *
 * The /probe/density-authority route renders ONE identical public DS tree for
 * every cell, mounted through the shared `ShowroomTenantProvider`, sweeping
 * theme source (`bithire-static` | `themanagement-db`) × semantic density
 * posture (compact | comfortable | spacious) × locale (en | es | ar).
 *
 * THE TWO LEGAL SEMANTICS. Density is requested the same way in both cells and
 * lands on a different authority, and this spec asserts each one for what it
 * is instead of forcing a uniform claim:
 *
 *   `themanagement-db`   ROOT/ARTIFACT authority. The customer document authors
 *                        `general.density`; the tenant-theme compiler emits
 *                        `--ds-density-mode-factor` into the proof-stamped
 *                        artifact; the provider derives the root `data-density`
 *                        from the SAME normalized appearance. The nearest
 *                        density boundary above the tree is `<html>`, and the
 *                        cell mounts exactly ONE proof-stamped artifact.
 *
 *   `bithire-static`     VIEWER-BOUNDARY authority. A code-owned tenant config
 *                        is object identity and cannot be copied or edited, so
 *                        the shared provider expresses a viewer's density as a
 *                        non-root `DensityScope` inside the provider. The root
 *                        keeps its code-owned authored posture and its
 *                        code-owned mode factor — this spec proves they do NOT
 *                        move with the request — and the cell mounts ZERO
 *                        proof-stamped artifacts.
 *
 * The planes proven in both cells, at the boundary each cell legitimately owns:
 *
 *   1. compiler plane  — the emitted mode factor (artifact bytes on the DB
 *                        path; the invariant code-owned root value on the
 *                        static one);
 *   2. DOM plane       — `data-density` on the governing boundary;
 *   3. CSS plane       — `--ds-density-local-factor` on that boundary and the
 *                        composed `--ds-density-effective-scale` (numeric read
 *                        via the px probe, see group C);
 *   4. JS plane        — `useDensity()` context readouts;
 *   5. geometry plane  — rendered Button/Input block sizes.
 *
 * Structural `--ds-density-scale` stays a separate axis in both cells -- not
 * because a customer document could never reach it. A bounded
 * `advanced.tokenOverrides['--ds-density-scale']` is legal: the global advanced
 * schema allows 0.75-1.25, and the BitHire vertical envelope narrows that to
 * 0.85-1.15. THIS fixture's document authors none. What the matrix proves is
 * therefore the narrower, true claim: a semantic POSTURE never moves the
 * structural channel on either path.
 *
 * No screenshot baselines: this spec asserts DOM attributes, computed styles,
 * mounted artifact bytes and measured geometry only.
 *
 * Project matrix note: playwright.visual.config.ts runs whitelabel specs on
 * Desktop Chromium only (the mobile-chromium project matches
 * *.mobile.spec.ts exclusively), so the coarse-pointer group H needs no
 * browserName skip.
 */
import { expect, test, type Page } from "@playwright/test";

type Source = "bithire-static" | "themanagement-db";
type Density = "compact" | "comfortable" | "spacious";
type Locale = "en" | "es" | "ar";

const SOURCES: readonly Source[] = ["bithire-static", "themanagement-db"];
const DENSITIES: readonly Density[] = ["compact", "comfortable", "spacious"];
const LOCALES: readonly Locale[] = ["en", "es", "ar"];

/**
 * Sources whose requested posture is ROOT authority. The static source is
 * deliberately absent: its requested posture lives on a non-root viewer
 * boundary and asserting it on `<html>` would be a false claim.
 */
const ROOT_AUTHORITY_SOURCES: readonly Source[] = ["themanagement-db"];
const VIEWER_BOUNDARY_SOURCES: readonly Source[] = ["bithire-static"];

/**
 * Canonical semantic factors — DENSITY_MODE_FACTORS in
 * packages/core/src/foundation/tokens/ts/foundation/base/density/index.ts
 * (`normal` is the tenant-facing alias of `comfortable` and never appears in
 * this matrix). The compilers emit String(factor); the CSS cascade law
 * projects the same literals onto `--ds-density-local-factor` for a non-root
 * boundary.
 */
const MODE_FACTORS: Record<Density, { factor: number; css: string }> = {
  compact: { factor: 0.85, css: "0.85" },
  comfortable: { factor: 1, css: "1" },
  spacious: { factor: 1.15, css: "1.15" },
};

/**
 * A proof-stamped tenant artifact is the `<style>` carrying the three
 * attributes `emitTenantThemeArtifactForSsr` writes
 * (packages/core/src/infrastructure/runtime/theming/foundation/visual-authority).
 * Matching on those attributes rather than on the showroom's own testid keeps
 * the count a statement about the RUNTIME's proof, not about probe markup.
 */
const ARTIFACT_SELECTOR =
  "style[data-ds-tenant-theme-digest][data-ds-tenant-theme-slug]" +
  "[data-ds-tenant-theme-vertical]";

const DB_TENANT_SLUG = "themanagementmiami";
const DB_TENANT_VERTICAL = "bithire";

/**
 * The customer artifact's own `--ds-color-primary`, and the causal witness for
 * the whole DB path. Its combined selector needs `data-ds-root`,
 * `data-vertical` and `data-tenant` live together on `<html>`; the bundled
 * bithire baseline declares #3A6FB0 on that same element. So this value
 * computing on the live root proves the rule PAINTS, which mounted bytes alone
 * never did.
 */
const DB_TENANT_PRIMARY = "#0f766e";

/** Custom properties keep their authored token stream; compare case-folded. */
function normalizeColor(value: string): string {
  return value.trim().toLowerCase();
}

const EFFECTIVE_TOLERANCE = 0.01;

interface Cell {
  source: Source;
  density: Density;
  locale?: Locale;
}

function cellUrl(cell: Cell): string {
  const params = new URLSearchParams({ source: cell.source });
  params.set("density", cell.density);
  if (cell.locale) params.set("locale", cell.locale);
  return `/probe/density-authority?${params.toString()}`;
}

/** Computed custom-property value on <html>, trimmed ("" when unset). */
async function rootComputedVar(page: Page, name: string): Promise<string> {
  return page.evaluate(
    (prop) =>
      getComputedStyle(document.documentElement).getPropertyValue(prop).trim(),
    name
  );
}

async function rootDensityAttribute(page: Page): Promise<string> {
  return page.evaluate(
    () => document.documentElement.getAttribute("data-density") ?? ""
  );
}

/**
 * An unset factor/scale channel means the identity value: every consumer reads
 * it as `var(--ds-density-…, 1)`. Resolving "" to 1 here keeps the arithmetic
 * below identical to the CSS the browser actually evaluated.
 */
function numericChannel(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 1;
}

interface BoundaryReading {
  /** True when the governing boundary is the document element itself. */
  readonly isRoot: boolean;
  /** `data-density` on that boundary ("" when no boundary exists at all). */
  readonly posture: string;
  /** Computed `--ds-density-local-factor` on that boundary. */
  readonly localFactor: string;
  /** Computed `--ds-density-effective-scale` text (kept unevaluated by CSS). */
  readonly structural: string;
  readonly modeFactor: string;
}

/**
 * The ONE locator rule for the density boundary governing the probe tree,
 * resolved from `da-boundary-anchor`. It returns `<html>` on the DB path and
 * the shared provider's viewer `DensityScope` on the static path; which one it
 * returned is itself an assertion below, never an assumption.
 */
async function readBoundary(page: Page): Promise<BoundaryReading> {
  return page.getByTestId("da-boundary-anchor").evaluate((anchor) => {
    const node = (anchor as HTMLElement).closest("[data-density]");
    const read = (element: Element, prop: string) =>
      getComputedStyle(element as HTMLElement).getPropertyValue(prop).trim();
    if (!node) {
      return {
        isRoot: false,
        posture: "",
        localFactor: "",
        structural: "",
        modeFactor: "",
      };
    }
    return {
      isRoot: node === document.documentElement,
      posture: node.getAttribute("data-density") ?? "",
      localFactor: read(node, "--ds-density-local-factor"),
      structural: read(node, "--ds-density-scale"),
      modeFactor: read(node, "--ds-density-mode-factor"),
    };
  });
}

async function openCell(page: Page, cell: Cell): Promise<void> {
  await page.goto(cellUrl(cell), { waitUntil: "networkidle" });
  await expect(page.getByTestId("da-frame")).toHaveAttribute(
    "data-da-source",
    cell.source
  );
  await expect(page.getByTestId("da-button")).toBeVisible();
  // Settling signal that holds for BOTH semantics: the boundary governing the
  // tree carries the requested posture. On the DB path that boundary is <html>,
  // whose attribute RootDensityProvider stamps in an effect -- and the root
  // scope attributes the artifact selector needs are claimed in an effect too,
  // so polling here keeps every computed read below on a settled tree.
  await expect
    .poll(async () => (await readBoundary(page)).posture)
    .toBe(cell.density);
}

async function heightOf(page: Page, testId: string): Promise<number> {
  const box = await page.getByTestId(testId).boundingBox();
  expect(box, `${testId} bounding box`).not.toBeNull();
  return box!.height;
}

/**
 * Numeric effective-scale read. `--ds-density-effective-scale` is declared on
 * :root and redeclared on every non-root density boundary, but computed custom
 * properties keep calc()/clamp() unevaluated, so the spec reads the resolved
 * used width of the probe element
 * (`calc(var(--ds-density-effective-scale, 1) * 100px)`) and divides by 100.
 * All matrix products stay inside the clamp bounds (0.5..3).
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

async function artifactCount(page: Page, selector: string): Promise<number> {
  return page.evaluate(
    (css) => document.querySelectorAll(css).length,
    selector
  );
}

test.describe("OLA-5 F2: density authority over one identical tree", () => {
  test.describe("A. posture sweep: each cell on its own authority", () => {
    for (const source of SOURCES) {
      for (const density of DENSITIES) {
        for (const locale of LOCALES) {
          test(`${source} / ${density} / ${locale}`, async ({ page }) => {
            await openCell(page, { source, density, locale });
            const boundary = await readBoundary(page);
            const rootPosture = await rootDensityAttribute(page);

            if (source === "themanagement-db") {
              // Root/artifact authority: the governing boundary IS the root.
              expect(
                boundary.isRoot,
                "the compiled DB posture must govern from <html>"
              ).toBe(true);
              await expect(page.locator("html")).toHaveAttribute(
                "data-density",
                density
              );
              // The root writes the SEMANTIC channel, never a second local
              // multiplier: the cascade law declares --ds-density-local-factor
              // only under [data-density]:not(:root).
              expect(
                boundary.localFactor === "" || boundary.localFactor === "1",
                `root local factor must be unset or 1, got "${boundary.localFactor}"`
              ).toBe(true);
              await expect
                .poll(() => rootComputedVar(page, "--ds-density-mode-factor"))
                .toBe(MODE_FACTORS[density].css);
            } else {
              // Viewer-boundary authority: the requested posture lives on a
              // NON-root boundary and the root is not asked to pretend.
              expect(
                boundary.isRoot,
                "the static viewer posture must govern from a non-root boundary"
              ).toBe(false);
              expect(
                numericChannel(boundary.localFactor),
                `viewer boundary local factor for ${density}`
              ).toBeCloseTo(MODE_FACTORS[density].factor, 5);
              // The root keeps the code-owned authored posture. Its exact value
              // is code-owned, not a matrix input, so the claim here is that it
              // is a real posture; group B proves it does not follow the
              // request.
              expect(
                DENSITIES as readonly string[],
                "root posture must remain a code-owned posture"
              ).toContain(rootPosture);
            }

            // JS plane. The readout is identical in both cells and means two
            // different things: the root context on the DB path, the viewer
            // boundary's context on the static one.
            await expect(page.getByTestId("da-context")).toHaveAttribute(
              "data-density-context",
              density
            );

            // RTL cells: direction contract. The overflow guard runs in every
            // cell (the overlong string is always on); the brief requires it at
            // minimum for ar.
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

  test.describe("B. root authority moves only where it legally may", () => {
    for (const source of ROOT_AUTHORITY_SOURCES) {
      test(`root posture and mode factor follow the request: ${source}`, async ({
        page,
      }) => {
        const postures: string[] = [];
        const factors: string[] = [];
        for (const density of DENSITIES) {
          await openCell(page, { source, density, locale: "en" });
          postures.push(await rootDensityAttribute(page));
          factors.push(await rootComputedVar(page, "--ds-density-mode-factor"));
        }
        expect(postures).toEqual([...DENSITIES]);
        expect(factors).toEqual(DENSITIES.map((d) => MODE_FACTORS[d].css));
      });
    }

    for (const source of VIEWER_BOUNDARY_SOURCES) {
      test(`root posture and mode factor stay code-owned: ${source}`, async ({
        page,
      }) => {
        const postures: string[] = [];
        const factors: string[] = [];
        for (const density of DENSITIES) {
          await openCell(page, { source, density, locale: "en" });
          postures.push(await rootDensityAttribute(page));
          factors.push(await rootComputedVar(page, "--ds-density-mode-factor"));
        }
        // The whole point of the static path: a viewer's density request must
        // not restamp the tenant root or retune the compiled mode factor.
        expect(
          new Set(postures).size,
          `root posture must not follow the request: ${postures.join(", ")}`
        ).toBe(1);
        expect(
          new Set(factors).size,
          `root mode factor must not follow the request: ${factors.join(", ")}`
        ).toBe(1);
        expect(
          DENSITIES as readonly string[],
          "root posture must be a real code-owned posture"
        ).toContain(postures[0]);
      });
    }
  });

  test.describe("C. structural scale is code-owned and posture-independent", () => {
    for (const source of SOURCES) {
      test(`structural scale never moves with the request: ${source}`, async ({
        page,
      }) => {
        const readings: string[] = [];
        for (const density of DENSITIES) {
          await openCell(page, { source, density, locale: "en" });
          readings.push(await rootComputedVar(page, "--ds-density-scale"));
        }
        // A semantic posture is not a structural-scale channel on either path:
        // the static tenant's scale is authored in its BrandTheme, and this
        // fixture's DB document authors none. A bounded override would be
        // legal -- 0.75-1.25 by the global advanced schema, 0.85-1.15 inside
        // the BitHire envelope -- and would still not be a posture.
        expect(
          new Set(readings).size,
          `structural scale must not move with posture: ${readings.join(", ")}`
        ).toBe(1);
        if (source === "bithire-static") {
          // Non-vacuous. The bundled bithire artifact declares
          // --ds-density-scale: 0.9 and reaches <html> through its own
          // html[data-tenant='bithire'] arm, so ["", "", ""] means a DEAD
          // ground, not a stable one, and must fail here rather than pass
          // Set-size-1.
          expect(
            readings.every((reading) => reading !== ""),
            `bithire-static structural scale must be a real value: ${readings.join(", ")}`
          ).toBe(true);
        }
      });
    }
  });

  test.describe("D. effective scale composes structural × mode × local", () => {
    for (const source of SOURCES) {
      test(`effective scale agreement: ${source}`, async ({ page }) => {
        for (const density of DENSITIES) {
          for (const locale of LOCALES) {
            await openCell(page, { source, density, locale });
            const boundary = await readBoundary(page);
            // Read every input from the DOM rather than pinning it: the two
            // paths legitimately carry the requested factor in different
            // channels (mode on the DB root, local on the static boundary), and
            // this asserts the CSS math composes them into one plane either way.
            const expected =
              numericChannel(boundary.structural) *
              numericChannel(boundary.modeFactor) *
              numericChannel(boundary.localFactor);
            const actual = await effectiveScale(page);
            expect(
              Math.abs(actual - expected),
              `${source} ${density} ${locale}: effective ${actual} vs expected ${expected}`
            ).toBeLessThanOrEqual(EFFECTIVE_TOLERANCE);
            // And the requested posture is what moved it: exactly one of the
            // two channels carries the semantic factor for this cell.
            const carried =
              source === "themanagement-db"
                ? numericChannel(boundary.modeFactor)
                : numericChannel(boundary.localFactor);
            expect(
              carried,
              `${source} ${density}: requested factor channel`
            ).toBeCloseTo(MODE_FACTORS[density].factor, 5);
          }
        }
      });
    }
  });

  test.describe("E. rendered geometry is monotonic in the posture", () => {
    for (const source of SOURCES) {
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

  test.describe("F. nested DensityScope applies and restores", () => {
    for (const source of SOURCES) {
      test(`compact scope inside a spacious cell: ${source}`, async ({
        page,
      }) => {
        await openCell(page, { source, density: "spacious", locale: "en" });

        const nested = await heightOf(page, "da-nested-button");
        const surrounding = await heightOf(page, "da-root-button");
        const unscoped = await heightOf(page, "da-button");

        // Relative, not absolute: the nested boundary recomputes from the
        // global structural × mode plane and its own local factor, so it is
        // smaller than the plane it sits in without composing with that plane's
        // own local factor.
        expect(
          surrounding - nested,
          `nested compact button (${nested}) must be smaller than the surrounding spacious one (${surrounding})`
        ).toBeGreaterThanOrEqual(1);

        await expect(page.getByTestId("da-context-nested")).toHaveAttribute(
          "data-density-context",
          "compact"
        );
        await expect(page.getByTestId("da-context-after")).toHaveAttribute(
          "data-density-context",
          "spacious"
        );

        // An element outside the nested boundary is untouched by it.
        expect(Math.abs(surrounding - unscoped)).toBeLessThanOrEqual(0.01);
      });
    }
  });

  test.describe("G. density never changes layout structure", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    for (const source of SOURCES) {
      test(`grid-template-columns identical across postures: ${source}`, async ({
        page,
      }) => {
        const templates: string[] = [];
        for (const density of DENSITIES) {
          await openCell(page, { source, density, locale: "en" });
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
    }
  });

  test.describe("H. visual-authority proof per source", () => {
    test("bithire-static mounts zero proof-stamped tenant artifacts", async ({
      page,
    }) => {
      for (const density of DENSITIES) {
        await openCell(page, {
          source: "bithire-static",
          density,
          locale: "en",
        });
        expect(
          await artifactCount(page, ARTIFACT_SELECTOR),
          `bithire-static ${density}: code-owned identity is bundled CSS, not a compiled tenant artifact`
        ).toBe(0);
      }
    });

    for (const density of DENSITIES) {
      test(`themanagement-db mounts exactly one artifact carrying the ${density} factor`, async ({
        page,
      }) => {
        await openCell(page, {
          source: "themanagement-db",
          density,
          locale: "en",
        });

        expect(await artifactCount(page, ARTIFACT_SELECTOR)).toBe(1);
        const artifact = page.locator(ARTIFACT_SELECTOR);
        await expect(artifact).toHaveAttribute(
          "data-ds-tenant-theme-slug",
          DB_TENANT_SLUG
        );
        await expect(artifact).toHaveAttribute(
          "data-ds-tenant-theme-vertical",
          DB_TENANT_VERTICAL
        );

        // CAUSAL, and it must come before the byte reads: a mounted artifact is
        // not a painting one. The rule only matches when data-ds-root,
        // data-vertical and data-tenant are all live on <html>, so a non-density
        // channel of this artifact computing on the live root is what certifies
        // the compiler plane below is being read from CSS that applies.
        await expect
          .poll(async () =>
            normalizeColor(await rootComputedVar(page, "--ds-color-primary"))
          )
          .toBe(DB_TENANT_PRIMARY);

        const css = await artifact.evaluate(
          (element) => element.textContent ?? ""
        );
        // The compiler plane, read from the bytes that were actually mounted.
        expect(
          css,
          `artifact must compile the ${density} posture`
        ).toContain(`--ds-density-mode-factor: ${MODE_FACTORS[density].css};`);
        // This fixture's document authors no structural-density override, so
        // its artifact must not carry one. A bounded advanced
        // `--ds-density-scale` would be legal for a customer -- 0.75-1.25 by
        // the global advanced schema, 0.85-1.15 inside the BitHire envelope --
        // it is simply not published here.
        expect(
          css,
          "this fixture's document authors no structural density channel"
        ).not.toContain("--ds-density-scale");
      });
    }

    for (const source of SOURCES) {
      test(`the probe never mounts, styles or injects locally: ${source}`, async ({
        page,
      }) => {
        await openCell(page, { source, density: "compact", locale: "en" });
        const inside = await page
          .getByTestId("da-canvas")
          .evaluate(
            (element, selector) =>
              (element as HTMLElement).querySelectorAll(selector).length,
            ARTIFACT_SELECTOR
          );
        expect(
          inside,
          "artifacts belong outside the provider, emitted by the shared ground"
        ).toBe(0);
      });
    }
  });

  test.describe("I. coarse-pointer 44px floor", () => {
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
        for (const source of SOURCES) {
          await openCell(coarsePage, {
            source,
            density: "compact",
            locale: "en",
          });
          // The skins enforce the floor with min-block-size under
          // @media (pointer: coarse) — deliberately outside the density scale,
          // so it holds whichever plane the compact request landed on.
          await expect
            .poll(() =>
              coarsePage.evaluate(
                () => window.matchMedia("(pointer: coarse)").matches
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
