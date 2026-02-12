/**
 * StaffProfile - Core Interface
 * Detail panel with personal info, skills, certifications, work history, evaluations
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type StaffProfilePreset = 'full' | 'compact';

export interface StaffSkill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verifiedAt?: Date;
}

export interface StaffCertification {
  id: string;
  name: string;
  issuedBy: string;
  issuedAt: Date;
  expiresAt?: Date;
  status: 'valid' | 'expired' | 'pending';
}

export interface StaffWorkHistory {
  id: string;
  eventName: string;
  role: string;
  startDate: Date;
  endDate: Date;
  hoursWorked: number;
  rating?: number;
}

export interface StaffEvaluation {
  id: string;
  evaluatorName: string;
  date: Date;
  overallRating: number;
  categories: { name: string; score: number }[];
  comments?: string;
}

export interface StaffProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: 'active' | 'inactive' | 'on-leave';
  bio?: string;
  hourlyRate: number;
  currency?: string;
  hireDate: Date;
  skills: StaffSkill[];
  certifications: StaffCertification[];
  workHistory: StaffWorkHistory[];
  evaluations: StaffEvaluation[];
}

export interface StaffProfileProps extends EngineAwareProps {
  preset?: StaffProfilePreset;
  profile?: StaffProfileData;
  onEdit?: () => void;
  onBack?: () => void;
  onDeactivate?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const STAFF_PROFILE_DEFAULTS: Partial<StaffProfileProps> = {
  preset: 'full',
};
