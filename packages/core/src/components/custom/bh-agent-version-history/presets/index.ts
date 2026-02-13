/**
 * BhAgentVersionHistory - All Presets
 */

export { TimelineBhAgentVersionHistory } from './timeline';
export { CompactBhAgentVersionHistory } from './compact';

import type { BhAgentVersionHistoryPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhAgentVersionHistoryProps } from '../core';
import { TimelineBhAgentVersionHistory } from './timeline';
import { CompactBhAgentVersionHistory } from './compact';

export const BH_AGENT_VERSION_HISTORY_PRESETS: Record<BhAgentVersionHistoryPreset, ComponentType<BhAgentVersionHistoryProps>> = {
  timeline: TimelineBhAgentVersionHistory,
  compact: CompactBhAgentVersionHistory,
};
