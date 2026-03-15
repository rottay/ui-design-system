/**
 * EvContractManager - Core Interface
 * Artist contracts management
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvContractManagerPreset = 'list' | 'editor';

export interface ArtistContract {
  id: string;
  artistName: string;
  eventName: string;
  fee: number;
  currency: string;
  status: "draft" | "sent" | "negotiating" | "signed" | "completed";
  startDate: Date;
  endDate: Date;
  deliverables: string[];
}

export interface PaymentSchedule {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: "pending" | "paid" | "overdue";
}

export interface EvContractManagerProps extends EngineAwareProps {
  preset?: EvContractManagerPreset;
  contracts?: ArtistContract[];
  onContractClick?: (id: string) => void;
  onCreateContract?: () => void;
  onSignContract?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_CONTRACT_MANAGER_DEFAULTS: Partial<EvContractManagerProps> = {
  preset: 'list',

};
