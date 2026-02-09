/**
 * PlScimDirectorySync - All Presets
 */

export { StatusPlScimDirectorySync } from './status';
export { LogPlScimDirectorySync } from './log';

import type { PlScimDirectorySyncPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlScimDirectorySyncProps } from '../core';
import { StatusPlScimDirectorySync } from './status';
import { LogPlScimDirectorySync } from './log';

export const PL_SCIM_DIRECTORY_SYNC_PRESETS: Record<PlScimDirectorySyncPreset, ComponentType<PlScimDirectorySyncProps>> = {
  status: StatusPlScimDirectorySync,
  log: LogPlScimDirectorySync,
};
