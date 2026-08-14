/**
 * C4B6R — custom component pack realm isolation.
 *
 * STATUS: BROWSER-PENDING. Nothing in this file has ever been executed. It is
 * source-complete and typechecked only. Until a sanctioned build + browser pass
 * runs it, every assertion below is a stated expectation, NOT evidence, and no
 * result from this file may be described as green.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS BEING PROVEN
 *
 * A `DesignSystemProvider` claims the DOCUMENT ROOT's governed channels
 * (`data-tenant`, `data-theme` + class `dark` + inline `color-scheme`,
 * `data-engine`, `lang`/`dir`) through the root-attribute claim stack, whose
 * contract is that the LAST claim pushed on a channel is the live one. The docs
 * shell provider claims those channels for every `(docs)` route and stays
 * mounted across client-side navigation.
 *
 * The docs page for component packs therefore must not mount a provider of its
 * own. If it did, there would be two claimants of one set of channels and two
 * different wrong answers depending on arrival:
 *
 *   hard load    child layout effects run before ancestor ones, so the SHELL
 *                claims last and wins; the page's tenant/engine never reach the
 *                root and the page describes a root state it does not own.
 *
 *   SPA arrival  the shell does not remount; only the page subtree commits, so
 *                the page's claim is pushed ON TOP of the live shell claim and
 *                the entire docs chrome is restamped until navigation away.
 *
 * Only the SPA-arrival leg can detect this, because the hard-load ordering
 * hides it. Group A is that leg and it is the load-bearing test in this file.
 *
 * ---------------------------------------------------------------------------
 * WHY THE CONTROL ROUTE IS /foundations AND NOT /foundations/engines
 *
 * `/foundations/engines` mounts THREE nested providers (one per engine preview
 * column). Its root tuple is whatever the last column claimed, and leaving the
 * route releases three claims — so it is neither a stable state nor a clean
 * navigation origin, and equality against it would fail or pass for reasons
 * that have nothing to do with this atom.
 *
 * `/foundations` was source-censused for this role. It is a server component
 * whose entire transitive import closure is `showroom-link` (rewrites hrefs,
 * touches no root), `showroom-ui` (inline-style wrappers, no effects), its own
 * `foundation-top-rail` (no DS runtime import at all) and icon glyphs. Zero
 * `DesignSystemProvider`, zero TenantProvider/ThemeProvider/EngineProvider,
 * zero `document.documentElement` writes.
 *
 * ---------------------------------------------------------------------------
 * THE TWO DIFFERENT EQUALITY CLAIMS, STATED SEPARATELY
 *
 * These are not the same strength and this file does not pretend they are:
 *
 *   ROOT ATTRIBUTES — asserted EXACTLY EQUAL across every capture point,
 *   including across routes. The full ordered attribute-name list and every
 *   value (so `class`, inline `style` text, `lang`, `dir` and every `data-*`
 *   are all in scope, and a restored-but-reordered attribute still fails).
 *   These are shell-owned; a route change must not move them.
 *
 *   STYLE/LINK SURFACE — asserted EXACTLY EQUAL (element-for-element,
 *   `outerHTML`-identical, in document order, plus the readable rules of every
 *   adopted stylesheet) only ACROSS THE FRAME MOUNT/UNMOUNT/REMOUNT CYCLE ON
 *   ONE ROUTE, which is where a leak from the frame realm would appear. Across
 *   a route change, Next legitimately adds route CSS chunks, so the cross-route
 *   claim is the weaker true one: every pre-existing sheet survives in the same
 *   relative order, every addition is a Next static chunk, and nothing anywhere
 *   carries the pack tenant's identity.
 *
 *   TENANT ARTIFACT SURFACE — asserted EQUAL TO THE PARENT'S OWN BASELINE,
 *   captured on the censused-clean control route, never against a hardcoded
 *   count. Whether the docs shell stamps zero artifacts or several is the
 *   shell's decision and is not what this atom is about; pinning a literal
 *   zero would make an unrelated shell change fail this file for the wrong
 *   reason. The absolute claim kept is the narrow one this file does own: no
 *   artifact in the parent may ever name the PACK tenant, and the probe realm
 *   itself must stamp zero, because an identity-only config has no visual
 *   payload to compile.
 *
 * ---------------------------------------------------------------------------
 * FRAME ROOT VALUES ARE DERIVED, NOT SNIFFED
 *
 * Group D asserts the frame's channels by exact equality against values read
 * out of Core, so a channel that was never claimed (`getAttribute` -> `null`)
 * fails instead of coalescing into a pass. See `EXPECTED_FRAME_THEME`,
 * `EXPECTED_FRAME_LANG` and `EXPECTED_FRAME_DIR` for the source derivations.
 */
import { expect, test, type Frame, type FrameLocator, type Page } from "@playwright/test";

const CONTROL_ROUTE = "/foundations";
const PACK_ROUTE = "/foundations/engines/custom-component-pack";
const PROBE_ROUTE = "/probe/custom-component-pack";
const PROBE_INDEX_ROUTE = "/probe";

const PACK_ID = "ds-example-pack";
const PACK_TENANT_SLUG = "showroom-component-pack";

const NAV_PACK_LINK = "Component packs";
const NAV_CONTROL_LINK = "Foundations";

/** The tenant-theme artifact stamp used across the whitelabel suite. */
const ARTIFACT_SELECTOR =
  "style[data-ds-tenant-theme-digest][data-ds-tenant-theme-slug][data-ds-tenant-theme-vertical]";

/**
 * The locale the probe realm must resolve to, derived from source rather than
 * guessed. `PACK_TENANT_CONFIG` sets no `locale`, and no vertical preset sets
 * one, so `DesignSystemProvider` computes
 * `toSupportedLocale(undefined) === DEFAULT_LOCALE`
 * (`src/foundation/i18n/kernel/contracts/index.ts:39` -> `'en'`), and the
 * `en` entry of `LOCALE_CONFIGS`
 * (`src/foundation/i18n/runtime/catalog/configuration/index.ts`) publishes
 * `code: 'en'`, `direction: 'ltr'`. `I18nProvider` claims `lang = config.code`
 * and `dir = config.direction` in its default document scope. Anything else on
 * that root is a real defect, so these are exact equalities: an absent
 * attribute reads as `null` and must fail, never coalesce to a pass.
 */
const EXPECTED_FRAME_LANG = "en";
const EXPECTED_FRAME_DIR = "ltr";

/**
 * `PACK_TENANT_CONFIG.theme` is `'base'`, which is not in the provider's
 * `VALID_THEME_MODES` set, so no explicit mode wins and `theme` stays `'base'`.
 * `resolveTheme()` maps anything that is not `auto`/`dark`/`light` to `'base'`,
 * and the inline `color-scheme` claim is guarded by
 * `if (nextResolvedTheme !== 'base')`. So the frame root must carry exactly
 * `data-theme="base"`, must NOT carry the `dark` class, and must have no
 * inline `color-scheme`.
 */
const EXPECTED_FRAME_THEME = "base";

interface RootSnapshot {
  /** Ordered [name, value] pairs, exactly as the element lists them. */
  attributes: Array<[string, string]>;
  /** `outerHTML` of every <style> and <link> in document order. */
  sheets: string[];
  /** Readable rules of every constructed/adopted stylesheet, in order. */
  adopted: string[];
  /**
   * Ordered identity of every tenant-theme artifact stamped into this
   * document: `slug|vertical|digest` per artifact.
   *
   * This file does NOT assert that the parent count is zero. Whether the docs
   * shell legitimately stamps an artifact is the shell's business and can
   * change without this defect changing; hardcoding zero would turn an
   * unrelated shell decision into a false red here. The law asserted instead
   * is the only one this file actually owns: whatever the shell had on the
   * censused-clean control route, it still has -- unchanged, in order --
   * after arriving at the pack page and after the frame realm has come and
   * gone. The absolute claim that survives is narrower and is kept in
   * `expectNoPackPaint`: no artifact in the parent may ever name the PACK
   * tenant.
   */
  artifacts: string[];
}

/**
 * Anything that can run script in a document: a `Page`, or a `Frame`. Every
 * capture in this file goes through this type so the same fingerprint is taken
 * of the parent document, of the frame's document, and of a throwaway control
 * page — with no second, subtly different implementation to drift.
 */
type Realm = Pick<Page, "evaluate">;

async function captureRoot(page: Realm): Promise<RootSnapshot> {
  return page.evaluate((artifactSelector) => {
    const root = document.documentElement;

    const attributes = root
      .getAttributeNames()
      .map((name) => [name, root.getAttribute(name) ?? ""] as [string, string]);

    const sheets = Array.from(document.querySelectorAll("style,link")).map(
      (element) => element.outerHTML,
    );

    const adoptedSheets = (document as unknown as { adoptedStyleSheets?: CSSStyleSheet[] })
      .adoptedStyleSheets;

    const adopted = (adoptedSheets ?? []).map((sheet, index) => {
      try {
        return `#${index} ${Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n")}`;
      } catch {
        return `#${index} <unreadable>`;
      }
    });

    const artifacts = Array.from(document.querySelectorAll(artifactSelector)).map(
      (element) =>
        `${element.getAttribute("data-ds-tenant-theme-slug") ?? ""}|` +
        `${element.getAttribute("data-ds-tenant-theme-vertical") ?? ""}|` +
        `${element.getAttribute("data-ds-tenant-theme-digest") ?? ""}`,
    );

    return { attributes, sheets, adopted, artifacts };
  }, ARTIFACT_SELECTOR);
}

/**
 * Captures until two consecutive captures are byte-identical, so a snapshot is
 * never taken mid-commit. Every capture point in this file goes through here.
 */
async function settledRoot(page: Realm): Promise<RootSnapshot> {
  let previous = JSON.stringify(await captureRoot(page));

  await expect
    .poll(
      async () => {
        const next = JSON.stringify(await captureRoot(page));
        const stable = next === previous;
        previous = next;
        return stable;
      },
      { timeout: 15_000, message: "root snapshot never settled" },
    )
    .toBe(true);

  return JSON.parse(previous) as RootSnapshot;
}

/** Root attributes must match exactly, including order. */
function expectSameRootAttributes(actual: RootSnapshot, expected: RootSnapshot, label: string) {
  expect(actual.attributes, `${label}: root attribute tuple changed`).toEqual(expected.attributes);
}

/** The whole style surface must match exactly, element for element. */
function expectSameStyleSurface(actual: RootSnapshot, expected: RootSnapshot, label: string) {
  expect(actual.sheets, `${label}: style/link surface changed`).toEqual(expected.sheets);
  expect(actual.adopted, `${label}: adopted stylesheets changed`).toEqual(expected.adopted);
}

/**
 * The honest cross-route claim: nothing was removed or reordered, and anything
 * added is a Next static chunk rather than a runtime-emitted style.
 */
function expectStyleSurfaceOnlyGrewWithChunks(
  actual: RootSnapshot,
  expected: RootSnapshot,
  label: string,
) {
  const retained = actual.sheets.filter((sheet) => expected.sheets.includes(sheet));
  expect(retained, `${label}: a pre-existing sheet was dropped or reordered`).toEqual(
    expected.sheets,
  );

  const added = actual.sheets.filter((sheet) => !expected.sheets.includes(sheet));
  for (const sheet of added) {
    expect(
      sheet.startsWith("<link") && sheet.includes("/_next/static/"),
      `${label}: unexpected non-chunk sheet added: ${sheet.slice(0, 200)}`,
    ).toBe(true);
  }

  expect(actual.adopted, `${label}: adopted stylesheets changed`).toEqual(expected.adopted);
}

/**
 * The artifact surface must be exactly the one the censused-clean control route
 * produced. This is the derived parent law: it does not care whether the shell
 * stamps zero artifacts or three, only that the pack page and the frame realm
 * add, remove and reorder none of them.
 */
function expectSameArtifacts(actual: RootSnapshot, expected: RootSnapshot, label: string) {
  expect(actual.artifacts, `${label}: the tenant-artifact surface changed`).toEqual(
    expected.artifacts,
  );
}

/**
 * No sheet or artifact in this document may carry the PACK tenant's identity,
 * and no `--ds-*` may be written inline on this document's root.
 *
 * This is deliberately narrower than "no artifact at all": the shell's own
 * artifacts, if it has any, are not this file's business and are policed by
 * `expectSameArtifacts` against the control-route baseline instead.
 */
function expectNoPackPaint(snapshot: RootSnapshot, label: string) {
  for (const sheet of [...snapshot.sheets, ...snapshot.adopted]) {
    expect(sheet.includes(PACK_TENANT_SLUG), `${label}: a sheet names the pack tenant`).toBe(false);
    expect(sheet.includes(PACK_ID), `${label}: a sheet names the pack id`).toBe(false);
  }

  for (const artifact of snapshot.artifacts) {
    expect(
      artifact.startsWith(`${PACK_TENANT_SLUG}|`),
      `${label}: a tenant artifact for the pack tenant is mounted in this document`,
    ).toBe(false);
  }

  const rootStyle = snapshot.attributes.find(([name]) => name === "style")?.[1] ?? "";
  expect(rootStyle.includes("--ds-"), `${label}: a --ds-* custom property is set inline on the root`).toBe(
    false,
  );
}

/**
 * The realm's full resolution contract: bespoke Button/Card carry the pack's
 * witnesses and anatomy, Input/Select carry none, and all four still work.
 *
 * This exists because "the realm reported ready" is a much weaker claim than
 * "the pack resolved": a realm that came up with an unregistered pack would
 * still set `data-pack-ready="true"` and still render a ground, having quietly
 * resolved the flagship components instead. Group C asserts this whole
 * contract after its remount rather than trusting the ready flag.
 *
 * `startingAction` is the action output the realm is expected to be at when
 * this runs, so the interaction assertions stay causal (state CHANGED) rather
 * than merely descriptive on a realm that has already been clicked.
 */
async function expectPackContract(realm: FrameLocator, startingAction = "none") {
  const primary = realm.getByTestId("custom-pack-button-primary");
  const secondary = realm.getByTestId("custom-pack-button-secondary");
  const card = realm.getByTestId("custom-pack-card");

  for (const control of [primary, secondary]) {
    await expect(control).toHaveAttribute("data-pack", PACK_ID);
    await expect(control).toHaveAttribute("data-pack-part", "button");
  }
  await expect(primary).toHaveAttribute("data-pack-variant", "primary");
  await expect(secondary).toHaveAttribute("data-pack-variant", "secondary");
  await expect(primary.locator('[data-pack-part="button-dot"]')).toHaveCount(1);
  await expect(primary.locator('[data-pack-part="button-label"]')).toHaveText("Approve");

  await expect(card).toHaveAttribute("data-pack", PACK_ID);
  await expect(card.locator('[data-pack-part="card-rail"]')).toHaveCount(1);
  await expect(card.locator('[data-pack-part="card-body"]')).toHaveCount(1);

  const inputHost = realm.getByTestId("custom-pack-fallback-input");
  const selectHost = realm.getByTestId("custom-pack-fallback-select");

  await expect(inputHost).toHaveAttribute("data-pack-entry", "absent");
  await expect(selectHost).toHaveAttribute("data-pack-entry", "absent");
  await expect(inputHost.locator("[data-pack]")).toHaveCount(0);
  await expect(selectHost.locator("[data-pack]")).toHaveCount(0);

  await expect(realm.getByTestId("custom-pack-action-output")).toHaveText(
    `action: ${startingAction}`,
  );
  await primary.click();
  await expect(realm.getByTestId("custom-pack-action-output")).toHaveText("action: approve");

  await inputHost.locator("input").fill("acme");
  await expect(realm.getByTestId("custom-pack-input-output")).toHaveText("query: acme");

  await selectHost.click();
  await realm.getByText("Enterprise", { exact: true }).click();
  await expect(realm.getByTestId("custom-pack-select-output")).toHaveText("plan: enterprise");
}

async function packFrame(page: Page): Promise<Frame> {
  const handle = await page.locator('[data-testid="custom-pack-frame"]').elementHandle();
  expect(handle, "the pack frame element is not present").not.toBeNull();

  const frame = await handle!.contentFrame();
  expect(frame, "the pack frame has no content frame").not.toBeNull();

  return frame!;
}

/** Mounts the frame and waits until the probe realm has registered its pack. */
async function mountFrame(page: Page) {
  await page.getByTestId("custom-pack-frame-toggle").click();
  await page.getByTestId("custom-pack-frame").scrollIntoViewIfNeeded();

  const realm = page
    .frameLocator('[data-testid="custom-pack-frame"]')
    .locator('[data-testid="custom-pack-realm"]');

  await expect(realm).toHaveAttribute("data-pack-ready", "true", { timeout: 20_000 });
  await expect(
    page.frameLocator('[data-testid="custom-pack-frame"]').getByTestId("custom-pack-ground"),
  ).toBeVisible();
}

async function unmountFrame(page: Page) {
  await page.getByTestId("custom-pack-frame-toggle").click();
  await expect(page.getByTestId("custom-pack-frame")).toHaveCount(0);
  await expect(page.getByTestId("custom-pack-frame-slot")).toHaveAttribute(
    "data-frame-mounted",
    "false",
  );
}

/**
 * Arrives at the pack docs page the way the defect requires: a real client-side
 * navigation from a censused-clean route, with the frame not yet mounted.
 */
async function arriveViaSpa(page: Page): Promise<RootSnapshot> {
  await page.goto(CONTROL_ROUTE);
  await page.waitForLoadState("networkidle");

  // `ShowroomLink` rewrites hrefs with an engine/tenant override read from
  // localStorage or the current query. A stale override would legitimately move
  // the shell's engine and turn this whole file red for the wrong reason, so
  // the origin is asserted override-free before anything is captured.
  expect(new URL(page.url()).search, "the control route carries a runtime override").toBe("");

  const before = await settledRoot(page);

  await page
    .locator("aside.showroom-shell-sidebar")
    .getByRole("link", { name: NAV_PACK_LINK, exact: true })
    .click();

  await page.waitForURL(`**${PACK_ROUTE}`);
  await page.waitForLoadState("networkidle");

  return before;
}

test.describe("custom component pack — realm isolation", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("A. SPA arrival with the frame absent leaves the parent root exact", async ({ page }) => {
    const before = await arriveViaSpa(page);

    // The docs page itself must be inert: no provider, and no frame yet.
    await expect(page.getByTestId("custom-pack-frame")).toHaveCount(0);
    await expect(page.getByTestId("custom-pack-frame-slot")).toHaveAttribute(
      "data-frame-mounted",
      "false",
    );

    const arrival = await settledRoot(page);

    expectSameRootAttributes(arrival, before, "SPA arrival");
    expectStyleSurfaceOnlyGrewWithChunks(arrival, before, "SPA arrival");
    expectSameArtifacts(arrival, before, "SPA arrival");
    expectNoPackPaint(arrival, "SPA arrival");
  });

  test("B. SPA departure restores the parent root exactly", async ({ page }) => {
    const before = await arriveViaSpa(page);

    await page
      .locator("aside.showroom-shell-sidebar")
      .getByRole("link", { name: NAV_CONTROL_LINK, exact: true })
      .first()
      .click();

    await page.waitForURL(`**${CONTROL_ROUTE}`);
    await page.waitForLoadState("networkidle");

    const departure = await settledRoot(page);

    expectSameRootAttributes(departure, before, "SPA departure");
    expectSameArtifacts(departure, before, "SPA departure");
    expectNoPackPaint(departure, "SPA departure");
  });

  test("C. frame load, unload and reload never touch the parent document", async ({ page }) => {
    await arriveViaSpa(page);

    const preMount = await settledRoot(page);

    // Load.
    await mountFrame(page);
    const mounted = await settledRoot(page);
    expectSameRootAttributes(mounted, preMount, "frame mounted");
    expectSameStyleSurface(mounted, preMount, "frame mounted");
    expectSameArtifacts(mounted, preMount, "frame mounted");
    expectNoPackPaint(mounted, "frame mounted");

    // Unload.
    await unmountFrame(page);
    const unmounted = await settledRoot(page);
    expectSameRootAttributes(unmounted, preMount, "frame unmounted");
    expectSameStyleSurface(unmounted, preMount, "frame unmounted");
    expectSameArtifacts(unmounted, preMount, "frame unmounted");

    // Reload — a second, independent document for the same realm.
    await mountFrame(page);

    // The second mount must resolve the pack for real, not merely come up.
    //
    // What this does NOT prove: anything about the first realm's cleanup.
    // Unmounting the iframe destroys that document and its whole JS realm, so
    // the remount gets a brand-new module registry that the previous realm's
    // unregister/restore path could not have corrupted even if it were wrong.
    // Same-document cleanup is proven ONLY in group G, which never leaves the
    // document.
    //
    // What this does prove, and why it is worth asserting: registration and
    // readiness are DETERMINISTIC on a fresh realm, and a reload reproduces the
    // full contract rather than depending on the first mount's timing. The
    // probe registers in a client effect and gates rendering on `packReady`
    // precisely because `createCustomWrapper` reads the registry at component
    // LOAD time; a race there would show up as a second mount that reports
    // ready and renders a ground while resolving FLAGSHIP Button and Card.
    // Only asserting the whole contract distinguishes those two outcomes.
    await expectPackContract(page.frameLocator('[data-testid="custom-pack-frame"]'));

    const remounted = await settledRoot(page);
    expectSameRootAttributes(remounted, preMount, "frame remounted");
    expectSameStyleSurface(remounted, preMount, "frame remounted");
    expectSameArtifacts(remounted, preMount, "frame remounted");
    expectNoPackPaint(remounted, "frame remounted");
  });

  test("D. the frame owns its own root, with its own tenant and engine", async ({ page }) => {
    await arriveViaSpa(page);

    const parentBefore = await settledRoot(page);
    await mountFrame(page);

    const frame = await packFrame(page);
    const frameRoot = await frame.evaluate((artifactSelector) => {
      const root = document.documentElement;
      const computed = getComputedStyle(root);

      return {
        url: window.location.pathname,
        tenant: root.getAttribute("data-tenant"),
        engine: root.getAttribute("data-engine"),
        theme: root.getAttribute("data-theme"),
        lang: root.getAttribute("lang"),
        dir: root.getAttribute("dir"),
        hasDarkClass: root.classList.contains("dark"),
        colorScheme: root.style.colorScheme,
        // A base token resolving here is the proof that DS baseline CSS applies
        // in this realm without any app-owned root scope: base tokens are
        // declared on plain `:root` / `html.dark`.
        basePrimary: computed.getPropertyValue("--ds-color-primary").trim(),
        baseTextPrimary: computed.getPropertyValue("--ds-color-text-primary").trim(),
        artifacts: document.querySelectorAll(artifactSelector).length,
        inlineRootStyle: root.getAttribute("style") ?? "",
      };
    }, ARTIFACT_SELECTOR);

    expect(frameRoot.url).toBe(PROBE_ROUTE);
    expect(frameRoot.tenant).toBe(PACK_TENANT_SLUG);
    expect(frameRoot.engine).toBe("custom");

    // Exact, source-derived values. `getAttribute` returns `null` when the
    // channel was never claimed, and `null` must be a failure here: a missing
    // claim is precisely the defect this file exists to catch, so nothing is
    // allowed to coalesce it into a pass.
    expect(frameRoot.theme, "the frame root does not carry the tenant's resolved theme").toBe(
      EXPECTED_FRAME_THEME,
    );
    expect(
      frameRoot.hasDarkClass,
      "the frame root carries the dark class, which 'base' must never set",
    ).toBe(false);
    expect(
      frameRoot.colorScheme,
      "the frame root carries an inline color-scheme, which is guarded off for 'base'",
    ).toBe("");
    expect(frameRoot.lang, "the frame root does not carry the default locale's lang").toBe(
      EXPECTED_FRAME_LANG,
    );
    expect(frameRoot.dir, "the frame root does not carry the default locale's dir").toBe(
      EXPECTED_FRAME_DIR,
    );

    expect(frameRoot.basePrimary, "base tokens do not resolve in the frame realm").not.toBe("");
    expect(frameRoot.baseTextPrimary).not.toBe("");

    // The pack paints nothing in its own realm either. Zero IS the right number
    // here, and it is not a guess about somebody else's shell: this document is
    // the probe realm, its only tenant is the identity-only pack tenant, and an
    // identity-only config carries no visual payload to compile into an
    // artifact. A stamp appearing here would mean the pack acquired paint.
    expect(frameRoot.artifacts, "the pack realm stamped a tenant-theme artifact").toBe(0);
    expect(frameRoot.inlineRootStyle.includes("--ds-")).toBe(false);

    // And the parent still holds exactly what it held before the frame existed,
    // artifact surface included -- measured against the parent's own baseline,
    // not against a hardcoded count.
    const parentAfter = await settledRoot(page);
    expectSameRootAttributes(parentAfter, parentBefore, "parent, frame realm live");
    expectSameStyleSurface(parentAfter, parentBefore, "parent, frame realm live");
    expectSameArtifacts(parentAfter, parentBefore, "parent, frame realm live");
    expectNoPackPaint(parentAfter, "parent, frame realm live");
  });

  test("E. bespoke Button and Card resolve and work inside the frame", async ({ page }) => {
    await arriveViaSpa(page);
    await mountFrame(page);

    const realm = page.frameLocator('[data-testid="custom-pack-frame"]');

    const primary = realm.getByTestId("custom-pack-button-primary");
    const secondary = realm.getByTestId("custom-pack-button-secondary");
    const card = realm.getByTestId("custom-pack-card");

    // Resolution: the pack's own components, carrying the pack's own witnesses.
    for (const control of [primary, secondary]) {
      await expect(control).toHaveAttribute("data-pack", PACK_ID);
      await expect(control).toHaveAttribute("data-pack-part", "button");
    }
    await expect(primary).toHaveAttribute("data-pack-variant", "primary");
    await expect(secondary).toHaveAttribute("data-pack-variant", "secondary");

    // ------------------------------------------------------------------
    // The causal part: WHAT the pack rendered, not just that it rendered.
    //
    // `PackButton` destructures `type` and publishes `as="button"` and
    // `type={type ?? 'button'}` AFTER `{...rest}` so a caller cannot silently
    // take the host or the type away, and it builds its style as
    // `{ ...packBase, ...(style ?? {}) }`. The probe passes exactly one
    // declaration, `letterSpacing: '0.42em'`, over a `packBase` that sets
    // `letterSpacing: '0.08em'` and `textTransform: 'uppercase'`. That single
    // input separates three otherwise-indistinguishable implementations:
    //
    //   host/type ignored        -> not a BUTTON, or no type="button"
    //   consumer style dropped   -> letter-spacing is 0.08em
    //   pack base replaced       -> text-transform is not uppercase
    // ------------------------------------------------------------------
    // The secondary button is the in-test control: same pack component, same
    // base, NO consumer style. Comparing the two calibrates "the base" from the
    // running page instead of hardcoding a resolved pixel value.
    const readHost = (target: typeof primary) =>
      target.evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
          tag: element.tagName,
          type: element.getAttribute("type"),
          inlineStyle: element.getAttribute("style") ?? "",
          letterSpacing: computed.letterSpacing,
          textTransform: computed.textTransform,
          fontWeight: computed.fontWeight,
        };
      });

    const styled = await readHost(primary);
    const bare = await readHost(secondary);

    for (const [label, host] of [
      ["styled", styled],
      ["bare", bare],
    ] as const) {
      expect(host.tag, `the ${label} pack Button is not a real button host`).toBe("BUTTON");
      expect(host.type, `the ${label} pack Button did not publish its own type`).toBe("button");
    }

    // The consumer's declaration reached the element and WON on its property.
    expect(styled.inlineStyle, "the consumer style never reached the element").toContain("0.42em");
    expect(
      styled.letterSpacing,
      "the consumer's letter-spacing did not win over the pack base",
    ).not.toBe(bare.letterSpacing);

    // And the pack's own base SURVIVED on the properties the consumer did not
    // name -- so this was a merge, not a replacement in either direction.
    expect(styled.textTransform, "the pack base was replaced by the consumer style").toBe(
      bare.textTransform,
    );
    expect(styled.fontWeight, "the pack base was replaced by the consumer style").toBe(
      bare.fontWeight,
    );
    expect(bare.textTransform, "the pack base never applied at all").toBe("uppercase");

    // Anatomy: merging a consumer's style does not delete what the pack renders.
    await expect(primary.locator('[data-pack-part="button-dot"]')).toHaveCount(1);
    await expect(primary.locator('[data-pack-part="button-label"]')).toHaveText("Approve");
    await expect(card).toHaveAttribute("data-pack", PACK_ID);
    await expect(card.locator('[data-pack-part="card-rail"]')).toHaveCount(1);
    await expect(card.locator('[data-pack-part="card-body"]')).toHaveCount(1);

    // Interaction: the bespoke control is a real control, not a picture.
    await expect(realm.getByTestId("custom-pack-action-output")).toHaveText("action: none");
    await primary.click();
    await expect(realm.getByTestId("custom-pack-action-output")).toHaveText("action: approve");
    await secondary.click();
    await expect(realm.getByTestId("custom-pack-action-output")).toHaveText("action: dismiss");
  });

  test("F. Input and Select fall through the pack and stay interactive", async ({ page }) => {
    await arriveViaSpa(page);
    await mountFrame(page);

    const realm = page.frameLocator('[data-testid="custom-pack-frame"]');

    const inputHost = realm.getByTestId("custom-pack-fallback-input");
    const selectHost = realm.getByTestId("custom-pack-fallback-select");

    await expect(inputHost).toHaveAttribute("data-pack-entry", "absent");
    await expect(selectHost).toHaveAttribute("data-pack-entry", "absent");

    // Falling through means no pack witness anywhere inside these hosts.
    await expect(inputHost.locator("[data-pack]")).toHaveCount(0);
    await expect(selectHost.locator("[data-pack]")).toHaveCount(0);

    // Falling through is ordinary resolution, not a degraded mode.
    await inputHost.locator("input").fill("acme");
    await expect(realm.getByTestId("custom-pack-input-output")).toHaveText("query: acme");

    await expect(realm.getByTestId("custom-pack-select-output")).toHaveText("plan: growth");
    await selectHost.click();
    await realm.getByText("Enterprise", { exact: true }).click();
    await expect(realm.getByTestId("custom-pack-select-output")).toHaveText("plan: enterprise");
  });

  test("G. a client-side exit inside the frame runs cleanup and leaves the parent exact", async ({
    page,
    context,
  }) => {
    // The reference for "what a bare /probe document looks like" is measured,
    // never written down. A throwaway page in the SAME browser context loads
    // /probe with no provider in its history at all, is fingerprinted, and is
    // closed again. This is what makes the cleanup assertion exact without
    // hardcoding the root layout's generated font-variable class names.
    //
    // It is a separate page, so it cannot touch the page under test.
    const controlPage = await context.newPage();
    await controlPage.goto(PROBE_INDEX_ROUTE);
    await controlPage.waitForLoadState("networkidle");
    const bareProbe = await settledRoot(controlPage);
    await controlPage.close();

    await arriveViaSpa(page);

    const preMount = await settledRoot(page);
    await mountFrame(page);

    // Navigate INSIDE the frame, by CLICKING A NEXT LINK — not by loading a new
    // document. This distinction is the whole point of this group.
    //
    // `frame.goto()` would tear the document down, and a document teardown
    // releases the registry, the provider and every claim whether or not the
    // page's cleanup effect is correct: it can only ever pass. A Next
    // client-side route transition keeps the document, the module-global
    // component registry and the parent frame element all alive while React
    // unmounts the probe subtree, so the unregister/restore path in the probe's
    // effect is genuinely exercised — and a leak from it would still be in the
    // same document when the parent is fingerprinted below.
    const realm = page.frameLocator('[data-testid="custom-pack-frame"]');
    const exit = realm.getByTestId("custom-pack-exit");
    const frame = await packFrame(page);

    // "Client-side" is a claim, so it gets a witness rather than a comment.
    //
    // This nonce is written by the TEST onto the frame's `window`, never by
    // production code, and it is written to a namespaced property nothing in
    // the app reads. A same-document (Next client) transition keeps that window
    // object and therefore the nonce; a full document navigation replaces the
    // window and the nonce comes back `undefined`. So if the assertion below
    // holds, the exit really did keep the document — and with it the
    // module-global component registry whose cleanup this group exists to
    // exercise.
    // Two sentinels, on two different objects, because they fail differently.
    // `window` can in principle be reused by an engine that keeps a browsing
    // context alive, whereas a new `Document` is created by every document
    // load without exception -- so the document expando is the stricter of the
    // pair. Both are written by the TEST onto namespaced keys nothing in the
    // app reads, and neither is a production write.
    const NONCE_KEY = "__c4b6rClientNavWitness";
    const DOC_SENTINEL_KEY = "__c4b6rSameDocumentSentinel";
    const nonce = `c4b6r-${process.pid}-${test.info().workerIndex}-${test.info().repeatEachIndex}`;

    await frame.evaluate(
      ([windowKey, documentKey, value]) => {
        (window as unknown as Record<string, string>)[windowKey] = value;
        (document as unknown as Record<string, string>)[documentKey] = value;
      },
      [NONCE_KEY, DOC_SENTINEL_KEY, nonce] as const,
    );

    await expect(exit).toBeVisible();
    await exit.click();

    // The transition really happened: the realm is gone and the pathname moved.
    await expect(realm.getByTestId("custom-pack-ground")).toHaveCount(0);
    await expect(realm.getByTestId("custom-pack-realm")).toHaveCount(0);

    await expect
      .poll(async () => frame.url() && new URL(frame.url()).pathname, {
        timeout: 15_000,
        message: "the frame never reached the probe index after the client-side exit",
      })
      .toBe(PROBE_INDEX_ROUTE);

    // And it was client-side, not a document load.
    const surviving = await frame.evaluate(
      ([windowKey, documentKey]) => ({
        window: (window as unknown as Record<string, string | undefined>)[windowKey],
        document: (document as unknown as Record<string, string | undefined>)[documentKey],
      }),
      [NONCE_KEY, DOC_SENTINEL_KEY] as const,
    );
    expect(
      surviving.window,
      "the frame's window was replaced, so the exit was a document load and this group proves nothing about cleanup",
    ).toBe(nonce);
    expect(
      surviving.document,
      "the frame's Document was replaced, so the exit was a document load and this group proves nothing about cleanup",
    ).toBe(nonce);

    // ------------------------------------------------------------------
    // CLEANUP, not just isolation.
    //
    // The realm unmounted inside a document that is still alive, so every claim
    // the provider pushed had to be RELEASED and every predecessor RESTORED. If
    // release is wrong, this document is now a /probe page still wearing the
    // pack tenant's channels — and nothing measured on the PARENT would ever
    // notice, because the parent was never the leaking document.
    //
    // The reference is the fresh /probe control captured at the top of this
    // test, so the whole ordered attribute tuple is compared: the governed
    // channels, the class attribute (font variables included, never
    // hardcoded), and the inline style. Absent-vs-empty is part of the
    // comparison, which is exactly what a claim-stack restore must get right.
    // ------------------------------------------------------------------
    const frameAfterExit = await settledRoot(frame);

    expectSameRootAttributes(frameAfterExit, bareProbe, "frame root after client-side cleanup");
    expectSameArtifacts(frameAfterExit, bareProbe, "frame root after client-side cleanup");
    expectNoPackPaint(frameAfterExit, "frame root after client-side cleanup");

    // Named restatements of the channels, so a failure says WHICH claim leaked
    // rather than only that a tuple differed.
    const frameAttribute = (name: string) =>
      frameAfterExit.attributes.find(([key]) => key === name)?.[1];

    for (const channel of ["data-tenant", "data-engine", "data-theme"]) {
      expect(
        frameAttribute(channel),
        `the pack provider's ${channel} claim was never released`,
      ).toBeUndefined();
    }
    expect(
      (frameAttribute("class") ?? "").split(/\s+/),
      "the dark class survived the provider's release",
    ).not.toContain("dark");
    expect(
      frameAttribute("style") ?? "",
      "an inline root style survived the provider's release",
    ).not.toContain("color-scheme");

    // NOT hardcoded: `lang`/`dir` are whatever the bare /probe document has,
    // including `dir` being absent there.
    expect(frameAttribute("lang"), "lang was not restored to its predecessor").toBe(
      bareProbe.attributes.find(([key]) => key === "lang")?.[1],
    );
    expect(frameAttribute("dir"), "dir was not restored to its predecessor").toBe(
      bareProbe.attributes.find(([key]) => key === "dir")?.[1],
    );

    // The style/link surface is deliberately NOT compared to the fresh control.
    // A client-transitioned frame legitimately retains the CSS chunks of the
    // route it came from; a freshly loaded /probe never requested them. Exact
    // equality there would be a false red. The true claim is the one asserted
    // above and by `expectNoPackPaint`: no artifact, no pack identity, and no
    // `--ds-*` written on that root. Exact style-surface equality is asserted
    // where it IS true -- the parent's same-route mount/unmount/remount cycle
    // in group C, and the parent assertions below.

    const afterFrameNavigation = await settledRoot(page);
    expectSameRootAttributes(afterFrameNavigation, preMount, "frame navigated away");
    expectSameStyleSurface(afterFrameNavigation, preMount, "frame navigated away");
    expectSameArtifacts(afterFrameNavigation, preMount, "frame navigated away");

    await unmountFrame(page);

    const afterUnmount = await settledRoot(page);
    expectSameRootAttributes(afterUnmount, preMount, "frame torn down");
    expectSameStyleSurface(afterUnmount, preMount, "frame torn down");
    expectSameArtifacts(afterUnmount, preMount, "frame torn down");
    expectNoPackPaint(afterUnmount, "frame torn down");
  });
});
