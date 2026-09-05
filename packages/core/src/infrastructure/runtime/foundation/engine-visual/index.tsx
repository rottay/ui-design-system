'use client';

/**
 * @fileoverview The compiled engine projection, published to the runtime.
 *
 * An engine library that needs concrete values — antd is the only shipped one —
 * gets them from the compile that produced the mounted artifact, never from a
 * second read of the live cascade and never from tenant branding fields. This
 * context is the transport, and absence is absence: a consumer that needs a
 * declaration and does not find one refuses instead of guessing.
 *
 * @module System/Runtime/EngineVisual
 * @category System
 * @package @rottay/design-system
 */

import React, { createContext, useContext } from 'react';
import type { EngineVisualDeclaration } from '@/foundation/contracts/composition/tenants/themes/engine-adapter';
import type { EngineName } from '@/foundation/contracts/kernel/engine-identity';
import type { TenantAppearance } from '@/foundation/contracts/composition/tenants/themes';

const EngineVisualDeclarationContext = createContext<EngineVisualDeclaration | null>(null);

export interface EngineVisualDeclarationProviderProps {
  declaration?: EngineVisualDeclaration;
  children: React.ReactNode;
}

export function EngineVisualDeclarationProvider({
  declaration,
  children,
}: EngineVisualDeclarationProviderProps): React.ReactElement {
  return (
    <EngineVisualDeclarationContext.Provider value={declaration ?? null}>
      {children}
    </EngineVisualDeclarationContext.Provider>
  );
}

/** The declaration if one was published, `null` otherwise. Never a substitute. */
export function useEngineVisualDeclaration(): EngineVisualDeclaration | null {
  return useContext(EngineVisualDeclarationContext);
}

/**
 * The declaration an engine that seeds a library cannot render without.
 *
 * @throws when nothing published one, or when the published compile was made
 * for a different engine than the one rendering.
 */
export function useRequiredEngineVisualDeclaration(
  engine: EngineVisualDeclaration['engine']
): EngineVisualDeclaration {
  const declaration = useContext(EngineVisualDeclarationContext);
  if (!declaration) {
    throw new Error(
      `The "${engine}" engine seeds its library from the compiled projection, and none was published. ` +
        'Pass `engineVisual` to DesignSystemProvider with the output of compileTheme for this tenant.'
    );
  }
  if (declaration.engine !== engine) {
    throw new Error(
      `The published projection was compiled for "${declaration.engine}" but "${engine}" is rendering. ` +
        'Compile with resolveAdapter(<the engine that renders>); there is no cross-engine projection.'
    );
  }
  return declaration;
}

/**
 * Refuse a declaration that does not belong to what is rendering.
 *
 * Two halves of ONE compile cannot disagree: the seeds carry one library's
 * token names, and the runtime half carries the governed profiles that compile
 * selected. A declaration produced from another engine or another theme is a
 * wiring error, and paying for it in a wrong first frame is the failure this
 * check exists to end.
 */
export function assertEngineVisualBelongs(
  declaration: EngineVisualDeclaration,
  engine: EngineName,
  appearance: TenantAppearance | undefined,
): void {
  if (declaration.engine !== engine) {
    throw new Error(
      `engineVisual was compiled for "${declaration.engine}" but "${engine}" renders. ` +
        'Compile with resolveAdapter(<the engine that renders>).'
    );
  }
  const declaredRecipe = appearance?.recipeProfile;
  const compiledRecipe = declaration.runtime.recipeProfile;
  if (
    declaredRecipe !== undefined
    && compiledRecipe !== undefined
    && declaredRecipe !== compiledRecipe
  ) {
    throw new Error(
      `engineVisual was compiled with recipe profile "${compiledRecipe}" but this tenant ` +
        `declares "${declaredRecipe}". The declaration belongs to another compile.`
    );
  }
  const declaredExperience = appearance?.general?.experienceProfile;
  const compiledExperience = declaration.runtime.experienceProfile;
  if (
    declaredExperience !== undefined
    && compiledExperience !== undefined
    && declaredExperience !== compiledExperience
  ) {
    throw new Error(
      `engineVisual was compiled with experience profile "${compiledExperience}" but this tenant ` +
        `declares "${declaredExperience}". The declaration belongs to another compile.`
    );
  }
}

export { EngineVisualDeclarationContext };
