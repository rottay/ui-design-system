/**
 * @fileoverview Visual authority resolution - Rottay Design System
 * @description Decides which emitter owns each tenant visual channel, from a
 * declaration that carries provenance instead of a lossy boolean.
 *
 * @remarks
 * The provider previously declared `visualAuthority = 'provider'` as a plain
 * default parameter. That fails OPEN: an app that mounted a server-compiled
 * artifact but forgot the prop got provider-side emitters painting on top of
 * it, and nothing reported the double ownership.
 *
 * Reporting alone then failed CLOSED on every correct DB tenant. The resolver
 * received `hasRuntimeVisualPayload`, a boolean that counted the presence of
 * `config.appearance` as provider-emittable paint. For a compiled envelope the
 * app sets `appearance = artifact.normalizedAppearance` -- the artifact's OWN
 * compiled source, retained because the runtime must still READ it for density,
 * the motion dial, `backgroundMode`, the recipe profile and the anatomy
 * attributes. Without provenance the resolver could not tell that echo apart
 * from an authored later override, so every correct envelope reported double
 * authority and threw in development.
 *
 * What this module now decides, per channel rather than per provider:
 *
 * - A `compiled-artifact` DECLARATION carries the artifact's `coverage`, its
 *   digest/compiler version and its `normalizedAppearance`. Coverage is the
 *   suppression set: the provider silences exactly those emitters and nothing
 *   more. `personality` is deliberately outside v1 coverage, so the bridge
 *   stays mounted and COMPLETES the channels the artifact does not cover.
 *
 * - An appearance payload is an echo when it canonicalizes identically to the
 *   artifact's `normalizedAppearance`. The comparison is STRUCTURAL, never
 *   referential: the RSC/JSON boundary in `initialRuntimeTheme` deserializes
 *   the envelope into distinct objects, so identity checks would report every
 *   hydrated tenant as an authored override.
 *
 * - A bare `'compiled-artifact'` string stays legal but unverifiable. It keeps
 *   the previous fail-closed behavior exactly: any payload is a conflict and
 *   all five channels are suppressed.
 *
 * `Boolean(appearance)` appears nowhere in the authority decision.
 *
 * @module Theming/Foundation/VisualAuthority
 * @category Theming
 * @package @rottay/design-system
 */

import type { TenantAppearance } from '@/foundation/contracts/composition/tenants/themes';
import type {
  NormalizedTenantThemeAppearance,
  TenantThemeArtifact,
  TenantVisualChannel,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { TENANT_VISUAL_CHANNELS } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { canonicalizeJsonValue } from '@/foundation/kernel/serialization';

/** Single owner of tenant visual CSS variables. */
export type VisualAuthority = 'provider' | 'compiled-artifact';

const VISUAL_AUTHORITIES: readonly VisualAuthority[] = ['provider', 'compiled-artifact'];

/** Why the resolved authority was chosen. */
export type VisualAuthorityOrigin =
  | 'explicit'
  | 'compiled-envelope'
  | 'bundled-vertical'
  | 'db-tenant'
  | 'no-visual-payload';

/** The app renders provider-owned visual emitters. */
export interface ProviderDeclaration {
  authority: 'provider';
}

/**
 * The app already mounted this exact compiled artifact. The subset carried
 * here is everything the resolver needs to VERIFY the claim -- coverage to
 * decide suppression, `normalizedAppearance` to recognise the echo, and the
 * digest/version pair for diagnostics.
 */
export interface CompiledArtifactDeclaration {
  authority: 'compiled-artifact';
  artifact: Pick<
    TenantThemeArtifact,
    'digest' | 'compilerVersion' | 'coverage' | 'normalizedAppearance'
  >;
}

export type VisualAuthorityDeclaration = ProviderDeclaration | CompiledArtifactDeclaration;

/**
 * What the provider is actually holding, before any suppression.
 *
 * `appearance` is the document itself rather than a boolean, because whether
 * it is provider-emittable paint or an echo of the compiled source cannot be
 * decided without comparing it to the artifact.
 */
export interface RuntimeVisualPayloadCensus {
  visualBranding: boolean;
  tokenOverrides: boolean;
  appearance: TenantAppearance | undefined;
}

export interface VisualAuthorityInput {
  /** Declaration from the app, when provided. */
  declaration?: VisualAuthority | VisualAuthorityDeclaration;
  /** Tenant slug, used only for diagnostics. */
  slug: string;
  /**
   * Whether this tenant ships a compiled static artifact inside the DS CSS
   * bundle. Callers pass `isBundledTenant(slug)`.
   */
  hasBundledArtifact: boolean;
  /** The provider's own visual payload census. */
  payload: RuntimeVisualPayloadCensus;
}

export interface VisualAuthorityResolution {
  authority: VisualAuthority;
  origin: VisualAuthorityOrigin;
  /** Emitters the provider must silence. Empty means the provider emits all. */
  suppressedChannels: readonly TenantVisualChannel[];
  /** Human-readable description of a simultaneous-authority condition. */
  conflict: string | null;
}

const NO_SUPPRESSION: readonly TenantVisualChannel[] = Object.freeze([]);

/**
 * A bare string declaration proves nothing, so every channel is suppressed.
 * Narrowing this set would let an unverified claim keep an emitter alive.
 */
const ALL_CHANNELS_SUPPRESSED: readonly TenantVisualChannel[] = Object.freeze([
  ...TENANT_VISUAL_CHANNELS,
]);

function isVisualAuthority(value: unknown): value is VisualAuthority {
  return VISUAL_AUTHORITIES.includes(value as VisualAuthority);
}

function isTenantVisualChannel(value: unknown): value is TenantVisualChannel {
  return TENANT_VISUAL_CHANNELS.includes(value as TenantVisualChannel);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidDeclaration(value: unknown, slug: string): Error {
  return new Error(
    `[design-system] Invalid visualAuthority ${JSON.stringify(value)} for tenant "${slug}". ` +
      `Expected one of: ${VISUAL_AUTHORITIES.join(', ')}, or a declaration object ` +
      `{ authority: 'provider' } / { authority: 'compiled-artifact', artifact: { digest, ` +
      `compilerVersion, coverage, normalizedAppearance } }.`,
  );
}

/**
 * Structural equality between a provider appearance payload and the artifact's
 * compiled source, through the shared canonical JSON kernel.
 *
 * Reference identity is unusable here: `initialRuntimeTheme` crosses the
 * RSC/JSON boundary, so the hydrated appearance is always a distinct object
 * with the same content. Canonicalization sorts keys recursively and trims
 * edge whitespace, which is exactly the equivalence the compiler uses to build
 * the digest -- literally the same kernel function, so the echo test and the
 * digest can never drift apart, and this runtime owner does not have to reach
 * up into a compiler composition owner to borrow it.
 *
 * A payload that cannot be canonicalized (a non-JSON value, a cycle) is NOT an
 * echo. That direction fails closed: it reports rather than silently
 * suppressing an emitter whose content was never verified.
 */
export function appearanceMatchesArtifact(
  appearance: TenantAppearance,
  normalizedAppearance: NormalizedTenantThemeAppearance,
): boolean {
  try {
    return (
      canonicalizeJsonValue(appearance) === canonicalizeJsonValue(normalizedAppearance)
    );
  } catch {
    return false;
  }
}

/** Whether the provider holds anything it could paint. Diagnostics only. */
function hasAnyPayload(payload: RuntimeVisualPayloadCensus): boolean {
  return payload.visualBranding || payload.tokenOverrides || payload.appearance !== undefined;
}

function resolveBareStringDeclaration(
  declaration: string,
  slug: string,
  payload: RuntimeVisualPayloadCensus,
): VisualAuthorityResolution {
  if (!isVisualAuthority(declaration)) throw invalidDeclaration(declaration, slug);

  if (declaration === 'provider') {
    return {
      authority: 'provider',
      origin: 'explicit',
      suppressedChannels: NO_SUPPRESSION,
      conflict: null,
    };
  }

  return {
    authority: 'compiled-artifact',
    origin: 'explicit',
    suppressedChannels: ALL_CHANNELS_SUPPRESSED,
    conflict: hasAnyPayload(payload)
      ? `Tenant "${slug}" declares visualAuthority="compiled-artifact" while also supplying ` +
        `runtime visual payload (branding colors, tokenOverrides, or appearance). Two ` +
        `authorities would paint the same variables, so the provider drops the payload ` +
        `entirely. Pass the typed declaration carrying the artifact so the payload can be ` +
        `verified, remove the runtime payload, or switch to visualAuthority="provider".`
      : null,
  };
}

function readCoverage(
  declaration: CompiledArtifactDeclaration,
  slug: string,
): readonly TenantVisualChannel[] {
  const artifact = declaration.artifact as unknown;
  if (
    !isRecord(artifact) ||
    typeof artifact.digest !== 'string' ||
    typeof artifact.compilerVersion !== 'string' ||
    !isRecord(artifact.normalizedAppearance) ||
    !Array.isArray(artifact.coverage) ||
    !artifact.coverage.every(isTenantVisualChannel) ||
    new Set(artifact.coverage).size !== artifact.coverage.length
  ) {
    throw invalidDeclaration(declaration, slug);
  }
  return Object.freeze([...(artifact.coverage as readonly TenantVisualChannel[])]);
}

function resolveCompiledEnvelope(
  declaration: CompiledArtifactDeclaration,
  slug: string,
  payload: RuntimeVisualPayloadCensus,
): VisualAuthorityResolution {
  const coverage = readCoverage(declaration, slug);
  const { digest, compilerVersion, normalizedAppearance } = declaration.artifact;
  const conflicts: string[] = [];

  // A channel the artifact does NOT cover is not a competing authority: it is
  // a channel the provider legitimately still owns. Coverage is therefore the
  // gate for both suppression and conflict.
  if (payload.visualBranding && coverage.includes('visual-branding')) {
    conflicts.push('uncompiled visual branding under compiled-artifact');
  }
  if (payload.tokenOverrides && coverage.includes('token-overrides')) {
    conflicts.push('uncompiled tokenOverrides under compiled-artifact');
  }
  if (
    payload.appearance !== undefined &&
    coverage.includes('appearance') &&
    !appearanceMatchesArtifact(payload.appearance, normalizedAppearance)
  ) {
    conflicts.push(`an uncompiled appearance override for tenant "${slug}"`);
  }

  return {
    authority: 'compiled-artifact',
    origin: 'compiled-envelope',
    // Suppression stays total across the covered set even under conflict: a
    // reported ambiguity must never turn into a second painter.
    suppressedChannels: coverage,
    conflict:
      conflicts.length === 0
        ? null
        : `Tenant "${slug}" mounted the compiled artifact ${digest} (${compilerVersion}), which ` +
          `owns ${coverage.join(', ')}, yet the provider still carries ${conflicts.join(' and ')}. ` +
          `The compiled artifact is the only tenant authority for the channels it covers, so the ` +
          `provider drops that payload entirely. Publish the change through the tenant theme ` +
          `document, or switch to visualAuthority="provider".`,
  };
}

/**
 * Resolves the visual authority per channel and reports simultaneous ownership.
 *
 * Pure: callers own the environment-dependent reaction to `conflict`.
 *
 * @throws If `declaration` is present but is neither a valid authority string
 * nor a well-formed declaration object. An unrecognized value must never fall
 * back silently, because the fallback is precisely the fail-open behavior this
 * resolution replaces.
 */
export function resolveVisualAuthority(
  input: VisualAuthorityInput,
): VisualAuthorityResolution {
  const { declaration, slug, hasBundledArtifact, payload } = input;

  if (declaration !== undefined) {
    if (typeof declaration === 'string') {
      return resolveBareStringDeclaration(declaration, slug, payload);
    }
    if (!isRecord(declaration)) throw invalidDeclaration(declaration, slug);
    if (declaration.authority === 'provider') {
      return {
        authority: 'provider',
        origin: 'explicit',
        suppressedChannels: NO_SUPPRESSION,
        conflict: null,
      };
    }
    if (declaration.authority === 'compiled-artifact') {
      return resolveCompiledEnvelope(declaration as CompiledArtifactDeclaration, slug, payload);
    }
    throw invalidDeclaration(declaration, slug);
  }

  if (hasBundledArtifact) {
    // The bundled artifact owns tenant chrome; the bridge owns personality.
    // Disjoint by construction -- the artifacts declare no personality vars.
    return {
      authority: 'provider',
      origin: 'bundled-vertical',
      suppressedChannels: NO_SUPPRESSION,
      conflict: null,
    };
  }

  // Origin only. Under provider authority an appearance document IS
  // provider-emittable paint, so counting its presence here is honest; it is
  // the authority decision that must never be made from its presence.
  if (hasAnyPayload(payload)) {
    // A DB-sourced tenant with no compiled artifact on the client: the provider
    // is the only emitter that can paint it.
    return {
      authority: 'provider',
      origin: 'db-tenant',
      suppressedChannels: NO_SUPPRESSION,
      conflict: null,
    };
  }

  return {
    authority: 'provider',
    origin: 'no-visual-payload',
    suppressedChannels: NO_SUPPRESSION,
    conflict: null,
  };
}

let hasReportedConflict = false;

/** Test-only reset for the once-per-process diagnostic latch. */
export function resetVisualAuthorityDiagnostics(): void {
  hasReportedConflict = false;
}

/**
 * Reports a simultaneous-authority condition.
 *
 * Fails closed in development by throwing, so the ambiguity cannot ship. Under
 * any other environment (production, test, SSR) it reports once and continues:
 * throwing in production would turn a styling ambiguity into an outage, and
 * `compiled-artifact` suppressing provider payload is an intentional, tested
 * contract that must stay runnable.
 */
export function reportVisualAuthorityConflict(
  conflict: string,
  environment: string | undefined = process.env.NODE_ENV,
): void {
  if (environment === 'development') {
    throw new Error(`[design-system] ${conflict}`);
  }

  if (hasReportedConflict) return;
  hasReportedConflict = true;
  console.error(`[design-system] ${conflict}`);
}
