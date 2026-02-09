/**
 * PlScimDirectorySync - Core Interface
 * Monitor and configure SCIM directory synchronization with external identity providers
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlScimDirectorySyncPreset = 'status' | 'log';

// ─── Sync Status ────────────────────────────────────────────────────────────

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'paused' | 'pending';

// ─── Sync Operation ─────────────────────────────────────────────────────────

export type SyncOperation = 'create' | 'update' | 'delete' | 'provision' | 'deprovision';

// ─── Sync Mapping ───────────────────────────────────────────────────────────

export interface SyncMapping {
  /** Unique identifier for this mapping entry */
  id: string;
  /** External identifier from the identity provider */
  externalId: string;
  /** Internal identifier in the local system */
  internalId: string;
  /** Display name of the mapped user/entity */
  displayName: string;
  /** Email address of the mapped user */
  email: string;
  /** Current sync status of this mapping */
  status: SyncStatus;
  /** Timestamp of the last successful sync for this mapping */
  lastSynced?: Date;
  /** Source identity provider name */
  source: string;
  /** List of conflict descriptions, if any exist */
  conflicts?: string[];
}

// ─── Sync Log ───────────────────────────────────────────────────────────────

export type SyncLogStatus = 'success' | 'failure' | 'skipped';

export interface SyncLog {
  /** Unique identifier for this log entry */
  id: string;
  /** The type of operation that was performed */
  operation: SyncOperation;
  /** Result status of the operation */
  status: SyncLogStatus;
  /** Entity type (e.g. 'user', 'group') */
  entity: string;
  /** Display name of the affected entity */
  entityName: string;
  /** When the operation occurred */
  timestamp: Date;
  /** Additional message or error description */
  message?: string;
  /** Duration of the operation in milliseconds */
  duration?: number;
}

// ─── Sync Config ────────────────────────────────────────────────────────────

export interface SyncConfig {
  /** Identity provider name (e.g. 'Azure AD', 'Okta', 'Google Workspace') */
  provider: string;
  /** The tenant URL for the identity provider */
  tenantUrl: string;
  /** Current overall sync status */
  status: SyncStatus;
  /** Timestamp of the last full synchronization */
  lastFullSync?: Date;
  /** Timestamp of the next scheduled synchronization */
  nextScheduledSync?: Date;
  /** Total number of mapped identities */
  totalMapped: number;
  /** Total number of active conflicts */
  totalConflicts: number;
  /** Whether auto-provisioning is enabled */
  autoProvision: boolean;
  /** Sync interval in minutes */
  syncInterval: number;
}

// ─── Component Props ────────────────────────────────────────────────────────

export interface PlScimDirectorySyncProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlScimDirectorySyncPreset;

  /** Sync configuration and provider details */
  config: SyncConfig;
  /** User/entity mappings between external and internal systems */
  mappings?: SyncMapping[];
  /** Sync operation logs */
  logs?: SyncLog[];

  /** Trigger a manual sync */
  onSync?: () => void;
  /** Resolve a conflict for a specific mapping */
  onResolveConflict?: (mappingId: string) => void;
  /** Toggle auto-provisioning on/off */
  onToggleAutoProvision?: (enabled: boolean) => void;
  /** Handle click on a specific mapping row */
  onMappingClick?: (mappingId: string) => void;

  /** Loading state */
  loading?: boolean;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_SCIM_DIRECTORY_SYNC_DEFAULTS: Partial<PlScimDirectorySyncProps> = {
  preset: 'status',
  loading: false,
};
