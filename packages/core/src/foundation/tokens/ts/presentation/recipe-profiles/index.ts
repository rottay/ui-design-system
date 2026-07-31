/**
 * Rottay recipe-profile registry (DS-S001) — governed, migration-safe
 * personality selection shared by the static BrandTheme compiler, the DB
 * TenantThemeDocument compiler and the runtime provider.
 *
 * A profile is a bounded set of per-family recipe axis defaults. Theme sources
 * SELECT a namespaced id from this closed registry; they never author profile
 * content. Resolution is fail-closed: an unknown id, a malformed id or an
 * unsupported schema version yields no profile (engine defaults), never a
 * throw on the paint path. Ids are permanent once published — retire by
 * superseding `@N+1`, never by reuse.
 */

/** Version of the profile selection contract persisted by theme sources. */
export const RECIPE_PROFILE_SCHEMA_VERSION = 1 as const;

/**
 * Closed family/axis vocabulary.
 *
 * Profiles are data, not a parallel styling language. Keeping both the family
 * names and their admissible axes/values closed prevents an inline profile
 * from inventing a second recipe system that components happen to interpret
 * differently.
 */
export interface RecipeProfileDefaultsByFamily {
  readonly button: {
    readonly shape?: 'default' | 'round';
    readonly size?: 'sm' | 'lg';
    readonly variant?: 'outline' | 'primary';
  };
  readonly card: {
    readonly variant?: 'outlined' | 'elevated';
  };
  readonly tabs: {
    readonly recipe?: 'underline' | 'pills';
  };
  readonly tag: {
    readonly size?: 'sm' | 'lg';
    readonly radius?: 'none' | 'full';
    readonly bordered?: boolean;
    readonly outlined?: boolean;
  };
  readonly sectionCard: {
    readonly variant?: 'outlined' | 'elevated';
  };
  readonly dataTable: {
    readonly density?: 'compact' | 'comfortable';
    readonly recipe?: 'ruled' | 'minimal';
  };
}

/** Families a profile may default. Mirrors the DS-S001 target set. */
export type RecipeProfileFamily = keyof RecipeProfileDefaultsByFamily;

/** Bounded defaults for one exact family. */
export type RecipeProfileFamilyDefaults<
  Family extends RecipeProfileFamily = RecipeProfileFamily,
> = Readonly<RecipeProfileDefaultsByFamily[Family]>;

export interface RecipeProfileDefinition {
  /** Namespaced, versioned id: `<namespace>/<name>@<major>`. */
  readonly id: string;
  readonly schemaVersion: typeof RECIPE_PROFILE_SCHEMA_VERSION;
  /** Human intent, for the manifest and audits. */
  readonly description: string;
  readonly families: {
    readonly [Family in RecipeProfileFamily]?: RecipeProfileFamilyDefaults<Family>;
  };
}

const PROFILE_ID_PATTERN = /^[a-z0-9-]+\/[a-z0-9-]+@[0-9]+$/;

/** First-party profile registry. Adding an entry is a reviewed DS change. */
export const RECIPE_PROFILES = [
  {
    id: 'rottay/technical-sharp@1',
    schemaVersion: RECIPE_PROFILE_SCHEMA_VERSION,
    description:
      'Radius-zero technical posture: square geometry, outlined containers, ruled data surfaces.',
    families: {
      button: { shape: 'default', size: 'sm', variant: 'outline' },
      card: { variant: 'outlined' },
      tabs: { recipe: 'underline' },
      tag: { size: 'sm', radius: 'none', bordered: true, outlined: true },
      sectionCard: { variant: 'outlined' },
      dataTable: { density: 'compact', recipe: 'ruled' },
    },
  },
  {
    id: 'rottay/editorial-round@1',
    schemaVersion: RECIPE_PROFILE_SCHEMA_VERSION,
    description:
      'Ultra-rounded editorial posture: pill controls, soft elevated containers, open data surfaces.',
    families: {
      button: { shape: 'round', size: 'lg', variant: 'primary' },
      card: { variant: 'elevated' },
      tabs: { recipe: 'pills' },
      tag: { size: 'lg', radius: 'full', bordered: false, outlined: false },
      sectionCard: { variant: 'elevated' },
      dataTable: { density: 'comfortable', recipe: 'minimal' },
    },
  },
] as const satisfies readonly RecipeProfileDefinition[];

const PROFILE_INDEX: ReadonlyMap<string, RecipeProfileDefinition> = new Map(
  RECIPE_PROFILES.map((profile) => [profile.id, profile])
);

export type RecipeProfileId = (typeof RECIPE_PROFILES)[number]['id'];

export interface RecipeProfileValidation {
  readonly ok: boolean;
  readonly profile?: RecipeProfileDefinition;
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
export function validateRecipeProfileSelection(
  id: string | undefined,
  schemaVersion: number = RECIPE_PROFILE_SCHEMA_VERSION
): RecipeProfileValidation {
  if (id === undefined) return { ok: true };
  if (typeof id !== 'string' || !PROFILE_ID_PATTERN.test(id)) {
    return { ok: false, reason: 'malformed-id' };
  }
  if (schemaVersion !== RECIPE_PROFILE_SCHEMA_VERSION) {
    return { ok: false, reason: 'unsupported-schema-version' };
  }
  const profile = PROFILE_INDEX.get(id);
  if (!profile) return { ok: false, reason: 'unknown-id' };
  return { ok: true, profile };
}

/** Fail-closed runtime resolution: anything invalid yields no profile. */
export function resolveRecipeProfile(
  id: string | undefined,
  schemaVersion?: number
): RecipeProfileDefinition | undefined {
  const validation = validateRecipeProfileSelection(id, schemaVersion);
  return validation.ok ? validation.profile : undefined;
}
