/**
 * @fileoverview How a tenant row NAMES a style: `{id, version}`, exactly two
 * keys, and the resolution of that pair against the registry.
 *
 * The reference is the whole transport. A style body never travels on a tenant
 * document, and neither does its digest: the digest is the registry's, so a
 * supplied one is a second authority over content the transport does not carry.
 *
 * @module Contracts/Theme/Styles/Reference
 * @category Types
 * @package @rottay/design-system
 */

import {
  ThemeStyleReferenceError,
  type ThemeStyleRecord,
} from "@/contracts/theme/runtime/styles/foundation/document";
import {
  THEME_STYLE_IDS,
  THEME_STYLE_REGISTRY,
  themeStyleKey,
  themeStyleVersions,
  type ThemeStyleId,
} from "@/contracts/theme/runtime/styles/composition/registry";

/** A tenant's selection: the published style and the version of it. */
export interface ThemeStyleReference {
  readonly id: ThemeStyleId;
  readonly version: number;
}

const REFERENCE_KEYS = ["id", "version"];

/**
 * Close the reference's SHAPE, fail-closed and by name.
 *
 * Membership is deliberately not asked here: the registry owns its ids, and
 * `resolveThemeStyle` is where an unknown id earns a refusal that can name the
 * registered ones. This function owns the key set, which nothing downstream
 * re-derives -- an inline body or a supplied digest is refused by the KEY it
 * carried, whatever its value.
 */
export function assertThemeStyleReference(
  value: unknown,
  context = "style"
): ThemeStyleReference {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ThemeStyleReferenceError(
      `${context} must be an object of ${REFERENCE_KEYS.join(", ")}; got ${JSON.stringify(value)}`
    );
  }
  const candidate = value as Record<string, unknown>;
  for (const key of Object.keys(candidate)) {
    if (REFERENCE_KEYS.includes(key)) continue;
    throw new ThemeStyleReferenceError(
      `unsupported key ${JSON.stringify(key)} in ${context}; a style is named by {id, version}, never carried`
    );
  }
  const { id, version } = candidate;
  if (typeof id !== "string" || id.length === 0) {
    throw new ThemeStyleReferenceError(
      `${context}.id must be a non-empty string; got ${JSON.stringify(id)}`
    );
  }
  if (!Number.isSafeInteger(version) || (version as number) <= 0) {
    throw new ThemeStyleReferenceError(
      `${context}.version must be a positive integer; got ${JSON.stringify(version)}`
    );
  }
  return { id, version: version as number };
}

/**
 * The publication a reference names, or a refusal that says what exists.
 *
 * Two refusals, not one: an unknown id and an unavailable version are different
 * mistakes and a reader fixes them differently, so the first names the registry
 * and the second names the versions that id actually has.
 */
export function resolveThemeStyle(ref: ThemeStyleReference): ThemeStyleRecord {
  const reference = assertThemeStyleReference(ref);
  const record = THEME_STYLE_REGISTRY[themeStyleKey(reference)];
  if (record) return record;
  const versions = themeStyleVersions(reference.id);
  if (versions.length === 0) {
    throw new ThemeStyleReferenceError(
      `unknown style ${JSON.stringify(reference.id)}; the registry is ${THEME_STYLE_IDS.join(" | ")}`
    );
  }
  throw new ThemeStyleReferenceError(
    `style ${JSON.stringify(reference.id)} has no version ${reference.version}; the registered versions are ${versions.join(", ")}`
  );
}
