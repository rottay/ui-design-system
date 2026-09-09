/**
 * @fileoverview The admission catalog for instance-level surface visual selections.
 * @description One catalog, one precedence: an instance selection is admitted
 * only when its value is in the catalog AND the tenant has left that channel
 * undecided. It can therefore narrow a default; it can never contradict a
 * tenant.
 *
 * @remarks
 * Every field of `SurfaceVisualOverrides` appears twice here on purpose:
 *
 * - `SURFACE_VISUAL_OVERRIDE_CATALOG` states the finite value domain, so an
 *   app cannot smuggle an unmodelled value (`density: 'ultra'`) through a
 *   config object into surface layout decisions.
 * - `SURFACE_VISUAL_OVERRIDE_TENANT_CHANNELS` states which tenant personality
 *   channel each field speaks for, so subordination is a lookup rather than a
 *   convention. A field with no channel would be a field the tenant cannot
 *   outrank, which is the defect this module exists against.
 *
 * Both are typed `Record<keyof SurfaceVisualOverrides, …>`, so adding a
 * fourteenth override field without declaring its domain and its channel does
 * not compile.
 */

import type { PersonalityTokens } from '@/foundation/contracts/kernel/tokens/personality';
import type { TenantConfig } from '@/foundation/contracts';
import { tenantDecidedChannels } from '@/infrastructure/runtime/tenant/foundation/configuration/registry';

import type { SurfaceVisualOverrides } from '../../../../contracts';

/** A `dimension.field` address inside the resolved personality graph. */
export type TenantPersonalityChannel =
  | `animation.${keyof PersonalityTokens['animation'] & string}`
  | `typography.${keyof PersonalityTokens['typography'] & string}`
  | `accent.${keyof PersonalityTokens['accent'] & string}`
  | `card.${keyof PersonalityTokens['card'] & string}`;

/** The admitted value domain of one instance selection. */
export type SurfaceVisualOverrideAdmission =
  | { readonly kind: 'enum'; readonly values: readonly (string | boolean)[] }
  | { readonly kind: 'milliseconds'; readonly min: number; readonly max: number };

/**
 * The finite domain of every instance selection.
 *
 * The two millisecond fields are bounded rather than enumerated because a
 * duration is genuinely continuous; the bounds are the same ones the motion
 * vocabulary treats as expressible (0 = off, 4000ms = the longest entrance a
 * surface may claim). An out-of-range number is refused, not clamped: a
 * silently clamped value is a decision nobody made.
 */
export const SURFACE_VISUAL_OVERRIDE_CATALOG: Readonly<
  Record<keyof SurfaceVisualOverrides, SurfaceVisualOverrideAdmission>
> = Object.freeze({
  density: { kind: 'enum', values: Object.freeze(['compact', 'comfortable', 'spacious']) },
  cardVariant: { kind: 'enum', values: Object.freeze(['outlined', 'elevated', 'filled', 'ghost']) },
  sectionSpacing: { kind: 'enum', values: Object.freeze(['sm', 'md', 'lg']) },
  headerWeight: { kind: 'enum', values: Object.freeze(['lighter', 'normal', 'heavier']) },
  animateEntrance: { kind: 'enum', values: Object.freeze([true, false]) },
  entranceStyle: { kind: 'enum', values: Object.freeze(['none', 'fade', 'slideUp', 'spring', 'bounce']) },
  entranceDuration: { kind: 'milliseconds', min: 0, max: 4000 },
  staggerDelay: { kind: 'milliseconds', min: 0, max: 4000 },
  badgeShape: { kind: 'enum', values: Object.freeze(['rounded', 'pill', 'square']) },
  labelStyle: { kind: 'enum', values: Object.freeze(['uppercase', 'sentence', 'capitalize']) },
  countUpEnabled: { kind: 'enum', values: Object.freeze([true, false]) },
  pulseSpeed: { kind: 'enum', values: Object.freeze(['none', 'slow', 'normal', 'fast']) },
} as const);

/**
 * The tenant channel each instance selection speaks for.
 *
 * `density` and `sectionSpacing` share `card.paddingDensity` because the base
 * resolver derives section spacing FROM density: letting an instance set the
 * spacing of a tenant-decided density would contradict that decision by the
 * back door.
 */
export const SURFACE_VISUAL_OVERRIDE_TENANT_CHANNELS: Readonly<
  Record<keyof SurfaceVisualOverrides, readonly TenantPersonalityChannel[]>
> = Object.freeze({
  density: Object.freeze(['card.paddingDensity'] as const),
  cardVariant: Object.freeze(['card.showBorder'] as const),
  sectionSpacing: Object.freeze(['card.paddingDensity'] as const),
  headerWeight: Object.freeze(['typography.headingWeightBias'] as const),
  animateEntrance: Object.freeze(['animation.intensity'] as const),
  entranceStyle: Object.freeze(['animation.entrance'] as const),
  entranceDuration: Object.freeze(['animation.entranceDuration'] as const),
  staggerDelay: Object.freeze(['animation.staggerDelay'] as const),
  badgeShape: Object.freeze(['accent.badgeShape'] as const),
  labelStyle: Object.freeze(['typography.labelStyle'] as const),
  countUpEnabled: Object.freeze(['animation.countUpEnabled'] as const),
  pulseSpeed: Object.freeze(['animation.pulseSpeed'] as const),
});

/** Every field name the catalog governs, in declaration order. */
export const SURFACE_VISUAL_OVERRIDE_FIELDS = Object.freeze(
  Object.keys(SURFACE_VISUAL_OVERRIDE_CATALOG) as (keyof SurfaceVisualOverrides)[],
);

/** True when `value` is inside the field's admitted domain. */
export function isAdmittedOverrideValue(
  field: keyof SurfaceVisualOverrides,
  value: unknown,
): boolean {
  const admission = SURFACE_VISUAL_OVERRIDE_CATALOG[field];
  if (admission.kind === 'enum') {
    return admission.values.includes(value as string | boolean);
  }
  return (
    typeof value === 'number'
    && Number.isFinite(value)
    && value >= admission.min
    && value <= admission.max
  );
}

/**
 * The personality channels the TENANT decided, by any of its authoring routes.
 *
 * Delegated to the tenant configuration registry, which owns the ONE
 * definition, because the answer has to survive a projection this layer never
 * sees: `getCodeOwnedRuntimeConfig` strips `personality`, `brandTheme` and
 * `appearance` before a component is ever handed the config, so re-reading
 * those three fields here adjudicated every selection against an empty set
 * behind the real provider and admitted what it exists to refuse.
 */
export function resolveTenantDecidedChannels(
  config: TenantConfig | undefined,
): ReadonlySet<string> {
  return tenantDecidedChannels(config);
}

/** One admitted or refused instance selection, with the reason it was refused. */
export interface SurfaceVisualOverrideVerdict {
  readonly field: keyof SurfaceVisualOverrides;
  readonly value: unknown;
  readonly admitted: boolean;
  readonly refusedBecause?: 'not-in-catalog' | 'tenant-decided';
}

/**
 * Adjudicate every declared instance selection against the catalog and the
 * tenant's decisions.
 *
 * Order matters: catalog membership is checked FIRST, so an unmodelled value
 * is refused as unmodelled even on a channel the tenant never touched.
 */
export function adjudicateInstanceOverrides(
  overrides: SurfaceVisualOverrides | undefined,
  tenantDecidedChannels: ReadonlySet<string>,
): readonly SurfaceVisualOverrideVerdict[] {
  if (!overrides) return [];

  const verdicts: SurfaceVisualOverrideVerdict[] = [];
  for (const field of SURFACE_VISUAL_OVERRIDE_FIELDS) {
    const value = overrides[field];
    if (value === undefined) continue;

    if (!isAdmittedOverrideValue(field, value)) {
      verdicts.push({ field, value, admitted: false, refusedBecause: 'not-in-catalog' });
      continue;
    }
    const contradicts = SURFACE_VISUAL_OVERRIDE_TENANT_CHANNELS[field]
      .some((channel) => tenantDecidedChannels.has(channel));
    verdicts.push(
      contradicts
        ? { field, value, admitted: false, refusedBecause: 'tenant-decided' }
        : { field, value, admitted: true },
    );
  }
  return verdicts;
}

/**
 * The subset of `overrides` that may be applied: in the catalog, and on a
 * channel the tenant left open.
 */
export function admitInstanceOverrides(
  overrides: SurfaceVisualOverrides | undefined,
  tenantDecidedChannels: ReadonlySet<string>,
): SurfaceVisualOverrides {
  const admitted: Record<string, unknown> = {};
  for (const verdict of adjudicateInstanceOverrides(overrides, tenantDecidedChannels)) {
    if (verdict.admitted) admitted[verdict.field] = verdict.value;
  }
  return admitted as SurfaceVisualOverrides;
}
