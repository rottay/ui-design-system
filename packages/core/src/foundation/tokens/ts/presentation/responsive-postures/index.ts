/**
 * Rottay responsive-posture registry (E2) — governed selection of the adaptive
 * ladder: the container-width thresholds postures bucket on, AND the span
 * preference the pure solver resolves items with.
 *
 * A posture profile is bounded data, not a styling language. Theme sources
 * SELECT one of three ids; they never author thresholds or biases, so a tenant
 * cannot invent a second breakpoint system that only some compositions honor.
 * Resolution is fail-closed: an unknown id or an unsupported selection-contract
 * version yields `balanced`, never a throw on the render path.
 *
 * THE LADDER IS ONE SHAPE, THREE ONSETS. Every threshold sits one pixel below a
 * multiple-of-40 stop (960/840/760/720/640/520), and each profile is the
 * balanced ladder shifted ±120px at BOTH edges. That preserves the 200px
 * compact→standard band exactly in all three, so only the onset moves: a tenant
 * picks WHEN the layout steps down, never a differently-shaped reflow.
 *
 * PHYSICAL PLACEMENT: this registry sits beside `recipe-profiles` and
 * `expressive-profiles` rather than beside the solver contracts that consume
 * it. The TenantThemeDocument schema
 * (`infrastructure/compilers/kernel/foundation/schemas`) validates against
 * these ids, and `infrastructure` may never import from `ui` — production
 * infrastructure has zero `@/ui` imports today and this capability must not be
 * the first. `foundation` is below both, so both reach it legally.
 *
 * DATA, NOT CSS: no channel is emitted for this axis. The selected id travels
 * document → schema → artifact `normalizedAppearance` and is read at render by
 * `resolveActiveResponsivePosture`, exactly like the icon posture axis.
 */

/** Version of the posture SELECTION contract persisted by theme sources. */
export const RESPONSIVE_POSTURE_SCHEMA_VERSION = 1 as const;

/**
 * How the solver resolves an item's column span inside its own declared
 * `minSpan..maxSpan` range. A preference, never a bound: every value stays
 * clamped to the contract range and to the tier capacity, so no bias can
 * produce overflow, reorder anything, or open an avoidable hole.
 */
export type AdaptiveSpanBias = 'min' | 'preferred' | 'max';

export interface ResponsivePostureDefinition {
  readonly id: string;
  /** Human intent, for the manifest and audits. */
  readonly description: string;
  /**
   * Inclusive upper bounds of the compact and standard bands, in px of the
   * measured BOUNDARY. Anything above `standardMaxPx` is `expanded`.
   */
  readonly thresholds: {
    readonly compactMaxPx: number;
    readonly standardMaxPx: number;
  };
  /** Span preference handed to the pure solver through door 2. */
  readonly spanBias: AdaptiveSpanBias;
}

/**
 * First-party posture registry. Adding an entry is a reviewed DS change.
 *
 * `balanced` is the identity row: its thresholds ARE the constants the adaptive
 * runtime hardcoded before this axis opened, and its `preferred` bias IS the
 * solver's pre-capability span resolution. Absent therefore resolves to
 * byte-identical layout, which is what makes "unset it" a true rollback rather
 * than an approximate one.
 */
export const RESPONSIVE_POSTURE_PROFILES = [
  {
    id: 'compact',
    description:
      'Tiers collapse sooner and items resolve toward their minimum span: more widgets per row at a given width, each given less room. For dense operational consoles where seeing everything at once beats per-item breathing room.',
    thresholds: { compactMaxPx: 759, standardMaxPx: 959 },
    spanBias: 'min',
  },
  {
    id: 'balanced',
    description:
      'The baseline ladder (compact ≤639px, standard ≤839px) with items at their authored preferred span. Exactly the pre-capability constants, so an absent selection is byte-for-byte the previous behavior.',
    thresholds: { compactMaxPx: 639, standardMaxPx: 839 },
    spanBias: 'preferred',
  },
  {
    id: 'expansive',
    description:
      'Tiers hold their wider form longer and items resolve toward their maximum span: fewer, larger widgets per row. For presentation and review surfaces where each item deserves the room.',
    thresholds: { compactMaxPx: 519, standardMaxPx: 719 },
    spanBias: 'max',
  },
] as const satisfies readonly ResponsivePostureDefinition[];

export type ResponsivePostureId =
  (typeof RESPONSIVE_POSTURE_PROFILES)[number]['id'];

/** The profile an ABSENT selection resolves to. */
export const DEFAULT_RESPONSIVE_POSTURE_ID: ResponsivePostureId = 'balanced';

const PROFILE_INDEX: ReadonlyMap<string, ResponsivePostureDefinition> = new Map(
  RESPONSIVE_POSTURE_PROFILES.map((profile) => [profile.id, profile])
);

export const DEFAULT_RESPONSIVE_POSTURE: ResponsivePostureDefinition =
  PROFILE_INDEX.get(DEFAULT_RESPONSIVE_POSTURE_ID)!;

export interface ResponsivePostureValidation {
  readonly ok: boolean;
  readonly profile?: ResponsivePostureDefinition;
  /** Stable machine-readable reason when not ok. */
  readonly reason?: 'unknown-id' | 'unsupported-schema-version';
}

/**
 * Validate a persisted selection. Used by the DB compiler so a bad row is
 * rejected with a reason instead of silently laying out on a ladder nobody
 * chose. A typo must never resolve to the default here — that is the
 * difference between a closed vocabulary and a suggestion.
 */
export function validateResponsivePostureSelection(
  id: string | undefined,
  schemaVersion: number = RESPONSIVE_POSTURE_SCHEMA_VERSION
): ResponsivePostureValidation {
  if (id === undefined) return { ok: true };
  if (schemaVersion !== RESPONSIVE_POSTURE_SCHEMA_VERSION) {
    return { ok: false, reason: 'unsupported-schema-version' };
  }
  const profile = typeof id === 'string' ? PROFILE_INDEX.get(id) : undefined;
  if (!profile) return { ok: false, reason: 'unknown-id' };
  return { ok: true, profile };
}

/**
 * Fail-closed RENDER-path resolution: anything invalid yields `balanced`. The
 * compiler already rejects a bad id at write time; this exists so a row
 * persisted before a profile retirement lays out on the baseline ladder
 * instead of throwing inside a layout effect.
 */
export function resolveResponsivePosture(
  id: string | undefined,
  schemaVersion?: number
): ResponsivePostureDefinition {
  const validation = validateResponsivePostureSelection(id, schemaVersion);
  return validation.ok && validation.profile
    ? validation.profile
    : DEFAULT_RESPONSIVE_POSTURE;
}
