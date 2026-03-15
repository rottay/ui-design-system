/**
 * EvWaitlistManager - Core Interface
 * Waitlist and presale management
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvWaitlistManagerPreset = 'standard' | 'priority';

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  requestedType: string;
  position: number;
  joinedAt: Date;
  status: "waiting" | "notified" | "converted" | "expired";
  priority: "normal" | "vip" | "high";
}

export interface PresaleCode {
  code: string;
  discount: number;
  usageCount: number;
  maxUses: number;
  validUntil: Date;
  isActive: boolean;
}

export interface EvWaitlistManagerProps extends EngineAwareProps {
  preset?: EvWaitlistManagerPreset;
  entries?: WaitlistEntry[];
  presaleCodes?: PresaleCode[];
  onNotify?: (entryId: string) => void;
  onGenerateCode?: () => void;
  onToggleCode?: (code: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_WAITLIST_MANAGER_DEFAULTS: Partial<EvWaitlistManagerProps> = {
  preset: 'standard',

};
