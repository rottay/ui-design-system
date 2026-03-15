/**
 * EvIncidentManager - Core Interface
 * Security, medical, and maintenance incident dispatch with timeline and map views
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvIncidentManagerPreset = 'dispatch' | 'map';

export interface Incident {
  id: string;
  type: 'security' | 'medical' | 'maintenance' | 'fire' | 'crowd';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  x?: number;
  y?: number;
  reportedBy: string;
  assignedTo?: string;
  status: 'reported' | 'dispatched' | 'in-progress' | 'resolved' | 'escalated';
  reportedAt: Date;
  resolvedAt?: Date;
  actions: IncidentAction[];
}

export interface IncidentAction {
  id: string;
  action: string;
  performedBy: string;
  timestamp: Date;
}

export interface EvIncidentManagerProps extends EngineAwareProps {
  preset?: EvIncidentManagerPreset;
  incidents?: Incident[];
  onIncidentClick?: (incidentId: string) => void;
  onAssign?: (incidentId: string, staffId: string) => void;
  onStatusChange?: (incidentId: string, status: Incident['status']) => void;
  onCreateIncident?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_INCIDENT_MANAGER_DEFAULTS: Partial<EvIncidentManagerProps> = {
  preset: 'dispatch',
};
