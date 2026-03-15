/**
 * EvStaffingPlanner - Core Interface
 * Event staffing requirements planner
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvStaffingPlannerPreset = 'overview' | 'detail';

export interface StaffingRequirement {
  id: string;
  role: string;
  quantityNeeded: number;
  quantityAssigned: number;
  hourlyRate: number;
  requiredSkills: string[];
  status: "open" | "partially-filled" | "filled";
}

export interface StaffInvitation {
  id: string;
  staffName: string;
  role: string;
  status: "pending" | "accepted" | "declined" | "expired";
  sentAt: Date;
}

export interface EvStaffingPlannerProps extends EngineAwareProps {
  preset?: EvStaffingPlannerPreset;
  requirements?: StaffingRequirement[];
  invitations?: StaffInvitation[];
  onSendInvitation?: (requirementId: string) => void;
  onRequirementClick?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_STAFFING_PLANNER_DEFAULTS: Partial<EvStaffingPlannerProps> = {
  preset: 'overview',

};
