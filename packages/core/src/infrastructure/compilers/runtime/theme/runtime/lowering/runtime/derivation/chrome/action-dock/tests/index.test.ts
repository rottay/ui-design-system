/**
 * The `action-dock` contract: the thirteen channels the skin reads under the
 * family's own namespace now have a producer, at the value the skin itself
 * stated — so the drain is proven to be a cascade repair and not a repaint,
 * and the skin is pinned to the deriver so neither side can drift alone.
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
import { actionDockChromeDeriver, deriveActionDockChannels } from "..";

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/action-dock/index.css",
  ),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

/** Every `--ds-action-dock-*` name the skin READS, and every one it DECLARES. */
const readBySkin = new Set(
  [...SKIN.matchAll(/var\(\s*(--ds-action-dock-[a-z0-9-]+)/gu)].map((m) => m[1]!),
);
const declaredBySkin = new Set(
  [...SKIN.matchAll(/(--ds-action-dock-[a-z0-9-]+)\s*:/gu)].map((m) => m[1]!),
);

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

describeFamilyContract(actionDockChromeDeriver, FIXTURES);

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/action-dock", () => {
  it("is the action-dock family at rank derived", () => {
    expect(actionDockChromeDeriver.family).toBe("action-dock");
    expect(actionDockChromeDeriver.rank).toBe("derived");
  });

  it("derive emits exactly what it declares, and nothing else", () => {
    const derived = actionDockChromeDeriver.derive(context(), {});
    expect(derived).toEqual(deriveActionDockChannels());
    expect(Object.keys(derived).sort()).toEqual(
      [...actionDockChromeDeriver.produces].sort(),
    );
  });

  it("names only its own family namespace", () => {
    for (const channel of actionDockChromeDeriver.produces) {
      expect(channel.startsWith("--ds-action-dock-")).toBe(true);
    }
  });

  /**
   * The drain, measured rather than asserted in prose: every family channel
   * the skin reads and does not declare itself is produced here. The two
   * reservation hooks (`--ds-action-dock-reserved-block-start` / `-end`) are
   * declared BY the skin as a published contract other surfaces consume, so
   * they are excluded — a deriver that also emitted them would be a second
   * authority for a name the skin already owns.
   */
  it("produces every family channel the skin reads and does not declare itself", () => {
    const owed = [...readBySkin].filter((name) => !declaredBySkin.has(name)).sort();
    expect(owed).toEqual([...actionDockChromeDeriver.produces].sort());
  });

  it("leaves the skin's own reservation contract to the skin", () => {
    expect([...declaredBySkin].sort()).toEqual([
      "--ds-action-dock-reserved-block-end",
      "--ds-action-dock-reserved-block-start",
    ]);
    for (const name of declaredBySkin) {
      expect(actionDockChromeDeriver.produces).not.toContain(name);
    }
  });

  /**
   * Paint identity: each published value is the literal the skin was already
   * falling back to, so adopting the channel moves no pixel. Spelled per
   * channel rather than as a loop, because the point is the VALUES.
   */
  it("publishes each channel at the resting value the skin already painted", () => {
    const v = deriveActionDockChannels();
    expect(v["--ds-action-dock-bg"]).toBe(
      "color-mix(in srgb, var(--ds-color-bg-primary) 90%, transparent)",
    );
    expect(v["--ds-action-dock-backdrop-filter"]).toBe("blur(var(--ds-glass-blur, 8px))");
    expect(v["--ds-action-dock-edge-color"]).toBe(
      "var(--ds-color-border-primary, transparent)",
    );
    expect(v["--ds-action-dock-edge-highlight"]).toBe(
      "color-mix(in srgb, var(--ds-color-bg-elevated) 72%, transparent)",
    );
    expect(v["--ds-action-dock-shadow-top"]).toBe("var(--ds-shadow-navbar)");
    expect(v["--ds-action-dock-padding-inline"]).toBe("var(--ds-spacing-4, 1rem)");
    expect(v["--ds-action-dock-padding-block"]).toBe("var(--ds-spacing-3, 0.75rem)");
    expect(v["--ds-action-dock-gap"]).toBe("var(--ds-spacing-3, 0.75rem)");
    expect(v["--ds-action-dock-z-index"]).toBe("var(--ds-z-index-fixed, 1200)");
    expect(v["--ds-action-dock-sticky-z-index"]).toBe("var(--ds-z-index-sticky, 1100)");
    expect(v["--ds-action-dock-safe-area-top"]).toBe(
      "var(--ds-safe-area-top, env(safe-area-inset-top, 0px))",
    );
    expect(v["--ds-action-dock-safe-area-bottom"]).toBe(
      "var(--ds-safe-area-bottom, env(safe-area-inset-bottom, 0px))",
    );
  });

  /**
   * Every published value the skin reads back is byte-identical to the literal
   * that read was falling back to. This is the drain's whole safety claim, and
   * it is measured from the file rather than restated.
   */
  it("matches the skin's own fallback text for every channel it adopts", () => {
    const v = deriveActionDockChannels();
    let compared = 0;
    for (const [channel, value] of Object.entries(v)) {
      // `var( --ds-x , FALLBACK )` — whitespace-tolerant, balanced to the
      // matching close paren so a nested color-mix() is read whole.
      const opener = new RegExp(`var\\(\\s*${channel}\\s*,`, "u").exec(SKIN);
      expect(opener, `${channel} must be read by the skin`).not.toBeNull();
      const open = opener!.index;
      let depth = 0;
      let end = -1;
      for (let i = open; i < SKIN.length; i += 1) {
        if (SKIN[i] === "(") depth += 1;
        else if (SKIN[i] === ")") {
          depth -= 1;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      const fallback = SKIN.slice(open + opener![0].length, end)
        .replace(/\s+/gu, " ")
        .trim();
      expect(fallback, `${channel} fallback must equal its published value`).toBe(
        value.replace(/\s+/gu, " ").trim(),
      );
      compared += 1;
    }
    // A loop that silently matched nothing would pass; this is what stops it.
    expect(compared).toBe(actionDockChromeDeriver.produces.length);
  });

  /**
   * The two names this skin reads that this cut does NOT produce, pinned so a
   * later reading of "readWithoutProducer = 2" cannot be mistaken for an
   * oversight: one is a kernel root the token lane owns, the other is stamped
   * per instance by the family's own TSX from the live viewport.
   */
  it("states its residue: the two reads outside the family namespace", () => {
    expect(SKIN).toContain("var(--ds-size-touch-target, 44px)");
    expect(SKIN).toContain("var(--ds-virtual-keyboard-inset, 0px)");
    for (const name of ["--ds-size-touch-target", "--ds-virtual-keyboard-inset"]) {
      expect(actionDockChromeDeriver.produces).not.toContain(name);
    }
  });

  /** The app-shell band the dock sits above is B's published contract, not ours. */
  it("consumes the published shell inset without restating it", () => {
    expect(SKIN).toContain("var(--ds-shell-bottom-inset, 0px)");
    expect(actionDockChromeDeriver.produces).not.toContain("--ds-shell-bottom-inset");
  });

  it("yields to a higher-ranked statement of a family channel", () => {
    const stated: FamilyDeriver = {
      family: "stated-tenant",
      rank: "tenant",
      consumes: ["chrome.*"],
      produces: ["--ds-action-dock-bg"],
      derive: () => ({ "--ds-action-dock-bg": "tenant" }),
    };
    const result = runDerivation(context(), [actionDockChromeDeriver, stated]);
    expect(result.channels["--ds-action-dock-bg"]).toBe("tenant");
    expect(result.provenance.get("--ds-action-dock-bg")).toEqual({
      family: "stated-tenant",
      rank: "tenant",
    });
    // Every other channel still belongs to this family.
    expect(result.provenance.get("--ds-action-dock-gap")).toEqual({
      family: "action-dock",
      rank: "derived",
    });
  });
});
