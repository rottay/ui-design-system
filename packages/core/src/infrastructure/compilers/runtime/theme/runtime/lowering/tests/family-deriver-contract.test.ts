/**
 * The FamilyDeriver contract, run over every registered family, plus the two
 * registry-wide invariants no single family can check about itself.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  bithireBrandTheme,
  evntoBrandTheme,
  rottayBrandTheme,
} from "@/foundation/tokens/ts/presentation/brand-themes";
import { MERGE_RANK } from "../foundation/contract";
import { FAMILY_DERIVERS } from "../runtime/derivation";
import { buildLoweringContext } from "../runtime/pipeline";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";

const MINIMAL_THEME: BrandTheme = { id: "minimal", name: "Minimal" };

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: rottayBrandTheme },
  { label: "bithire", theme: bithireBrandTheme },
  { label: "evnto", theme: evntoBrandTheme },
  { label: "minimal", theme: MINIMAL_THEME },
  {
    label: "bithire under a tenant floor",
    theme: bithireBrandTheme,
    tenant: FIXTURE_TENANT_FACTS,
  },
  {
    label: "minimal under a tenant floor",
    theme: MINIMAL_THEME,
    tenant: FIXTURE_TENANT_FACTS,
  },
];

for (const deriver of FAMILY_DERIVERS) {
  describeFamilyContract(deriver, FIXTURES);
}

describe("the family registry", () => {
  it("gives every family exactly one id", () => {
    const ids = FAMILY_DERIVERS.map((deriver) => deriver.family);
    expect([...new Set(ids)].sort()).toEqual([...ids].sort());
  });

  it("gives every channel exactly one producing family per rank", () => {
    const owners = new Map<string, string>();
    const collisions: string[] = [];
    for (const fixture of FIXTURES) {
      const context = buildLoweringContext({
        theme: fixture.theme,
        tenant: fixture.tenant,
      });
      for (const deriver of FAMILY_DERIVERS) {
        for (const channel of Object.keys(deriver.derive(context, {}))) {
          const key = `${MERGE_RANK[deriver.rank]}:${channel}`;
          const held = owners.get(key);
          if (held === undefined) owners.set(key, deriver.family);
          else if (held !== deriver.family) {
            collisions.push(`${channel} @ rank ${deriver.rank}: ${held} + ${deriver.family}`);
          }
        }
      }
    }
    expect([...new Set(collisions)].sort()).toEqual([]);
  });

  it("has no deriver that imports another deriver", () => {
    const root = join(
      dirname(fileURLToPath(import.meta.url)),
      "../runtime/derivation",
    );
    const offenders: string[] = [];
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const source = readFileSync(join(root, entry.name, "index.ts"), "utf8");
      for (const match of source.matchAll(/from "(\.\.\/[a-z-]+)"/g)) {
        offenders.push(`${entry.name} -> ${match[1]}`);
      }
    }
    expect(offenders.sort()).toEqual([]);
  });

  it("resolves the expressive expansion exactly once, in one file", () => {
    const loweringRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
    const callSites: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "tests") walk(full);
          continue;
        }
        if (!entry.name.endsWith(".ts")) continue;
        const source = readFileSync(full, "utf8");
        for (const match of source.matchAll(/expandExpressiveProfiles\(/g)) {
          callSites.push(`${full}:${source.slice(0, match.index).split("\n").length}`);
        }
      }
    };
    walk(loweringRoot);
    expect(callSites).toHaveLength(1);
    expect(callSites[0]).toContain("foundation/expressive/index.ts");
  });
});
