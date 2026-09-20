/**
 * The FamilyDeriver contract, run over every registered family, plus the two
 * registry-wide invariants no single family can check about itself.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { MERGE_RANK, type FamilyDeriver } from "../foundation/contract";
import { FAMILY_DERIVERS } from "../runtime/derivation";
import { buildLoweringContext } from "../runtime/pipeline";
import { buildRecipeManifest } from "@/infrastructure/runtime/foundation/recipes/manifest";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import { SHELL_PUBLISHED_CHANNELS } from "@/components/structures/shell/contracts";
import {
  SECTION_CARD_CHANNEL_PREFIX,
  SECTION_CARD_PUBLISHED_CHANNELS,
} from "@/infrastructure/runtime/foundation/recipes/contracts/families";

const bithireFlatTheme = firstPartyFixture('bithire');
const evntoFlatTheme = firstPartyFixture('evnto');
const rottayFlatTheme = firstPartyFixture('rottay');

const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: rottayFlatTheme },
  { label: "bithire", theme: bithireFlatTheme },
  { label: "evnto", theme: evntoFlatTheme },
  { label: "minimal", theme: MINIMAL_THEME },
  {
    label: "bithire under a tenant floor",
    theme: bithireFlatTheme,
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

// Inherited pre-wave channel names exempt from the family-namespace rule.
// --ds-form-action-dock-reserved-space is named for the SHARED form action
// dock, not the form-surface family, but it has been tenant-facing since
// 2026-07 (71f57d91a), ships in three facade artifacts and has exactly one
// consumer (the form-surface skin). Renaming it is unsafe, so the channel
// stays until a versioned break. Frozen set of one: any NEW stray name must
// still fail the namespace check.
const INHERITED_PREWAVE_CHANNELS: ReadonlySet<string> = new Set([
  "--ds-form-action-dock-reserved-space",
]);

/**
 * Bands a family produces under a name it does not own, because the name is a
 * cross-owner contract that owner declares and other owners read.
 *
 * An entry is the DECLARED constant, never a copied list: the exemption is
 * whatever the owner publishes today, so a channel silently added to the
 * family's private chrome is still a stray. `app-shell` keeps the five
 * track/cadence names of `SHELL_PUBLISHED_CHANNELS` it produces — four shell
 * skins, the responsive channel contract, `chrome-variables` and three
 * applications read them, and `static-db-channel-vocabulary` pins two as the
 * static/DB parity vocabulary. Its own chrome is `--ds-app-shell-*`.
 *
 * `surface-chrome` keeps all four of `SECTION_CARD_PUBLISHED_CHANNELS`. The
 * declaring owner is the governed section-card recipe, and the declaration
 * ships: `buildRecipeManifest()` is exported from the package root and states
 * `--ds-section-card-` as the namespace a tenant may own for that family,
 * alongside the generated `ds-section-card` class root the same recipe emits.
 * The band is the one place the two registries meet — a recipe family and a
 * deriver family that do not share a name — so renaming the channels would
 * not tidy an owner, it would make a published prefix govern nothing.
 */
const DECLARED_PUBLISHED_BANDS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["app-shell", new Set<string>(SHELL_PUBLISHED_CHANNELS)],
  ["surface-chrome", new Set<string>(SECTION_CARD_PUBLISHED_CHANNELS)],
]);

const isNamespaceStray = (family: string, channel: string): boolean =>
  channel !== `--ds-${family}` &&
  !channel.startsWith(`--ds-${family}-`) &&
  !INHERITED_PREWAVE_CHANNELS.has(channel) &&
  !DECLARED_PUBLISHED_BANDS.get(family)?.has(channel);

const collectNamespaceStrays = (
  derivers: readonly FamilyDeriver[],
  chromeFamilies: ReadonlySet<string>,
  fixtures: readonly FamilyFixture[],
): string[] => {
  const strays: string[] = [];
  for (const fixture of fixtures) {
    const context = buildLoweringContext({
      theme: fixture.theme,
      tenant: fixture.tenant,
    });
    for (const deriver of derivers) {
      if (!chromeFamilies.has(deriver.family)) continue;
      for (const channel of Object.keys(deriver.derive(context, {}))) {
        if (isNamespaceStray(deriver.family, channel)) {
          strays.push(`${deriver.family} produces ${channel}`);
        }
      }
    }
  }
  return [...new Set(strays)].sort();
};

describe("the family registry", () => {
  const chromeFamilies = (): Set<string> => {
    const root = join(
      dirname(fileURLToPath(import.meta.url)),
      "../runtime/derivation/chrome",
    );
    return new Set(
      readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
    );
  };

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

  it("keeps every family chrome deriver inside its own channel namespace", () => {
    expect(collectNamespaceStrays(FAMILY_DERIVERS, chromeFamilies(), FIXTURES)).toEqual([]);
  });

  it("still flags a planted stray channel outside the carve-out", () => {
    const planted: FamilyDeriver[] = [
      {
        family: "form-surface",
        rank: "derived",
        consumes: [],
        produces: [],
        derive: () => ({ "--ds-planted-cross-family-channel": "1px" }),
      },
    ];
    expect(
      collectNamespaceStrays(planted, new Set(["form-surface"]), FIXTURES),
    ).toEqual(["form-surface produces --ds-planted-cross-family-channel"]);
    expect(
      isNamespaceStray("form-surface", "--ds-form-action-dock-reserved-space"),
    ).toBe(false);
    // The published band admits the names its owner declares and nothing else:
    // a private chrome name in the same prefix is still a stray.
    expect(isNamespaceStray("app-shell", "--ds-shell-sidebar-width")).toBe(false);
    expect(isNamespaceStray("app-shell", "--ds-shell-header-radius")).toBe(true);
    expect(isNamespaceStray("page-shell", "--ds-shell-sidebar-width")).toBe(true);
    // The same three readings for the recipe-declared band: admitted for its
    // owner, refused for a name inside the published prefix that no owner
    // declared, refused for a family the prefix was never published to.
    expect(isNamespaceStray("surface-chrome", "--ds-section-card-icon-size")).toBe(false);
    expect(isNamespaceStray("surface-chrome", "--ds-section-card-header-bg")).toBe(true);
    expect(isNamespaceStray("page-shell", "--ds-section-card-icon-size")).toBe(true);
  });

  it("binds each published band to the owner that declares it", () => {
    // The band is only an exemption because someone else publishes the name.
    // Every admitted section-card channel has to sit inside the prefix the
    // public recipe manifest states, or the exemption has no author.
    for (const channel of SECTION_CARD_PUBLISHED_CHANNELS) {
      expect(channel.startsWith(SECTION_CARD_CHANNEL_PREFIX)).toBe(true);
    }
    const section = buildRecipeManifest().families.find(
      (entry) => entry.name === "sectionCard",
    );
    expect(section?.customPropertyPrefix).toBe(SECTION_CARD_CHANNEL_PREFIX);

    // And the band is exactly what its family produces: a channel dropped from
    // the deriver may not linger as a standing exemption.
    const surfaceChrome = FAMILY_DERIVERS.find(
      (deriver) => deriver.family === "surface-chrome",
    );
    expect([...(surfaceChrome?.produces ?? [])].sort()).toEqual(
      [...SECTION_CARD_PUBLISHED_CHANNELS].sort(),
    );
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
