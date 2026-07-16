'use client';

import { useContext, useMemo } from 'react';

import { TenantContext } from '@/runtime/tenant';
import {
  resolveChartGrammar,
  type ChartGrammar,
} from '../spec';

/**
 * Resolves the nearest provider's vertical recipe without observing tenant
 * identity. Standalone renderers and unknown custom verticals use the neutral
 * grammar, which keeps SSR and progressive adoption deterministic.
 */
export function useResolvedChartGrammar(): ChartGrammar {
  const tenantContext = useContext(TenantContext);
  const verticalIdentity = tenantContext?.vertical?.key
    ?? tenantContext?.config.vertical;

  return useMemo(
    () => resolveChartGrammar(verticalIdentity),
    [verticalIdentity],
  );
}
