/**
 * BhClientList - Core Interface
 * Client DataTable + grid view for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhClientListPreset = 'table' | 'grid';

export interface ClientListItem {
  id: string;
  name: string;
  tier: 'enterprise' | 'business' | 'starter';
  contractStatus: 'active' | 'expiring' | 'expired';
  openPositions: number;
  totalHires: number;
  revenue: number;
}

export interface BhClientListProps extends EngineAwareProps {
  preset?: BhClientListPreset;
  clients: ClientListItem[];
  onClientClick?: (clientId: string) => void;
  selectedClientId?: string | null;
  sortBy?: string;
  onSortChange?: (field: string) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_CLIENT_LIST_DEFAULTS: Partial<BhClientListProps> = {
  preset: 'table',
  loading: false,
};
