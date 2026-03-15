/**
 * StaffEvaluations - Core Interface
 * Performance review form with ratings and radar chart visualization
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type StaffEvaluationsPreset = 'form' | 'summary';

export interface EvaluationCategory {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight?: number;
}

export interface EvaluationRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  staffAvatar?: string;
  evaluatorName: string;
  date: Date;
  period: string;
  categories: EvaluationCategory[];
  overallScore: number;
  maxScore: number;
  strengths?: string;
  improvements?: string;
  comments?: string;
  status: 'draft' | 'submitted' | 'acknowledged';
}

export interface StaffEvaluationsProps extends EngineAwareProps {
  preset?: StaffEvaluationsPreset;
  evaluations?: EvaluationRecord[];
  currentEvaluation?: EvaluationRecord;
  onSubmit?: (evaluation: EvaluationRecord) => void;
  onSaveDraft?: (evaluation: EvaluationRecord) => void;
  onEvaluationClick?: (id: string) => void;
  onCreateNew?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const STAFF_EVALUATIONS_DEFAULTS: Partial<StaffEvaluationsProps> = {
  preset: 'form',
};
