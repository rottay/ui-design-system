/**
 * BhDecisionSupport - All Presets
 */

import type { BhDecisionSupportPreset, BhDecisionSupportProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhDecisionSupport } from './compact';

export { CompactBhDecisionSupport } from './compact';

export const BH_DECISION_SUPPORT_PRESETS: Record<BhDecisionSupportPreset, ComponentType<BhDecisionSupportProps>> = {
  compact: CompactBhDecisionSupport,
};
