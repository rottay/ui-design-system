/**
 * PlPasskeyManager - All Presets
 */

export { ListPlPasskeyManager } from './list';
export { SetupPlPasskeyManager } from './setup';

import type { PlPasskeyManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlPasskeyManagerProps } from '../core';
import { ListPlPasskeyManager } from './list';
import { SetupPlPasskeyManager } from './setup';

export const PL_PASSKEY_MANAGER_PRESETS: Record<PlPasskeyManagerPreset, ComponentType<PlPasskeyManagerProps>> = {
  list: ListPlPasskeyManager,
  setup: SetupPlPasskeyManager,
};
