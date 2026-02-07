/**
 * BhAgentTester - All Presets
 */

export { StandardBhAgentTester } from './standard';

import type { BhAgentTesterPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhAgentTesterProps } from '../core';
import { StandardBhAgentTester } from './standard';

export const BH_AGENT_TESTER_PRESETS: Record<BhAgentTesterPreset, ComponentType<BhAgentTesterProps>> = {
  standard: StandardBhAgentTester,
};
