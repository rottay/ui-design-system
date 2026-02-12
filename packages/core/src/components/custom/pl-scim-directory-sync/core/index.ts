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

// ─── Sync Operation Types ───────────────────────────────────────────────────

export type SyncOperationType = 'full' | 'incremental' | 'manual';

export type SyncOperationStatus = 'running' | 'completed' | 'failed' | 'partial';

// ─── Sync Stats ─────────────────────────────────────────────────────────────

export interface SyncStats {
  /** Number of users created in this operation */
  usersCreated: number;
  /** Number of users updated in this operation */
  usersUpdated: number;
  /** Number of users deactivated in this operation */
  usersDeactivated: number;
  /** Number of groups created in this operation */
  groupsCreated: number;
  /** Number of groups updated in this operation */
  groupsUpdated: number;
  /** Number of errors encountered in this operation */
  errors: number;
}

// ─── Sync Operation Record ──────────────────────────────────────────────────

export interface SyncOperationRecord {
  /** Unique identifier for this operation */
  id: string;
  /** Provider ID this operation is associated with */
  providerId: string;
  /** Type of sync operation */
  type: SyncOperationType;
  /** Current status of the operation */
  status: SyncOperationStatus;
  /** When the operation started */
  startedAt: Date | string;
  /** Duration of the operation in seconds */
  duration?: number;
  /** Statistics for this operation */
  stats: SyncStats;
  /** Error details if the operation failed */
  errorDetails?: Array<{ resource: string; message: string }>;
}

// ─── Mapping Direction ──────────────────────────────────────────────────────

export type MappingDirection = 'inbound' | 'outbound' | 'bidirectional';

// ─── Sync Mapping ───────────────────────────────────────────────────────────

export interface SyncMapping {
  /** Unique identifier for this mapping entry */
  id?: string;
  /** External identifier from the identity provider */
  externalId?: string;
  /** Internal identifier in the local system */
  internalId?: string;
  /** Display name of the mapped user/entity */
  displayName?: string;
  /** Email address of the mapped user */
  email?: string;
  /** Current sync status of this mapping */
  status?: SyncStatus;
  /** Timestamp of the last successful sync for this mapping */
  lastSynced?: Date;
  /** Source identity provider name */
  source?: string;
  /** List of conflict descriptions, if any exist */
  conflicts?: string[];
  /** SCIM attribute name (for attribute mappings) */
  scimAttribute?: string;
  /** Direction of the mapping */
  direction?: MappingDirection;
  /** Local attribute name (for attribute mappings) */
  localAttribute?: string;
  /** Whether this mapping is required */
  isRequired?: boolean;
  /** Transform function name or expression */
  transform?: string;
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

// ─── Provider Types ─────────────────────────────────────────────────────────

export type ProviderType = 'azure-ad' | 'okta' | 'google-workspace' | 'onelogin' | 'custom';

export type ProviderStatus = 'active' | 'inactive' | 'error' | 'pending';

// ─── Sync Provider ──────────────────────────────────────────────────────────

export interface SyncProvider {
  /** Unique identifier for this provider */
  id: string;
  /** Display name of the provider */
  name: string;
  /** Type of identity provider */
  type: ProviderType;
  /** Current status of the provider connection */
  status: ProviderStatus;
  /** The tenant URL for the identity provider */
  tenantUrl?: string;
  /** Last time the provider was synced */
  lastSync?: Date | string;
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

// ─── Filter Change Event ────────────────────────────────────────────────────

export interface FilterChangeEvent {
  providerId?: string;
  operationType?: SyncOperationType;
  operationStatus?: SyncOperationStatus;
  dateStart?: Date | string;
  dateEnd?: Date | string;
}

// ─── Component Props ────────────────────────────────────────────────────────

export interface PlScimDirectorySyncProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlScimDirectorySyncPreset;

  /** Sync configuration and provider details */
  config?: SyncConfig;
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

  // ─── Log Preset Props ─────────────────────────────────────────────────────

  /** List of sync providers (for log preset) */
  providers?: SyncProvider[];
  /** List of sync operations (for log preset) */
  operations?: SyncOperationRecord[];
  /** Handle click on a specific operation row */
  onOperationClick?: (operationId: string) => void;
  /** Export logs to a file */
  onExportLogs?: () => void;

  // ─── Filter Props ─────────────────────────────────────────────────────────

  /** Filter by provider ID */
  filterProviderId?: string;
  /** Filter by operation type */
  filterOperationType?: SyncOperationType;
  /** Filter by operation status */
  filterOperationStatus?: SyncOperationStatus;
  /** Filter by start date */
  filterDateStart?: Date | string;
  /** Filter by end date */
  filterDateEnd?: Date | string;
  /** Handle filter changes */
  onFilterChange?: (filters: FilterChangeEvent) => void;

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
