/**
 * BhTokenManager - All Presets
 */

export { OverviewBhTokenManager } from './overview';
export { DetailedBhTokenManager } from './detailed';

import type { BhTokenManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhTokenManagerProps } from '../core';
import { OverviewBhTokenManager } from './overview';
import { DetailedBhTokenManager } from './detailed';

export const BH_TOKEN_MANAGER_PRESETS: Record<BhTokenManagerPreset, ComponentType<BhTokenManagerProps>> = {
  overview: OverviewBhTokenManager,
  detailed: DetailedBhTokenManager,
};
