/**
 * @fileoverview The density-scope projection: which channels a `[data-density]:not(:root)`
 * boundary re-declares, and at what value.
 *
 * @module Compilers/Theme/Lowering/Runtime/density-scope
 * @category Compilers
 * @package @rottay/design-system
 */

import type { ThemeCompilationDensityScopeBlock } from "@/foundation/contracts/composition/tenants/themes/compiled";
import {
  DENSITY_GLOBAL_EFFECTIVE_SCALE_VARIABLE,
  DENSITY_LOCAL_FACTOR_VARIABLE,
} from "@/foundation/tokens/ts/foundation/base/density";
import {
  channelMatches,
  MERGE_RANK,
  type FamilyDeriver,
} from "../../foundation/contract";

const DENSITY_SCOPE_FACTORS = new Set<string>([
  DENSITY_LOCAL_FACTOR_VARIABLE,
  DENSITY_GLOBAL_EFFECTIVE_SCALE_VARIABLE,
  "--ds-density-effective-scale",
]);

/** A name a density boundary re-declares for its subtree: the scale chain and the spacing ramp. */
export function isDensityScopeName(name: string): boolean {
  return DENSITY_SCOPE_FACTORS.has(name) || /^--ds-spacing-[a-z0-9-]+$/.test(name);
}

/** Every custom property `value` reads. */
export function referencedNames(value: string): string[] {
  return [...value.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)].map((match) => match[1]);
}

/** The channels of one block that re-resolve at a boundary, directly or through the block's own channels. */
export function densityScopeExposed(channels: Readonly<Record<string, string>>): Set<string> {
  const exposed = new Set<string>();
  for (let grew = true; grew; ) {
    grew = false;
    for (const [channel, value] of Object.entries(channels)) {
      if (exposed.has(channel)) continue;
      if (referencedNames(value).some((name) => isDensityScopeName(name) || exposed.has(name))) {
        exposed.add(channel);
        grew = true;
      }
    }
  }
  return exposed;
}

export function claimsDensityScope(deriver: FamilyDeriver): boolean {
  return deriver.scopes?.includes("density") === true;
}

/** Judged on the claiming family's OWN value (a run capped at its rank), so a higher-rank
 *  statement is carried at its final value rather than dropping the channel. */
export function densityScopeMembers(
  derivers: readonly FamilyDeriver[],
  lower: (derivers: readonly FamilyDeriver[]) => Readonly<Record<string, string>>
): string[] {
  const claiming = derivers.filter(claimsDensityScope);
  const members = new Set<string>();
  for (const rank of new Set(claiming.map((deriver) => MERGE_RANK[deriver.rank]))) {
    const own = lower(derivers.filter((deriver) => MERGE_RANK[deriver.rank] <= rank));
    const exposed = densityScopeExposed(own);
    for (const deriver of claiming.filter((candidate) => MERGE_RANK[candidate.rank] === rank)) {
      for (const channel of Object.keys(own)) {
        if (!exposed.has(channel)) continue;
        if (deriver.produces.some((pattern) => channelMatches(channel, pattern))) members.add(channel);
      }
    }
    for (const channel of members) {
      const through = referencedNames(own[channel] ?? "").filter(
        (name) => exposed.has(name) && !members.has(name)
      );
      if (through.length > 0) {
        throw new Error(
          `density scope: ${channel} re-resolves only through ${through.join(", ")}, which no boundary re-declares`
        );
      }
    }
  }
  return [...members].sort();
}

/** The boundary block at FINAL values; a mode or contrast rule restating a member would lose
 *  inside every boundary, so it is refused. */
export function projectDensityScopeBlock(
  final: Readonly<Record<string, string>>,
  members: readonly string[],
  restating: readonly { readonly label: string; readonly cssVariables: Readonly<Record<string, string>> }[]
): ThemeCompilationDensityScopeBlock | undefined {
  for (const block of restating) {
    const restated = members.filter((channel) => channel in block.cssVariables);
    if (restated.length > 0) {
      throw new Error(
        `density scope: the ${block.label} block restates ${restated.join(", ")}; one boundary block cannot carry it`
      );
    }
  }
  const cssVariables = Object.fromEntries(
    members.filter((channel) => channel in final).map((channel) => [channel, final[channel] as string])
  );
  return Object.keys(cssVariables).length > 0 ? { cssVariables } : undefined;
}
