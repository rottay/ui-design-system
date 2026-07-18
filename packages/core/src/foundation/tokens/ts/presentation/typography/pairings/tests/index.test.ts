/**
 * Unit contract for the typography pairing presets (W4-B2).
 * The four presets are the interface the tenant-theme APPEARANCE compiler
 * consumes; their family stacks and tuned dials are pinned here so a preset
 * cannot silently drift from the documented white-label direction.
 */
import { describe, expect, it } from "vitest";
import {
  TYPE_PAIRINGS,
  TYPE_PAIRING_IDS,
  type TypePairing,
  type TypePairingId,
} from "../index";

const DOCUMENTED = {
  sober: {
    heading: "var(--ds-font-pack-grotesk-display, var(--ds-font-sans))",
    base: "var(--ds-font-pack-humanist-text, var(--ds-font-sans))",
    headingLs: "-0.01em",
    displayLh: 1.15,
  },
  editorial: {
    heading: "var(--ds-font-pack-editorial-display, Georgia, 'Times New Roman', serif)",
    base: "var(--ds-font-pack-editorial-text, Georgia, 'Times New Roman', serif)",
    headingLs: "0",
    displayLh: 1.2,
  },
  geometric: {
    heading: "var(--ds-font-pack-geometric-display, var(--ds-font-sans))",
    base: "var(--ds-font-sans)",
    headingLs: "0.005em",
    displayLh: 1.18,
  },
  technical: {
    heading: "var(--ds-font-pack-grotesk-display, var(--ds-font-sans))",
    base: "var(--ds-font-sans)",
    mono: "var(--ds-font-pack-plex-mono, var(--ds-font-mono))",
    headingLs: "0.01em",
    displayLh: 1.12,
  },
} as const;

describe("TYPE_PAIRINGS", () => {
  it("exposes exactly the four documented preset ids", () => {
    expect(TYPE_PAIRING_IDS.sort()).toEqual(
      ["editorial", "geometric", "sober", "technical"]
    );
  });

  it("resolves each preset to its documented family stacks and dials", () => {
    for (const id of Object.keys(DOCUMENTED) as TypePairingId[]) {
      expect(TYPE_PAIRINGS[id], id).toEqual(DOCUMENTED[id]);
    }
  });

  it("only the technical preset tunes a mono family", () => {
    expect(TYPE_PAIRINGS.technical.mono).toBe(
      "var(--ds-font-pack-plex-mono, var(--ds-font-mono))"
    );
    expect("mono" in TYPE_PAIRINGS.sober).toBe(false);
    expect("mono" in TYPE_PAIRINGS.editorial).toBe(false);
    expect("mono" in TYPE_PAIRINGS.geometric).toBe(false);
  });

  it("every value is a single var() whose fallback lives in-parens and never references an emitted family token", () => {
    // Legal grammar: var(--ds-font-pack-<id>, <in-parens fallback>) where the
    // fallback is a concrete stack or var(--ds-font-sans|--ds-font-mono), or a
    // direct var(--ds-font-sans|--ds-font-mono). Referencing an emitted
    // --ds-font-family-* token is a per-element cycle (guaranteed-invalid), and
    // anything after the closing paren is a font-list item, not a fallback.
    const legal =
      /^var\(--ds-font-pack-[a-z-]+, (var\(--ds-font-(sans|mono)\)|[A-Za-z'", -]+)\)$|^var\(--ds-font-(sans|mono)\)$/;
    for (const id of TYPE_PAIRING_IDS) {
      const pairing: TypePairing = TYPE_PAIRINGS[id];
      const { heading, base, mono } = pairing;
      for (const [slot, value] of Object.entries({ heading, base, mono })) {
        if (value === undefined) continue;
        expect(value, `${id}.${slot}`).toMatch(legal);
        expect(value, `${id}.${slot} must not reference an emitted family token`).not.toMatch(
          /--ds-font-family-/
        );
      }
    }
  });
});
