/**
 * The `view-mode-switcher` contract: the family owns zero paint channels, so
 * the honest deriver produces the empty set — and the tests below pin that
 * emptiness to the skin it is measured from, so a future channel has to arrive
 * as an honest claim instead of drifting in.
 *
 * This is the `header-surface` ruling reached from the opposite direction. That
 * family reads no channel because everything it renders belongs to a component
 * it composes; this one reads no channel because its wrapper's second recessed
 * frame was retired and the certified Segmented it IS owns every remaining
 * surface. Same verdict, two different measurements, and both are on file.
 *
 * Registration in FAMILY_DERIVERS is the DT's line at integration and is
 * deliberately NOT asserted here; the precedence case proves the registry path
 * by running the deriver through runDerivation directly.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { deriveViewModeSwitcherChannels, viewModeSwitcherChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/view-mode-switcher/index.css",
  ),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * The battery every family survives, generated from the shared template rather
 * than restated here: a contract each family words for itself is a contract
 * each family can quietly weaken.
 */
const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: firstPartyFixture("rottay") },
  { label: "bithire", theme: firstPartyFixture("bithire") },
  { label: "evnto", theme: firstPartyFixture("evnto") },
  { label: "minimal", theme: MINIMAL_THEME },
  {
    label: "bithire under a tenant floor",
    theme: firstPartyFixture("bithire"),
    tenant: FIXTURE_TENANT_FACTS,
  },
  { label: "minimal under a tenant floor", theme: MINIMAL_THEME, tenant: FIXTURE_TENANT_FACTS },
];

describeFamilyContract(viewModeSwitcherChromeDeriver, FIXTURES);

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/view-mode-switcher", () => {
  it("is the view-mode-switcher family at rank derived", () => {
    expect(viewModeSwitcherChromeDeriver.family).toBe("view-mode-switcher");
    expect(viewModeSwitcherChromeDeriver.rank).toBe("derived");
  });

  it("produces the empty set, and derive emits exactly what it declares", () => {
    expect(viewModeSwitcherChromeDeriver.produces).toEqual([]);
    const derived = viewModeSwitcherChromeDeriver.derive(context(), {});
    expect(derived).toEqual(deriveViewModeSwitcherChannels());
    expect(Object.keys(derived).sort()).toEqual(
      [...viewModeSwitcherChromeDeriver.produces].sort(),
    );
  });

  it("names only its own family namespace", () => {
    for (const channel of viewModeSwitcherChromeDeriver.produces) {
      expect(channel.startsWith("--ds-view-mode-switcher-")).toBe(true);
    }
  });

  it("keeps produces honest against the skin: it reads zero --ds-view-mode-switcher-* names", () => {
    // Drift guard: the measured reason for the empty set is that the skin
    // reads no family channel. The day the skin grows one, this test fails
    // and the deriver must grow the producer in the same change.
    expect(SKIN.match(/--ds-view-mode-switcher-/gu)).toBeNull();
  });

  it("measures the skin as zero-channel by design: no var(--ds-*) read exists to drain", () => {
    expect(SKIN.match(/var\(\s*--ds-/gu)).toBeNull();
  });

  /**
   * The ruling's other half, and the one a read-count alone would miss: the
   * file owns no SURFACE either. A skin that grew a ground, a frame or a
   * corner would have something for a channel to key to, and the empty
   * `produces` would stop being the honest answer.
   */
  it("owns layout only: no ground, no frame, no corner, no state", () => {
    expect(SKIN).not.toMatch(/\b(?:background|border|box-shadow|border-radius)\s*:/u);
    expect(SKIN).not.toMatch(/\[data-state/u);
  });

  it("yields to a higher-ranked statement of a family channel once registered", () => {
    const stated: FamilyDeriver = {
      family: "stated-tenant",
      rank: "tenant",
      consumes: ["chrome.*"],
      produces: ["--ds-view-mode-switcher-probe"],
      derive: () => ({ "--ds-view-mode-switcher-probe": "tenant" }),
    };
    const result = runDerivation(context(), [viewModeSwitcherChromeDeriver, stated]);
    expect(Object.keys(result.channels)).toEqual(["--ds-view-mode-switcher-probe"]);
    expect(result.channels["--ds-view-mode-switcher-probe"]).toBe("tenant");
    expect(result.provenance.get("--ds-view-mode-switcher-probe")).toEqual({
      family: "stated-tenant",
      rank: "tenant",
    });
  });
});
