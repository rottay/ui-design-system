/**
 * BhCareerCoach - Core Interface
 * AI Career Coach for candidates, providing personalized development plans
 * based on interview performance. Public-facing, empathetic by design.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhCareerCoachPreset = 'candidate-facing' | 'opt-in';

// =============================================================================
// GAP SEVERITY
// =============================================================================

export type GapSeverity = 'minor' | 'moderate' | 'significant';

export type DevelopmentPriority = 'high' | 'medium' | 'low';

export type ResourceType = 'course' | 'article' | 'book' | 'video' | 'practice';

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

// =============================================================================
// LEARNING RESOURCE
// =============================================================================

export interface LearningResource {
  title: string;
  url: string;
  type: ResourceType;
  provider: string;
  estimatedHours?: number;
}

// =============================================================================
// SKILL GAP
// =============================================================================

export interface CareerSkillGap {
  dimension: string;
  currentLevel: number;
  targetLevel: number;
  gapSeverity: GapSeverity;
  recommendations: string[];
  resources: LearningResource[];
}

// =============================================================================
// STRENGTH
// =============================================================================

export interface CareerStrength {
  dimension: string;
  level: number;
  description: string;
  evidence: string;
}

// =============================================================================
// DEVELOPMENT PLAN ITEM
// =============================================================================

export interface DevelopmentPlanItem {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  timeline: string;
  actions: string[];
  priority: DevelopmentPriority;
}

// =============================================================================
// TALENT POOL INFO
// =============================================================================

export interface TalentPoolInfo {
  description: string;
  benefits: string[];
  optedIn: boolean;
}

// =============================================================================
// CAREER COACH DATA
// =============================================================================

export interface CareerCoachData {
  candidateFirstName: string;
  jobTitle: string;
  companyName: string;
  overallFeedback: string;
  skillGaps: CareerSkillGap[];
  strengths: CareerStrength[];
  developmentPlan: DevelopmentPlanItem[];
  resources: LearningResource[];
  talentPoolOptIn?: TalentPoolInfo;
}

// =============================================================================
// FEEDBACK DATA
// =============================================================================

export interface CareerCoachFeedback {
  rating: FeedbackRating;
  comments?: string;
}

// =============================================================================
// OPT-IN DATA
// =============================================================================

export interface TalentPoolOptInData {
  email: string;
  consentAccepted: boolean;
}

// =============================================================================
// PROPS
// =============================================================================

export interface BhCareerCoachProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhCareerCoachPreset;

  /** Career coach data payload */
  data?: CareerCoachData;

  /** Callback when candidate opts into talent pool */
  onOptInTalentPool?: (data: TalentPoolOptInData) => void;

  /** Callback when candidate submits feedback */
  onSubmitFeedback?: (feedback: CareerCoachFeedback) => void;

  /** Loading state */
  loading?: boolean;

  /** Error message */
  error?: string;

  /** Callback to retry on error */
  onRetry?: () => void;

  /** Candidate email for the opt-in form (pre-filled) */
  candidateEmail?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CAREER_COACH_DEFAULTS: Partial<BhCareerCoachProps> = {
  preset: 'candidate-facing',
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns severity configuration for display
 */
export function getSeverityConfig(tokens: DesignTokens) {
  return {
    minor: {
      label: 'Minor Gap',
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
      borderColor: tokens.colors.infoScale[200],
    },
    moderate: {
      label: 'Moderate Gap',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
    },
    significant: {
      label: 'Needs Focus',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
    },
  };
}

/**
 * Returns priority configuration for display
 */
export function getPriorityConfig(tokens: DesignTokens) {
  return {
    high: {
      label: 'High Priority',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
    },
    medium: {
      label: 'Medium Priority',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
    },
    low: {
      label: 'Low Priority',
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
      borderColor: tokens.colors.infoScale[200],
    },
  };
}

/**
 * Returns resource type configuration for display
 */
export function getResourceTypeConfig(tokens: DesignTokens) {
  return {
    course: {
      label: 'Course',
      color: tokens.colors.primaryScale[700],
      bgColor: tokens.colors.primaryScale[50],
    },
    article: {
      label: 'Article',
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
    },
    book: {
      label: 'Book',
      color: tokens.colors.secondaryScale[700],
      bgColor: tokens.colors.secondaryScale[50],
    },
    video: {
      label: 'Video',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
    },
    practice: {
      label: 'Practice',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
    },
  };
}

/**
 * Returns color for a score level (0-100)
 */
export function getScoreLevelColor(tokens: DesignTokens, score: number): string {
  if (score >= 80) return tokens.colors.successScale[500];
  if (score >= 60) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

/**
 * Returns a human-readable level label from score (0-100)
 */
export function getScoreLevelLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Developing';
  if (score >= 40) return 'Emerging';
  return 'Foundational';
}

/**
 * Sort development plan items by priority (high first)
 */
export function sortByPriority(items: DevelopmentPlanItem[]): DevelopmentPlanItem[] {
  const order: Record<DevelopmentPriority, number> = { high: 0, medium: 1, low: 2 };
  return items.slice().sort((a, b) => order[a.priority] - order[b.priority]);
}

/**
 * Group resources by their dimension/skill area
 */
export function groupResourcesBySkill(gaps: CareerSkillGap[]): Record<string, LearningResource[]> {
  const grouped: Record<string, LearningResource[]> = {};
  for (const gap of gaps) {
    if (gap.resources.length > 0) {
      grouped[gap.dimension] = gap.resources;
    }
  }
  return grouped;
}
