/**
 * The typography family, sub-owner by sub-owner.
 *
 * One authority per statement: the ramp rides the type dial and is expressed
 * on its own facets, the weight ladder answers to `headingWeightBias`, and the
 * figure posture the foundation declares at rest is the one this family owns.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { NUMERIC_POSTURE } from "../numeric";
import { deriveTypeScaleChannels } from "../scale";
import { deriveTypeWeightChannels } from "../weights";

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
