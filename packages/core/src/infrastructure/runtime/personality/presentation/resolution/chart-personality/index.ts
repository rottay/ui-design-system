'use client';

/** React bridge for the canonical chart-personality resolver. */

import { useContext, useMemo } from 'react';

import type { ChartPersonalityTokens } from '../../../../../../foundation/contracts/kernel/tokens/personality';
import { ProductProfileContext } from '../../../../product-profiles';
// The Context OBJECT, from the module that owns the single `createContext`
// call -- not the tenant facade. A chart renderer needs the identity to read
// through and nothing else; importing the facade dragged provider validation,
// root-attribute claiming and the first-party registry into every leaf that
// only wanted `useContext`.
import { TenantContext } from '../../../../tenant/foundation/context';
import { EngineVisualDeclarationContext } from '../../../../foundation/engine-visual';
import { resolveChartPersonality } from '../../../runtime/resolution/chart';

/**
 * Read the resolved chart posture from the nearest provider scope.
 *
 * Unlike foundational tenant hooks, chart renderers are valid standalone (for
 * SSR, tests, embeds, and progressive adoption). Missing providers therefore
 * resolve to the neutral default instead of throwing. The hook has no engine,
 * hostname, slug, or supplier coupling.
 */
export function useResolvedChartPersonality(): ChartPersonalityTokens {
  const { profile } = useContext(ProductProfileContext);
  const compiled = useContext(EngineVisualDeclarationContext)?.runtime.personality;

  return useMemo(
    () => resolveChartPersonality({ compiled, productProfile: profile }),
    [compiled, profile],
  );
}
