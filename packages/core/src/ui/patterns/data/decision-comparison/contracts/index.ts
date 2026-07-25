/**
 * @fileoverview Contracts for the DecisionComparison pattern.
 *
 * The pattern owns the dense, aligned anatomy of a human decision table while
 * callers retain ownership of domain data, permissions, copy and callbacks.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';

export type DecisionComparisonTone =
  | 'neutral'
  | 'positive'
  | 'warning'
  | 'critical'
  | 'info';

export interface DecisionComparisonFact {
  /** Stable key for the aligned fact row. */
  key: string;
  /** Human-readable criterion label. */
  label: ReactNode;
  /** Value or richer value composition. */
  value: ReactNode;
  /** Optional semantic treatment. */
  tone?: DecisionComparisonTone;
  /** Optional provenance, confidence or freshness note. */
  supporting?: ReactNode;
}

export interface DecisionComparisonSubject {
  /** Stable entity key. */
  key: string;
  /** Avatar, logo or identity mark. */
  avatar?: ReactNode;
  /** Primary entity identity. */
  title: ReactNode;
  /** Role, plan or entity context. */
  subtitle?: ReactNode;
  /** Prominent normalized score. */
  score?: ReactNode;
  /** Score scale or derivation label. */
  scoreLabel?: ReactNode;
  /** Marks the leading subject without relying on color alone. */
  leading?: boolean;
  /** Compact verified/risk/status chips. */
  badges?: ReactNode;
  /** Radar, image, distribution or other comparable visual. */
  visualization?: ReactNode;
  /** Aligned decision facts. */
  facts: DecisionComparisonFact[];
  /** Primary and secondary actions for this subject. */
  actions?: ReactNode;
  /** Short decision rationale below the action. */
  footnote?: ReactNode;
}

export interface DecisionComparisonProps extends PatternBaseProps {
  /** Compact context sentence at the top-left of the instrument. */
  context?: ReactNode;
  /** Secondary context such as an active role or rubric. */
  contextMeta?: ReactNode;
  /** View controls and add/remove actions. */
  toolbar?: ReactNode;
  /** Subjects rendered as aligned decision columns. */
  subjects: DecisionComparisonSubject[];
  /** Optional comparison verdict between context and columns. */
  verdict?: ReactNode;
  /** Optional AI/human recommendation below the comparison. */
  insight?: ReactNode;
  /** Empty-state composition owned by the caller. */
  emptyState?: ReactNode;
  /** Accessible label for the comparison region. */
  ariaLabel?: string;
  /** Density of the instrument. */
  density?: 'compact' | 'comfortable';
}
