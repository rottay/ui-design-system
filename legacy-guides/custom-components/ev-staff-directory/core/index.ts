/**
 * EvStaffDirectory - Core Interface
 * Staff member directory
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvStaffDirectoryPreset = 'cards' | 'table';

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  status: "active" | "inactive" | "on-leave";
  skills: string[];
  rating: number;
  hireDate: Date;
}

export interface StaffFilter {
  search?: string;
  role?: string;
  status?: string;
  skill?: string;
}

export interface EvStaffDirectoryProps extends EngineAwareProps {
  preset?: EvStaffDirectoryPreset;
  staff?: StaffMember[];
  filters?: StaffFilter;
  onStaffClick?: (id: string) => void;
  onFilterChange?: (filters: StaffFilter) => void;
  onInviteStaff?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_STAFF_DIRECTORY_DEFAULTS: Partial<EvStaffDirectoryProps> = {
  preset: 'cards',

};
