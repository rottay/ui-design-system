/**
 * C1 + C2 MASS RETIRE / MIGRATE — source-only extension.css drain.
 *
 * Authority:
 *   • C1: independent audit 5 + design authority census in /private/tmp/modern-rescue-extension-fable.txt
 *     (zero-read + app-only + reduced-motion + shadowed duplicates).
 *   • C2: K3 C2_ACCEPT + independent audit C2_EXACT_ACCEPT in /private/tmp/C2-MASSIVE-RULING.md
 *     (55 channel occurrences / 68 declarations migrated to typed BrandTheme
 *     owners that already exist; zero contract/compiler changes).
 *
 * Historical receipts are kept as data, not compared against the live source,
 * so later cohorts (C3/C4/C5) cannot accidentally pin their totals as law.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  compileBrandTheme,
  compileTheme,
} from "@/infrastructure/compilers/kernel/runtime/brand-theme";

import { bithireBrandTheme } from "../ts/presentation/brand-themes/bithire";
import { evntoBrandTheme } from "../ts/presentation/brand-themes/evnto";
import { FIRST_PARTY_THEMES } from "../ts/presentation/brand-themes";
import { rottayBrandTheme } from "../ts/presentation/brand-themes/rottay";

const ROOT = process.cwd();

/**
 * A mode-scoped root reading, from the shipped artifact. Several typed chrome
 * fields moved from a per-mode literal onto a cascade root, so the divergence
 * they used to state directly is now stated by the root they read: the alias is
 * one string in both modes and the ROOT carries the two values. Both halves are
 * asserted wherever that happened, which keeps the exact colours pinned.
 */
function rootValue(slug: string, mode: "dark" | "light", channel: string): string {
  const css = readFileSync(
    join(ROOT, `src/foundation/tokens/css/facade/artifacts/${slug}/index.css`),
    "utf8",
  );
  const declarations = [...css.matchAll(new RegExp(`^\\s*${channel}:\\s*([^;]+);`, "gm"))].map(
    (match) => match[1].trim(),
  );
  // The base block is the vertical's default mode; rottay's default is dark, so
  // the first reading is dark and the second is the light overlay.
  const index = mode === "dark" ? 0 : 1;
  if (declarations.length < 2) {
    throw new Error(`${channel} must be declared for both modes in ${slug}`);
  }
  return declarations[index];
}
// EXCISED (SEV-2): `ARTIFACTS_DIR` — its only readers were the deleted
// extension helpers below.
const CORE_SRC = join(ROOT, "src");

const SLUGS = ["rottay", "bithire", "evnto"] as const;

/** 44 extension names with zero productive readers in Core. */
const C1_ROSTER = [
  // 5 zero-anywhere (confirmed by productive-Core single-pass)
  "--ds-color-accent-live",
  "--ds-empty-title-color",
  "--ds-shadow-primary",
  "--ds-global-search-results-width",
  "--ds-button-primary-border-color",
  // 39 BitHire app-only (confirmed zero productive Core readers)
  "--ds-action-rail-card-bg",
  "--ds-action-rail-card-border",
  "--ds-action-rail-card-shadow",
  "--ds-breadcrumb-bar-bg",
  "--ds-breadcrumb-bar-border",
  "--ds-breadcrumb-bar-padding-x",
  "--ds-breadcrumb-bar-shadow",
  "--ds-cell-pill-bg",
  "--ds-cell-pill-border",
  "--ds-cell-pill-color",
  "--ds-chart-panel-border",
  "--ds-color-interactive-border",
  "--ds-detail-radius",
  "--ds-expanded-panel-actions-bg",
  "--ds-expanded-panel-actions-max-height",
  "--ds-expanded-panel-bg",
  "--ds-expanded-panel-border",
  "--ds-insight-panel-bg",
  "--ds-insight-panel-border",
  "--ds-insight-panel-shadow",
  "--ds-list-preview-action-min-width",
  "--ds-list-preview-cockpit-min-column-width",
  "--ds-list-preview-lane-gap",
  "--ds-list-preview-lane-marker-size",
  "--ds-list-preview-meter-height",
  "--ds-list-preview-rail-border",
  "--ds-list-preview-row-gap",
  "--ds-preview-tooltip-max-width",
  "--ds-shell-breadcrumb-bg",
  "--ds-surface-border",
  "--ds-surface-border-soft",
  "--ds-surface-border-strong",
  "--ds-surface-card-border-soft",
  "--ds-surface-card-grid-line-strong",
  "--ds-surface-focus-ring",
  "--ds-table-action-tooltip-max-width",
  "--ds-table-tooltip-z-index",
  "--ds-text-display-numeric",
  "--ds-text-title-numeric",
] as const;

/** 16 Evnto app-only event/ticket status tokens. Apps are out of scope. */
const EVNTO_EVENT_TICKET_RETIRE = [
  "--ds-ticket-available",
  "--ds-ticket-available-text",
  "--ds-ticket-sold",
  "--ds-ticket-sold-text",
  "--ds-ticket-reserved",
  "--ds-ticket-reserved-text",
  "--ds-event-draft",
  "--ds-event-draft-text",
  "--ds-event-published",
  "--ds-event-published-text",
  "--ds-event-live",
  "--ds-event-live-text",
  "--ds-event-ended",
  "--ds-event-ended-text",
  "--ds-event-cancelled",
  "--ds-event-cancelled-text",
] as const;

const C1_ALL_TARGETS = new Set<string>([
  ...C1_ROSTER,
  ...EVNTO_EVENT_TICKET_RETIRE,
]);

const C1_ROSTER_SHA256 =
  "0a9da345732cc819d5616a6f22f40567a3a7956d83eb456090e58545beb82779";

/**
 * C1 historical receipts. PRE = count on the base C1 started from;
 * POST = count after C1 deleted its target set. Kept as data only.
 */
const C1_DECL_RECEIPTS: Record<
  string,
  { pre: number; post: number; postUnique: number; delta: number }
> = {
  rottay: { pre: 1026, post: 1019, postUnique: 526, delta: 7 },
  bithire: { pre: 172, post: 121, postUnique: 120, delta: 51 },
  evnto: { pre: 25, post: 9, postUnique: 9, delta: 16 },
};

/** 39 unique C2 channels (55 occurrences across the three tenants). */
const C2_UNIQUE_NAMES = [
  // controls.button
  "--ds-button-default-border-active",
  "--ds-button-default-color-active",
  "--ds-button-default-color-hover",
  "--ds-button-default-bg-active",
  "--ds-button-ghost-border",
  "--ds-button-ghost-border-active",
  "--ds-button-ghost-border-hover",
  "--ds-button-ghost-color-active",
  "--ds-button-ghost-color-hover",
  "--ds-button-ghost-bg-active",
  "--ds-button-text-color-active",
  "--ds-button-text-color-hover",
  "--ds-button-text-bg",
  "--ds-button-text-bg-active",
  "--ds-button-text-bg-hover",
  "--ds-button-text-color",
  // cardComponent.image
  "--ds-card-image-placeholder-bg",
  "--ds-card-image-placeholder-color",
  "--ds-card-image-loading-track",
  "--ds-card-image-loading-active",
  // breadcrumb
  "--ds-breadcrumb-color",
  "--ds-breadcrumb-color-hover",
  "--ds-breadcrumb-color-active",
  "--ds-breadcrumb-active-color",
  "--ds-breadcrumb-separator-color",
  // segmented
  "--ds-segmented-bg",
  "--ds-segmented-item-bg",
  "--ds-segmented-item-bg-selected",
  "--ds-segmented-item-color",
  "--ds-segmented-item-color-hover",
  "--ds-segmented-item-color-selected",
  "--ds-segmented-shadow",
  // sidebar
  "--ds-sidebar-group-margin-top",
  "--ds-sidebar-group-margin-bottom",
  "--ds-sidebar-group-padding-top",
  "--ds-sidebar-item-indent",
  // layout / palette / surfaces
  "--ds-divider-color",
  "--ds-color-bg-surface",
  "--ds-radius-full",
] as const;

const C2_SET = new Set<string>(C2_UNIQUE_NAMES);
const C2_UNIQUE_NAMES_SHA256 =
  "be6d15a2bf057e769147c067d455b23f96c4a888e2269a2c9c03b03038cf2d42";

/**
 * C2 historical receipts. PRE = post-C1 count; POST = count after C2 migration.
 * unique = channels migrated in this tenant; delta = declarations removed.
 */
const C2_DECL_RECEIPTS: Record<
  string,
  { pre: number; post: number; unique: number; delta: number }
> = {
  rottay: { pre: 1019, post: 973, unique: 33, delta: 46 },
  bithire: { pre: 121, post: 104, unique: 17, delta: 17 },
  evnto: { pre: 9, post: 4, unique: 5, delta: 5 },
};

const C2_TOTAL_CHANNELS = 55;

/** C3-c common control algebra: nine typed outputs plus one retired alias. */
const C3_CONTROL_CHANNELS = [
  "--ds-control-ink",
  "--ds-control-ink-muted",
  "--ds-control-on-brand",
  "--ds-control-surface",
  "--ds-control-surface-raised",
  "--ds-control-brand-tint",
  "--ds-control-brand-tint-hover",
  "--ds-control-brand-border",
  "--ds-icon-tile-border",
] as const;

const C3_EXTENSION_RETIRE = [
  ...C3_CONTROL_CHANNELS,
  "--ds-color-on-primary",
] as const;

const C3_CONTROL_FIELD_BY_CHANNEL = {
  "--ds-control-ink": "ink",
  "--ds-control-ink-muted": "inkMuted",
  "--ds-control-on-brand": "onBrand",
  "--ds-control-surface": "surface",
  "--ds-control-surface-raised": "surfaceRaised",
  "--ds-control-brand-tint": "brandTint",
  "--ds-control-brand-tint-hover": "brandTintHover",
  "--ds-control-brand-border": "brandBorder",
  "--ds-icon-tile-border": "iconTileBorder",
} as const;
const C2_TOTAL_DECLARATIONS = 68;

// ── helpers ───────────────────────────────────────────────────────────────

// EXCISED (SEV-2): `extensionText()` and `parseExtension()`. Both opened
// `artifacts/<slug>/_source/extension.css`, which no longer exists, so every
// caller threw at read time. Each caller is excised or reduced below with its
// own note; the "the extension declares nothing" family of claims they served
// is now carried unconditionally by law G2 of
// `scripts/check/verticals/single-author/index.mjs`, which fails on ANY resurrected
// extension.css or `_source/` directory under the authored token CSS tree.

function rosterHash(names: readonly string[]): string {
  return createHash("sha256")
    .update([...names].sort().join("\n") + "\n")
    .digest("hex");
}

function walkDir(
  dir: string,
  exts: string[],
  exclude: string[],
  out: string[] = []
): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (exclude.includes(entry.name)) continue;
      walkDir(p, exts, exclude, out);
    } else if (
      exts.some((ext) => entry.name.endsWith(ext)) &&
      !entry.name.endsWith(".stories.tsx") &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".test.tsx") &&
      !entry.name.endsWith(".spec.ts") &&
      !entry.name.endsWith(".spec.tsx")
    ) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Single-pass productive-Core reference collector. Reads each Core source file
 * once and extracts every `var(--ds-*)` and CSSOM string argument. Story,
 * test and spec files are excluded because they are not productive consumers.
 * A name is counted as read only when followed by a non-identifier boundary,
 * so `--ds-tag-border` does not falsely match `--ds-tag-border-width`.
 */
function collectCoreRefs(): Map<string, number> {
  const files = walkDir(
    CORE_SRC,
    [".css", ".ts", ".tsx", ".mjs", ".js", ".jsx"],
    [
      "node_modules",
      "dist",
      ".next",
      "build",
      "out",
      "coverage",
      "__tests__",
      "tests",
      "test-artifacts",
      "fixtures",
    ]
  );
  const refs = new Map<string, number>();
  const varRe = /var\(\s*(--ds-[a-zA-Z0-9_-]+)(?![a-zA-Z0-9_-])/g;
  const cssomRe =
    /(setProperty|getPropertyValue|removeProperty)\(\s*['"`](--ds-[a-zA-Z0-9_-]+)(?![a-zA-Z0-9_-])/g;
  for (const f of files) {
    const text = readFileSync(f, "utf8");
    for (const re of [varRe, cssomRe]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const name = m[1].startsWith("--") ? m[1] : m[2];
        refs.set(name, (refs.get(name) ?? 0) + 1);
      }
    }
  }
  return refs;
}

// ── authority pins ─────────────────────────────────────────────────────────

describe("C1/C2 roster and source authority", () => {
  it("C1 roster is exactly 44 names and hashes to the signed value", () => {
    expect(C1_ROSTER.length).toBe(44);
    expect(rosterHash(C1_ROSTER)).toBe(C1_ROSTER_SHA256);
  });

  it("C2 unique-name roster is 39 channels and hashes to the signed value", () => {
    expect(C2_UNIQUE_NAMES.length).toBe(39);
    expect(rosterHash(C2_UNIQUE_NAMES)).toBe(C2_UNIQUE_NAMES_SHA256);
  });

  it("C1/C2 historical receipts are internally consistent", () => {
    for (const slug of SLUGS) {
      const c1 = C1_DECL_RECEIPTS[slug];
      expect(c1.pre - c1.delta).toBe(c1.post);
      const c2 = C2_DECL_RECEIPTS[slug];
      expect(c2.pre - c2.delta).toBe(c2.post);
    }
    expect(
      Object.values(C2_DECL_RECEIPTS).reduce((a, r) => a + r.unique, 0)
    ).toBe(C2_TOTAL_CHANNELS);
    expect(
      Object.values(C2_DECL_RECEIPTS).reduce((a, r) => a + r.delta, 0)
    ).toBe(C2_TOTAL_DECLARATIONS);
  });
});

// ── absence and shadowed-duplicate resolution ─────────────────────────────

// EXCISED (SEV-2): the three per-slug `<slug> extension declares zero C1
// target names` tests and `BitHire redundant reduced-motion media block is
// removed`. All four graded the deleted extension corpus; G2 now forbids the
// corpus outright, which subsumes "it declares none of these 44 names".
describe("C1 targets stay retired on the compiled surface", () => {
  /**
   * C1 de-duplicated four shadowed premium-card declarations down to the later
   * winning value. MASS C3-BITHIRE-ALL then drained the whole BitHire
   * extension, so the guard moved from "declared exactly once in the extension"
   * to "declared exactly once by the typed owner and compiled with the same
   * winning percentages". The values C1 preserved are still the values shipped.
   */
  // The extension half of this test (zero `--ds-premium-card-*` rows in the
  // stylesheet) was excised with the corpus; the compiled half below is the
  // load-bearing one — it pins the exact percentages C1 preserved.
  it("shadowed premium-card duplicates keep the later winning values", () => {
    const compiled = compileTheme(FIRST_PARTY_THEMES.bithire).cssVariables;
    expect(compiled["--ds-premium-card-border"]).toContain("12%");
    expect(compiled["--ds-premium-card-border-hover"]).toContain("28%");
    expect(compiled["--ds-premium-card-selected-border"]).toContain("46%");
    expect(compiled["--ds-premium-card-selected-ring"]).toContain("12%");
  });
});

// ── C2 migration ──────────────────────────────────────────────────────────

// EXCISED (SEV-2): the three per-slug `<slug> extension declares zero C2
// target names` tests, for the same reason as their C1 siblings above.
describe("C2 targets live in typed owners", () => {
  it("Rottay dark/light button states diverge on the same typed fields", () => {
    expect(rottayBrandTheme.chrome?.controls?.buttonDefault?.borderActive).toBe(
      "rgba(255, 255, 255, 0.22)"
    );
    expect(
      rottayBrandTheme.modes.light?.chrome?.controls?.buttonDefault
        ?.borderActive
    ).toBe("#C4C4C2");
    // Alias + resolution: the field now reads the brand root, so the mode
    // divergence lives on the root and the painted colours are unchanged.
    expect(rottayBrandTheme.chrome?.controls?.buttonGhost?.colorActive).toBe(
      "var(--ds-color-primary)"
    );
    expect(
      rottayBrandTheme.modes.light?.chrome?.controls?.buttonGhost?.colorActive
    ).toBeUndefined();
    expect(rootValue("rottay", "dark", "--ds-color-primary")).toBe("#FFFFFF");
    expect(rootValue("rottay", "light", "--ds-color-primary")).toBe("#0A0A0A");
    expect(rottayBrandTheme.chrome?.controls?.buttonText?.colorHover).toBe(
      "#ECECEC"
    );
    expect(
      rottayBrandTheme.modes.light?.chrome?.controls?.buttonText?.colorHover
    ).toBe("var(--ds-color-text-primary)");
    expect(rootValue("rottay", "light", "--ds-color-text-primary")).toBe("#1A1A1A");
  });

  it("Rottay dark/light card image loading and divider diverge", () => {
    expect(rottayBrandTheme.chrome?.cardComponent?.imageLoadingTrack).toBe(
      "#222226"
    );
    expect(
      rottayBrandTheme.modes.light?.chrome?.cardComponent?.imageLoadingTrack
    ).toBe("#EDEDEC");
    expect(rottayBrandTheme.chrome?.cardComponent?.imageLoadingActive).toBe(
      "#ECECEC"
    );
    expect(
      rottayBrandTheme.modes.light?.chrome?.cardComponent?.imageLoadingActive
    ).toBe("var(--ds-color-primary)");
    expect(rootValue("rottay", "light", "--ds-color-primary")).toBe("#0A0A0A");
    expect(rottayBrandTheme.chrome?.layout?.dividerColor).toBe("#2A2A2F");
    expect(rottayBrandTheme.modes.light?.chrome?.layout?.dividerColor).toBe(
      "#E5E5E3"
    );
  });

  it("Rottay segmented track lives in controls.segmented with mode divergence", () => {
    expect(rottayBrandTheme.chrome?.controls?.segmented?.bg).toBe("#131316");
    expect(rottayBrandTheme.modes.light?.chrome?.controls?.segmented?.bg).toBe(
      "#F4F4F3"
    );
    expect(
      rottayBrandTheme.chrome?.controls?.segmented?.itemColorSelected
    ).toBe("#ECECEC");
    expect(
      rottayBrandTheme.modes.light?.chrome?.controls?.segmented
        ?.itemColorSelected
    ).toBe("var(--ds-color-text-primary)");
    expect(rootValue("rottay", "light", "--ds-color-text-primary")).toBe("#1A1A1A");
  });

  it("Rottay migrated breadcrumb values are in chrome.breadcrumb", () => {
    expect(rottayBrandTheme.chrome?.breadcrumb?.color).toBe("#6B6B72");
    expect(rottayBrandTheme.chrome?.breadcrumb?.colorActive).toBe("#ECECEC");
    expect(rottayBrandTheme.chrome?.breadcrumb?.separatorColor).toBe("#4A4A4F");
  });

  it("BitHire migrated button values are in typed variant chrome", () => {
    expect(
      bithireBrandTheme.chrome?.controls?.buttonDefault?.bgActive
    ).toContain("color-mix");
    expect(bithireBrandTheme.chrome?.controls?.buttonDefault?.colorHover).toBe(
      "var(--ds-control-ink)"
    );
    expect(bithireBrandTheme.chrome?.controls?.buttonGhost?.bgActive).toBe(
      "var(--ds-control-brand-tint-hover)"
    );
    expect(bithireBrandTheme.chrome?.controls?.buttonText).toBeDefined();
    expect(bithireBrandTheme.chrome?.controls?.buttonText?.bg).toBe(
      "transparent"
    );
    expect(bithireBrandTheme.chrome?.controls?.buttonText?.color).toBe(
      "var(--ds-control-ink)"
    );
  });

  it("sidebar geometry migrated to all three typed chrome.sidebar objects", () => {
    expect(rottayBrandTheme.chrome?.sidebar?.groupMarginTop).toBe("1px");
    expect(rottayBrandTheme.chrome?.sidebar?.itemIndent).toBe("8px");
    expect(bithireBrandTheme.chrome?.sidebar?.groupMarginTop).toBe("8px");
    expect(bithireBrandTheme.chrome?.sidebar?.itemIndent).toBe("6px");
    expect(evntoBrandTheme.chrome?.sidebar?.groupMarginTop).toBe("12px");
    expect(evntoBrandTheme.chrome?.sidebar?.itemIndent).toBe("8px");
  });

  it("surfaces.borderRadius.full migrated to all three BrandThemes", () => {
    expect(rottayBrandTheme.surfaces?.borderRadius?.full).toBe("9999px");
    expect(bithireBrandTheme.surfaces?.borderRadius?.full).toBe("9999px");
    expect(evntoBrandTheme.surfaces?.borderRadius?.full).toBe("9999px");
  });

  it("Rottay palette.backgroundSurfaceColor migrated to typed owner", () => {
    expect(rottayBrandTheme.palette?.backgroundSurfaceColor).toBe("#18181B");
  });
});

// ── C3-c common semantic control algebra ───────────────────────────────────

describe("C3-c control algebra is Theme-owned for static and DB compilation", () => {
  it("all first-party BrandThemes author the same semantic control keypaths", () => {
    const expected = [
      "brandBorder",
      "brandTint",
      "brandTintHover",
      "iconTileBorder",
      "ink",
      "inkMuted",
      "onBrand",
      "surface",
      "surfaceRaised",
    ];
    for (const theme of [
      rottayBrandTheme,
      bithireBrandTheme,
      evntoBrandTheme,
    ]) {
      expect(
        Object.keys(theme.chrome?.controls?.semantic ?? {}).sort()
      ).toEqual(expected);
    }
  });

  it("the common compiler emits every semantic control channel for all verticals", () => {
    for (const theme of Object.values(FIRST_PARTY_THEMES)) {
      const compiled = compileTheme(theme);
      for (const channel of C3_CONTROL_CHANNELS) {
        expect(compiled.cssVariables[channel], `${theme.id} ${channel}`).toBe(
          theme.chrome.controls?.semantic?.[
            C3_CONTROL_FIELD_BY_CHANNEL[channel]
          ]
        );
      }
    }
  });

  it("BitHire preserves the exact control algebra formerly authored by extension.css", () => {
    const semantic = compileTheme(FIRST_PARTY_THEMES.bithire).cssVariables;
    expect(semantic["--ds-control-ink"]).toBe("var(--ds-color-text-primary)");
    expect(semantic["--ds-control-surface"]).toBe("var(--ds-surface-card)");
    expect(semantic["--ds-control-surface-raised"]).toBe(
      "color-mix(in srgb, var(--ds-surface-card) 86%, var(--ds-surface-panel))"
    );
    expect(semantic["--ds-control-brand-tint-hover"]).toBe(
      "color-mix(in srgb, var(--ds-color-primary) 15%, var(--ds-control-surface))"
    );
    expect(semantic["--ds-icon-tile-border"]).toBe(
      "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border))"
    );
  });

  // EXCISED (SEV-2): `retires all ten BitHire extension declarations by exact
  // property name`. It asserted the ten C3_EXTENSION_RETIRE channels were
  // absent from bithire's extension; the file is gone, so the ten are absent
  // by construction and G2 keeps them that way. The roster constant survives
  // above as the signed record of which ten names were retired.
});

// ── productive-Core reader proof ──────────────────────────────────────────

describe("every C1 target has zero productive readers in Core", () => {
  const coreRefs = collectCoreRefs();

  for (const name of C1_ALL_TARGETS) {
    it(`${name} is unread in packages/core/src`, () => {
      expect(coreRefs.get(name) ?? 0).toBe(0);
    });
  }
});

// ── homonym / near-miss guard ─────────────────────────────────────────────

describe("exact-name deletion does not harm near-name siblings", () => {
  // EXCISED (SEV-2): the `homonyms` map and its per-slug
  // `<slug> keeps expected homonym siblings` loop. Both roster entries had
  // already drained to EMPTY name lists (ROTTAY-T1, the T1 P0 repair and EVNTO
  // TERMINAL-2), so the loop parsed the stylesheet and then asserted nothing.
  // The real homonym claim — the near-name siblings survived the exact-name
  // deletions — is graded on the compiled surface by the three tests below.

  /**
   * BitHire's extension is fully drained, so its homonym guard cannot read the
   * stylesheet any more. The siblings C1 was careful not to delete must now be
   * reachable from the compiled theme instead — which is a strictly stronger
   * claim than "still declared in an override file".
   */
  it("bithire keeps expected homonym siblings on the compiled surface", () => {
    // The `declared === 0` stylesheet half was excised with the corpus (G2).
    const compiled = compileTheme(FIRST_PARTY_THEMES.bithire).cssVariables;
    for (const name of [
      "--ds-premium-card-bg", // near the removed duplicate border set
      "--ds-detail-hero-spine", // near --ds-detail-radius
      "--ds-surface-card-grid-line", // near --ds-surface-card-grid-line-strong
      "--ds-select-dropdown-bg", // former mode duplicate, not C1
      "--ds-button-primary-bg-active", // near --ds-button-primary-border-color
    ]) {
      expect(compiled[name], name).toBeTruthy();
    }
  });

  /**
   * ROTTAY-T1 (G1 elevation ruling) migrated the two shadow homonyms out of
   * rottay's extension and into the theme. C1's claim — "the exact-name
   * deletion did not take the near-name siblings with it" — is unchanged; the
   * evidence simply moves to the compiled surface, which is the stronger
   * reading already applied to bithire above.
   *
   * Both lowerings are graded, because T1 requires the static BrandTheme path
   * and the ISO `Theme` path to agree on every migrated name. They disagreed
   * until `DEFAULT_SHADOWS_SHAPE` was widened to the full declared shadow
   * union; the equality assertion below is what keeps that bridge honest.
   *
   * ROTTAY-T3 (2026-08-15) drained `--ds-empty-icon-color` and
   * `--ds-empty-description-color` the same way, so they moved out of the
   * near-name list above and are graded here under the identical three-part
   * rule: absent from the stylesheet, truthy on the compiled surface, and
   * equal across both lowerings.
   */
  it("rottay keeps the migrated shadow homonyms on the compiled surface", () => {
    // The `declared` stylesheet set was excised with the corpus (G2); the
    // two-transport equality below is the half that was always load-bearing.
    const viaBrandTheme = compileBrandTheme({
      brandTheme: rottayBrandTheme,
      tenantSlug: "rottay",
    }).cssVariables;
    const viaTheme = compileTheme(FIRST_PARTY_THEMES.rottay).cssVariables;

    for (const name of [
      "--ds-shadow-xs", // near --ds-shadow-primary
      "--ds-shadow-2xl", // near --ds-shadow-primary
      "--ds-empty-icon-color", // near --ds-empty-title-color
      "--ds-empty-description-color", // near --ds-empty-title-color
    ]) {
      expect(viaBrandTheme[name], name).toBeTruthy();
      expect(viaTheme[name], `${name} via ISO Theme`).toBe(viaBrandTheme[name]);
    }
  });

  /**
   * The T1 P0 repair moved evnto's two dark button-hover channels out of the
   * extension and into `modes.dark`.
   *
   * Why they had to move: evnto's default mode is LIGHT, so the theme body is
   * the light authority and the compiler emits it UNCONDITIONALLY. The
   * extension declared the dark hover under a `[data-theme='dark']` gate, so a
   * mode-gated override was beating an unconditional compiled channel — the
   * paint happened to be right today, and would have silently repainted the
   * moment anything reordered or re-scoped the two layers. Authoring the value
   * in `modes.dark` makes the dark overlay the authority for the mode it
   * governs, and the extension row is then pure duplicate.
   *
   * Four emissions are graded per transport, not two: `bgHover` reaches both
   * the canonical `--ds-button-<variant>-bg-hover` spelling and the legacy
   * `--ds-button-<variant>-hover-bg` alias that the rustic skin reads as its
   * PRIMARY name. Grading only the canonical pair would pass while the alias —
   * the name the extension actually declared — went missing.
   */
  it("evnto keeps both button-hover homonyms on the compiled dark surface", () => {
    // EXCISED (SEV-2): the zero-survivor stylesheet census. EVNTO TERMINAL-2
    // had already driven it to 0; G2 now makes 0 unconditional. The grading
    // that matters — body vs dark, per transport — lives in
    // evnto-extension/index.test.ts and in the compiled block below.

    const darkOf = (result: {
      cssVariables: Record<string, string>;
      modeBlocks?: ReadonlyArray<{
        mode: string;
        cssVariables: Record<string, string>;
      }>;
    }): Record<string, string> => {
      const block = (result.modeBlocks ?? []).find((b) => b.mode === "dark");
      expect(block, "evnto must emit a dark mode block").toBeDefined();
      return { ...result.cssVariables, ...(block?.cssVariables ?? {}) };
    };

    const staticTransport = compileBrandTheme({
      brandTheme: evntoBrandTheme,
      tenantSlug: "evnto",
    });
    const dbTransport = compileTheme(FIRST_PARTY_THEMES.evnto);

    const expected: Record<string, string> = {
      "--ds-button-primary-hover-bg": "#F0F0E8",
      "--ds-button-primary-bg-hover": "#F0F0E8",
      "--ds-button-secondary-hover-bg": "#1C1A16",
      "--ds-button-secondary-bg-hover": "#1C1A16",
    };
    expect(Object.keys(expected)).toHaveLength(4);

    for (const [transportName, result] of [
      ["static BrandTheme", staticTransport],
      ["DB Theme", dbTransport],
    ] as const) {
      const dark = darkOf(result);
      for (const [name, value] of Object.entries(expected)) {
        // The per-name "drained from the stylesheet" half was excised with the
        // corpus (G2); the compiled dark byte below is the surviving claim.
        expect(dark[name], `${name} via ${transportName}`).toBe(value);
      }
    }

    // The two transports agree name-for-name, byte-for-byte.
    for (const name of Object.keys(expected)) {
      expect(darkOf(dbTransport)[name], `${name} transport parity`).toBe(
        darkOf(staticTransport)[name]
      );
    }

    // Old-byte negative: the LIGHT hover must not leak into the dark block.
    const dark = darkOf(staticTransport);
    expect(dark["--ds-button-primary-hover-bg"]).not.toBe("#262626");
    expect(dark["--ds-button-secondary-hover-bg"]).not.toBe("rgba(0, 0, 0, 0.04)");

    // Wrong-mode negative: the unconditional block still carries LIGHT, because
    // the repair added a dark overlay and did not touch the light authority.
    const base = staticTransport.cssVariables;
    expect(base["--ds-button-primary-hover-bg"]).toBe("#262626");
    expect(base["--ds-button-secondary-hover-bg"]).toBe("rgba(0, 0, 0, 0.04)");
    expect(base["--ds-button-primary-hover-bg"]).not.toBe("#F0F0E8");
    expect(base["--ds-button-secondary-hover-bg"]).not.toBe("#1C1A16");
  });
});

// ── no resurrection / product-branch cleanup ──────────────────────────────

// EXCISED (SEV-2): describe "C1 leaves no target residue and no unexpected
// product dialect" and its sole test, `no --rt-* product-branch tokens are
// declared`. It scanned the three extension sources for the --rt-* product
// dialect. With no extension source to carry a dialect, the claim is
// discharged by G2; the compiler-side owner of the last --rt-* holdout
// (--ds-surface-card-grid-line -> chrome.surface.cardGridLine) is graded by
// the bithire homonym test above.
