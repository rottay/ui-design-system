/**
 * PlSsoConnectionManager - All Presets
 */

export { ListPlSsoConnectionManager } from './list';
export { SetupPlSsoConnectionManager } from './setup';

import type { PlSsoConnectionManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlSsoConnectionManagerProps } from '../core';
import { ListPlSsoConnectionManager } from './list';
import { SetupPlSsoConnectionManager } from './setup';

export const PL_SSO_CONNECTION_MANAGER_PRESETS: Record<PlSsoConnectionManagerPreset, ComponentType<PlSsoConnectionManagerProps>> = {
  list: ListPlSsoConnectionManager,
  setup: SetupPlSsoConnectionManager,
};
