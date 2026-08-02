/**
 * Shared expressive expansion (C1b) — the ONE pure lowering from a resolved
 * axis set into (a) typed field defaults for emitters that already exist and
 * (b) values for channels no other writer owns.
 *
 * Laws:
 * - deterministic and serializable: same axes, same output, stable key order;
 * - fail-closed: an axis without a row expands to nothing, never a throw;
 * - no color math and no DOM/React — values are plain strings over existing
 *   channels (`var()`/`color-mix()` composition happens in CSS, not here);
 * - single writer: `variables` may only name channels WITHOUT an existing
 *   emitter (typographic depth roles, border-width roles, elevation
 *   satellites). Channels that existing emitters own ride `fieldDefaults`
 *   so envelope clamping, APCA and the JS consumers (useTokens,
 *   MotionProvider) all see the same effective values. Those defaults are
 *   lowered by the shared appearance-posture emitter on both compiler paths;
 *   this expansion never duplicates their CSS channels.
 */

import { EXPRESSIVE_A11Y_FLOORS } from '..';
import type { ExpressiveAxes } from '..';

/**
 * Field defaults the compilers apply where the theme source left the field
 * unset. Vocabularies mirror the existing tenant/appearance contracts; the
 * compilers own clamping against global bounds and the vertical envelope.
 */
export interface ExpressiveFieldDefaultSet {
  readonly typePairing?: 'sober' | 'editorial' | 'geometric' | 'technical';
  readonly buttonStyle?: 'sharp' | 'soft' | 'pill';
  readonly radiusScale?: number;
  readonly density?: 'compact' | 'normal' | 'spacious';
  readonly motion?: {
    readonly intensity?: number;
    readonly durationScale?: number;
    readonly ambient?: 'off' | 'subtle';
  };
  readonly elevation?: 'flat' | 'soft' | 'elevated';
}

export interface ExpressiveExpansion {
  readonly fieldDefaults: ExpressiveFieldDefaultSet;
  readonly variables: Readonly<Record<string, string>>;
}

/**
 * Typographic depth: ONE facet table per type posture, projected two ways —
 * `--ds-type-{role}-{facet}` channel rows for the DB path (which has no
 * role emitter, so the expansion is the single writer there) and a
 * role-keyed overlay for the static `setSemanticTypographyVariables`
 * emitter, which stays the single writer of those channels on the static
 * path with the precedence `defaults < profile overlay < authored roles`.
 * Personality travels through tracking, label case and numeral posture —
 * never through font metrics, which stay family-authored (B1.2).
 *
 * The numeric-role numerals deliberately do NOT touch data tables: Table
 * cells read `--ds-table-cell-numeric` with a local `tabular-nums` default,
 * so an oldstyle editorial posture can never break column alignment.
 */
export interface ExpressiveTypeRoleFacets {
  readonly letterSpacing?: string;
  readonly textTransform?: string;
  readonly fontVariantNumeric?: string;
}

export type ExpressiveTypeRoleOverlay = Readonly<
  Partial<Record<'display' | 'label' | 'numeric', ExpressiveTypeRoleFacets>>
>;

interface TypeProfileRow {
  /** Heading tracking channel (`--ds-letter-spacing-heading`, no role). */
  readonly headingTracking: string;
  readonly roles: ExpressiveTypeRoleOverlay;
  /** Live table-chrome hooks (authored chrome always wins by merge order). */
  readonly tableHeader: {
    readonly letterSpacing: string;
    readonly textTransform: string;
  };
  /** Chrome micro-label case (group labels, eyebrows) — consumer channels. */
  readonly overlineTransform: string;
}

const TYPE_PROFILE_ROWS: Record<
  NonNullable<ExpressiveAxes['type']>,
  TypeProfileRow
> = {
  // Display tracking values stay var()-wrapped over the per-context channel:
  // a vertical's authored `--ds-letter-spacing-display` keeps winning through
  // the chain, while a DB tenant (which has no per-context authoring surface)
  // lands on the profile fallback — the divergence the acid test measures.
  technical: {
    headingTracking: '-0.015em',
    roles: {
      display: { letterSpacing: 'var(--ds-letter-spacing-display, -0.02em)' },
      label: { textTransform: 'uppercase' },
      numeric: { fontVariantNumeric: 'tabular-nums lining-nums' },
    },
    tableHeader: { letterSpacing: '0.05em', textTransform: 'uppercase' },
    overlineTransform: 'uppercase',
  },
  editorial: {
    headingTracking: '0em',
    roles: {
      display: { letterSpacing: 'var(--ds-letter-spacing-display, 0em)' },
      label: { letterSpacing: '0.01em', textTransform: 'none' },
      numeric: { fontVariantNumeric: 'oldstyle-nums' },
    },
    tableHeader: { letterSpacing: '0.01em', textTransform: 'none' },
    overlineTransform: 'none',
  },
  humanist: {
    headingTracking: '-0.005em',
    roles: {
      display: { letterSpacing: 'var(--ds-letter-spacing-display, -0.005em)' },
      label: { textTransform: 'none' },
      numeric: { fontVariantNumeric: 'proportional-nums' },
    },
    tableHeader: { letterSpacing: '0.02em', textTransform: 'none' },
    overlineTransform: 'none',
  },
  geometric: {
    headingTracking: '0.01em',
    roles: {
      display: { letterSpacing: 'var(--ds-letter-spacing-display, 0.02em)' },
      label: { letterSpacing: '0.08em', textTransform: 'uppercase' },
      numeric: { fontVariantNumeric: 'lining-nums' },
    },
    tableHeader: { letterSpacing: '0.07em', textTransform: 'uppercase' },
    overlineTransform: 'uppercase',
  },
};

const TYPE_FACET_CHANNEL: Record<keyof ExpressiveTypeRoleFacets, string> = {
  letterSpacing: 'letter-spacing',
  textTransform: 'text-transform',
  fontVariantNumeric: 'font-variant-numeric',
};

function typeProfileVariables(
  type: NonNullable<ExpressiveAxes['type']>
): Record<string, string> {
  const row = TYPE_PROFILE_ROWS[type];
  const variables: Record<string, string> = {
    '--ds-letter-spacing-heading': row.headingTracking,
    '--ds-table-header-letter-spacing': row.tableHeader.letterSpacing,
    '--ds-table-header-text-transform': row.tableHeader.textTransform,
    '--ds-select-group-text-transform': row.overlineTransform,
    '--ds-menu-group-text-transform': row.overlineTransform,
    '--ds-page-header-eyebrow-text-transform': row.overlineTransform,
  };
  for (const [role, facets] of Object.entries(row.roles)) {
    for (const [facet, value] of Object.entries(facets)) {
      variables[
        `--ds-type-${role}-${TYPE_FACET_CHANNEL[facet as keyof ExpressiveTypeRoleFacets]}`
      ] = value;
    }
  }
  return variables;
}

/**
 * Static-path projection of the SAME type table: the role overlay the
 * semantic-typography emitter merges between its defaults and the authored
 * roles. Absent type axis → undefined (the emitter behaves exactly as
 * before).
 */
export function expressiveTypeRoleOverlay(
  axes: ExpressiveAxes
): ExpressiveTypeRoleOverlay | undefined {
  return axes.type ? TYPE_PROFILE_ROWS[axes.type].roles : undefined;
}

/** The pairing preset each type posture defaults (explicit families win). */
const TYPE_PROFILE_PAIRING: Record<
  NonNullable<ExpressiveAxes['type']>,
  NonNullable<ExpressiveFieldDefaultSet['typePairing']>
> = {
  technical: 'technical',
  editorial: 'editorial',
  humanist: 'sober',
  geometric: 'geometric',
};

/**
 * Geometry rows: the radius dial plus the button silhouette. `pill-accented`
 * pills CONTROLS through the button-style field while containers keep a
 * bounded scale — never a global infinite radius.
 */
const GEOMETRY_PROFILE_FIELDS: Record<
  NonNullable<ExpressiveAxes['geometry']>,
  Pick<ExpressiveFieldDefaultSet, 'buttonStyle' | 'radiusScale'>
> = {
  sharp: { buttonStyle: 'sharp', radiusScale: 0.85 },
  soft: { buttonStyle: 'soft', radiusScale: 1.15 },
  rounded: { buttonStyle: 'soft', radiusScale: 1.25 },
  'pill-accented': { buttonStyle: 'pill', radiusScale: 1.1 },
};

/**
 * Border grammar rows own the NEW width-role channels (floors in
 * default.css). Structural `--ds-border-width-{0,1,2,4,8}` scale tokens are
 * deliberately untouched — a profile modulates roles, never the scale.
 * Selection/error/focus states never ride these roles (they keep their own
 * state channels), so no edge value can make a state border-only-invisible.
 */
const EDGE_PROFILE_VARIABLES: Record<
  NonNullable<ExpressiveAxes['edge']>,
  Readonly<Record<string, string>>
> = {
  'borderless-shadow': {
    '--ds-edge-hairline-width': '0px',
    '--ds-edge-standard-width': '0px',
    '--ds-edge-emphasis-width': '1px',
  },
  hairline: {
    '--ds-edge-hairline-width': '1px',
    '--ds-edge-standard-width': '1px',
    '--ds-edge-emphasis-width': '1px',
  },
  outlined: {
    '--ds-edge-hairline-width': '1px',
    '--ds-edge-standard-width': '1.5px',
    '--ds-edge-emphasis-width': '2px',
  },
  ruled: {
    '--ds-edge-hairline-width': '1px',
    '--ds-edge-standard-width': '1px',
    '--ds-edge-emphasis-width': '2px',
  },
  'inset-double': {
    '--ds-edge-hairline-width': '1px',
    // A genuine double keyline: the style channel switches every container
    // consumer to `double`, and 3px is the minimum width where CSS renders
    // both strokes. Dividers follow the same posture through the existing
    // divider channels (floors keep them 1px solid everywhere else).
    '--ds-edge-standard-width': '3px',
    '--ds-edge-standard-style': 'double',
    '--ds-edge-emphasis-width': '3px',
    '--ds-divider-width': '3px',
    '--ds-divider-style': 'double',
  },
};

/**
 * Elevation rows: the coarse posture rides the existing `surfaces.elevation`
 * field (its preset stays the single owner of `--ds-elevation-1..5`); the
 * profile adds only satellite channels — the existing dark surface-lift dial
 * (`--ds-elevation-lift-strength`, floor 0) and, for luminous profiles, a
 * brand glow gated by effect-intensity. Dark stays a derived overlay, never
 * a second identity (C1 residual law).
 */
const ELEVATION_PROFILE_FIELDS: Record<
  NonNullable<ExpressiveAxes['elevation']>,
  NonNullable<ExpressiveFieldDefaultSet['elevation']>
> = {
  flat: 'flat',
  'hairline-lift': 'flat',
  'soft-depth': 'soft',
  dramatic: 'elevated',
  'luminous-glow': 'elevated',
};

const ELEVATION_PROFILE_VARIABLES: Record<
  NonNullable<ExpressiveAxes['elevation']>,
  Readonly<Record<string, string>>
> = {
  // C2: postures now also move the key/ambient strength dials the parametric
  // --ds-elevation-1..6 ramp composes (default.css §5). One ramp, two dials,
  // zero per-component shadows. hairline-lift deliberately softens both
  // (keylines carry its depth); dramatic/luminous push them past neutral.
  flat: { '--ds-elevation-lift-strength': '0' },
  'hairline-lift': {
    '--ds-elevation-lift-strength': '0',
    '--ds-shadow-key-strength': '0.7',
    '--ds-shadow-ambient-strength': '0.6',
  },
  'soft-depth': {
    '--ds-elevation-lift-strength': '2',
    '--ds-shadow-key-strength': '1',
    '--ds-shadow-ambient-strength': '1.15',
  },
  dramatic: {
    '--ds-elevation-lift-strength': '3',
    '--ds-shadow-key-strength': '1.35',
    '--ds-shadow-ambient-strength': '1.25',
  },
  'luminous-glow': {
    '--ds-elevation-lift-strength': '2',
    '--ds-shadow-key-strength': '1.1',
    '--ds-shadow-ambient-strength': '1.35',
  },
};

/**
 * Material rows write the EXISTING `--ds-material-{role}-{facet}` matrix
 * (census: consumed by SemanticSurface for every role, and by Tooltip and
 * Popover for the overlay role) — never a parallel vocabulary. Texture and
 * highlight are the sanctioned decoration facets; dense bodies, forms and
 * data tables never receive texture (their families do not read these
 * facets). `flat` states its posture explicitly so a material change is
 * always observable; `frosted`/`luminous` modulate the EXISTING glass and
 * highlight channels on overlay/raised roles only.
 */
const MATERIAL_PROFILE_VARIABLES: Partial<
  Record<NonNullable<ExpressiveAxes['material']>, Readonly<Record<string, string>>>
> = {
  flat: {
    '--ds-material-card-texture': 'none',
    '--ds-material-panel-texture': 'none',
    '--ds-material-card-highlight': 'none',
  },
  paper: {
    '--ds-material-card-texture':
      'linear-gradient(color-mix(in srgb, var(--ds-color-text-primary) calc(3% * var(--ds-effect-intensity, 1)), transparent), color-mix(in srgb, var(--ds-color-text-primary) calc(3% * var(--ds-effect-intensity, 1)), transparent))',
    '--ds-material-panel-texture':
      'linear-gradient(color-mix(in srgb, var(--ds-color-text-primary) calc(2% * var(--ds-effect-intensity, 1)), transparent), color-mix(in srgb, var(--ds-color-text-primary) calc(2% * var(--ds-effect-intensity, 1)), transparent))',
    '--ds-material-card-highlight':
      'color-mix(in srgb, var(--ds-color-primary) calc(4% * var(--ds-effect-intensity, 1)), transparent)',
    // C2: warm materials tint their shadows through the elevation ramp's
    // color authority — a paper product never casts a cold gray shadow.
    '--ds-shadow-tint': 'color-mix(in srgb, var(--ds-color-primary) 25%, #000)',
  },
  'soft-depth': {
    '--ds-material-card-highlight':
      'color-mix(in srgb, var(--ds-color-primary) calc(6% * var(--ds-effect-intensity, 1)), transparent)',
    '--ds-shadow-tint': 'color-mix(in srgb, var(--ds-color-primary) 18%, #000)',
  },
  frosted: {
    '--ds-material-overlay-texture':
      'linear-gradient(color-mix(in srgb, var(--ds-surface-overlay) calc(30% * var(--ds-effect-intensity, 1)), transparent), transparent)',
  },
  luminous: {
    '--ds-material-card-highlight':
      'color-mix(in srgb, var(--ds-color-primary) calc(10% * var(--ds-effect-intensity, 1)), transparent)',
    '--ds-material-raised-highlight':
      'color-mix(in srgb, var(--ds-color-primary) calc(12% * var(--ds-effect-intensity, 1)), transparent)',
    '--ds-shadow-tint': 'color-mix(in srgb, var(--ds-color-primary) 32%, #000)',
  },
};

/**
 * Motif rows reuse the decoration surfaces that already exist and are read
 * today: the canvas texture facet (SemanticSurface) and the page-header
 * background chain (`--ds-page-header-bg`, page-shell). Every recipe is a
 * plain CSS gradient over theme channels, alpha-gated by effect-intensity,
 * with no animation. `dots`, `deco-fan` and `ambient-orbs` have NO v1 rows —
 * a dot grid needs a tiling size and the fan/orb shapes need a real
 * paint-only slot (K-wave); until then they resolve but expand to nothing,
 * and the registry test pins that boundary explicitly.
 */
const MOTIF_PROFILE_VARIABLES: Partial<
  Record<NonNullable<ExpressiveAxes['motif']>, Readonly<Record<string, string>>>
> = {
  none: {},
  'micro-grid': {
    '--ds-material-canvas-texture':
      'repeating-linear-gradient(0deg, color-mix(in srgb, var(--ds-color-text-primary) calc(2% * var(--ds-effect-intensity, 1)), transparent) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, color-mix(in srgb, var(--ds-color-text-primary) calc(2% * var(--ds-effect-intensity, 1)), transparent) 0 1px, transparent 1px 24px)',
  },
  pinstripe: {
    '--ds-material-canvas-texture':
      'repeating-linear-gradient(90deg, color-mix(in srgb, var(--ds-color-text-primary) calc(2% * var(--ds-effect-intensity, 1)), transparent) 0 1px, transparent 1px 56px)',
  },
  contour: {
    '--ds-material-canvas-texture':
      'radial-gradient(1200px 500px at 85% -10%, color-mix(in srgb, var(--ds-color-primary) calc(5% * var(--ds-effect-intensity, 1)), transparent), transparent 70%)',
    '--ds-page-header-bg':
      'linear-gradient(135deg, color-mix(in srgb, var(--ds-color-primary) calc(7% * var(--ds-effect-intensity, 1)), var(--ds-surface-card)), var(--ds-surface-card) 65%)',
  },
};

/**
 * A11y floor as an EXECUTABLE invariant, not a constant: every edge-width
 * value the expansion emits is clamped to the universal cap. A future table
 * row cannot ship decoration-grade borders even by typo; the compiler's
 * artifact guard re-asserts the same invariant downstream.
 */
export function clampExpressiveEdgeWidth(value: string): string {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return value;
  return parsed > EXPRESSIVE_A11Y_FLOORS.edgeWidthMaxPx
    ? `${EXPRESSIVE_A11Y_FLOORS.edgeWidthMaxPx}px`
    : value;
}

function sortedRecord(
  record: Record<string, string>
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(record)
      .map(([key, value]): [string, string] =>
        key.includes('width') ? [key, clampExpressiveEdgeWidth(value)] : [key, value]
      )
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  );
}

/**
 * Lower a resolved axis set into field defaults plus no-other-writer channel
 * values. Pure; key-order stable; unknown or frontier axis values expand to
 * nothing.
 */
export function expandExpressiveProfiles(
  axes: ExpressiveAxes
): ExpressiveExpansion {
  const variables: Record<string, string> = {};
  if (axes.type) Object.assign(variables, typeProfileVariables(axes.type));
  if (axes.edge) Object.assign(variables, EDGE_PROFILE_VARIABLES[axes.edge]);
  if (axes.material) {
    Object.assign(variables, MATERIAL_PROFILE_VARIABLES[axes.material] ?? {});
  }
  if (axes.elevation) {
    Object.assign(variables, ELEVATION_PROFILE_VARIABLES[axes.elevation]);
  }
  if (axes.motif) {
    Object.assign(variables, MOTIF_PROFILE_VARIABLES[axes.motif] ?? {});
  }

  const fieldDefaults: {
    -readonly [Key in keyof ExpressiveFieldDefaultSet]: ExpressiveFieldDefaultSet[Key];
  } = {};
  if (axes.type) fieldDefaults.typePairing = TYPE_PROFILE_PAIRING[axes.type];
  if (axes.geometry) {
    const geometry = GEOMETRY_PROFILE_FIELDS[axes.geometry];
    fieldDefaults.buttonStyle = geometry.buttonStyle;
    fieldDefaults.radiusScale = geometry.radiusScale;
  }
  if (axes.elevation) {
    fieldDefaults.elevation = ELEVATION_PROFILE_FIELDS[axes.elevation];
  }
  if (axes.density) fieldDefaults.density = axes.density;
  if (axes.motion) fieldDefaults.motion = axes.motion;

  return { fieldDefaults, variables: sortedRecord(variables) };
}
