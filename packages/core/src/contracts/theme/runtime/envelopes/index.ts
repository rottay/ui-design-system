/**
 * @fileoverview The vertical envelope: what a vertical lets a tenant reach.
 *
 * D-28 (b), approved by the owner on 2026-09-05: an envelope states the
 * capabilities, the bounds and the defaults a vertical exposes, and `locked`
 * exists as a mechanism in every case. It is the second half of the catalog
 * door -- `THEME_CONTROL_CATALOG` says WHAT a tenant may decide, this says HOW
 * FAR the vertical lets that decision travel.
 *
 * FENCES.
 * - No import from `infrastructure/**`. This table used to live inside
 *   `compilers/composition/tenant-theme`, which made it unreachable from the
 *   single admission at the compile door without a module cycle: the door
 *   cannot import the terminal that imports the door. A policy only one
 *   transport can read is how the DB path grew a law the preview path did not
 *   have (F-13).
 * - The record is keyed on the CLOSED `FirstPartyVerticalId` union, so a
 *   vertical cannot be quietly left out. `rottay`'s absence was that exact bug.
 *
 * @module Contracts/Theme/Envelopes
 * @category Types
 * @package @rottay/design-system
 */

import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import {
  TENANT_THEME_CHROME_FAMILIES,
  TENANT_THEME_SCHEMA_VERSION,
  type TenantThemeVerticalEnvelope,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";

function deepFreezeTenantThemeValue<T>(value: T): Readonly<T> {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value as Record<string, unknown>))
      deepFreezeTenantThemeValue(child);
    Object.freeze(value);
  }
  return value;
}

/**
 * Code-owned vertical policy registry. Apps resolve the trusted vertical from
 * their tenant directory, then ask this registry for the compilation envelope;
 * neither client payloads nor tenant JSONB can supply or widen this authority.
 */
export const TENANT_THEME_VERTICAL_ENVELOPES = deepFreezeTenantThemeValue({
  /**
   * Rottay's envelope. Its ABSENCE was the bug.
   *
   * `getTenantThemeVerticalEnvelope` fails closed, so a missing key is not an
   * error anyone sees — it silently returns `undefined`. With no `rottay` row,
   * a perfectly legitimate customer tenant (slug `acme`, `verticalKey:
   * 'rottay'`) resolved no envelope and therefore could not compile a theme at
   * all, while bithire and evnto customers could. The roster names three
   * verticals; keying this record on `FirstPartyVerticalId` below means the
   * third one can never again be quietly left out.
   *
   * The ranges are the most conservative of the three on purpose: Rottay is
   * the neutral baseline the other two are read against, so a customer riding
   * it should be able to brand it without being able to restyle it into a
   * different product.
   */
  rottay: {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    verticalKey: "rottay",
    allowedModes: ["simple", "advanced"],
    advanced: {
      chromeFamilies: [...TENANT_THEME_CHROME_FAMILIES],
      allowTokenOverrides: true,
      allowAnatomyVariants: true,
    },
    ranges: {
      densityScale: { min: 0.85, max: 1.15 },
      effectIntensity: { min: 0, max: 0.65 },
      motionIntensity: { min: 0, max: 0.8 },
      motionDurationScale: { min: 0.75, max: 1.35 },
      typeScale: { min: 0.92, max: 1.08 },
      radiusScale: { min: 0.8, max: 1.2 },
    },
  },
  bithire: {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    verticalKey: "bithire",
    allowedModes: ["simple", "advanced"],
    advanced: {
      chromeFamilies: [...TENANT_THEME_CHROME_FAMILIES],
      allowTokenOverrides: true,
      allowAnatomyVariants: true,
    },
    ranges: {
      densityScale: { min: 0.85, max: 1.15 },
      effectIntensity: { min: 0, max: 0.65 },
      motionIntensity: { min: 0, max: 0.8 },
      motionDurationScale: { min: 0.75, max: 1.35 },
      typeScale: { min: 0.92, max: 1.08 },
      radiusScale: { min: 0.8, max: 1.2 },
    },
  },
  evnto: {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    verticalKey: "evnto",
    allowedModes: ["simple", "advanced"],
    advanced: {
      chromeFamilies: [...TENANT_THEME_CHROME_FAMILIES],
      allowTokenOverrides: true,
      allowAnatomyVariants: true,
    },
    ranges: {
      // Capability limits, not defaults. The static Evnto vertical remains the
      // owner of engine, product profile, component anatomy and motion topology.
      densityScale: { min: 0.85, max: 1.15 },
      effectIntensity: { min: 0, max: 0.75 },
      motionIntensity: { min: 0, max: 0.8 },
      motionDurationScale: { min: 0.75, max: 1.35 },
      typeScale: { min: 0.92, max: 1.08 },
      radiusScale: { min: 0.8, max: 1.2 },
    },
  },
  // `Record<FirstPartyVerticalId, ...>`, not `Record<string, ...>`. The open
  // key type is what let this record ship two of the three verticals: with a
  // `string` key nothing states how many rows there must be, so omitting one
  // type-checked exactly like listing it. Keyed on the closed union, a missing
  // vertical is a compile error at this line.
} as const satisfies Readonly<Record<FirstPartyVerticalId, TenantThemeVerticalEnvelope>>);

/**
 * Resolve the envelope of a vertical the type system has already closed.
 *
 * The registry above is `satisfies Readonly<Record<FirstPartyVerticalId,
 * TenantThemeVerticalEnvelope>>`, so for a `FirstPartyVerticalId` the row is
 * PROVEN to exist at compile time. The string-keyed accessor below cannot say
 * that -- it takes untrusted input, so it must fail closed and return
 * `| undefined`. Callers that already hold a first-party id were paying that
 * `undefined` anyway, and were narrowing it with `!` or a cast in each suite.
 * This accessor is a direct index into the satisfies-proven record: the
 * closed-domain invariant is stated once, in the product, where every consumer
 * can see it.
 */
export function getFirstPartyTenantThemeVerticalEnvelope(
  vertical: FirstPartyVerticalId
): TenantThemeVerticalEnvelope {
  return TENANT_THEME_VERTICAL_ENVELOPES[vertical];
}

/**
 * An envelope whose `advanced` policy is present.
 *
 * `advanced` is optional on the contract because a vertical is allowed to admit
 * simple mode only. Every FIRST-PARTY envelope declares it, but that is a
 * runtime fact about the registry's contents, not something the type states --
 * so it gets an assertion rather than a cast.
 */
export type TenantThemeVerticalEnvelopeWithAdvanced =
  TenantThemeVerticalEnvelope & {
    advanced: NonNullable<TenantThemeVerticalEnvelope["advanced"]>;
  };

/**
 * Assert the genuinely-runtime half of the invariant: this envelope declares an
 * `advanced` policy. Shared and exported beside the registry so the check is
 * one declaration rather than a throw re-invented privately per test file, and
 * so the failure names the offending vertical instead of surfacing as a
 * `possibly undefined` at the use site.
 */
export function assertTenantThemeEnvelopeDeclaresAdvanced(
  envelope: TenantThemeVerticalEnvelope
): asserts envelope is TenantThemeVerticalEnvelopeWithAdvanced {
  if (envelope.advanced === undefined) {
    throw new Error(
      `Tenant theme envelope for vertical '${envelope.verticalKey}' declares no advanced policy`
    );
  }
}

/** Resolve a trusted code-owned envelope; unknown verticals fail closed. */
export function getTenantThemeVerticalEnvelope(
  verticalKey: string
): TenantThemeVerticalEnvelope | undefined {
  if (
    !Object.prototype.hasOwnProperty.call(
      TENANT_THEME_VERTICAL_ENVELOPES,
      verticalKey
    )
  )
    return undefined;
  return TENANT_THEME_VERTICAL_ENVELOPES[
    verticalKey as keyof typeof TENANT_THEME_VERTICAL_ENVELOPES
  ];
}

/**
 * The one table that says which envelope range bounds which authored value.
 *
 * Two transports read it. The DB terminal reports against the DOCUMENT keypath
 * a tenant wrote (`$.appearance.typography.scale`); the compile door reports
 * against the THEME keypath the merge produced (`typography.scale`). Before
 * WO-CAT-03 only the first existed, which is why `previewThemeIntent` accepted
 * `typography.scale 100` and `radiusScale 9` that publish refused (F-13).
 */
export const TENANT_THEME_ENVELOPE_RANGES = Object.freeze([
  {
    range: "motionIntensity",
    themePath: "motion.intensity",
    documentPath: "motion.intensity",
  },
  {
    range: "motionDurationScale",
    themePath: "motion.durationScale",
    documentPath: "motion.durationScale",
  },
  {
    range: "typeScale",
    themePath: "typography.scale",
    documentPath: "typography.scale",
  },
  {
    range: "radiusScale",
    themePath: "surfaces.radiusScale",
    documentPath: "shape.radiusScale",
  },
  {
    range: "effectIntensity",
    themePath: "surfaces.effectIntensity",
    documentPath: "surfaces.effectIntensity",
  },
  {
    range: "densityScale",
    themePath: "surfaces.densityScale",
    documentPath: 'advanced.tokenOverrides["--ds-density-scale"]',
  },
] as const satisfies readonly {
  range: keyof NonNullable<TenantThemeVerticalEnvelope["ranges"]>;
  themePath: string;
  documentPath: string;
}[]);

export type TenantThemeEnvelopeRangeRow =
  (typeof TENANT_THEME_ENVELOPE_RANGES)[number];

/**
 * The verdict, stated once.
 *
 * A number outside its declared range is REFUSED, never clamped: the preview
 * used to clamp `radiusScale 5` to `1.25` while publish refused it, so an
 * author saw a theme that could not be saved.
 */
export function isInsideEnvelopeRange(
  value: unknown,
  range: { readonly min: number; readonly max: number } | undefined
): boolean {
  if (typeof value !== "number" || !Number.isFinite(value)) return true;
  if (!range) return true;
  return value >= range.min && value <= range.max;
}
