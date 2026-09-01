/**
 * Status-tint floor acceptance spec for the static compilation path.
 *
 * Canonical formula under test:
 *
 *   -bg               -> var(--ds-color-{tone}-50)
 *   -border           -> color-mix(in srgb, var(--ds-color-{tone}) 20%, transparent)
 *   alpha-{tone}-10/20 -> color-mix(in srgb, var(--ds-color-{tone}) {10,20}%, transparent)
 *   -ink              -> UNTOUCHED (already derives from default.css:480-483,
 *                        authority `tinted-well-tone-ink`; no test here)
 *
 * The ANCHOR is the tone's own channel (`--ds-color-{tone}`), never the
 * `-500` ramp step: the `-500` step is residue of a documented APCA
 * re-level in `default.css` and no longer coincides with the channel in
 * three of four tones (see the review, section A.2/A.3). This file
 * previously tested a `-500`-anchored draft; the FORMULA constants below are
 * the only thing that changed to align with the adjudicated formula — the
 * test names, helpers and red/green partition are unchanged.
 *
 * `--ds-color-alpha-info-20` is never emitted: it is a RETIRED channel
 * (`governance/tokens/decisions/writers/unused/system/index.json`, `"decision": "RETIRE_PROPOSED", "executed":
 * true`), so the alpha family is seven channels, not eight.
 *
 * Precedence under test mirrors the existing `deriveExtendedPaletteFloor`
 * pattern (`brand-theme/index.ts` — "derivation is the floor, authored is
 * the ceiling"): a theme that authors `successBgColor` etc. keeps its own
 * literal per channel; the floor only fills a gap where the seed exists and
 * the field does not.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { contrastRatio, parseHex } from "@/foundation/kernel/color/contrast";

import {
  compileBrandTheme,
  deriveStatusTintFloor,
  STATUS_SEED_SHADOWING_FIELDS,
} from "@/infrastructure/compilers/kernel/runtime/brand-theme";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/bithire";
import { evntoBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/evnto";

const TONES = ["success", "warning", "error", "info"] as const;
type Tone = (typeof TONES)[number];

const FORMULA = {
  bg: (tone: Tone) => `var(--ds-color-${tone}-50)`,
  border: (tone: Tone) =>
    `color-mix(in srgb, var(--ds-color-${tone}) 20%, transparent)`,
  alpha10: (tone: Tone) =>
    `color-mix(in srgb, var(--ds-color-${tone}) 10%, transparent)`,
  alpha20: (tone: Tone) =>
    `color-mix(in srgb, var(--ds-color-${tone}) 20%, transparent)`,
};

const BG_FIELD: Record<Tone, string> = {
  success: "successBgColor",
  warning: "warningBgColor",
  error: "errorBgColor",
  info: "infoBgColor",
};
const BORDER_FIELD: Record<Tone, string> = {
  success: "successBorderColor",
  warning: "warningBorderColor",
  error: "errorBorderColor",
  info: "infoBorderColor",
};
const SEED_FIELD: Record<Tone, string> = {
  success: "successColor",
  warning: "warningColor",
  error: "errorColor",
  info: "infoColor",
};

/** Delete a set of `palette.*` leaves from a cloned BrandTheme. Mirrors the
 * `withoutKeypath` pattern in `bithire-extension/index.test.ts`, generalized to
 * many leaves in one clone. */
function withoutPaletteFields(
  theme: BrandTheme,
  fields: readonly string[]
): BrandTheme {
  const clone = structuredClone(theme) as unknown as {
    palette?: Record<string, unknown>;
  };
  for (const field of fields) {
    if (clone.palette) delete clone.palette[field];
  }
  return clone as unknown as BrandTheme;
}

/** Add a `palette.*` leaf to a cloned BrandTheme. */
function withPaletteField(
  theme: BrandTheme,
  field: string,
  value: string
): BrandTheme {
  const clone = structuredClone(theme) as unknown as {
    palette?: Record<string, unknown>;
  };
  if (clone.palette) clone.palette[field] = value;
  return clone as unknown as BrandTheme;
}

function compile(theme: BrandTheme, slug: string) {
  return compileBrandTheme({ brandTheme: theme, tenantSlug: slug });
}

// BitHire light authors a seed for all four tones (blue success `#327CA8`)
// and no longer authors any `*BgColor`/`*BorderColor` literal
// (retired — see the vertical source) and never authored any
// `alpha{Tone}10/20` field either. The theme AS SHIPPED is therefore already
// the "floor fires" fixture; no cloning needed for this half of the claim.
describe("status-tint floor fires when the seed exists and the field is unauthored", () => {
  const { cssVariables } = compile(bithireBrandTheme, "bithire");

  it.each(TONES)("derives -bg for %s from the vertical's own seed ramp", (tone) => {
    expect(cssVariables[`--ds-color-${tone}-bg`]).toBe(FORMULA.bg(tone));
  });

  it.each(TONES)("derives -border for %s at 20%% of the seed's own channel", (tone) => {
    expect(cssVariables[`--ds-color-${tone}-border`]).toBe(FORMULA.border(tone));
  });

  it.each(TONES)("derives alpha-%s-10 from the tone's own channel, not the -500 ramp step", (tone) => {
    expect(cssVariables[`--ds-color-alpha-${tone}-10`]).toBe(FORMULA.alpha10(tone));
  });

  it.each(["success", "warning", "error"] as const)(
    "derives alpha-%s-20 from the tone's own channel",
    (tone) => {
      expect(cssVariables[`--ds-color-alpha-${tone}-20`]).toBe(FORMULA.alpha20(tone));
    }
  );

  it("never emits alpha-info-20 — a retired channel, not a symmetry gap", () => {
    expect(cssVariables["--ds-color-alpha-info-20"]).toBeUndefined();
  });
});

describe("an authored status literal outranks the floor per channel", () => {
  // Synthetic: bithire no longer authors successBgColor itself (retired), so
  // this test re-authors it on a clone to prove the PRECEDENCE contract in
  // isolation from the vertical's own current authoring choices. A sentinel
  // value far from both the seed-derived floor and any prior literal makes a
  // pass unambiguous.
  const withAuthoredBg = withPaletteField(
    bithireBrandTheme,
    "successBgColor",
    "#ABCDEF"
  );
  const { cssVariables } = compile(withAuthoredBg, "bithire");

  it("the authored -bg wins", () => {
    expect(cssVariables["--ds-color-success-bg"]).toBe("#ABCDEF");
  });

  it("every OTHER channel for the same tone still derives from the floor", () => {
    expect(cssVariables["--ds-color-success-border"]).toBe(FORMULA.border("success"));
    expect(cssVariables["--ds-color-alpha-success-10"]).toBe(FORMULA.alpha10("success"));
    expect(cssVariables["--ds-color-alpha-success-20"]).toBe(FORMULA.alpha20("success"));
  });
});

describe("an absent status seed emits nothing", () => {
  it.each(TONES)("no %s seed means no derived -bg/-border/alpha for that tone", (tone) => {
    const stripped = withoutPaletteFields(bithireBrandTheme, [
      SEED_FIELD[tone],
      BG_FIELD[tone],
      BORDER_FIELD[tone],
    ]);
    const { cssVariables } = compile(stripped, "bithire");
    expect(cssVariables[`--ds-color-${tone}-bg`]).toBeUndefined();
    expect(cssVariables[`--ds-color-${tone}-border`]).toBeUndefined();
    expect(cssVariables[`--ds-color-alpha-${tone}-10`]).toBeUndefined();
    expect(cssVariables[`--ds-color-alpha-${tone}-20`]).toBeUndefined();
  });
});

// ── Tenant re-derivation, static shape half ─────────────────────────────────

/**
 * `applyTenantStatusSeedDerivations` (the status-tint sibling of
 * `applyTenantSeedDerivations`) needs `STATUS_SEED_SHADOWING_FIELDS` entries
 * for the fifteen bg/border/alpha channels, exactly the SIBLING pattern the
 * review adjudicated (section B.iii): a table separate from the primary
 * `SEED_SHADOWING_FIELDS`, never an extension of it, so
 * `provenance-acceptance.test.ts`'s `SEED_FAMILY` closure over the PRIMARY
 * table stays untouched.
 *
 * The closure below is assembled from `deriveStatusTintFloor`'s own output
 * rather than hand-listed, so a channel added to the floor cannot be
 * silently omitted from the shadowing table's coverage.
 */
describe("STATUS_SEED_SHADOWING_FIELDS exactly matches the floor output", () => {
  it("closure: the shadowing table's keys equal the floor's own emission when every tone is seeded", () => {
    const allSeeded: Record<string, string> = {
      successColor: "#111111",
      warningColor: "#222222",
      errorColor: "#333333",
      infoColor: "#444444",
    };
    const emitted = deriveStatusTintFloor(
      allSeeded as unknown as Parameters<typeof deriveStatusTintFloor>[0]
    );
    expect(Object.keys(STATUS_SEED_SHADOWING_FIELDS).sort()).toEqual(
      Object.keys(emitted).sort()
    );
  });

  it("has exactly fifteen entries: 4 tones x (bg + border + alpha-10) + 3 alpha-20 (info excluded)", () => {
    expect(Object.keys(STATUS_SEED_SHADOWING_FIELDS)).toHaveLength(15);
  });

  it.each(TONES)("%s bg/border channels have a shadowing field", (tone) => {
    expect(STATUS_SEED_SHADOWING_FIELDS[`--ds-color-${tone}-bg`]).toEqual([
      `palette.${BG_FIELD[tone]}`,
    ]);
    expect(STATUS_SEED_SHADOWING_FIELDS[`--ds-color-${tone}-border`]).toEqual([
      `palette.${BORDER_FIELD[tone]}`,
    ]);
  });

  it("never has an entry for alpha-info-20", () => {
    expect(STATUS_SEED_SHADOWING_FIELDS["--ds-color-alpha-info-20"]).toBeUndefined();
  });
});

// ── Foundation :root remains unchanged ─────────────────────────────────────

/**
 * The review (section A.6) rejected rewriting `default.css` to formulas: with
 * the ADJUDICATED seed anchor the eight `:root` literals would actually move
 * (they are pinned at the `-500` step; the anchor is the channel, which is
 * `-600`/`-600`/`-400`/`-400` for the four tones — see the review's table in
 * A.2), for zero functional gain, since `:root` is precisely the no-seed case
 * outside this floor's domain. This is a GATE, not prose: pin the exact
 * current text of both blocks so any future edit to `default.css`'s status
 * lines fails this test first.
 */
describe("the foundation root remains untouched", () => {
  const DEFAULT_CSS_PATH = join(
    process.cwd(),
    "src/foundation/tokens/css/foundation/themes/default/index.css"
  );
  const defaultCss = readFileSync(DEFAULT_CSS_PATH, "utf8");

  it("the alpha block is byte-identical to the pre-derivation fixture", () => {
    expect(defaultCss).toContain(
      "  --ds-color-alpha-success-10: rgba(34, 197, 94, 0.10);\n" +
        "  --ds-color-alpha-success-20: rgba(34, 197, 94, 0.20);\n" +
        "  --ds-color-alpha-warning-10: rgba(245, 158, 11, 0.10);\n" +
        "  --ds-color-alpha-warning-20: rgba(245, 158, 11, 0.20);\n" +
        "  --ds-color-alpha-error-10: rgba(239, 68, 68, 0.10);\n" +
        "  --ds-color-alpha-error-20: rgba(239, 68, 68, 0.20);\n" +
        "  --ds-color-alpha-info-10: rgba(59, 130, 246, 0.10);"
    );
  });

  it("the background and border block is byte-identical to the pre-derivation fixture", () => {
    expect(defaultCss).toContain(
      "  --ds-color-success-bg: var(--ds-color-success-50);\n" +
        "  --ds-color-success-border: rgba(34, 197, 94, 0.2);\n" +
        "  --ds-color-warning-bg: var(--ds-color-warning-50);\n" +
        "  --ds-color-warning-border: rgba(245, 158, 11, 0.2);\n" +
        "  --ds-color-error-bg: var(--ds-color-error-50);\n" +
        "  --ds-color-error-border: rgba(239, 68, 68, 0.2);\n" +
        "  --ds-color-info-bg: var(--ds-color-info-50);\n" +
        "  --ds-color-info-border: rgba(59, 130, 246, 0.2);"
    );
  });

  // alpha-info-20 does not exist in the contract or in default.css. The
  // floor must not invent a channel with no consumer and no declared output;
  // this is a closed-vocabulary guard, not an oversight.
  it("alpha-info-20 has no foundation literal and is out of scope for the floor", () => {
    expect(defaultCss).not.toContain("--ds-color-alpha-info-20:");
  });
});

// ── Contrast: ink over the corrected well ──────────────────────────────────

/**
 * The review measured (section A.4) that bithire light success — the tone
 * that moves the most — loses no WCAG contrast between its ink and its
 * corrected well: ink stays derived from `default.css:480-483`
 * (`tinted-well-tone-ink`, unchanged by this floor), which mixes the seed 60% into
 * the vertical's own neutral-900 at 40%. This test recomputes that mix and
 * the resulting contrast independently from source values (the compiled
 * seed and neutral-900), rather than repeating the review's own numbers.
 */
describe("ink and well contrast holds after the hue correction", () => {
  it("bithire light success: ink over the corrected -bg clears WCAG AA for large text", () => {
    const { cssVariables } = compile(bithireBrandTheme, "bithire");
    const seed = cssVariables["--ds-color-success"];
    const neutral900 = cssVariables["--ds-color-neutral-900"];
    const well50 = cssVariables["--ds-color-success-50"];
    expect(seed).toBeTruthy();
    expect(neutral900).toBeTruthy();
    expect(well50).toBeTruthy();

    const seedRgb = parseHex(seed);
    const neutralRgb = parseHex(neutral900);
    if (!seedRgb || !neutralRgb) throw new Error("expected hex literals for seed/neutral-900");

    // Mirrors `color-mix(in srgb, var(--ds-color-success) 60%, var(--ds-color-neutral-900) 40%)`.
    const mixChannel = (a: number, b: number) => Math.round(a * 0.6 + b * 0.4);
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    const ink =
      "#" +
      toHex(mixChannel(seedRgb.r, neutralRgb.r)) +
      toHex(mixChannel(seedRgb.g, neutralRgb.g)) +
      toHex(mixChannel(seedRgb.b, neutralRgb.b));

    const contrast = contrastRatio(ink, well50);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
});

// ── Evnto border zero-delta: byte-identical to the pre-derivation fixture ──

/**
 * evnto's light palette RETIRED all four `*BorderColor` literals in this lot
 * (see `evnto/index.ts`, the comment above `linkHoverColor`), but each one
 * authored EXACTLY the string `deriveStatusTintFloor` derives from the seed
 * — a cero-delta byte retirement, not a correction (unlike the four
 * `*BgColor` literals, which genuinely moved). The four values below are
 * `evnto/index.ts` `successBorderColor`/`warningBorderColor`/
 * `errorBorderColor`/`infoBorderColor` as they read at HEAD
 * (`git show e14213be8:packages/core/src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts:1901,1906,1911,1916`),
 * pinned literally so a future edit to either the retired baseline or the
 * floor formula that quietly changed evnto's compiled `-border` bytes fails
 * this test first.
 */
describe("Evnto border channels remain byte-identical to the pre-derivation fixture", () => {
  const HEAD_EVNTO_BORDER: Readonly<Record<Tone, string>> = {
    success: "color-mix(in srgb, var(--ds-color-success) 20%, transparent)",
    warning: "color-mix(in srgb, var(--ds-color-warning) 20%, transparent)",
    error: "color-mix(in srgb, var(--ds-color-error) 20%, transparent)",
    info: "color-mix(in srgb, var(--ds-color-info) 20%, transparent)",
  };

  it.each(TONES)(
    "evnto light -%s-border matches the retired HEAD literal byte-for-byte",
    (tone) => {
      const { cssVariables } = compile(evntoBrandTheme, "evnto");
      expect(cssVariables[`--ds-color-${tone}-border`]).toBe(
        HEAD_EVNTO_BORDER[tone]
      );
    }
  );
});
