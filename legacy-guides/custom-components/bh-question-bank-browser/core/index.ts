/**
 * BhQuestionBankBrowser - Core Interface
 * Full-page question bank library and detail views for BitHire ATS platform.
 * Separate from the compact bh-question-bank widget.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhQuestionBankBrowserPreset = 'library' | 'detail';

// =============================================================================
// QUESTION DATA TYPES
// =============================================================================

/**
 * An interview question in the question bank.
 */
export interface Question {
  id: string;
  text: string;
  dimension: string;
  competency?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'behavioral' | 'technical' | 'situational' | 'cultural';
  followUps: string[];
  rubricGuidance?: string;
  effectiveness: number;
  usageCount: number;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data structure for the question bank browser.
 */
export interface QuestionBankData {
  questions: Question[];
  dimensions: string[];
  totalCount: number;
  filters: {
    dimension?: string;
    type?: string;
    difficulty?: string;
    search?: string;
  };
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhQuestionBankBrowserProps extends EngineAwareProps {
  preset?: BhQuestionBankBrowserPreset;

  /** Question bank data */
  data?: QuestionBankData;

  /** Currently selected question for detail view */
  selectedQuestion?: Question | null;

  /** Whether data is loading */
  loading?: boolean;

  /** Callback when a question is selected */
  onSelectQuestion?: (questionId: string) => void;

  /** Callback to create a new question */
  onCreateQuestion?: () => void;

  /** Callback to edit a question */
  onEditQuestion?: (questionId: string) => void;

  /** Callback to delete a question */
  onDeleteQuestion?: (questionId: string) => void;

  /** Callback when filters change */
  onFilterChange?: (filters: QuestionBankData['filters']) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_QUESTION_BANK_BROWSER_DEFAULTS: Partial<BhQuestionBankBrowserProps> = {
  preset: 'library',
};
