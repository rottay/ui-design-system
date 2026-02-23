/**
 * FileManager - All Presets
 */

import type { FileManagerPreset, FileManagerProps } from '../core';
import type { ComponentType } from 'react';
import { StandardFileManager } from './standard';
import { DualPanelFileManager } from './dual-panel';

export { StandardFileManager } from './standard';
export { DualPanelFileManager } from './dual-panel';

export const FILE_MANAGER_PRESETS: Record<FileManagerPreset, ComponentType<FileManagerProps>> = {
  standard: StandardFileManager,
  'dual-panel': DualPanelFileManager,
};
