'use client';

import { useContext, useMemo } from 'react';

// The Context OBJECT from its sole owner, not the tenant facade. This module
// is a UI leaf: it reads a vertical identity through the nearest provider and
// never validates, resolves or publishes a tenant.
import { TenantContext } from '@/infrastructure/runtime/tenant/foundation/context';
import {
  resolveChartGrammar,
  type ChartGrammar,
} from '../../foundation/spec';

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
