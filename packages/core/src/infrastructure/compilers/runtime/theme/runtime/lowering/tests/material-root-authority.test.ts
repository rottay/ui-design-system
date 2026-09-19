/**
 * The 103 material roots have ONE table.
 *
 * `themes/default/index.css` keeps a `:root` block so a document with no
 * compiled artifact still has materials, and `derivation/materials` emits the
 * same roots per vertical. Two copies of one table is how a tenant ends up
 * with a hover the un-tenanted page does not have, so the copy is asserted
 * identical here rather than trusted.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { SEMANTIC_SURFACE_ROLES } from "@/foundation/contracts/kernel/tokens/materials";
import { deriveMaterialChannels } from "../runtime/derivation/materials";
import { lowerBlock } from "../runtime/pipeline";
import { firstPartyFixture } from "@tests/support/theme-lowering";

const bithireFlatTheme = firstPartyFixture('bithire');
const evntoFlatTheme = firstPartyFixture('evnto');
const rottayFlatTheme = firstPartyFixture('rottay');

const DEFAULT_THEME_CSS = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../../../../foundation/tokens/css/foundation/themes/default/index.css"
);

const NEUTRAL: FlatTheme = { id: "neutral", name: "Neutral" };

/** Every `--ds-material-*` declared inside the FIRST `:root` block. */
function rootMaterialBlock(): Record<string, string> {
  const css = readFileSync(DEFAULT_THEME_CSS, "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    ""
  );
  const start = css.indexOf(":root {");
  const end = css.indexOf("\n}", start);
  const block = css.slice(start, end);
  const declarations: Record<string, string> = {};
  for (const match of block.matchAll(
    /(--ds-material-[a-z-]+)\s*:\s*([^;]+);/g
  )) {
    declarations[match[1]!] = match[2]!.trim().replace(/\s+/g, " ");
  }
  return declarations;
}

describe("the material roots", () => {
  it("are the same 103 names in the foundation fallback and in the deriver", () => {
    const derived = Object.keys(deriveMaterialChannels(NEUTRAL)).sort();
    expect(derived).toHaveLength(103);
    expect(Object.keys(rootMaterialBlock()).sort()).toEqual(derived);
  });

  it("carry the same value in both, so neither can drift from the other", () => {
    expect(rootMaterialBlock()).toEqual(deriveMaterialChannels(NEUTRAL));
  });

  it("cover every semantic surface role", () => {
    const roles = new Set(
      Object.keys(deriveMaterialChannels(NEUTRAL)).map(
        (channel) => channel.slice("--ds-material-".length).split("-")[0]
      )
    );
    expect([...roles].sort()).toEqual([...SEMANTIC_SURFACE_ROLES].sort());
  });

  it("are emitted whole by every vertical, authored facets or not", () => {
    const expected = Object.keys(deriveMaterialChannels(NEUTRAL)).sort();
    for (const theme of [rottayFlatTheme, bithireFlatTheme, evntoFlatTheme]) {
      const emitted = Object.keys(lowerBlock({ theme })).filter((channel) =>
        channel.startsWith("--ds-material-")
      );
      expect(expected.every((channel) => emitted.includes(channel))).toBe(true);
    }
  });

  it("let an authored surface role override its own facet without dropping a root", () => {
    const authored: FlatTheme = {
      id: "authored",
      name: "Authored",
      surfaces: { surfaceRoles: { card: { backgroundHover: "#123456" } } },
    };
    const channels = deriveMaterialChannels(authored);
    expect(channels["--ds-material-card-background-hover"]).toBe("#123456");
    expect(Object.keys(channels)).toHaveLength(103);
  });
});

/**
 * `overlay` and `raised` used to carry 2 facets against `panel`/`card`/
 * `control`'s 19, so nine families read the rest with nine private fallbacks.
 * These pin the repair: the full facet list, at the values the readers already
 * resolved to, with the four disagreeing facets left authorable but valueless.
 */
describe("the overlay and raised facet lists", () => {
  const FACETS = [
    "background",
    "background-hover",
    "background-active",
    "background-selected",
    "background-disabled",
    "foreground",
    "foreground-muted",
    "foreground-disabled",
    "border",
    "border-strong",
    "border-hover",
    "border-active",
    "border-selected",
    "border-disabled",
    "focus-ring",
    "shadow",
    "shadow-hover",
    "shadow-active",
    "shadow-selected",
  ];

  /** The facets a family that already had 19 carries, as the reference shape. */
  const facetsOf = (role: string) =>
    Object.keys(deriveMaterialChannels(NEUTRAL))
      .filter((channel) => channel.startsWith(`--ds-material-${role}-`))
      .map((channel) => channel.slice(`--ds-material-${role}-`.length));

  it("match the shape panel, card and control already carried", () => {
    expect(facetsOf("panel").sort()).toEqual([...FACETS].sort());
    expect(facetsOf("raised").sort()).toEqual([...FACETS].sort());
    // Overlay is short its three ink facets: producing them puts overlay ink
    // under the APCA admission floor and fails shipped tenant documents
    // closed. The deriver's header carries the measurement.
    expect(facetsOf("overlay").sort()).toEqual(
      [
        ...FACETS.filter((facet) => !facet.startsWith("foreground")),
        "opaque",
      ].sort()
    );
  });

  /**
   * Byte-equal to what the semantic-surface role table and the nine reading
   * skins resolved to before any of these roots existed. A change here is a
   * pixel change, not a refactor.
   */
  it("rest at the value their readers already resolved to", () => {
    const channels = deriveMaterialChannels(NEUTRAL);
    expect(channels).toMatchObject({
      "--ds-material-overlay-background-hover":
        "var(--ds-material-overlay-background, var(--ds-surface-overlay))",
      "--ds-material-overlay-border-strong":
        "var(--ds-material-overlay-border, transparent)",
      "--ds-material-overlay-border-selected":
        "var(--ds-material-overlay-border-strong, var(--ds-material-overlay-border, transparent))",
      "--ds-material-overlay-focus-ring":
        "var(--ds-focus-ring, var(--ds-shadow-focus-ring))",
      "--ds-material-overlay-shadow-hover":
        "var(--ds-material-overlay-shadow, none)",
      "--ds-material-raised-background-disabled":
        "var(--ds-material-raised-background, var(--ds-surface-raised))",
      "--ds-material-raised-border": "transparent",
      "--ds-material-raised-border-hover":
        "var(--ds-material-raised-border, transparent)",
      "--ds-material-raised-shadow": "none",
      "--ds-material-raised-shadow-active":
        "var(--ds-material-raised-shadow, none)",
    });
  });

  /**
   * Five distinct readings of `overlay-border` across six families, five of
   * `overlay-shadow`, three of `raised-shadow-selected`, two of
   * `raised-shadow-hover`. A root value would pick a winner and move the other
   * families' pixels, so the channel exists and stays empty until the visual
   * call is made.
   */
  it("leave the four disagreeing facets authorable but valueless", () => {
    const channels = deriveMaterialChannels(NEUTRAL);
    for (const channel of [
      "--ds-material-overlay-border",
      "--ds-material-overlay-shadow",
      "--ds-material-raised-shadow-hover",
      "--ds-material-raised-shadow-selected",
    ]) {
      expect(channels[channel]).toBe("initial");
    }
  });

  it("let a tenant author any of the four and reach every reading family", () => {
    const channels = deriveMaterialChannels({
      id: "authored",
      name: "Authored",
      surfaces: {
        surfaceRoles: {
          overlay: { border: "#0b7", shadow: "0 1px 2px #0002" },
          raised: { shadowHover: "none", shadowSelected: "none" },
        },
      },
    });
    expect(channels["--ds-material-overlay-border"]).toBe("#0b7");
    expect(channels["--ds-material-overlay-shadow"]).toBe("0 1px 2px #0002");
    expect(channels["--ds-material-raised-shadow-hover"]).toBe("none");
    expect(channels["--ds-material-raised-shadow-selected"]).toBe("none");
    // The state facets chain off the resting root, so one decision carries.
    expect(channels["--ds-material-overlay-border-hover"]).toBe(
      "var(--ds-material-overlay-border, transparent)"
    );
    expect(channels["--ds-material-overlay-shadow-selected"]).toBe(
      "var(--ds-material-overlay-shadow, none)"
    );
  });
});
