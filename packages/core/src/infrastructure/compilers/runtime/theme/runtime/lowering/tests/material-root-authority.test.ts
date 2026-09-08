/**
 * The 71 material roots have ONE table.
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

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { SEMANTIC_SURFACE_ROLES } from "@/foundation/contracts/kernel/tokens/materials";
import {
  bithireBrandTheme,
  evntoBrandTheme,
  rottayBrandTheme,
} from "@/foundation/tokens/ts/presentation/brand-themes";
import { deriveMaterialChannels } from "../runtime/derivation/materials";
import { lowerBlock } from "../runtime/pipeline";

const DEFAULT_THEME_CSS = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../../../../foundation/tokens/css/foundation/themes/default/index.css"
);

const NEUTRAL: BrandTheme = { id: "neutral", name: "Neutral" };

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
  it("are the same 71 names in the foundation fallback and in the deriver", () => {
    const derived = Object.keys(deriveMaterialChannels(NEUTRAL)).sort();
    expect(derived).toHaveLength(71);
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
    for (const theme of [rottayBrandTheme, bithireBrandTheme, evntoBrandTheme]) {
      const emitted = Object.keys(lowerBlock({ theme })).filter((channel) =>
        channel.startsWith("--ds-material-")
      );
      expect(expected.every((channel) => emitted.includes(channel))).toBe(true);
    }
  });

  it("let an authored surface role override its own facet without dropping a root", () => {
    const authored: BrandTheme = {
      id: "authored",
      name: "Authored",
      surfaces: { surfaceRoles: { card: { backgroundHover: "#123456" } } },
    };
    const channels = deriveMaterialChannels(authored);
    expect(channels["--ds-material-card-background-hover"]).toBe("#123456");
    expect(Object.keys(channels)).toHaveLength(71);
  });
});
