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

test.describe("canary A · the DB FULL-APPEARANCE path works, under proven authority", () => {
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

  /**
   * The authority ledger, per source. A DB-owned document may only paint
   * through a COMPILED artifact that the provider verified as mounted, and the
   * proof is quantitative on both sides:
   *
   *  - exactly ONE artifact for each DB source. Zero means the visual authority
   *    was refused, and a refusal renders `<LoadingScreen />` — a healthy-looking
   *    spinner, not an error. Two is the same failure from the other side: the
   *    provider's own mount proof rejects `candidates.length !== 1`, so a second
   *    element blocks the tenant it was meant to serve.
   *  - exactly ZERO for the bundled vertical. Its CSS ships in the bundle; an
   *    artifact appearing there would mean the probe compiled a customer
   *    document for a code-owned identity, which is the substitution this whole
   *    file exists to make impossible.
   */
  const EXPECTED_ARTIFACTS: readonly { source: string; count: number }[] = [
    { source: "bithire-static", count: 0 },
    { source: "themanagement-db", count: 1 },
    { source: "themanagement-seeds", count: 1 },
  ];

  for (const { source, count } of EXPECTED_ARTIFACTS) {
    test(`${source} mounts exactly ${count} proof-stamped artifact(s)`, async ({ page }) => {
      const { SHOWROOM_TENANT_ARTIFACT_TESTID } = await import(
        "../../src/components/showroom-tenant"
      );
      await open(page, `?source=${source}`);
      // Positive control FIRST: the tree committed. Without it, a blocked
      // authority renders a spinner and "zero artifacts" reads as a pass.
      await expect(root(page)).toBeVisible();
      await expect(
        page.locator(`[data-testid='${SHOWROOM_TENANT_ARTIFACT_TESTID}']`)
      ).toHaveCount(count);
    });
  }
});

// ---------------------------------------------------------------------------
// B · the GENUINELY seeds-only canary
// ---------------------------------------------------------------------------

/**
 * Same React tree, same vertical, same engine — only the configuration differs.
 *
 * The subject is now the PUBLISHED DB DOCUMENT the seeds arm actually compiles,
 * not a hand-authored appearance literal standing in for one. That change is
 * the point: a payload the DB channel would refuse to accept can prove nothing
 * about the DB channel, however few keys it carries. The first test proves the
 * authored key set STRUCTURALLY, before any compiler runs; everything the
 * tenant then sees beyond four colours is derived, which is the whole claim.
 */
test.describe("canary B · seeds-only, proven structurally then downstream", () => {
  test("the authored document key set is EXACTLY the canonical seeds allowlist", async () => {
    const { seedsOnlyDocument, SEEDS_ONLY_DOCUMENT_ALLOWLIST } = await import(
      "../../src/components/showroom-tenant"
    );
    // The same builder the seeds ground publishes — not a transcription of it.
    const authored = seedsOnlyDocument() as unknown as Record<string, unknown>;

    // Recursive exact-key comparison: presence AND absence, at every level.
    // A subset check would pass on a payload carrying advanced/chrome, which
    // is precisely the failure that made the old claim false.
    const walk = (node: unknown, path: string): void => {
      const expected = SEEDS_ONLY_DOCUMENT_ALLOWLIST[path];
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
    // Scoped to `visualFoundation`, which is the whole of the document's visual
    // authoring surface and the only place any of these can appear: the two
    // fields outside it are `schemaVersion` and the authoring-tier `mode`,
    // whose value is the literal string "advanced" and is not an appearance
    // branch. Serialising the envelope with them would make this check assert
    // against its own vocabulary rather than against the payload.
    const serialised = JSON.stringify(authored.visualFoundation);
    for (const forbidden of ["advanced", "chrome", "tokenOverrides", "typography", "density", "motion", "surfaces", "shape"]) {
      expect(serialised, `seeds-only document must not carry "${forbidden}"`).not.toContain(forbidden);
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

// -----------------------------------------------------------------------------
// Document-claim lease contract (pure, no browser)
// -----------------------------------------------------------------------------

test.describe("canary · document claim lease is fail-closed and idempotent", () => {
  test("second claim on the same Document throws", async () => {
    const { claimShowroomTenantDocument } = await import(
      "../../src/components/showroom-tenant"
    );
    const doc = { nodeType: 9 } as unknown as Document;
    const release = claimShowroomTenantDocument(doc);
    expect(() => claimShowroomTenantDocument(doc)).toThrow(
      /already claims this Document/,
    );
    release();
  });

  test("different Documents claim independently", async () => {
    const { claimShowroomTenantDocument } = await import(
      "../../src/components/showroom-tenant"
    );
    const docA = { nodeType: 9 } as unknown as Document;
    const docB = { nodeType: 9 } as unknown as Document;
    const releaseA = claimShowroomTenantDocument(docA);
    const releaseB = claimShowroomTenantDocument(docB);
    expect(releaseA).not.toBe(releaseB);
    releaseA();
    releaseB();
  });

  test("release is idempotent, stale release is safe, and reclaim works", async () => {
    const { claimShowroomTenantDocument } = await import(
      "../../src/components/showroom-tenant"
    );
    const doc = { nodeType: 9 } as unknown as Document;

    const release1 = claimShowroomTenantDocument(doc);
    release1();
    release1(); // idempotent

    const release2 = claimShowroomTenantDocument(doc);
    release1(); // stale: must not delete release2's claim
    expect(() => claimShowroomTenantDocument(doc)).toThrow(
      /already claims this Document/,
    );

    release2();
    const release3 = claimShowroomTenantDocument(doc);
    expect(release3).toBeTypeOf("function");
    release3();
  });
});

// -----------------------------------------------------------------------------
// SPA transition contract: one hard load, then pushState inside the same Document
// -----------------------------------------------------------------------------

declare global {
  interface Window {
    __canaryDocSentinel: string;
    __canarySnapshots: Array<{
      source: string | null;
      artifactCount: number;
      rootPresent: boolean;
      digest: string | null;
    }>;
    __canaryArtifactSet?: Set<Element>;
    __canaryRootSet?: Set<Element>;
    __canaryObserver?: MutationObserver;
  }
}

test.describe("canary · SPA transition keeps one Document and style-before-root order", () => {
  test(
    "static hard-load then pushState transitions prove same Document, lease renewal, and lawful artifact counts",
    { tag: ["@browser-not-run"] },
    async ({ page }) => {
      const { SHOWROOM_TENANT_ARTIFACT_TESTID } = await import(
        "../../src/components/showroom-tenant"
      );
      const DIGEST_ATTR = "data-ds-tenant-theme-digest";
      const ROOT_TESTID = "wc-root";

      await page.goto(`${ROUTE}?source=bithire-static`, { waitUntil: "networkidle" });
      await expect(root(page)).toBeVisible();
      await expect(root(page)).toHaveAttribute("data-canary-source", "bithire-static");

      const sentinel = await page.evaluate(
        (artifactTestid: string, digestAttr: string, rootTestid: string) => {
          const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
          window.__canaryDocSentinel = id;
          window.__canarySnapshots = [];
          const artifactSet = new Set<Element>();
          const rootSet = new Set<Element>();
          window.__canaryArtifactSet = artifactSet;
          window.__canaryRootSet = rootSet;

          const takeSnapshot = () => {
            const artifacts = Array.from(artifactSet);
            const rootEl = rootSet.size > 0 ? Array.from(rootSet)[0] : null;
            window.__canarySnapshots.push({
              source: rootEl?.getAttribute("data-canary-source") ?? null,
              artifactCount: artifacts.length,
              rootPresent: rootEl !== null,
              digest: artifacts.length === 1 ? artifacts[0].getAttribute(digestAttr) : null,
            });
          };

          const visitAdded = (node: Node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const el = node as Element;
            const walk = (n: Element) => {
              const testid = n.getAttribute("data-testid");
              if (testid === artifactTestid) artifactSet.add(n);
              if (testid === rootTestid) rootSet.add(n);
            };
            walk(el);
            el.querySelectorAll("*").forEach(walk);
          };

          const visitRemoved = (node: Node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const el = node as Element;
            const walk = (n: Element) => {
              artifactSet.delete(n);
              rootSet.delete(n);
            };
            walk(el);
            el.querySelectorAll("*").forEach(walk);
          };

          const observer = new MutationObserver((records) => {
            for (const record of records) {
              for (const node of record.removedNodes) visitRemoved(node);
              for (const node of record.addedNodes) visitAdded(node);
              if (record.type === "attributes") {
                const target = record.target as Element;
                const testid = target.getAttribute("data-testid");
                if (testid === artifactTestid) artifactSet.add(target);
                else artifactSet.delete(target);
                if (testid === rootTestid) rootSet.add(target);
                else rootSet.delete(target);
              }
              takeSnapshot();
            }
          });

          window.__canaryObserver = observer;
          observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
          });

          return id;
        },
        SHOWROOM_TENANT_ARTIFACT_TESTID,
        DIGEST_ATTR,
        ROOT_TESTID,
      );

      async function pushAndReport(
        query: string,
        expectedSource: string,
      ): Promise<{
        snapshots: typeof window.__canarySnapshots;
        liveFinal: {
          source: string | null;
          artifactCount: number;
          rootPresent: boolean;
          digest: string | null;
        };
      }> {
        await page.evaluate((q: string) => {
          window.__canarySnapshots = [];
          const url = new URL(window.location.href);
          url.search = q;
          window.history.pushState({}, "", url);
        }, query);

        await expect(root(page)).toHaveAttribute("data-canary-source", expectedSource);
        await expect(root(page)).toBeVisible();

        return page.evaluate(
          (artifactTestid: string, digestAttr: string, rootTestid: string) =>
            new Promise<{
              snapshots: typeof window.__canarySnapshots;
              liveFinal: {
                source: string | null;
                artifactCount: number;
                rootPresent: boolean;
                digest: string | null;
              };
            }>((resolve) => {
              Promise.resolve().then(() => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    const liveRoot = document.querySelector(`[data-testid='${rootTestid}']`);
                    const liveArtifacts = document.querySelectorAll(
                      `[data-testid='${artifactTestid}']`,
                    );
                    resolve({
                      snapshots: window.__canarySnapshots,
                      liveFinal: {
                        source: liveRoot?.getAttribute("data-canary-source") ?? null,
                        artifactCount: liveArtifacts.length,
                        rootPresent: liveRoot !== null,
                        digest:
                          liveArtifacts.length === 1
                            ? liveArtifacts[0].getAttribute(digestAttr)
                            : null,
                      },
                    });
                  });
                });
              });
            }),
          SHOWROOM_TENANT_ARTIFACT_TESTID,
          DIGEST_ATTR,
          ROOT_TESTID,
        );
      }

      const dbReport = await pushAndReport("?source=themanagement-db", "themanagement-db");
      const dbMax = dbReport.snapshots.reduce((m, s) => Math.max(m, s.artifactCount), 0);
      expect(dbMax, "DB transition logical artifact count exceeded 1").toBeLessThanOrEqual(1);
      expect(
        dbReport.snapshots.find((s) => s.artifactCount === 1 && s.rootPresent === false),
        "DB transition missing style-before-root logical snapshot",
      ).toBeDefined();
      expect(dbReport.liveFinal.source).toBe("themanagement-db");
      expect(dbReport.liveFinal.rootPresent).toBe(true);
      expect(dbReport.liveFinal.artifactCount).toBe(1);
      expect(dbReport.liveFinal.digest, "DB final digest is empty").toBeTruthy();

      const seedsReport = await pushAndReport("?source=themanagement-seeds", "themanagement-seeds");
      const seedsMax = seedsReport.snapshots.reduce((m, s) => Math.max(m, s.artifactCount), 0);
      expect(seedsMax, "seeds transition logical artifact count exceeded 1").toBeLessThanOrEqual(1);
      expect(
        seedsReport.snapshots.find((s) => s.artifactCount === 1 && s.rootPresent === false),
        "seeds transition missing style-before-root logical snapshot",
      ).toBeDefined();
      expect(seedsReport.liveFinal.source).toBe("themanagement-seeds");
      expect(seedsReport.liveFinal.rootPresent).toBe(true);
      expect(seedsReport.liveFinal.artifactCount).toBe(1);
      expect(seedsReport.liveFinal.digest, "seeds final digest is empty").toBeTruthy();

      const seedPrimaryReport = await pushAndReport(
        "?source=themanagement-seeds&seedPrimary=%23AA0000",
        "themanagement-seeds",
      );
      const seedPrimaryMax = seedPrimaryReport.snapshots.reduce(
        (m, s) => Math.max(m, s.artifactCount),
        0,
      );
      expect(seedPrimaryMax, "seedPrimary transition logical artifact count exceeded 1").toBeLessThanOrEqual(1);
      expect(
        seedPrimaryReport.snapshots.find((s) => s.artifactCount === 1 && s.rootPresent === false),
        "seedPrimary transition missing style-before-root logical snapshot",
      ).toBeDefined();
      expect(seedPrimaryReport.liveFinal.source).toBe("themanagement-seeds");
      expect(seedPrimaryReport.liveFinal.rootPresent).toBe(true);
      expect(seedPrimaryReport.liveFinal.artifactCount).toBe(1);
      expect(seedPrimaryReport.liveFinal.digest, "seedPrimary final digest is empty").toBeTruthy();

      const staticReport = await pushAndReport("?source=bithire-static", "bithire-static");
      expect(staticReport.liveFinal.source).toBe("bithire-static");
      expect(staticReport.liveFinal.rootPresent).toBe(true);
      expect(staticReport.liveFinal.artifactCount).toBe(0);

      const dbDigest = dbReport.liveFinal.digest!;
      const seedsDigest = seedsReport.liveFinal.digest!;
      const seedPrimaryDigest = seedPrimaryReport.liveFinal.digest!;
      expect(dbDigest, "DB and seeds final digests are identical").not.toBe(seedsDigest);
      expect(dbDigest, "DB and seedPrimary final digests are identical").not.toBe(seedPrimaryDigest);
      expect(seedsDigest, "seeds and seedPrimary final digests are identical").not.toBe(seedPrimaryDigest);

      await expect(page.evaluate(() => window.__canaryDocSentinel)).resolves.toBe(sentinel);
    },
  );
});
