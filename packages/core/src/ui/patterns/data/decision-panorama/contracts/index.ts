/**
 * @fileoverview Contracts for the DecisionPanorama pattern.
 *
 * DecisionPanorama owns a balanced context / identity / active-decision
 * composition. Callers retain ownership of copy, data, permissions and actions.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';

export interface DecisionPanoramaFact {
  /** Stable key for the fact. */
  key: string;
  /** Small fact label. */
  label: ReactNode;
  /** Prominent value. */
  value: ReactNode;
  /** Optional provenance, freshness or explanatory copy. */
  supporting?: ReactNode;
  /** Optional icon or compact visual marker. */
  icon?: ReactNode;
}

export interface DecisionPanoramaProps extends PatternBaseProps {
  /** Accessible label for the complete instrument. */
  ariaLabel?: string;
  /** Label above the contextual facts. */
  contextLabel?: ReactNode;
  /** Contextual facts rendered in a compact vertical list. */
  contextFacts?: DecisionPanoramaFact[];
  /** Central avatar, logo or identity visual. */
  identityVisual?: ReactNode;
  /** Small line above the central title. */
  identityEyebrow?: ReactNode;
  /** Primary identity. */
  title: ReactNode;
  /** Secondary identity context. */
  subtitle?: ReactNode;
  /** Compact status and provenance badges. */
  badges?: ReactNode;
  /** Label above the active decision. */
  decisionLabel?: ReactNode;
  /** Active decision or next milestone. */
  decisionTitle?: ReactNode;
  /** Prominent score or confidence value. */
  decisionScore?: ReactNode;
  /** Supporting decision explanation. */
  decisionSummary?: ReactNode;
  /** Progress, stages or another compact decision visualization. */
  decisionProgress?: ReactNode;
  /** Final supporting decision row. */
  decisionMeta?: ReactNode;
  /** Primary and secondary actions aligned below all three columns. */
  actions?: ReactNode;
}
