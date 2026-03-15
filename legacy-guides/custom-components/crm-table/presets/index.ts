/**
 * CrmTable - All Presets
 */

import type { CrmTablePreset, CrmTableProps } from '../core';
import type { ComponentType } from 'react';
import { StandardCrmTable } from './standard';
import { EnrichedCrmTable } from './enriched';

export { StandardCrmTable } from './standard';
export { EnrichedCrmTable } from './enriched';

export const CRM_TABLE_PRESETS: Record<CrmTablePreset, ComponentType<CrmTableProps>> = {
  standard: StandardCrmTable,
  enriched: EnrichedCrmTable,
};
