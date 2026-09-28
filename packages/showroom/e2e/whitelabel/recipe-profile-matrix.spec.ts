/**
 * DS-Q001L matrix — computed-style and DOM-parity evidence, no screenshots.
 *
 * The specimen route renders one identical tree for the six DS-S001 families
 * under the two opposing governed INGRESS PATHS: the code-owned first-party
 * tenant whose published artifact runtime block selects `rottay/technical-
 * sharp@1` (derived below, never assumed) and whose CSS is bundled, versus a published customer document
 * selecting `rottay/editorial-round@1`, compiled and mounted as a verified
 * artifact. This spec proves the machine-checkable half of the exit contract;
 * Sighted review uses the manifest in the wave handoff.
 *
 * Only the editorial side states expected colours literally: those bytes are
 * authored by the specimen's own document. The technical side's canvas is
 * that vertical's shipped identity, so it is asserted by CONTRACT — readable, and
 * divergent from editorial — rather than by a number this spec would be
 * restating from the brand theme and silently pinning.
 */
import { devices, expect, test, type Page } from "@playwright/test";
import { FIRST_PARTY_ARTIFACT_RUNTIME } from "../../../core/src/infrastructure/compilers/runtime/tenant-css/artifact-runtime";
import { RECIPE_PROFILES } from "../../../core/src/foundation/tokens/ts/presentation/recipe-profiles";
import { expectHydrated } from "../support/hydration";

type Source = "technical-static" | "editorial-db";
type Locale = "en" | "es" | "ar";

const SOURCES: readonly Source[] = ["technical-static", "editorial-db"];

/**
 * The profile whose recipe postures (outline / default / ruled) the
 * divergence case asserts, and the first-party vertical that ships it as
 * published. `undefined` means no vertical publishes it any more and the
 * technical side has lost its subject.
 */
const TECHNICAL_PROFILE = "rottay/technical-sharp@1";
/** The profile the specimen's own editorial document selects. */
const EDITORIAL_PROFILE = "rottay/editorial-round@1";

/** The published per-family defaults of a registry profile: the posture oracle. */
function profileFamilies(id: string) {
  const profile = RECIPE_PROFILES.find((entry) => entry.id === id);
  if (!profile) throw new Error(`${id} is not in the published recipe-profile registry`);
  return profile.families;
}
const TECHNICAL_VERTICAL = (
  Object.entries(FIRST_PARTY_ARTIFACT_RUNTIME) as [string, { recipeProfile?: string }][]
).find(([, block]) => block.recipeProfile === TECHNICAL_PROFILE)?.[0];
const LOCALES: readonly Locale[] = ["en", "es", "ar"];
const MOBILE = {
  userAgent: devices["Pixel 7"].userAgent,
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 1,
  hasTouch: true,
  isMobile: true,
} as const;

function cellUrl(cell: {
  source: Source;
  locale?: Locale;
  state?: string;
  stress?: string;
}): string {
  const params = new URLSearchParams({ source: cell.source });
  if (cell.locale) params.set("locale", cell.locale);
  if (cell.state) params.set("state", cell.state);
  if (cell.stress) params.set("stress", cell.stress);
  return `/probe/recipe-profile-specimen?${params.toString()}`;
}

async function openCell(
  page: Page,
  cell: Parameters<typeof cellUrl>[0]
): Promise<void> {
  await page.goto(cellUrl(cell), { waitUntil: "networkidle" });
  await expectHydrated(page);
  await expect(page.getByTestId("specimen-frame")).toHaveAttribute(
    "data-specimen-source",
    cell.source
  );
  await expect(page.getByTestId("specimen-button-primary")).toBeVisible();
  const table = page.getByTestId("specimen-table");
  await expect(
    table
      .locator("[data-part='header-cell'], [data-part='mobile-card'], [data-part='root']")
      .first()
  ).toBeVisible();
}

async function computedOf(
  page: Page,
  testId: string,
  properties: readonly string[]
): Promise<Record<string, string>> {
  return page.getByTestId(testId).first().evaluate((element, props) => {
    const style = getComputedStyle(element as HTMLElement);
    return Object.fromEntries(
      (props as string[]).map((prop) => [prop, style.getPropertyValue(prop)])
    );
  }, properties);
}

/**
 * Stable semantic fingerprint: testid/part sequence, no text, no classes.
 *
 * Recipe-owned decoration is deliberately excluded. The underline recipe
 * renders a measured visual indicator while the pills recipe does not; that
 * is governed presentation, not a product-tree or content difference.
 */
async function domFingerprint(page: Page): Promise<string[]> {
  return page.getByTestId("specimen-root").evaluate((root) => {
    const out: string[] = [];
    const walk = (node: Element) => {
      const id = node.getAttribute("data-testid");
      const part = node.getAttribute("data-part");
      if (part === "indicator") return;
      if (id) out.push(`id:${id}`);
      else if (part) out.push(`part:${part}`);
      for (const child of Array.from(node.children)) walk(child);
    };
    walk(root as Element);
    return out;
  });
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

test.describe("DS-Q001L: opposing profile sources over one tree", () => {
  test("each source mounts its own governed ingress, and only the DB one ships an artifact", async ({
    page,
  }) => {
    const artifact = page.locator(
      'style[data-testid="showroom-tenant-artifact"]'
    );

    expect(
      TECHNICAL_VERTICAL,
      `no first-party vertical publishes ${TECHNICAL_PROFILE}`
    ).toBeDefined();
    await openCell(page, { source: "technical-static" });
    await expect(page.getByTestId("specimen-frame")).toHaveAttribute(
      "data-specimen-tenant",
      TECHNICAL_VERTICAL!
    );
    // The code-owned path's CSS is bundled. An artifact here would mean the
    // specimen had synthesised a second visual authority.
    await expect(artifact).toHaveCount(0);

    await openCell(page, { source: "editorial-db" });
    await expect(page.getByTestId("specimen-frame")).toHaveAttribute(
      "data-specimen-tenant",
      "q001l-editorial"
    );
    // Exactly one: the provider's mount proof fails on candidates.length !== 1,
    // and a blocked resolution renders as a spinner rather than an error.
    await expect(artifact).toHaveCount(1);
  });

  test("both governed sources paint their readable canvas contract", async ({
    page,
  }) => {
    const canvases: Record<Source, Record<string, string>> = {
      "technical-static": {},
      "editorial-db": {},
    };

    for (const source of SOURCES) {
      await openCell(page, { source });
      const canvas = await computedOf(page, "specimen-canvas", [
        "background-color",
        "color",
      ]);
      const cardBody = await computedOf(page, "specimen-card-body", ["color"]);

      // Readable, and the body text inherits the same ink: the two ways a
      // blocked or half-applied authority shows up as a legible-looking page.
      expect(canvas.color).not.toBe(canvas["background-color"]);
      expect(cardBody.color).toBe(canvas.color);
      canvases[source] = canvas;
    }

    // The editorial ground is authored by the specimen's own document, so its
    // compiled bytes are stated exactly.
    expect(canvases["editorial-db"]["background-color"]).toBe(
      "rgb(255, 250, 243)"
    );
    expect(canvases["editorial-db"].color).toBe("rgb(44, 24, 16)");

    // The technical vertical's shipped canvas is not restated here; it only has to be a
    // different ground from the customer's.
    expect(canvases["technical-static"]["background-color"]).not.toBe(
      canvases["editorial-db"]["background-color"]
    );
    expect(canvases["technical-static"].color).not.toBe(
      canvases["editorial-db"].color
    );
  });

  test("computed-style divergence between static technical and DB editorial", async ({
    page,
  }) => {
    const captured: Record<Source, Record<string, Record<string, string>>> = {
      "technical-static": {},
      "editorial-db": {},
    };

    for (const source of SOURCES) {
      await openCell(page, { source });
      captured[source].button = await computedOf(page, "specimen-button-primary", [
        "border-radius",
        "font-family",
        "background-color",
        "border-top-width",
      ]);
      captured[source].card = await computedOf(page, "specimen-card", [
        "border-radius",
        "box-shadow",
        "background-color",
      ]);
      captured[source].heading = await computedOf(page, "specimen-title", [
        "font-family",
      ]);
      captured[source].buttonAttrs = {
        variant:
          (await page
            .getByTestId("specimen-button-primary")
            .getAttribute("data-variant")) ?? "",
        shape:
          (await page
            .getByTestId("specimen-button-primary")
            .getAttribute("data-shape")) ?? "",
      };
      captured[source].cardAttrs = {
        variant:
          (await page.getByTestId("specimen-card").first().getAttribute("data-variant")) ?? "",
      };
      captured[source].tableAttrs = {
        recipe:
          (await page
            .locator(".ds-pattern-data-table[data-recipe]")
            .first()
            .getAttribute("data-recipe")) ?? "",
      };
    }

    const technical = captured["technical-static"];
    const editorial = captured["editorial-db"];

    // The technical postures below belong to TECHNICAL_PROFILE; they only
    // apply when the mounted tenant is the vertical that publishes it.
    expect(TECHNICAL_VERTICAL).toBeDefined();

    const technicalProfile = profileFamilies(TECHNICAL_PROFILE);
    const editorialProfile = profileFamilies(EDITORIAL_PROFILE);

    // Each posture is the one its registry profile publishes, and the two
    // profiles must actually disagree on it for the pair to prove anything.
    const postures: [string, string, string | undefined, string | undefined][] = [
      ["button variant", "buttonAttrs.variant", technicalProfile.button.variant, editorialProfile.button.variant],
      ["button shape", "buttonAttrs.shape", technicalProfile.button.shape, editorialProfile.button.shape],
      ["card variant", "cardAttrs.variant", technicalProfile.card.variant, editorialProfile.card.variant],
      ["table recipe", "tableAttrs.recipe", technicalProfile.dataTable.recipe, editorialProfile.dataTable.recipe],
    ];
    for (const [name, path, technicalExpected, editorialExpected] of postures) {
      const [group, attr] = path.split(".");
      expect(technicalExpected, `${TECHNICAL_PROFILE} publishes no ${name}`).toBeDefined();
      expect(editorialExpected, `${EDITORIAL_PROFILE} publishes no ${name}`).toBeDefined();
      expect(technicalExpected, `the two profiles agree on ${name}`).not.toBe(editorialExpected);
      expect(technical[group][attr], `technical ${name}`).toBe(technicalExpected);
      expect(editorial[group][attr], `editorial ${name}`).toBe(editorialExpected);
    }

    // Geometry divergence is asserted as divergence. The literal `0px` this
    // once pinned came from the deleted synthetic FlatTheme; the radius the
    // registry tenant ships is that vertical's to change, and the profile contract is
    // that the two postures do not agree.
    expect(technical.button["border-radius"]).not.toBe(
      editorial.button["border-radius"]
    );
    expect(technical.card["border-radius"]).not.toBe(
      editorial.card["border-radius"]
    );
    expect(technical.heading["font-family"]).not.toBe(
      editorial.heading["font-family"]
    );
  });

  test("semantic DOM parity across profile sources", async ({ page }) => {
    await openCell(page, { source: "technical-static" });
    const technical = await domFingerprint(page);
    await openCell(page, { source: "editorial-db" });
    const editorial = await domFingerprint(page);
    expect(technical.length).toBeGreaterThan(20);
    expect(editorial).toEqual(technical);
  });

  for (const source of SOURCES) {
    for (const locale of LOCALES) {
      test(`no horizontal overflow: ${source} ${locale} long-content desktop`, async ({
        page,
      }) => {
        await openCell(page, { source, locale, stress: "long" });
        if (locale === "ar") {
          await expect(page.getByTestId("specimen-frame")).toHaveAttribute(
            "dir",
            "rtl"
          );
        }
        await assertNoHorizontalOverflow(page);
      });
    }
  }

  test.describe("mobile", () => {
    test.use(MOBILE);

    for (const source of SOURCES) {
      test(`no overflow and visible controls: ${source} ar dense mobile`, async ({
        page,
      }) => {
        await openCell(page, { source, locale: "ar", stress: "dense" });
        await assertNoHorizontalOverflow(page);
        await expect(page.getByTestId("specimen-button-primary")).toBeVisible();
      });
    }

    test("touch target floor on the editorial profile", async ({ page }) => {
      await openCell(page, { source: "editorial-db" });
      const box = await page.getByTestId("specimen-button-primary").boundingBox();
      expect(box, "primary button bounding box").not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(40);
    });
  });

  test("keyboard focus state is visible and addressable", async ({ page }) => {
    await openCell(page, { source: "technical-static", state: "focus" });
    const focused = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return null;
      const style = getComputedStyle(active);
      return {
        testId: active.getAttribute("data-testid"),
        outlineWidth: style.outlineWidth,
        outlineStyle: style.outlineStyle,
        boxShadow: style.boxShadow,
      };
    });
    expect(focused?.testId).toBe("specimen-button-primary");
    const hasVisibleFocus =
      (focused!.outlineStyle !== "none" && focused!.outlineWidth !== "0px") ||
      focused!.boxShadow !== "none";
    expect(hasVisibleFocus, "focus affordance must paint").toBe(true);
  });

  test("disabled, loading, selected and empty states are addressable", async ({
    page,
  }) => {
    await openCell(page, { source: "editorial-db", state: "disabled" });
    await expect(page.getByTestId("specimen-button-primary")).toBeDisabled();

    await openCell(page, { source: "editorial-db", state: "loading" });
    await expect(page.getByTestId("specimen-button-primary")).toHaveAttribute(
      "data-loading",
      "true"
    );
    await expect(
      page.locator(".ds-pattern-data-table[data-loading='true']").first()
    ).toBeVisible();
    await expect(
      page.locator("[data-part='card'][data-state='loading']").first()
    ).toBeVisible();
    await expect(page.locator("[data-part='skeleton-row']").first()).toBeVisible();

    await openCell(page, { source: "editorial-db", state: "selected" });
    await expect(
      page
        .locator(
          "[data-part='body-row'][data-selected='true'][aria-selected='true']"
        )
        .first()
    ).toBeVisible();

    await openCell(page, { source: "editorial-db", stress: "empty" });
    await expect(
      page.locator("[data-part='card'][data-state='empty']").first()
    ).toBeVisible();
    await expect(page.locator("[data-part='empty-state']").first()).toBeVisible();
  });

  test("reduced motion collapses specimen transition durations", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openCell(page, { source: "editorial-db" });
    const durations = await page
      .getByTestId("specimen-button-primary")
      .evaluate((element) => {
        const style = getComputedStyle(element as HTMLElement);
        return {
          transition: style.transitionDuration,
          animation: style.animationDuration,
        };
      });
    const toMilliseconds = (value: string): number => {
      const trimmed = value.trim();
      if (trimmed === "") return 0;
      if (trimmed.endsWith("ms")) return Number.parseFloat(trimmed);
      if (trimmed.endsWith("s")) return Number.parseFloat(trimmed) * 1000;
      return Number.POSITIVE_INFINITY;
    };
    const collapsed = (value: string) =>
      value
        .split(",")
        .every((part) => toMilliseconds(part) <= 0.01);
    expect(
      collapsed(durations.transition) && collapsed(durations.animation),
      `reduced motion must collapse durations to the DS 0.01ms accessibility floor, got ${JSON.stringify(durations)}`
    ).toBe(true);
  });
});
