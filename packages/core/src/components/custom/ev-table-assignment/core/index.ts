/**
 * EvTableAssignment - Core Interface
 * Person-to-table assignment with visual drag-and-drop and list views
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvTableAssignmentPreset = 'visual' | 'list';

export interface TableInfo {
  id: string;
  label: string;
  capacity: number;
  zone: string;
  shape: 'round' | 'rectangle' | 'booth';
  assignedGuests: AssignedGuest[];
  server?: string;
  status: 'available' | 'partial' | 'full' | 'reserved';
}

export interface AssignedGuest {
  id: string;
  name: string;
  avatar?: string;
  vip?: boolean;
  dietaryNotes?: string;
  ticketType?: string;
}

export interface EvTableAssignmentProps extends EngineAwareProps {
  preset?: EvTableAssignmentPreset;
  tables?: TableInfo[];
  unassignedGuests?: AssignedGuest[];
  onAssign?: (guestId: string, tableId: string) => void;
  onUnassign?: (guestId: string, tableId: string) => void;
  onTableSelect?: (tableId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_TABLE_ASSIGNMENT_DEFAULTS: Partial<EvTableAssignmentProps> = {
  preset: 'visual',
};
