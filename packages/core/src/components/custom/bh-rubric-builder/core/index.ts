/**
 * BhRubricBuilder - Core Interface
 * Scoring Rubric Editor for BitHire ATS platform
 *
 * Uses RubricSelect and DimensionSelect from @rottay/scoring for DB types.
 * UI types are defined here with proper `number` fields for rendering.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { RubricSelect, DimensionSelect } from '@rottay/scoring';
import { n } from '../../helpers';

export type BhRubricBuilderPreset = 'editor' | 'preview';

/** Rubric status values */
export type RubricStatus = 'draft' | 'published' | 'archived' | 'deprecated';

/** Scorable type values */
export type ScorableType = 'conversation' | 'interview' | 'call' | 'ticket' | 'consultation' | 'presentation' | 'assessment';

/* ── UI types (what presets actually consume) ───────────────────────── */

/** A single scoring dimension for UI rendering */
export interface ScoringDimension {
  id?: string;
  name?: string;
  code?: string;
  description?: string;
  weight?: number;
  order?: number;
  isKnockout?: boolean;
  knockoutThreshold?: number;
  maxScore?: number;
  scoringCriteria?: string[];
  isRequired?: boolean;
  scoringPrompt?: string;
  evidencePrompt?: string;
  keywords?: string[];
  sortOrder?: number;
  criteria?: Record<string, unknown>;
}

export interface ScoreLevel {
  label: string;
  minScore: number;
  color: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface BhRubricBuilderProps extends EngineAwareProps {
  preset?: BhRubricBuilderPreset;

  /** The rubric DB entity (optional, for direct DB binding) */
  rubric?: Partial<RubricSelect>;

  /** Rubric name (for direct prop usage in presets) */
  rubricName?: string;

  /** Industry label */
  industry?: string;

  /** Scorable type */
  scorableType?: ScorableType | string;

  /** Rubric status */
  status?: RubricStatus | string;

  /** Dimensions for this rubric */
  dimensions?: ScoringDimension[];

  /** Score level configuration */
  scoreLevels?: ScoreLevel[];

  /** Currently selected dimension ID */
  selectedDimension?: string | null;

  /** Validation errors */
  validationErrors?: ValidationError[];

  /** Whether the form has unsaved changes */
  isDirty?: boolean;

  /** System prompt for scoring */
  systemPrompt?: string;

  /** Scoring instructions */
  scoringInstructions?: string;

  /** Evidence instructions */
  evidenceInstructions?: string;

  /** Output format */
  outputFormat?: string;

  /** Min score */
  minScore?: number;

  /** Max score */
  maxScore?: number;

  /** Passing score */
  passingScore?: number;

  /** Template flag */
  isTemplate?: boolean;

  /** Usage stats: times used */
  timesUsed?: number;

  /** Usage stats: average score */
  avgScore?: number;

  /** Usage stats: last used at */
  lastUsedAt?: Date | string;

  /** Callbacks */
  onChange?: (field: string, value: unknown) => void;
  onDimensionAdd?: () => void;
  onDimensionRemove?: (dimensionId: string) => void;
  onDimensionReorder?: (dimensionId: string, newOrder: number) => void;
  onDimensionSelect?: (dimensionId: string | null) => void;
  onPublish?: () => void;
  onSave?: () => void;
  showPreview?: boolean;
  onPreviewToggle?: () => void;

  /** Layout */
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
    published: {
      bg: tokens.colors.successScale[50],
      color: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
    },
    archived: {
      bg: tokens.colors.warningScale[50],
      color: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
    },
    deprecated: {
      bg: tokens.colors.neutral[200],
      color: tokens.colors.neutral[500],
      border: tokens.colors.neutral[300],
    },
  };
}

export function getScorableTypeColors(tokens: DesignTokens) {
  return {
    conversation: {
      bg: tokens.colors.primaryScale[50],
      color: tokens.colors.primaryScale[700],
      border: tokens.colors.primaryScale[200],
    },
    interview: {
      bg: tokens.colors.primaryScale[50],
      color: tokens.colors.primaryScale[700],
      border: tokens.colors.primaryScale[200],
    },
    call: {
      bg: tokens.colors.infoScale[50],
      color: tokens.colors.infoScale[700],
      border: tokens.colors.infoScale[200],
    },
    ticket: {
      bg: tokens.colors.warningScale[50],
      color: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
    },
    consultation: {
      bg: tokens.colors.successScale[50],
      color: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
    },
    presentation: {
      bg: tokens.colors.secondaryScale[50],
      color: tokens.colors.secondaryScale[700],
      border: tokens.colors.secondaryScale[200],
    },
    assessment: {
      bg: tokens.colors.warningScale[50],
      color: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
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

export function formatScorableType(type: string): string {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

/** Re-export n helper for convenience */
export { n };

/** Re-export DB types for convenience */
export type { RubricSelect, DimensionSelect };
