/**
 * FeatureRolloutPlanner - Core Interface
 * Planning and visualization of feature rollout stages across
 * environments and user segments with timeline, matrix, and scheduler views
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

// ============================================================================
// Type Aliases
// ============================================================================

export type FeatureRolloutPlannerPreset = 'timeline' | 'matrix' | 'scheduler';

export type RolloutStage = 'planned' | 'canary' | 'beta' | 'ga' | 'deprecated';

export type RolloutTarget = 'internal' | 'beta-users' | 'percentage' | 'segment' | 'all';

// ============================================================================
// Data Interfaces
// ============================================================================

export interface FeatureRollout {
  id: string;
  featureName: string;
  description?: string;
  currentStage: RolloutStage;
  targetStage: RolloutStage;
  rolloutPercentage: number;
  targets: RolloutTarget[];
  environments: string[];
  startDate: Date;
  targetDate?: Date;
  owner?: string;
  risks?: string[];
}

// ============================================================================
// Props
// ============================================================================

export interface FeatureRolloutPlannerProps extends EngineAwareProps {
  preset?: FeatureRolloutPlannerPreset;
  rollouts: FeatureRollout[];
  onEditRollout?: (id: string) => void;
  onAdvanceStage?: (id: string) => void;
  onRollback?: (id: string) => void;
  onPause?: (id: string) => void;
  selectedRolloutId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ============================================================================
// Defaults
// ============================================================================

export const FEATURE_ROLLOUT_PLANNER_DEFAULTS: Partial<FeatureRolloutPlannerProps> = {
  preset: 'timeline',
  title: 'Feature Rollouts',
};

// ============================================================================
// Utilities - Stage Colors
// ============================================================================

export function getStageColors(tokens: DesignTokens) {
  return {
    planned: {
      bg: tokens.colors.neutral[100],
      text: tokens.colors.neutral[700],
      border: tokens.colors.neutral[200],
      dot: tokens.colors.neutral[400],
      bar: tokens.colors.neutral[300],
    },
    canary: {
      bg: tokens.colors.warningScale[100],
      text: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
      dot: tokens.colors.warningScale[500],
      bar: tokens.colors.warningScale[400],
    },
    beta: {
      bg: tokens.colors.infoScale[100],
      text: tokens.colors.infoScale[700],
      border: tokens.colors.infoScale[200],
      dot: tokens.colors.infoScale[500],
      bar: tokens.colors.infoScale[400],
    },
    ga: {
      bg: tokens.colors.successScale[100],
      text: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
      dot: tokens.colors.successScale[500],
      bar: tokens.colors.successScale[400],
    },
    deprecated: {
      bg: tokens.colors.errorScale[100],
      text: tokens.colors.errorScale[700],
      border: tokens.colors.errorScale[200],
      dot: tokens.colors.errorScale[500],
      bar: tokens.colors.errorScale[400],
    },
  };
}

// ============================================================================
// Utilities - Stage Ordering & Labels
// ============================================================================

const STAGE_ORDER: RolloutStage[] = ['planned', 'canary', 'beta', 'ga', 'deprecated'];

export function getStageIndex(stage: RolloutStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function getStageLabel(stage: RolloutStage): string {
  const labels: Record<RolloutStage, string> = {
    planned: 'Planned',
    canary: 'Canary',
    beta: 'Beta',
    ga: 'GA',
    deprecated: 'Deprecated',
  };
  return labels[stage];
}

export function getAllStages(): RolloutStage[] {
  return [...STAGE_ORDER];
}

export function getTargetLabel(target: RolloutTarget): string {
  const labels: Record<RolloutTarget, string> = {
    'internal': 'Internal',
    'beta-users': 'Beta Users',
    'percentage': 'Percentage',
    'segment': 'Segment',
    'all': 'All Users',
  };
  return labels[target];
}

export function canAdvance(rollout: FeatureRollout): boolean {
  const currentIdx = getStageIndex(rollout.currentStage);
  const targetIdx = getStageIndex(rollout.targetStage);
  return currentIdx < targetIdx && rollout.currentStage !== 'deprecated';
}

export function canRollback(rollout: FeatureRollout): boolean {
  return getStageIndex(rollout.currentStage) > 0 && rollout.currentStage !== 'deprecated';
}

// ============================================================================
// Utilities - Date Helpers
// ============================================================================

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateFull(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getDaysBetween(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDaysUntil(date: Date): number {
  const now = new Date();
  return getDaysBetween(now, date);
}

export function isOverdue(rollout: FeatureRollout): boolean {
  if (!rollout.targetDate) return false;
  return new Date() > rollout.targetDate && rollout.currentStage !== rollout.targetStage;
}

// ============================================================================
// Utilities - Collect Unique Environments
// ============================================================================

export function collectEnvironments(rollouts: FeatureRollout[]): string[] {
  const envSet = new Set<string>();
  for (const r of rollouts) {
    for (const env of r.environments) {
      envSet.add(env);
    }
  }
  return Array.from(envSet).sort();
}
