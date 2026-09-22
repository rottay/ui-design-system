/**
 * @fileoverview The style registry: one row per published `<id>@<version>`.
 *
 * IMMUTABILITY IS STRUCTURAL, not a convention. The key is the composite
 * `<id>@<version>` and there is no code path that reads "the latest version of
 * a style", so republishing content cannot repoint a tenant: the tenant's row
 * names a version, and the only thing that could change what that resolves to
 * is deleting the row, which this owner's coverage test refuses.
 *
 * Every publication is checked HERE, at module load, against the partition it
 * may author and the floor it must clear. A style is authored content inherited
 * by many tenants, so the failure lands on the style author rather than on a
 * tenant who selected a published style.
 *
 * @module Contracts/Theme/Styles/Registry
 * @category Types
 * @package @rottay/design-system
 */

import type { ThemeStyleRecord } from "@/contracts/theme/runtime/styles/foundation/document";
import {
  assertStyleAuthorable,
  assertStyleEmitsSomething,
} from "@/contracts/theme/runtime/styles/runtime/partition";
import { QUIET_PREMIUM_V1 } from "./quiet-premium";

function admit(record: ThemeStyleRecord): ThemeStyleRecord {
  for (const id of record.manifest.rows) {
    assertStyleAuthorable(record.manifest.id, id);
  }
  assertStyleEmitsSomething(record.manifest.id, record.manifest.rows);
  return record;
}

const PUBLICATIONS: readonly ThemeStyleRecord[] = Object.freeze([
  QUIET_PREMIUM_V1,
].map(admit));

/** A registry key. A version is a ROW, never a mutation of a row. */
export function themeStyleKey(ref: {
  readonly id: string;
  readonly version: number;
}): string {
  return `${ref.id}@${ref.version}`;
}

export const THEME_STYLE_REGISTRY: Readonly<Record<string, ThemeStyleRecord>> =
  Object.freeze(
    Object.fromEntries(
      PUBLICATIONS.map((record) => [themeStyleKey(record.ref), record])
    )
  );

/**
 * The closed id vocabulary, DERIVED from the registry rather than listed a
 * second time. The registry is the authority; a second list is a second
 * authority with a different rot schedule.
 */
export const THEME_STYLE_IDS: readonly string[] = Object.freeze([
  ...new Set(PUBLICATIONS.map((record) => record.ref.id)),
]);

export type ThemeStyleId = (typeof THEME_STYLE_IDS)[number];

/** Every version registered for one id, ascending. Empty for an unknown id. */
export function themeStyleVersions(id: string): readonly number[] {
  return PUBLICATIONS.filter((record) => record.ref.id === id)
    .map((record) => record.ref.version)
    .sort((left, right) => left - right);
}
