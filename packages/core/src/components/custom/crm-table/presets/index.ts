/**
 * CrmTable - All Presets
 */

import type { CrmTablePreset } from '../core';
import { StandardCrmTable } from './standard';
import { EnrichedCrmTable } from './enriched';

export { StandardCrmTable } from './standard';
export { EnrichedCrmTable } from './enriched';

export const CRM_TABLE_PRESETS: Record<CrmTablePreset, React.ComponentType<any>> = {
  standard: StandardCrmTable,
  enriched: EnrichedCrmTable,
};
