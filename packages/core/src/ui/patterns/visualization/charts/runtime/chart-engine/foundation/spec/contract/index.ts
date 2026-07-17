/**
 * Pure, renderer-neutral chart semantics.
 *
 * This module intentionally has no React, browser, D3, tenant, or hostname
 * dependency. Applications own the values and domain meaning; a vertical only
 * selects one of the closed presentation grammars below.
 */

export type ChartGrammarId = 'neutral' | 'bithire' | 'platform' | 'evnto';

export type ChartCategoricalPaletteReference =
  `chart.palette.categorical.${ChartGrammarId}`;
export type ChartSequentialPaletteReference =
  `chart.palette.sequential.${ChartGrammarId}`;
export type ChartDivergingPaletteReference =
  `chart.palette.diverging.${ChartGrammarId}`;
export type ChartStatusPaletteReference = 'chart.palette.status.semantic';

/** Palette channels remain separate so magnitude, polarity, and status cannot
 * be accidentally rendered through a categorical scale. */
export interface ChartGrammarChannels {
  readonly categorical: ChartCategoricalPaletteReference;
  readonly sequential: ChartSequentialPaletteReference;
  readonly diverging: ChartDivergingPaletteReference;
  readonly status: ChartStatusPaletteReference;
}

export type ChartGrammarPosture =
  | 'neutral'
  | 'evidence-led'
  | 'control-plane'
  | 'editorial-temporal';

export type ChartGridPosture =
  | 'balanced'
  | 'light-sparse'
  | 'precise-compact'
  | 'soft-temporal';

export type ChartAxisPosture =
  | 'balanced'
  | 'border-led'
  | 'high-contrast-compact'
  | 'soft-editorial';

export type ChartMarkPosture =
  | 'balanced'
  | 'human-rounded'
  | 'technical-sharp'
  | 'tactile-temporal';

export type ChartAnnotationPosture =
  | 'general'
  | 'evidence-decision'
  | 'threshold-policy-incident'
  | 'milestone-capacity-schedule';

export type ChartGrammarMotionPosture =
  | 'calm'
  | 'calm-continuity'
  | 'fast-operational'
  | 'composed-editorial';

/** A closed, semantic vertical recipe. It never changes chart data or topology. */
export interface ChartGrammar {
  readonly id: ChartGrammarId;
  readonly posture: ChartGrammarPosture;
  readonly channels: ChartGrammarChannels;
  readonly grid: ChartGridPosture;
  readonly axes: ChartAxisPosture;
  readonly marks: ChartMarkPosture;
  readonly annotations: ChartAnnotationPosture;
  readonly motion: ChartGrammarMotionPosture;
}

interface ChartInsightBase {
  /** Stable app-owned identifier used by interaction and accessible alternatives. */
  readonly id: string;
  readonly label: string;
}

export interface ChartTargetInsightSpec extends ChartInsightBase {
  readonly type: 'target';
  readonly value: number;
}

export interface ChartBandInsightSpec extends ChartInsightBase {
  readonly type: 'band';
  readonly lower: number;
  readonly upper: number;
}

export interface ChartDirectLabelInsightSpec extends ChartInsightBase {
  readonly type: 'direct-label';
  /** Stable app-owned datum identifier, not a renderer index. */
  readonly datumId: string;
}

export interface ChartEventInsightSpec extends ChartInsightBase {
  readonly type: 'event';
  /** A finite quantitative coordinate or a non-empty categorical/time key. */
  readonly at: number | string;
}

/** First JSON-only InsightLayer slice. Functions and renderer nodes are absent by design. */
export type ChartInsightSpec =
  | ChartTargetInsightSpec
  | ChartBandInsightSpec
  | ChartDirectLabelInsightSpec
  | ChartEventInsightSpec;

export interface ChartInsightProvenance {
  /** Non-empty app-owned source identifiers used to derive the statement. */
  readonly sourceIds: readonly [string, ...string[]];
  /** Stable computation or generator identifier; never executable code. */
  readonly methodId: string;
}

/**
 * A summary must say whether it is a deterministic fact or generated
 * interpretation. Both modes require provenance; the DS does not infer
 * causality from either one.
 */
export interface ChartInsightSummary {
  readonly id: string;
  readonly mode: 'computed' | 'generated';
  readonly text: string;
  readonly provenance: ChartInsightProvenance;
}
