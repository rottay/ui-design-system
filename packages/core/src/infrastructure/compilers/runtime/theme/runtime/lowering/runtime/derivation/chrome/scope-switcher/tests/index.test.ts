/**
 * The `scope-switcher` contract: the namespace this cut created, pinned to the
 * skin it was measured from. The family had NO channels of its own before
 * WO-FAM-11 sub-lot E — twelve root-token reads and a read-without-producer
 * count of zero that said nothing was owed only because nothing was asked.
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
import { deriveScopeSwitcherChannels, scopeSwitcherChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/scope-switcher/index.css",
  ),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

const readBySkin = new Set(
  [...SKIN.matchAll(/var\(\s*(--ds-scope-switcher-[a-z0-9-]+)/gu)].map((m) => m[1]!),
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

describeFamilyContract(scopeSwitcherChromeDeriver, FIXTURES);

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/scope-switcher", () => {
  it("is the scope-switcher family at rank derived", () => {
    expect(scopeSwitcherChromeDeriver.family).toBe("scope-switcher");
    expect(scopeSwitcherChromeDeriver.rank).toBe("derived");
  });

  it("derive emits exactly what it declares, and nothing else", () => {
    const derived = scopeSwitcherChromeDeriver.derive(context(), {});
    expect(derived).toEqual(deriveScopeSwitcherChannels());
    expect(Object.keys(derived).sort()).toEqual(
      [...scopeSwitcherChromeDeriver.produces].sort(),
    );
  });

  it("names only its own family namespace", () => {
    for (const channel of scopeSwitcherChromeDeriver.produces) {
      expect(channel.startsWith("--ds-scope-switcher-")).toBe(true);
    }
  });

  /**
   * Both directions, because only one of them catches each failure: a channel
   * the skin reads and nobody writes is the debt this cut exists to remove,
   * and a channel produced that nothing reads is the mirror defect the census
   * found on `command-palette` (8 producers, 0 readers).
   */
  it("produces every channel the skin reads, and reads every channel it produces", () => {
    expect([...readBySkin].sort()).toEqual([...scopeSwitcherChromeDeriver.produces].sort());
  });

  /**
   * The private overflow-fade hook is family-private opt-in (`--_ds-` prefix),
   * so it is deliberately NOT a published channel: a tenant states the fade by
   * declaring it, and the deriver has no default to impose.
   */
  it("leaves the private overflow-fade hook out of the published namespace", () => {
    expect(SKIN).toContain("--_ds-scope-switcher-overflow-fade");
    for (const channel of scopeSwitcherChromeDeriver.produces) {
      expect(channel.startsWith("--_")).toBe(false);
    }
  });

  /**
   * Paint identity: each published value is the literal the skin falls back to,
   * measured from the file rather than restated, so creating the namespace
   * moves no pixel on any ground that predates the deriver.
   */
  it("publishes every channel at the skin's own fallback value", () => {
    const v = deriveScopeSwitcherChannels();
    let compared = 0;
    for (const [channel, value] of Object.entries(v)) {
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
    expect(compared).toBe(scopeSwitcherChromeDeriver.produces.length);
  });

  /**
   * The pill radius and the count weight now come from the cascade rather than
   * from the file — `999px` and `700` were the family stating two decisions
   * the token roots already own.
   */
  it("takes the pill radius and the numeric weight from the cascade", () => {
    const v = deriveScopeSwitcherChannels();
    expect(v["--ds-scope-switcher-count-radius"]).toBe("var(--ds-radius-full)");
    expect(v["--ds-scope-switcher-count-font-weight"]).toBe("var(--ds-font-weight-bold)");
    expect(SKIN).not.toMatch(/999px/u);
  });

  /** The strip is flat by ruling: no elevation channel may appear here. */
  it("states no elevation channel", () => {
    for (const channel of scopeSwitcherChromeDeriver.produces) {
      expect(channel).not.toMatch(/shadow|elevation/u);
    }
  });

  it("yields to a higher-ranked statement of a family channel", () => {
    const stated: FamilyDeriver = {
      family: "stated-tenant",
      rank: "tenant",
      consumes: ["chrome.*"],
      produces: ["--ds-scope-switcher-background"],
      derive: () => ({ "--ds-scope-switcher-background": "tenant" }),
    };
    const result = runDerivation(context(), [scopeSwitcherChromeDeriver, stated]);
    expect(result.channels["--ds-scope-switcher-background"]).toBe("tenant");
    expect(result.provenance.get("--ds-scope-switcher-background")).toEqual({
      family: "stated-tenant",
      rank: "tenant",
    });
    expect(result.provenance.get("--ds-scope-switcher-count-color")).toEqual({
      family: "scope-switcher",
      rank: "derived",
    });
  });
});
