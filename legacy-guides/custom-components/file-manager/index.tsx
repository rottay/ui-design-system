/**
 * FileManager - Main Export
 * Automatically selects preset based on props
 */

import type { FileManagerProps } from './core';
import { FILE_MANAGER_DEFAULTS } from './core';
import { FILE_MANAGER_PRESETS } from './presets';

export { type FileManagerProps, type FileManagerPreset, type FileItem, type FileManagerNavItem, type FileManagerAction, type FileManagerViewMode, FILE_MANAGER_DEFAULTS } from './core';
export * from './presets';

/**
 * FileManager component
 * Renders the appropriate preset based on the preset prop
 */
export function FileManager(props: FileManagerProps): React.ReactElement {
  const preset = props.preset ?? FILE_MANAGER_DEFAULTS.preset ?? 'standard';
  const PresetComponent = FILE_MANAGER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

FileManager.displayName = 'FileManager';

export { StandardFileManager, DualPanelFileManager } from './presets';
