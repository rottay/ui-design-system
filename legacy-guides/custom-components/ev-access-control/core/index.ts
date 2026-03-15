/**
 * EvAccessControl - Core Interface
 * Access control management
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvAccessControlPreset = 'monitor' | 'config';

export interface AccessLog {
  id: string;
  personName: string;
  personType: "staff" | "attendee" | "artist" | "vendor";
  zone: string;
  action: "entry" | "exit" | "denied";
  time: Date;
  credentialId?: string;
  reason?: string;
}

export interface GateStatus {
  id: string;
  name: string;
  zone: string;
  status: "open" | "closed" | "restricted";
  throughput: number;
}

export interface EvAccessControlProps extends EngineAwareProps {
  preset?: EvAccessControlPreset;
  logs?: AccessLog[];
  gates?: GateStatus[];
  onGateToggle?: (gateId: string) => void;
  onLogClick?: (logId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_ACCESS_CONTROL_DEFAULTS: Partial<EvAccessControlProps> = {
  preset: 'monitor',

};
