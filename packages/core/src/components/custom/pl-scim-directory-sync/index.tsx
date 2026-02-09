/**
 * PlScimDirectorySync - Main Export
 * Monitor and configure SCIM directory synchronization with external identity providers
 */

import React from 'react';
import type { PlScimDirectorySyncProps } from './core';
import { PL_SCIM_DIRECTORY_SYNC_DEFAULTS } from './core';
import { PL_SCIM_DIRECTORY_SYNC_PRESETS } from './presets';

export { type PlScimDirectorySyncProps, type PlScimDirectorySyncPreset, PL_SCIM_DIRECTORY_SYNC_DEFAULTS } from './core';
export type {
  SyncProvider,
  SyncOperation,
  SyncMapping,
  SyncStats,
  ProviderType,
  ProviderStatus,
  SyncOperationType,
  SyncOperationStatus,
  MappingDirection,
} from './core';
export * from './presets';

export function PlScimDirectorySync(props: PlScimDirectorySyncProps): React.ReactElement {
  const preset = props.preset ?? PL_SCIM_DIRECTORY_SYNC_DEFAULTS.preset ?? 'status';
  const PresetComponent = PL_SCIM_DIRECTORY_SYNC_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlScimDirectorySync.displayName = 'PlScimDirectorySync';
