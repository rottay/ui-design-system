/**
 * Public recipe/slot/profile manifest (DS-S001).
 *
 * Machine-readable statement of what an application may customize through the
 * governed recipe layer without addressing private DS anatomy: per-family
 * slots, bounded axes with their authored value domains, the closed
 * recipe-profile registry, and the per-family custom-property prefixes that
 * tenant compilers own. Built from the live definitions — never hand-listed.
 */

import {
  RECIPE_PROFILES,
  RECIPE_PROFILE_SCHEMA_VERSION,
} from '@/foundation/tokens/ts/presentation/recipe-profiles';
import { describeRecipeDefinition } from '../contracts';
import {
  BUTTON_RECIPE_DEFINITION,
  CARD_RECIPE_DEFINITION,
  SECTION_CARD_RECIPE_DEFINITION,
  TABS_RECIPE_DEFINITION,
  TAG_RECIPE_DEFINITION,
} from '../contracts/families';

export interface RecipeManifestFamily {
  readonly name: string;
  readonly slots: readonly string[];
  readonly axes: Readonly<Record<string, readonly string[]>>;
  /** Tenant-ownable custom-property namespace for this family. */
  readonly customPropertyPrefix: string;
  /** How the skin selects the visual recipe for this family. */
  readonly recipeMechanism: 'class' | 'data-attribute' | 'hybrid';
}

export interface RecipeManifest {
  readonly schemaVersion: typeof RECIPE_PROFILE_SCHEMA_VERSION;
  readonly families: readonly RecipeManifestFamily[];
  readonly profiles: ReadonlyArray<{
    readonly id: string;
    readonly description: string;
    readonly families: Readonly<Record<string, Readonly<Record<string, string | boolean>>>>;
  }>;
}

/** A family's authored shape, derived from the definition the engines resolve. */
interface FacadeFamily {
  readonly shape: {
    readonly name: string;
    readonly slotNames: readonly string[];
    readonly axisValues: Readonly<Record<string, readonly string[]>>;
  };
  readonly prefix: string;
  /** Axes the skin selects through data attributes rather than classes. */
  readonly dataAxes?: Readonly<Record<string, readonly string[]>>;
  readonly mechanism?: RecipeManifestFamily['recipeMechanism'];
}

const FACADE_FAMILIES: readonly FacadeFamily[] = [
  { shape: describeRecipeDefinition(BUTTON_RECIPE_DEFINITION), prefix: '--ds-button-' },
  { shape: describeRecipeDefinition(CARD_RECIPE_DEFINITION), prefix: '--ds-card-' },
  {
    shape: describeRecipeDefinition(TABS_RECIPE_DEFINITION),
    prefix: '--ds-tabs-',
    dataAxes: { recipe: ['underline', 'contained', 'segmented', 'pills'] },
    mechanism: 'hybrid',
  },
  {
    shape: describeRecipeDefinition(TAG_RECIPE_DEFINITION),
    prefix: '--ds-tag-',
    dataAxes: {
      variant: ['default', 'primary', 'secondary', 'success', 'warning', 'error'],
      size: ['xs', 'sm', 'md', 'lg', 'xl'],
      radius: ['none', 'sm', 'md', 'lg', 'full'],
      bordered: ['true', 'false'],
      outlined: ['true', 'false'],
    },
    mechanism: 'hybrid',
  },
  {
    shape: describeRecipeDefinition(SECTION_CARD_RECIPE_DEFINITION),
    prefix: '--ds-section-card-',
  },
];

/**
 * DataTable resolves its visual recipe through the `data-recipe` skin
 * attribute (`PatternDataTable.recipe`), not through class emission; its axis
 * domain is stated here from the public contract so the manifest stays
 * complete without forcing a cosmetic class migration.
 */
const DATA_TABLE_FAMILY: RecipeManifestFamily = {
  name: 'dataTable',
  slots: ['root'],
  axes: {
    recipe: ['minimal', 'ruled', 'grid', 'zebra', 'editorial'],
    density: ['compact', 'comfortable', 'spacious'],
  },
  customPropertyPrefix: '--ds-table-',
  recipeMechanism: 'data-attribute',
};

/** Build the manifest from the live recipe definitions and profile registry. */
export function buildRecipeManifest(): RecipeManifest {
  return {
    schemaVersion: RECIPE_PROFILE_SCHEMA_VERSION,
    families: [
      ...FACADE_FAMILIES.map(({ shape, prefix, dataAxes, mechanism }) => ({
        name: shape.name,
        slots: shape.slotNames,
        axes: { ...shape.axisValues, ...(dataAxes ?? {}) },
        customPropertyPrefix: prefix,
        recipeMechanism: mechanism ?? 'class',
      })),
      DATA_TABLE_FAMILY,
    ],
    profiles: RECIPE_PROFILES.map((profile) => ({
      id: profile.id,
      description: profile.description,
      families: profile.families as RecipeManifest['profiles'][number]['families'],
    })),
  };
}
