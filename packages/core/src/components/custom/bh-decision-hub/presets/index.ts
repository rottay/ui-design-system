/**
 * BhDecisionHub - All Presets
 */

export { StandardBhDecisionHub } from './standard';
export { BulkBhDecisionHub } from './bulk';

import type { BhDecisionHubPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhDecisionHubProps } from '../core';
import { StandardBhDecisionHub } from './standard';
import { BulkBhDecisionHub } from './bulk';

export const BH_DECISION_HUB_PRESETS: Record<BhDecisionHubPreset, ComponentType<BhDecisionHubProps>> = {
  standard: StandardBhDecisionHub,
  bulk: BulkBhDecisionHub,
};
