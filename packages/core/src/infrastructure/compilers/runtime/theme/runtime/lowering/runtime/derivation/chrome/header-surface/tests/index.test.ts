/**
 * The `header-surface` contract: the family owns zero paint channels, so the
 * honest deriver produces the empty set — and the tests below pin that
 * emptiness to the skin it is measured from, so a future channel has to
 * arrive as an honest claim instead of drifting in.
 *
 * Registration in FAMILY_DERIVERS is the DT's line at integration and is
 * deliberately NOT asserted here; the precedence case proves the registry
 * path by running the deriver through runDerivation directly.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { deriveHeaderSurfaceChannels, headerSurfaceChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/layout-header/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/header-surface", () => {
  it("is the header-surface family at rank derived", () => {
    expect(headerSurfaceChromeDeriver.family).toBe("header-surface");
    expect(headerSurfaceChromeDeriver.rank).toBe("derived");
  });

  it("produces the empty set, and derive emits exactly what it declares", () => {
    expect(headerSurfaceChromeDeriver.produces).toEqual([]);
    const derived = headerSurfaceChromeDeriver.derive(context(), {});
    expect(derived).toEqual(deriveHeaderSurfaceChannels());
    expect(Object.keys(derived).sort()).toEqual([...headerSurfaceChromeDeriver.produces].sort());
  });

  it("names only its own family namespace", () => {
    for (const channel of headerSurfaceChromeDeriver.produces) {
      expect(channel.startsWith("--ds-header-surface-")).toBe(true);
    }
  });

  it("keeps produces honest against the skin: layout-header reads zero --ds-header-surface-* names", () => {
    // Drift guard: the measured reason for the empty set is that the skin
    // reads no family channel. The day the skin grows one, this test fails
    // and the deriver must grow the producer in the same change.
    expect(SKIN.match(/--ds-header-surface-/g)).toBeNull();
  });

  it("measures the skin as zero-channel by design: no var(--ds-*) read exists to drain", () => {
    expect(SKIN.match(/var\(\s*--ds-/g)).toBeNull();
  });

  it("yields to a higher-ranked statement of a family channel once registered", () => {
    const stated: FamilyDeriver = {
      family: "stated-tenant",
      rank: "tenant",
      consumes: ["chrome.*"],
      produces: ["--ds-header-surface-probe"],
      derive: () => ({ "--ds-header-surface-probe": "tenant" }),
    };
    const result = runDerivation(context(), [headerSurfaceChromeDeriver, stated]);
    expect(Object.keys(result.channels)).toEqual(["--ds-header-surface-probe"]);
    expect(result.channels["--ds-header-surface-probe"]).toBe("tenant");
    expect(result.provenance.get("--ds-header-surface-probe")).toEqual({
      family: "stated-tenant",
      rank: "tenant",
    });
  });
});
