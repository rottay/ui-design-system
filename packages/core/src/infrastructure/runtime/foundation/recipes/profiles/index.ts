/**
 * Recipe-profile runtime (DS-S001): mounts the validated profile for a React
 * subtree so component engines can read per-family axis defaults. The
 * governed registry, validation and fail-closed resolution live in
 * `@/foundation/tokens/ts/presentation/recipe-profiles` where both compilers
 * and this runtime can consume them.
 */
'use client';

import { createContext, createElement, useContext, type ReactNode } from 'react';

import {
  resolveRecipeProfile,
  type RecipeProfileDefinition,
  type RecipeProfileFamily,
  type RecipeProfileFamilyDefaults,
} from '@/foundation/tokens/ts/presentation/recipe-profiles';

export {
  RECIPE_PROFILES,
  RECIPE_PROFILE_SCHEMA_VERSION,
  resolveRecipeProfile,
  validateRecipeProfileSelection,
} from '@/foundation/tokens/ts/presentation/recipe-profiles';
export type {
  RecipeProfileDefinition,
  RecipeProfileFamily,
  RecipeProfileFamilyDefaults,
  RecipeProfileId,
  RecipeProfileValidation,
} from '@/foundation/tokens/ts/presentation/recipe-profiles';

const RecipeProfileContext = createContext<RecipeProfileDefinition | undefined>(
  undefined
);

export interface RecipeProfileProviderProps {
  /** Validated profile id from the compiled theme; invalid ids fail closed. */
  readonly profileId?: string;
  readonly schemaVersion?: number;
  readonly children?: ReactNode;
}

/**
 * Mounts the active recipe profile for a subtree. The compiled theme owner
 * (static artifact or DB appearance runtime) supplies the id; components read
 * per-family defaults through `useRecipeProfileDefaults`.
 */
export function RecipeProfileProvider({
  profileId,
  schemaVersion,
  children,
}: RecipeProfileProviderProps) {
  return createElement(
    RecipeProfileContext.Provider,
    { value: resolveRecipeProfile(profileId, schemaVersion) },
    children
  );
}

/** The active profile, if any. */
export function useRecipeProfile(): RecipeProfileDefinition | undefined {
  return useContext(RecipeProfileContext);
}

const EMPTY_DEFAULTS: RecipeProfileFamilyDefaults = Object.freeze({});

/**
 * Per-family axis defaults from the active profile. Explicit caller props
 * always win; engines apply these only where the caller left an axis unset.
 */
export function useRecipeProfileDefaults(
  family: RecipeProfileFamily
): RecipeProfileFamilyDefaults {
  const profile = useContext(RecipeProfileContext);
  return profile?.families[family] ?? EMPTY_DEFAULTS;
}
