/**
 * FileManager - All Presets
 */

import type { FileManagerPreset } from '../core';
import { StandardFileManager } from './standard';
import { DualPanelFileManager } from './dual-panel';

export { StandardFileManager } from './standard';
export { DualPanelFileManager } from './dual-panel';

export const FILE_MANAGER_PRESETS: Record<FileManagerPreset, React.ComponentType<any>> = {
  standard: StandardFileManager,
  'dual-panel': DualPanelFileManager,
};
