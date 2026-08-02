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
      // `ambient` returned to the composition in C2: the historic DataTable
      // consumer that read the keyword as a transition-duration was fixed in
      // the C1b acceptance remediation (it rides --ds-motion-slow now), so
      // the dial is safe to default and the JS policy layer gates ambient
      // choreography through it.
      motion: { intensity: 0.7, durationScale: 1.1, ambient: 'subtle' },
    },
  },
] as const satisfies readonly ExperienceProfileDefinition[];

/**
 * Accessibility and resilience FLOORS (C2). Global and non-negotiable: no
 * profile, vertical envelope, tenant dial or explicit override may cross
 * them. Contrast stays owned by the APCA autocorrect pass and reduced motion
 * by the universal token-zeroing kill switch — both pre-existing enforcement
 * points this record names rather than duplicates.
 */
/**
 * C2c edge-width channel classification — the evasion audit made LAW.
 * EXPRESSIVE channels are decoration a tenant can reach (directly through
 * the edge grammar, or through the default.css component floors that derive
 * from it); every one of them respects `EXPRESSIVE_A11Y_FLOORS.edgeWidthMaxPx`
 * at expansion AND at compile. STRUCTURAL channels are layout dimensions
 * (sidebar tracks, card grid minima) that legitimately exceed the cap and
 * must never be blocked by it. Compiler-audit note: the appearance channels
 * whose names end in `-border` carry COLOR values, and the tenant raw
 * allowlist is color-only — the edge grammar is the single tenant-reachable
 * expressive width door.
 */
export const EXPRESSIVE_EDGE_WIDTH_CHANNELS = Object.freeze([
  '--ds-edge-hairline-width',
  '--ds-edge-standard-width',
  '--ds-edge-emphasis-width',
  '--ds-surface-border-width',
  '--ds-table-border-width',
  '--ds-table-header-rule-width',
  '--ds-menu-border-width',
  '--ds-page-shell-border-width',
] as const);

export const STRUCTURAL_WIDTH_CHANNELS = Object.freeze([
  '--ds-sidebar-width',
  '--ds-sidebar-collapsed-width',
  '--ds-listing-grid-min-card-width',
  '--ds-global-search-results-width',
  '--ds-button-group-mobile-width',
] as const);

export const EXPRESSIVE_A11Y_FLOORS = Object.freeze({
  /** Coarse-pointer targets never shrink below this, any density. */
  touchTargetMinPx: 44,
  /** Absolute type-scale floor — legibility beats identity. */
  typeScaleMin: 0.9,
  /** Absolute cap for any expressive edge width (beyond is decoration). */
  edgeWidthMaxPx: 4,
  /** Radius dial absolute range (mirrors the global schema bounds). */
  radiusScale: Object.freeze({ min: 0.75, max: 1.25 }),
  /** Motion intensity ceiling; reduced-motion always jumps to final state. */
  motionIntensityMax: 1,
} as const);

/**
 * Per-PROFILE envelopes (C2): a selected experience narrows what dials may
 * do ON TOP of it, so an explicit override can bend a posture but never
 * break it. Envelopes CLAMP — they never reorder precedence: explicit DB >
 * authored static > profile composition > canon default still holds, with
 * every layer clamped into (profile envelope ∩ vertical envelope ∩ global
 * bounds ∩ a11y floors).
 */
export interface ExpressiveProfileEnvelope {
  readonly radiusScale: { readonly min: number; readonly max: number };
  readonly typeScale: { readonly min: number; readonly max: number };
  readonly densityModes: readonly ('compact' | 'normal' | 'spacious')[];
  readonly edgeWidthMaxPx: number;
  readonly motionIntensityMax: number;
}

export const EXPERIENCE_PROFILE_ENVELOPES: Readonly<
  Record<ExperienceProfileId, ExpressiveProfileEnvelope>
> = Object.freeze({
  'rottay/bithire-technical@1': Object.freeze({
    radiusScale: Object.freeze({ min: 0.75, max: 1.0 }),
    typeScale: Object.freeze({ min: 0.92, max: 1.08 }),
    densityModes: Object.freeze(['compact', 'normal'] as const),
    edgeWidthMaxPx: 2,
    motionIntensityMax: 0.6,
  }),
  'rottay/management-editorial@1': Object.freeze({
    radiusScale: Object.freeze({ min: 1.0, max: 1.25 }),
    typeScale: Object.freeze({ min: 0.95, max: 1.1 }),
    densityModes: Object.freeze(['normal', 'spacious'] as const),
    edgeWidthMaxPx: 3,
    motionIntensityMax: 0.8,
  }),
});

/**
 * Clamp a numeric dial into the selected profile's envelope and the global
 * a11y floors. Pure; absent profile → only the global floors apply. The
 * compilers call this AFTER precedence resolution, so it bounds whoever won.
 */
export function clampIntoExpressiveEnvelope(
  profileId: string | undefined,
  dial: 'radiusScale' | 'typeScale' | 'motionIntensity',
  value: number
): number {
  const envelope =
    profileId !== undefined
      ? EXPERIENCE_PROFILE_ENVELOPES[profileId as ExperienceProfileId]
      : undefined;
  let min: number;
  let max: number;
  if (dial === 'radiusScale') {
    min = Math.max(
      EXPRESSIVE_A11Y_FLOORS.radiusScale.min,
      envelope?.radiusScale.min ?? EXPRESSIVE_A11Y_FLOORS.radiusScale.min
    );
    max = Math.min(
      EXPRESSIVE_A11Y_FLOORS.radiusScale.max,
      envelope?.radiusScale.max ?? EXPRESSIVE_A11Y_FLOORS.radiusScale.max
    );
  } else if (dial === 'typeScale') {
    min = Math.max(
      EXPRESSIVE_A11Y_FLOORS.typeScaleMin,
      envelope?.typeScale.min ?? EXPRESSIVE_A11Y_FLOORS.typeScaleMin
    );
    max = envelope?.typeScale.max ?? Number.POSITIVE_INFINITY;
  } else {
    min = 0;
    max = Math.min(
      EXPRESSIVE_A11Y_FLOORS.motionIntensityMax,
      envelope?.motionIntensityMax ?? EXPRESSIVE_A11Y_FLOORS.motionIntensityMax
    );
  }
  return Math.min(max, Math.max(min, value));
}

/** Density mode admission under a selected profile (unset stays unset). */
export function clampDensityIntoExpressiveEnvelope(
  profileId: string | undefined,
  density: 'compact' | 'normal' | 'spacious' | undefined
): 'compact' | 'normal' | 'spacious' | undefined {
  if (density === undefined || profileId === undefined) return density;
  const envelope =
    EXPERIENCE_PROFILE_ENVELOPES[profileId as ExperienceProfileId];
  if (!envelope || envelope.densityModes.includes(density)) return density;
  // Nearest admitted posture, deterministic: prefer the envelope's closest
  // neighbor toward 'normal'.
  return envelope.densityModes.includes('normal')
    ? 'normal'
    : envelope.densityModes[0];
}

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
