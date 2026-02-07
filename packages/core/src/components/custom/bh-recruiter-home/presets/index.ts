/**
 * BhRecruiterHome - All Presets
 */

export { OverviewBhRecruiterHome } from './overview';
export { CompactBhRecruiterHome } from './compact';

import type { BhRecruiterHomePreset } from '../core';
import type { ComponentType } from 'react';
import type { BhRecruiterHomeProps } from '../core';
import { OverviewBhRecruiterHome } from './overview';
import { CompactBhRecruiterHome } from './compact';

export const BH_RECRUITER_HOME_PRESETS: Record<BhRecruiterHomePreset, ComponentType<BhRecruiterHomeProps>> = {
  overview: OverviewBhRecruiterHome,
  compact: CompactBhRecruiterHome,
};
