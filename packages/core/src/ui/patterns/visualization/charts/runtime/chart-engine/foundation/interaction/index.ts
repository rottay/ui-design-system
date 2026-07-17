import type { ReactNode } from 'react';

/** Interaction posture exposed by every React-owned chart renderer. */
export type ChartInteractionMode = 'static' | 'explore' | 'select' | 'drill';

/** Pointer classes retained by the shared interaction contract. */
export type ChartInteractionPointerType = 'mouse' | 'touch' | 'pen';

/** Why the active datum changed. */
export type ChartInteractionReason =
  | 'focus'
  | 'hover'
  | 'pin'
  | 'action'
  | 'escape'
  | 'data-change';

/** Input provenance accompanying active-datum and action callbacks. */
export interface ChartInteractionMeta {
  readonly input: 'keyboard' | 'pointer' | 'programmatic';
  readonly reason: ChartInteractionReason;
  readonly pointerType?: ChartInteractionPointerType;
}

/** Renderer-neutral active value. `key` is opaque and must never be parsed. */
export interface ChartActiveDatum<TDatum> {
  readonly key: string;
  readonly label: string;
  readonly datum: TDatum;
}

interface ChartInteractiveCommon<TDatum> {
  /** Controlled active key. `undefined` selects uncontrolled operation. */
  readonly activeKey?: string | null;
  /** Initial active and roving key for uncontrolled operation. */
  readonly defaultActiveKey?: string;
  readonly onActiveChange?: (
    value: ChartActiveDatum<TDatum> | null,
    meta: ChartInteractionMeta,
  ) => void;
  /** Optional renderer-owned tooltip content for the active datum. */
  readonly renderTooltip?: (value: ChartActiveDatum<TDatum>) => ReactNode;
}

export interface ChartStaticInteraction {
  /** Static is the compatibility default and creates no tab stops or handlers. */
  readonly mode?: 'static';
  readonly activeKey?: never;
  readonly defaultActiveKey?: never;
  readonly onActiveChange?: never;
  readonly renderTooltip?: never;
  readonly actionLabel?: never;
  readonly onAction?: never;
}

export interface ChartExploreInteraction<TDatum> extends ChartInteractiveCommon<TDatum> {
  readonly mode: 'explore';
  readonly actionLabel?: never;
  readonly onAction?: never;
}

export interface ChartActionInteraction<TDatum> extends ChartInteractiveCommon<TDatum> {
  readonly mode: 'select' | 'drill';
  /** Localized action description used by the renderer's accessible mark. */
  readonly actionLabel: string;
  readonly onAction: (
    value: ChartActiveDatum<TDatum>,
    meta: ChartInteractionMeta,
  ) => void;
}

/**
 * Public interaction contract shared by Bar, Line, HeatMap, Pie and Scatter renderers.
 *
 * Bar and HeatMap parameterize `TDatum` with their public datum type. Line
 * uses a renderer-owned context containing both the series and point, which
 * lets its opaque key remain unique even when point ids repeat across series.
 */
export type ChartInteraction<TDatum> =
  | ChartStaticInteraction
  | ChartExploreInteraction<TDatum>
  | ChartActionInteraction<TDatum>;
