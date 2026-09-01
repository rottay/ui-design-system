/**
 * @fileoverview Contracts for the RecordFacts pattern.
 *
 * RecordFacts is the canonical read-only anatomy for dense business records.
 * It gives callers one section boundary and uses internal rhythm, typography,
 * icons and separators instead of turning every value into a separate card.
 */

import type { ReactNode } from "react";
import type { PatternBaseProps } from "../../../../../foundation/contracts/runtime/components/patterns/core";

export type RecordFactSpan =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | "full";
export type RecordFactEmphasis = "default" | "strong" | "accent" | "narrative";
export type RecordFactState = "set" | "empty";

export interface RecordFact {
  /** Stable key for React reconciliation and automation. */
  key: string;
  /** Quiet descriptor above the value. */
  label: ReactNode;
  /** Primary information. */
  value: ReactNode;
  /** Optional provenance, freshness or explanatory copy below the value. */
  supporting?: ReactNode;
  /** Semantic icon shown in a compact token-driven container. */
  icon?: ReactNode;
  /** Number of tracks occupied in the canonical twelve-column grid. */
  span?: RecordFactSpan;
  /** Visual hierarchy without domain-specific color assumptions. */
  emphasis?: RecordFactEmphasis;
  /** Data-completeness state. */
  state?: RecordFactState;
  /** Domain-free metadata exposed for styling and test automation. */
  kind?: string;
  /** Optional semantic formatter identifier exposed to consumers. */
  format?: string;
}

export interface RecordFactsProps extends PatternBaseProps {
  /** Accessible label for the whole section. */
  ariaLabel?: string;
  /** Section title. */
  title: ReactNode;
  /** Semantic heading level without changing the visual role. */
  headingLevel?: 2 | 3 | 4;
  /** Optional concise section description. */
  description?: ReactNode;
  /** Semantic section icon. */
  icon?: ReactNode;
  /** Optional section-level action. */
  action?: ReactNode;
  /** Ordered facts. */
  facts: RecordFact[];
  /** Controls vertical rhythm without changing anatomy. */
  density?: "compact" | "comfortable";
}
