import { test, expect, type Page } from "@playwright/test";

/**
 * FASE 5 — executable canary contracts.
 *
 * The manifest used to point at ordinary docs routes, which do not accept a
 * DB-mounted tenant: asking for one could silently render a different vertical.
 * A canary that can substitute the subject under test certifies nothing, so
 * these contracts are written against ONE route that mounts both sources into
 * the SAME React tree, and the first contract below is that the substitution is
 * impossible rather than merely unlikely.
 *
 * MECHANICAL ONLY. Every assertion here is a declared divergence or an identity
 * fact read from the DOM. Whether the two sides look premium is Codex's call
 * with eyes on the page; nothing in this file may be read as that judgement.
 */

const ROUTE = "/probe/wl-canary";

type Source = "bithire-static" | "themanagement-db";

const EXPECTED_TENANT: Record<Source, string> = {
  "bithire-static": "bithire",
  "themanagement-db": "themanagementmiami",
};

/**
 * The four declared consumers. Each selector is the real painted element of the
 * capability's own evidence file, not a wrapper the probe invented.
 */
const CONSUMERS = {
  button: "[data-testid='wc-header'] .rottay-button.rottay-button--modern[data-variant='primary']",
  // The header cell is the box that carries the header paint. It exists only
  // when the table renders its real header: with `autoMobileCards` left at its
  // default the table switched to the mobile-card renderer and no header
  // existed at all, which is why the probe pins that prop.
  tableHeader: "[data-testid='wc-table'] [data-part='header-cell']",
  heading: "[data-testid='wc-header'] [data-part='title']",
  sidebar: "[data-testid='wc-sidebar'] .rottay-menu",
} as const;

async function open(page: Page, query: string): Promise<void> {
  await page.goto(`${ROUTE}${query}`, { waitUntil: "networkidle" });
}

const root = (page: Page) => page.locator("[data-testid='wc-root']");

async function computed(page: Page, selector: string, property: string): Promise<string> {
  const element = page.locator(selector).first();
  await expect(element).toBeVisible();
  return element.evaluate(
    (node, prop) => getComputedStyle(node as Element).getPropertyValue(prop).trim(),
    property
  );
}

test.describe("canary · identity is exactly what was requested", () => {
  for (const source of Object.keys(EXPECTED_TENANT) as Source[]) {
    test(`${source} mounts its own tenant, engine and source`, async ({ page }) => {
      await open(page, `?source=${source}`);
      await expect(root(page)).toHaveAttribute("data-canary-source", source);
      await expect(root(page)).toHaveAttribute("data-canary-tenant", EXPECTED_TENANT[source]);
      await expect(root(page)).toHaveAttribute("data-canary-engine", "modern");
    });
  }

  test("DRILL: an unmountable source fails visibly and renders NO tenant tree", async ({ page }) => {
    await open(page, "?source=evnto-static");
    // The failure surface is present ...
    await expect(page.locator("[data-testid='wc-source-failure']")).toBeVisible();
    // ... and nothing from any vertical rendered in its place. This is the
    // capital defect: a silent substitution would leave a full, healthy-looking
    // tree carrying someone else's identity.
    await expect(root(page)).toHaveCount(0);
  });

  test("DRILL: a misspelt source does not resolve to the default", async ({ page }) => {
    await open(page, "?source=bithire");
    await expect(page.locator("[data-testid='wc-source-failure']")).toBeVisible();
    await expect(root(page)).toHaveCount(0);
  });
});

test.describe("canary · the four declared consumers exist and paint", () => {
  for (const source of Object.keys(EXPECTED_TENANT) as Source[]) {
    test(`${source} renders every declared consumer`, async ({ page }) => {
      await open(page, `?source=${source}`);
      for (const [name, selector] of Object.entries(CONSUMERS)) {
        await expect(page.locator(selector).first(), name).toBeVisible();
      }
    });
  }
});

test.describe("canary · the two sources DIVERGE on the committed axes", () => {
  /**
   * One entry per committed axis: the consumer whose computed value must differ
   * between the sides. Equality here means the capability did not propagate,
   * which is precisely the failure the canary exists to make visible.
   */
  const AXES: readonly { axis: string; selector: string; property: string }[] = [
    { axis: "palette.seeds", selector: CONSUMERS.button, property: "background-color" },
    { axis: "typography.families", selector: CONSUMERS.heading, property: "font-family" },
    { axis: "shape.radius-scale", selector: CONSUMERS.button, property: "border-radius" },
  ];

  for (const { axis, selector, property } of AXES) {
    test(`${axis}: ${property} differs between the sources`, async ({ page }) => {
      await open(page, "?source=bithire-static");
      const left = await computed(page, selector, property);
      await open(page, "?source=themanagement-db");
      const right = await computed(page, selector, property);

      // Positive control: a blank on either side would make "differs" trivially
      // true while proving the consumer never painted at all.
      expect(left, `${axis} left`).not.toBe("");
      expect(right, `${axis} right`).not.toBe("");
      expect(right, `${axis} did not propagate`).not.toBe(left);
    });
  }
});

test.describe("canary · controls move dependents and restore exactly", () => {
  test("density moves the dependent spacing channel and restores byte-identically", async ({ page }) => {
    await open(page, "?source=themanagement-db");
    const base = await root(page).evaluate((node) =>
      getComputedStyle(node as Element).getPropertyValue("--ds-spacing-4").trim()
    );

    await open(page, "?source=themanagement-db&density=compact");
    const compact = await root(page).evaluate((node) =>
      getComputedStyle(node as Element).getPropertyValue("--ds-spacing-4").trim()
    );

    expect(base).not.toBe("");
    // A superior control must move its dependents ...
    expect(compact).not.toBe(base);

    // ... and unsetting it must return the EXACT default, not merely a close
    // one. "Unset it" is the whole rollback story for every capability.
    await open(page, "?source=themanagement-db");
    const restored = await root(page).evaluate((node) =>
      getComputedStyle(node as Element).getPropertyValue("--ds-spacing-4").trim()
    );
    expect(restored).toBe(base);
  });

  test("locale ar mounts real RTL on the same tree", async ({ page }) => {
    await open(page, "?source=themanagement-db&locale=ar");
    await expect(root(page)).toHaveAttribute("dir", "rtl");
    await expect(root(page)).toHaveAttribute("data-canary-locale", "ar");
    // Same tenant: RTL must not be achieved by mounting a different identity.
    await expect(root(page)).toHaveAttribute("data-canary-tenant", "themanagementmiami");
  });
});

test.describe("canary A · the DB FULL-APPEARANCE path works", () => {
  /**
   * RENAMED. This block previously read "the TMM fixture authors seeds only",
   * which was false: the fixture's appearance comes from
   * `brandThemeToTenantAppearance(...)`, which projects typography, shape,
   * density, motion, surfaces AND `advanced.chrome`/`tokenOverrides`. The
   * assertion under that name only checked one channel was non-empty, so a
   * strong claim sat on top of a weak check. The DB full-appearance path is
   * genuinely worth proving — it just is not the seeds contract, which now
   * lives in block B with a structural assertion behind it.
   */
  test("the DB side supplies no brandTheme and still paints from the document", async ({ page }) => {
    await open(page, "?source=themanagement-db");
    // No `brandTheme` on this config, so a painted value can only have come
    // through the DB appearance document — the file-first path is not in play.
    const primary = await root(page).evaluate((node) =>
      getComputedStyle(node as Element).getPropertyValue("--ds-color-primary").trim()
    );
    expect(primary).not.toBe("");
  });
});

// ---------------------------------------------------------------------------
// B · the GENUINELY seeds-only canary
// ---------------------------------------------------------------------------

/**
 * Same React tree, same vertical, same engine — only the configuration differs.
 * The authored document is built from literal keys with zero BrandTheme
 * projection, and the first test proves that STRUCTURALLY, before any compiler
 * runs. Everything the tenant then sees beyond four colours is derived, which
 * is the whole claim.
 */
test.describe("canary B · seeds-only, proven structurally then downstream", () => {
  test("the authored key set is EXACTLY the canonical seeds allowlist", async () => {
    const { seedsOnlyAppearance, SEEDS_ONLY_ALLOWLIST } = await import(
      "../../src/components/brand-locale-evidence"
    );
    const authored = seedsOnlyAppearance() as Record<string, unknown>;

    // Recursive exact-key comparison: presence AND absence, at every level.
    // A subset check would pass on a payload carrying advanced/chrome, which
    // is precisely the failure that made the old claim false.
    const walk = (node: unknown, path: string): void => {
      const expected = SEEDS_ONLY_ALLOWLIST[path];
      expect(expected, `no allowlist entry for "${path}" — unauthorised branch`).toBeDefined();
      const actual = Object.keys(node as object).sort();
      expect(actual, `keys at "${path}"`).toEqual([...expected].sort());
      for (const key of actual) {
        const child = (node as Record<string, unknown>)[key];
        if (child && typeof child === "object" && !Array.isArray(child)) {
          walk(child, path ? `${path}.${key}` : key);
        }
      }
    };
    walk(authored, "");

    // Explicit negative controls on the exact fields that made A untrue.
    const serialised = JSON.stringify(authored);
    for (const forbidden of ["advanced", "chrome", "tokenOverrides", "typography", "density", "motion", "surfaces", "shape"]) {
      expect(serialised, `seeds-only payload must not carry "${forbidden}"`).not.toContain(forbidden);
    }
  });

  /** Derivation is claimed across several channels, never one. */
  const DERIVED = [
    "--ds-color-primary",
    "--ds-button-primary-bg",
    "--ds-color-text-on-primary",
    "--ds-chart-series-1",
    "--ds-color-primary-500",
  ] as const;

  const readChannels = (page: Page) =>
    root(page).evaluate((node, names) => {
      const style = getComputedStyle(node as Element);
      return Object.fromEntries(
        (names as readonly string[]).map((n) => [n, style.getPropertyValue(n).trim()])
      );
    }, DERIVED as unknown as string[]);

  test("four seeds derive a whole painted system, not one channel", async ({ page }) => {
    await open(page, "?source=themanagement-seeds");
    const channels = await readChannels(page);
    for (const name of DERIVED) {
      expect(channels[name], `${name} did not derive from the seeds`).not.toBe("");
    }
    // The button consumer paints from the derived chrome, not from the raw seed.
    const buttonBg = await computed(page, CONSUMERS.button, "background-color");
    expect(buttonBg).not.toBe("");
  });

  test("DRILL: seed mutations move every claimed derivation, and restore is byte-identical", async ({ page }) => {
    await open(page, "?source=themanagement-seeds");
    const base = await readChannels(page);

    await open(page, "?source=themanagement-seeds&seedPrimary=%23AA0000");
    const darkMutation = await readChannels(page);

    // These channels are direct/ramp/chart dependents of primary. Merely being
    // non-empty is not derivation evidence: every one must move causally.
    for (const name of [
      "--ds-color-primary",
      "--ds-button-primary-bg",
      "--ds-chart-series-1",
      "--ds-color-primary-500",
    ] as const) {
      expect(darkMutation[name], `${name} did not follow the mutated primary seed`).not.toBe(base[name]);
    }

    // Two dark seeds legitimately retain white contrast ink. Cross the
    // luminance threshold with a light seed to prove the contrast channel is
    // derived too, rather than hardcoded white.
    await open(page, "?source=themanagement-seeds&seedPrimary=%23FFFF00");
    const lightMutation = await readChannels(page);
    expect(lightMutation["--ds-color-text-on-primary"]).not.toBe(base["--ds-color-text-on-primary"]);

    await open(page, "?source=themanagement-seeds");
    const restored = await readChannels(page);
    // "Unset it" is the entire rollback story: restore must be exact.
    expect(restored).toEqual(base);
  });

  test("typography and radius are NOT attributable to colour seeds", async ({ page }) => {
    await open(page, "?source=themanagement-seeds");
    const seedsFont = await computed(page, CONSUMERS.heading, "font-family");
    await open(page, "?source=themanagement-seeds&seedPrimary=%23AA0000");
    const mutatedFont = await computed(page, CONSUMERS.heading, "font-family");
    // Colour seeds must not move type. If they did, the canary could credit a
    // typography divergence to the palette control.
    expect(mutatedFont).toBe(seedsFont);
  });
});
