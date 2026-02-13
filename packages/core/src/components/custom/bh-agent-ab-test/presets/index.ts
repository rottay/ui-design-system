/**
 * BhAgentAbTest - All Presets
 */

export { ConfigBhAgentAbTest } from './config';
export { CompactBhAgentAbTest } from './compact';

import type { BhAgentAbTestPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhAgentAbTestProps } from '../core';
import { ConfigBhAgentAbTest } from './config';
import { CompactBhAgentAbTest } from './compact';

export const BH_AGENT_AB_TEST_PRESETS: Record<BhAgentAbTestPreset, ComponentType<BhAgentAbTestProps>> = {
  config: ConfigBhAgentAbTest,
  compact: CompactBhAgentAbTest,
};
