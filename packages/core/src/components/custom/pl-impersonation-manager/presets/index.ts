/**
 * PlImpersonationManager - All Presets
 */

export { PanelPlImpersonationManager } from './panel';
export { LogPlImpersonationManager } from './log';

import type { PlImpersonationManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlImpersonationManagerProps } from '../core';
import { PanelPlImpersonationManager } from './panel';
import { LogPlImpersonationManager } from './log';

export const PL_IMPERSONATION_MANAGER_PRESETS: Record<PlImpersonationManagerPreset, ComponentType<PlImpersonationManagerProps>> = {
  panel: PanelPlImpersonationManager,
  log: LogPlImpersonationManager,
};
