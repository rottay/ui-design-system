/**
 * BhClientList - Core Interface
 * Client DataTable + grid view for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBClient[] directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBClient } from '@rottay/recruiter';

export type BhClientListPreset = 'table' | 'grid';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterClient = DBClient;

export interface BhClientListProps extends EngineAwareProps {
  preset?: BhClientListPreset;

  /** Clients to display - accepts DBClient[] directly from @rottay/recruiter */
  clients?: DBClient[];

  /** Callback when a client is clicked */
  onClientClick?: (clientId: string) => void;

  /** Currently selected client ID */
  selectedClientId?: string | null;

  /** Sort field */
  sortBy?: string;

  /** Callback when sort changes */
  onSortChange?: (field: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CLIENT_LIST_DEFAULTS: Partial<BhClientListProps> = {
  preset: 'table',
  loading: false,
};

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use RecruiterClient (DBClient) instead */
export type ClientListItem = RecruiterClient;
