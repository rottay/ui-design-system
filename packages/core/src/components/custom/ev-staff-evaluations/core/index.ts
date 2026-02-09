/**
 * EvStaffEvaluations - Core Interface
 * Staff evaluation/review system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvStaffEvaluationsPreset = 'form' | 'summary';

export interface EvaluationRecord {
  id: string;
  staffName: string;
  staffAvatar?: string;
  eventName: string;
  date: Date;
  punctualityScore: number;
  professionalismScore: number;
  overallScore: number;
  comments?: string;
}

export interface EvaluationForm {
  staffId: string;
  eventId: string;
  punctuality: number;
  professionalism: number;
  teamwork: number;
  quality: number;
  comments: string;
}

export interface EvStaffEvaluationsProps extends EngineAwareProps {
  preset?: EvStaffEvaluationsPreset;
  evaluations?: EvaluationRecord[];
  onSubmitEvaluation?: (form: EvaluationForm) => void;
  onEvaluationClick?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_STAFF_EVALUATIONS_DEFAULTS: Partial<EvStaffEvaluationsProps> = {
  preset: 'form',

};
