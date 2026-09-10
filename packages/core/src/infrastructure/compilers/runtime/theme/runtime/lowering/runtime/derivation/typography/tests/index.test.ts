/**
 * The typography family, sub-owner by sub-owner.
 *
 * One authority per statement: the ramp rides the type dial and is expressed
 * on its own facets, the weight ladder answers to `typography.roleWeights` over
 * the legacy `headingWeightBias`, and the figure posture the foundation
 * declares at rest is the floor `typography.numeric` moves from.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { NUMERIC_POSTURE, numericOverlay } from "../numeric";
import { deriveTypeRoleChannels } from "../roles";
import { deriveTypeScaleChannels } from "../scale";
import { deriveTypeWeightChannels, roleWeightOverlay } from "../weights";

const DEFAULT_THEME_CSS = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/foundation/themes/default/index.css"
  ),
  "utf8"
);

const theme = (typography: BrandTheme["typography"]): BrandTheme => ({
  id: "t",
  name: "T",
  typography,
});

describe("typography/scale", () => {
  const channels = deriveTypeScaleChannels();

  it("puts every size and leading facet on the type dial", () => {
    const dialed = Object.entries(channels).filter(
      ([channel]) => channel.endsWith("-size") || channel.endsWith("-line-height")
    );
    expect(dialed.length).toBeGreaterThan(0);
    for (const [channel, value] of dialed) {
      expect(value, channel).toContain("var(--ds-type-scale, 1)");
    }
  });

  it("expresses each ramp entry on its own facets, never on repeated literals", () => {
    expect(channels["--ds-text-body"]).toBe(
      "var(--ds-text-body-weight) var(--ds-text-body-size)" +
        "/var(--ds-text-body-line-height) var(--ds-font-family-base)"
    );
    expect(channels["--ds-text-eyebrow-transform"]).toBe("uppercase");
  });

  it("leaves the non-dialled facets alone", () => {
    expect(channels["--ds-text-body-weight"]).toBe("400");
    expect(channels["--ds-text-eyebrow-letter-spacing"]).toBe("0.08em");
  });
});

describe("typography/weights", () => {
  it("moves the heading and display weights with headingWeightBias", () => {
    const lighter = deriveTypeWeightChannels(
      theme({ headingWeightBias: "lighter" })
    );
    const heavier = deriveTypeWeightChannels(
      theme({ headingWeightBias: "heavier" })
    );
    expect(lighter["--ds-font-weight-heading"]).not.toBe(
      heavier["--ds-font-weight-heading"]
    );
    expect(lighter["--ds-font-weight-display"]).not.toBe(
      heavier["--ds-font-weight-display"]
    );
  });

  it("treats an absent bias as `normal`, not as an absent ladder", () => {
    expect(deriveTypeWeightChannels(theme(undefined))).toEqual(
      deriveTypeWeightChannels(theme({ headingWeightBias: "normal" }))
    );
  });

  // The compatibility transport erases the type: a BrandTheme arrives as plain
  // JSON through `TenantConfig.brandTheme`, so the two failure shapes below are
  // reachable input, not hypotheticals.
  it("rests at `normal` for a word outside the vocabulary, instead of throwing", () => {
    const rogue = theme({
      headingWeightBias: "ultra" as never,
    });
    expect(() => deriveTypeWeightChannels(rogue)).not.toThrow();
    expect(deriveTypeWeightChannels(rogue)).toEqual(
      deriveTypeWeightChannels(theme({ headingWeightBias: "normal" }))
    );
  });

  it("rests at `normal` for an INHERITED member, instead of painting undefined", () => {
    for (const inherited of ["constructor", "toString", "hasOwnProperty"]) {
      const rogue = theme({ headingWeightBias: inherited as never });
      expect(deriveTypeWeightChannels(rogue), inherited).toEqual(
        deriveTypeWeightChannels(theme({ headingWeightBias: "normal" }))
      );
    }
  });
});

describe("typography/numeric", () => {
  it("is the posture the foundation declares at rest", () => {
    expect(DEFAULT_THEME_CSS).toContain(
      `--ds-type-numeric-font-weight: ${NUMERIC_POSTURE.numeric!.fontWeight};`
    );
    expect(DEFAULT_THEME_CSS).toContain(
      "--ds-type-numeric-font-variant-numeric: " +
        `${NUMERIC_POSTURE.numeric!.fontVariantNumeric};`
    );
    expect(DEFAULT_THEME_CSS).toContain(
      "--ds-type-code-font-variant-numeric: " +
        `${NUMERIC_POSTURE.code!.fontVariantNumeric};`
    );
  });
});

describe("typography.role-weights (kit row 9)", () => {
  const roles = (typography: BrandTheme["typography"]) =>
    deriveTypeRoleChannels(theme(typography), undefined);

  it("moves the SEMANTIC role weight, not only the ladder channel", () => {
    // The defect CC-01 measured: the legacy bias moved heading 500->700 and
    // display 600->800 while `--ds-type-display-font-weight` stayed 700, so a
    // theme could state a weight posture that no surface bound.
    expect(roles({})["--ds-type-display-font-weight"]).toBe("700");
    expect(roles({ roleWeights: "strong" })["--ds-type-display-font-weight"]).toBe(
      "800"
    );
    expect(roles({ roleWeights: "light" })["--ds-type-display-font-weight"]).toBe(
      "600"
    );
  });

  it("states the whole emphasis vocabulary, and leaves the text roles alone", () => {
    const strong = roles({ roleWeights: "strong" });
    const rest = roles({});
    for (const role of ["display", "page-title", "section-title", "label", "numeric"]) {
      expect(
        strong[`--ds-type-${role}-font-weight`],
        role
      ).not.toBe(rest[`--ds-type-${role}-font-weight`]);
    }
    // Body weight is a legibility floor, not a posture.
    for (const role of ["body", "supporting", "caption", "code"]) {
      expect(strong[`--ds-type-${role}-font-weight`], role).toBe(
        rest[`--ds-type-${role}-font-weight`]
      );
    }
  });

  it("outranks the legacy bias on the ladder, and falls back to it when unauthored", () => {
    const both = deriveTypeWeightChannels(
      theme({ headingWeightBias: "lighter", roleWeights: "strong" })
    );
    expect(both["--ds-font-weight-heading"]).toBe("700");
    expect(both["--ds-font-weight-display"]).toBe("800");
    const biasOnly = deriveTypeWeightChannels(
      theme({ headingWeightBias: "lighter" })
    );
    expect(biasOnly["--ds-font-weight-heading"]).toBe("500");
    expect(biasOnly["--ds-font-weight-display"]).toBe("600");
  });

  it("leaves the legacy bias's own reach exactly where it was: two channels", () => {
    // Routing the bias through the posture table would re-weight the semantic
    // roles of the two shipped verticals that author `heavier` -- a repaint no
    // kit row asked for. The bias is the FALLBACK for the ladder, not a
    // second spelling of the decision.
    expect(roleWeightOverlay(theme({ headingWeightBias: "heavier" }))).toEqual({});
    expect(roles({ headingWeightBias: "heavier" })["--ds-type-display-font-weight"]).toBe(
      "700"
    );
  });

  it("is the identity at `regular`, so the resting ladder stays expressible", () => {
    expect(roles({ roleWeights: "regular" })).toEqual(roles({}));
  });

  it("loses to the finer authored role, and rests for a word outside the domain", () => {
    expect(
      roles({ roleWeights: "strong", roles: { display: { fontWeight: 500 } } })[
        "--ds-type-display-font-weight"
      ]
    ).toBe("500");
    expect(
      roles({ roleWeights: "potato" as never })["--ds-type-display-font-weight"]
    ).toBe("700");
    expect(
      roles({ roleWeights: "toString" as never })["--ds-type-display-font-weight"]
    ).toBe("700");
  });
});

describe("typography.numeric (kit row 10)", () => {
  const roles = (typography: BrandTheme["typography"]) =>
    deriveTypeRoleChannels(theme(typography), undefined);

  it("states ONE figure grammar across every role", () => {
    const tabular = roles({ numeric: "tabular" });
    const proportional = roles({ numeric: "proportional" });
    for (const role of [
      "display", "page-title", "section-title", "body",
      "supporting", "label", "caption", "code",
    ]) {
      expect(tabular[`--ds-type-${role}-font-variant-numeric`], role).toBe(
        "tabular-nums"
      );
      expect(proportional[`--ds-type-${role}-font-variant-numeric`], role).toBe(
        "proportional-nums"
      );
    }
    // The numeric role keeps its LINING figures under both: the decision is
    // proportional versus tabular advance, not whether digits sit on the
    // baseline.
    expect(tabular["--ds-type-numeric-font-variant-numeric"]).toBe(
      "tabular-nums lining-nums"
    );
    expect(proportional["--ds-type-numeric-font-variant-numeric"]).toBe(
      "proportional-nums lining-nums"
    );
  });

  it("moves at least one channel for BOTH steps: the resting vocabulary is mixed", () => {
    const rest = roles({});
    for (const posture of ["tabular", "proportional"] as const) {
      const moved = Object.keys(roles({ numeric: posture })).filter(
        (channel) =>
          channel.endsWith("-font-variant-numeric") &&
          roles({ numeric: posture })[channel] !== rest[channel]
      );
      expect(moved.length, posture).toBeGreaterThan(0);
    }
  });

  it("outranks an expressive overlay and loses to the finer authored role", () => {
    const overlaid = deriveTypeRoleChannels(
      theme({ numeric: "tabular" }),
      { body: { fontVariantNumeric: "oldstyle-nums" } } as never
    );
    expect(overlaid["--ds-type-body-font-variant-numeric"]).toBe("tabular-nums");
    expect(
      roles({
        numeric: "tabular",
        roles: { body: { fontVariantNumeric: "oldstyle-nums" } },
      })["--ds-type-body-font-variant-numeric"]
    ).toBe("oldstyle-nums");
  });

  it("rests for a word outside the domain and for an INHERITED member", () => {
    expect(numericOverlay(theme({ numeric: "potato" as never }))).toEqual({});
    expect(numericOverlay(theme({ numeric: "constructor" as never }))).toEqual({});
    expect(roles({ numeric: "potato" as never })).toEqual(roles({}));
  });
});
