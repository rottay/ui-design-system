/**
 * BhRubricBuilder - Core Interface
 * Scoring Rubric Editor for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhRubricBuilderPreset = 'editor' | 'preview';

/* ── Scoring Types ──────────────────────────────────────────────────── */

export interface ScoringDimension {
  id: string;
  name: string;
  code: string;
  description: string;
  weight: number;
  isKnockout: boolean;
  knockoutThreshold?: number;
  order: number;
}

export interface ScoreLevel {
  label: string;
  minScore: number;
  color: string;
}

/* ── Validation ─────────────────────────────────────────────────────── */

export interface ValidationError {
  field: string;
  message: string;
}

/* ── Rubric Status ──────────────────────────────────────────────────── */

export type RubricStatus = 'draft' | 'active' | 'archived';
export type ScorableType = 'interview' | 'assessment' | 'review' | 'overall';

/* ── Main Props ─────────────────────────────────────────────────────── */

export interface BhRubricBuilderProps extends EngineAwareProps {
  preset?: BhRubricBuilderPreset;

  /* data */
  rubricName: string;
  industry: string;
  scorableType: ScorableType;
  status: RubricStatus;
  dimensions: ScoringDimension[];
  scoreLevels: ScoreLevel[];
  selectedDimension?: string | null;
  validationErrors: ValidationError[];
  isDirty: boolean;

  /* callbacks */
  onChange?: (field: string, value: unknown) => void;
  onDimensionAdd?: () => void;
  onDimensionRemove?: (dimensionId: string) => void;
  onDimensionReorder?: (dimensionId: string, newOrder: number) => void;
  onDimensionSelect?: (dimensionId: string | null) => void;
  onPublish?: () => void;
  onSave?: () => void;
  showPreview?: boolean;
  onPreviewToggle?: () => void;

  /* layout */
  className?: string;
  style?: CSSProperties;
}

export const BH_RUBRIC_BUILDER_DEFAULTS: Partial<BhRubricBuilderProps> = {
  preset: 'editor',
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

export function getRubricStatusColors(tokens: DesignTokens) {
  return {
    draft: {
      bg: tokens.colors.neutral[100],
      color: tokens.colors.neutral[600],
      border: tokens.colors.neutral[200],
    },
    active: {
      bg: tokens.colors.successScale[50],
      color: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
    },
    archived: {
      bg: tokens.colors.warningScale[50],
      color: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
    },
  };
}

export function getScorableTypeColors(tokens: DesignTokens) {
  return {
    interview: {
      bg: tokens.colors.primaryScale[50],
      color: tokens.colors.primaryScale[700],
      border: tokens.colors.primaryScale[200],
    },
    assessment: {
      bg: tokens.colors.warningScale[50],
      color: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
    },
    review: {
      bg: tokens.colors.secondaryScale[50],
      color: tokens.colors.secondaryScale[700],
      border: tokens.colors.secondaryScale[200],
    },
    overall: {
      bg: tokens.colors.infoScale[50],
      color: tokens.colors.infoScale[700],
      border: tokens.colors.infoScale[200],
    },
  };
}

export function getDimensionColors(tokens: DesignTokens): string[] {
  return [
    tokens.colors.primaryScale[500],
    tokens.colors.infoScale[500],
    tokens.colors.warningScale[500],
    tokens.colors.successScale[500],
    tokens.colors.errorScale[500],
    tokens.colors.secondaryScale[500],
    tokens.colors.primaryScale[300],
    tokens.colors.infoScale[300],
    tokens.colors.warningScale[300],
    tokens.colors.successScale[300],
  ];
}

export function formatScorableType(type: ScorableType): string {
  switch (type) {
    case 'interview':
      return 'Interview';
    case 'assessment':
      return 'Assessment';
    case 'review':
      return 'Review';
    case 'overall':
      return 'Overall';
  }
}
