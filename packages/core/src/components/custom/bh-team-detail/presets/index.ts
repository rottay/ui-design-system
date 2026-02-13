/**
 * BhTeamDetail - All Presets
 */

export { FullBhTeamDetail } from './full';
export { CompactBhTeamDetail } from './compact';

import type { BhTeamDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhTeamDetailProps } from '../core';
import { FullBhTeamDetail } from './full';
import { CompactBhTeamDetail } from './compact';

export const BH_TEAM_DETAIL_PRESETS: Record<BhTeamDetailPreset, ComponentType<BhTeamDetailProps>> = {
  full: FullBhTeamDetail,
  compact: CompactBhTeamDetail,
};
