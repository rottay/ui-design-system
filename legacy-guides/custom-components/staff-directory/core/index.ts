/**
 * StaffDirectory - Core Interface
 * Staff member table with skills, certifications, availability, rate
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type StaffDirectoryPreset = 'cards' | 'table';

export interface StaffDirectoryMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'on-leave';
  skills: string[];
  certifications: string[];
  availability: 'full-time' | 'part-time' | 'on-call' | 'unavailable';
  hourlyRate: number;
  currency?: string;
  rating: number;
  hireDate: Date;
}

export interface StaffDirectoryFilter {
  search?: string;
  role?: string;
  status?: string;
  availability?: string;
  skill?: string;
}

export interface StaffDirectoryProps extends EngineAwareProps {
  preset?: StaffDirectoryPreset;
  staff?: StaffDirectoryMember[];
  filters?: StaffDirectoryFilter;
  onStaffClick?: (id: string) => void;
  onFilterChange?: (filters: StaffDirectoryFilter) => void;
  onAddStaff?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const STAFF_DIRECTORY_DEFAULTS: Partial<StaffDirectoryProps> = {
  preset: 'cards',
};
