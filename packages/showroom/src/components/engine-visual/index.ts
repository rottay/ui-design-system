'use client';

import { useMemo } from 'react';
import {
  firstPartyEngineVisual,
  type EngineVisualDeclaration,
} from '@rottay/design-system';

import type {
  RuntimeQueryEngine,
  RuntimeQueryTenant,
} from '@/components/runtime/query';

/**
 * The compiled projection the classic engine seeds antd from, memoized per
 * selection.
 *
 * The showroom is the one place an engine is chosen at runtime rather than by
 * the vertical, so it is also the one place that has to hand the provider a
 * projection compiled for the engine the reader picked.
 */
export function useFirstPartyEngineVisual(
  tenantSlug: RuntimeQueryTenant,
  engine: RuntimeQueryEngine,
): EngineVisualDeclaration {
  return useMemo(() => firstPartyEngineVisual(tenantSlug, engine), [tenantSlug, engine]);
}
