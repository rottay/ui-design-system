/**
 * Rottay expressive-profile registry (C1b) — governed, versioned visual-axis
 * selection shared by the static BrandTheme compiler and the DB
 * TenantThemeDocument compiler.
 *
 * An expressive profile is data on closed per-axis vocabularies; the shared
 * expansion (`./expansion`) lowers a resolved axis set into typed field
 * defaults for emitters that already exist plus values for channels that have
 * no other writer. Theme sources SELECT an experience id from this closed
 * registry or, on the Pro surface, override individual axes; they never author
 * profile content, CSS, or channel names. Resolution is fail-closed: an
 * unknown id, a malformed id or an unsupported schema version yields no
 * profile (baseline identity), never a throw on the paint path. Ids are
 * permanent once published — retire by superseding `@N+1`, never by reuse.
 */

/** Version of the expressive selection contract persisted by theme sources. */
export const EXPRESSIVE_PROFILE_SCHEMA_VERSION = 1 as const;

/**
 * Closed per-axis vocabularies.
 *
 * Every value is a reviewed DS posture, not a free knob: adding one is a
 * contract change with its own expansion rows, probes and drills. The `icon`
 * axis is declared vocabulary but ships FRONTIER in v1 — the tenant schemas
 * reject it until the generated icon pipeline can honor every value
 * (supplier weights/duotone are not yet governed emitter outputs).
 */
export const EXPRESSIVE_TYPE_PROFILES = [
  'technical',
  'editorial',
  'humanist',
  'geometric',
] as const;
export type ExpressiveTypeProfile = (typeof EXPRESSIVE_TYPE_PROFILES)[number];

export const EXPRESSIVE_GEOMETRY_PROFILES = [
  'sharp',
  'soft',
  'rounded',
  'pill-accented',
] as const;
export type ExpressiveGeometryProfile =
  (typeof EXPRESSIVE_GEOMETRY_PROFILES)[number];

export const EXPRESSIVE_EDGE_PROFILES = [
  'borderless-shadow',
  'hairline',
  'outlined',
  'ruled',
  'inset-double',
] as const;
export type ExpressiveEdgeProfile = (typeof EXPRESSIVE_EDGE_PROFILES)[number];

export const EXPRESSIVE_MATERIAL_PROFILES = [
  'flat',
  'paper',
  'soft-depth',
  'frosted',
  'luminous',
] as const;
export type ExpressiveMaterialProfile =
  (typeof EXPRESSIVE_MATERIAL_PROFILES)[number];

export const EXPRESSIVE_ELEVATION_PROFILES = [
  'flat',
  'hairline-lift',
  'soft-depth',
  'dramatic',
  'luminous-glow',
] as const;
export type ExpressiveElevationProfile =
  (typeof EXPRESSIVE_ELEVATION_PROFILES)[number];

export const EXPRESSIVE_MOTIF_PROFILES = [
  'none',
  'micro-grid',
  'dots',
  'pinstripe',
  'deco-fan',
  'ambient-orbs',
  'contour',
] as const;
export type ExpressiveMotifProfile = (typeof EXPRESSIVE_MOTIF_PROFILES)[number];

export const EXPRESSIVE_ICON_PROFILES = [
  'linear',
  'strong-outline',
  'duotone',
  'solid-active',
] as const;
export type ExpressiveIconProfile = (typeof EXPRESSIVE_ICON_PROFILES)[number];

/**
 * One resolved per-axis selection. Density and motion deliberately reuse the
 * existing tenant vocabularies instead of growing parallel profile enums: a
 * composition may default them, and the existing single emitters keep owning
 * their channels.
 */
export interface ExpressiveAxes {
  readonly type?: ExpressiveTypeProfile;
  readonly geometry?: ExpressiveGeometryProfile;
  readonly edge?: ExpressiveEdgeProfile;
  readonly material?: ExpressiveMaterialProfile;
  readonly elevation?: ExpressiveElevationProfile;
  readonly motif?: ExpressiveMotifProfile;
  /** Declared vocabulary; FRONTIER in v1 (schemas reject the axis). */
  readonly icon?: ExpressiveIconProfile;
  readonly density?: 'compact' | 'normal' | 'spacious';
  readonly motion?: {
    readonly intensity?: number;
    readonly durationScale?: number;
    readonly ambient?: 'off' | 'subtle';
  };
}

/**
 * The Pro authoring surface: explicit per-axis overrides layered over the
 * selected experience profile (each axis independently). Identical to
 * `ExpressiveAxes` today; kept as its own name because the authoring surface
 * may lag the internal vocabulary (e.g. `icon` stays schema-rejected).
 */
export type ExpressiveProfileOverrides = ExpressiveAxes;

export interface ExperienceProfileDefinition {
  /** Namespaced, versioned id: `<namespace>/<name>@<major>`. */
  readonly id: string;
  readonly schemaVersion: typeof EXPRESSIVE_PROFILE_SCHEMA_VERSION;
  /** Human intent, for the manifest and audits. */
  readonly description: string;
  /** The approved composition. Axes omitted here stay on baseline identity. */
  readonly axes: ExpressiveAxes;
}

const EXPERIENCE_PROFILE_ID_PATTERN = /^[a-z0-9-]+\/[a-z0-9-]+@[0-9]+$/;

/**
 * First-party experience registry. Adding an entry is a reviewed DS change:
 * each composition must stay within every global bound and each referenced
 * axis value must have live expansion rows.
 *
 * The v1 pair is the C1b acid-test matrix: a technical/sharp/hairline static
 * identity against an editorial/soft/ruled/paper DB identity. Neither
 * composition authors an `icon` axis while the axis is frontier.
 */
export const EXPERIENCE_PROFILES = [
  {
    id: 'rottay/bithire-technical@1',
    schemaVersion: EXPRESSIVE_PROFILE_SCHEMA_VERSION,
    description:
      'Technical instrument posture: sharp geometry, hairline edges, flat material, keyline lift, no motif, tight tracking with small-caps labels.',
    axes: {
      type: 'technical',
      geometry: 'sharp',
      edge: 'hairline',
      material: 'flat',
      elevation: 'hairline-lift',
      motif: 'none',
      // Explicit baseline posture: concrete for the static/DB acid contract,
      // but factor 1 keeps BitHire's existing densityScale as the only visual
      // multiplier. The Management composition can still diverge to spacious.
      density: 'normal',
    },
  },
  {
    id: 'rottay/management-editorial@1',
    schemaVersion: EXPRESSIVE_PROFILE_SCHEMA_VERSION,
    description:
      'Editorial document posture: soft geometry, ruled edges, paper material with brand-tinted depth, contour motif, spacious rhythm, expressive motion.',
    axes: {
      type: 'editorial',
      geometry: 'soft',
      edge: 'ruled',
      material: 'paper',
      elevation: 'soft-depth',
      motif: 'contour',
      density: 'spacious',
      // `ambient` is deliberately NOT composed: the ambient dial's only CSS
      // consumer reads the keyword into a transition-duration slot
      // (data-table.css:1031, pre-existing type mismatch), so a composition
      // default would activate that defect for every selecting tenant. The
      // expressive motion divergence rides intensity and duration-scale;
      // ambient returns to compositions once the consumer read is fixed.
      motion: { intensity: 0.7, durationScale: 1.1 },
    },
  },
] as const satisfies readonly ExperienceProfileDefinition[];

const EXPERIENCE_PROFILE_INDEX: ReadonlyMap<string, ExperienceProfileDefinition> =
  new Map(EXPERIENCE_PROFILES.map((profile) => [profile.id, profile]));

export type ExperienceProfileId = (typeof EXPERIENCE_PROFILES)[number]['id'];

export interface ExperienceProfileValidation {
  readonly ok: boolean;
  readonly profile?: ExperienceProfileDefinition;
  /** Stable machine-readable reason when not ok. */
  readonly reason?:
    | 'malformed-id'
    | 'unknown-id'
    | 'unsupported-schema-version';
}

/**
 * Validate a persisted selection. Used by the static and DB compilers so a bad
 * document is rejected with a reason instead of silently painting.
 */
export function validateExperienceProfileSelection(
  id: string | undefined,
  schemaVersion: number = EXPRESSIVE_PROFILE_SCHEMA_VERSION
): ExperienceProfileValidation {
  if (schemaVersion !== EXPRESSIVE_PROFILE_SCHEMA_VERSION) {
    return { ok: false, reason: 'unsupported-schema-version' };
  }
  if (id === undefined) return { ok: true };
  if (typeof id !== 'string' || !EXPERIENCE_PROFILE_ID_PATTERN.test(id)) {
    return { ok: false, reason: 'malformed-id' };
  }
  const profile = EXPERIENCE_PROFILE_INDEX.get(id);
  if (!profile) return { ok: false, reason: 'unknown-id' };
  return { ok: true, profile };
}

/** Fail-closed runtime resolution: anything invalid yields no profile. */
export function resolveExperienceProfile(
  id: string | undefined,
  schemaVersion?: number
): ExperienceProfileDefinition | undefined {
  const validation = validateExperienceProfileSelection(id, schemaVersion);
  return validation.ok ? validation.profile : undefined;
}

const includesValue = (
  vocabulary: readonly string[],
  value: unknown
): value is string => typeof value === 'string' && vocabulary.includes(value);

/**
 * Sanitize raw per-axis overrides (contract `string` fields on the static
 * path; defense-in-depth on the schema-validated DB path) against the closed
 * vocabularies. Fail-closed per axis: an unknown key or an out-of-vocabulary
 * value is DROPPED, never painted and never a throw on the paint path.
 * Density and motion are dial vocabularies, not expansion rows, and are
 * bounded by the same rules the existing emitters already enforce.
 */
export function sanitizeExpressiveOverrides(
  raw: unknown
): ExpressiveProfileOverrides | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const source = raw as Record<string, unknown>;
  const overrides: {
    -readonly [Key in keyof ExpressiveAxes]: ExpressiveAxes[Key];
  } = {};
  if (includesValue(EXPRESSIVE_TYPE_PROFILES, source.type)) {
    overrides.type = source.type as ExpressiveTypeProfile;
  }
  if (includesValue(EXPRESSIVE_GEOMETRY_PROFILES, source.geometry)) {
    overrides.geometry = source.geometry as ExpressiveGeometryProfile;
  }
  if (includesValue(EXPRESSIVE_EDGE_PROFILES, source.edge)) {
    overrides.edge = source.edge as ExpressiveEdgeProfile;
  }
  if (includesValue(EXPRESSIVE_MATERIAL_PROFILES, source.material)) {
    overrides.material = source.material as ExpressiveMaterialProfile;
  }
  if (includesValue(EXPRESSIVE_ELEVATION_PROFILES, source.elevation)) {
    overrides.elevation = source.elevation as ExpressiveElevationProfile;
  }
  if (includesValue(EXPRESSIVE_MOTIF_PROFILES, source.motif)) {
    overrides.motif = source.motif as ExpressiveMotifProfile;
  }
  if (includesValue(EXPRESSIVE_ICON_PROFILES, source.icon)) {
    overrides.icon = source.icon as ExpressiveIconProfile;
  }
  return Object.keys(overrides).length > 0 ? overrides : undefined;
}

/**
 * Resolve the effective axis set: the experience composition under explicit
 * per-axis overrides (Pro or static authoring). Pure and key-order stable —
 * axis keys always emerge in vocabulary order so both compilers serialize
 * identical objects. Unknown experience ids fail closed to overrides-only.
 */
export function resolveExpressiveAxes(
  experienceProfileId: string | undefined,
  overrides?: ExpressiveProfileOverrides,
  schemaVersion?: number
): ExpressiveAxes {
  if (
    schemaVersion !== undefined &&
    schemaVersion !== EXPRESSIVE_PROFILE_SCHEMA_VERSION
  ) {
    return {};
  }
  const experience = resolveExperienceProfile(
    experienceProfileId,
    schemaVersion
  )?.axes;
  const pick = <Key extends keyof ExpressiveAxes>(key: Key): ExpressiveAxes[Key] =>
    overrides?.[key] !== undefined ? overrides[key] : experience?.[key];
  const axes: ExpressiveAxes = {
    type: pick('type'),
    geometry: pick('geometry'),
    edge: pick('edge'),
    material: pick('material'),
    elevation: pick('elevation'),
    motif: pick('motif'),
    icon: pick('icon'),
    density: pick('density'),
    motion: pick('motion'),
  };
  return axes;
}
