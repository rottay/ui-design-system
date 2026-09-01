'use client';

/**
 * @fileoverview ChartFamilyFrame -- the opt-in semantic-projection door for
 * chart families. Without a `projection` prop a family keeps its
 * ChartScaffold path; with one, the family renders this frame adapter, which
 * maps the resolved device projection onto renderers:
 *
 * - `full`         -> the family's own engine renderer (`renderFull`)
 * - `micro`        -> the generic DS metric+trend renderer (app `metric` content)
 * - `ranked-rows`  -> the generic DS ranked-rows renderer fed from the
 *                     family's EXISTING accessible summary table
 * - `summary`      -> app-owned node via `renderSummaryView`
 * - `top-n`        -> app-owned node via `renderTopNView`
 * - `alternate`    -> app-owned node via `renderAlternateView`
 *
 * `resolveChartProjection` already rejects a full chart on phone, so any
 * family given a projection is mobile-correct by construction. Every view
 * requirement fails closed: a projection pointing at content the caller did
 * not supply throws instead of silently rendering nothing.
 */

import type { CSSProperties, ReactNode } from 'react';

import {
  ChartFrame,
  type ChartFrameHeadingLevel,
} from '../../runtime/chart-engine/presentation/react/projection/frame';
import type {
  ChartAlternateProjectionView,
  ChartDeviceClass,
  ChartFullProjectionView,
  ChartProjectionSpec,
  ChartProjectionView,
  ChartSummaryProjectionView,
  ChartTopNProjectionView,
} from '../../runtime/chart-engine/foundation/projection';
import {
  ChartMetricTrendView,
  type ChartMetricTrendContent,
} from '../../runtime/chart-engine/presentation/react/projection/metric-trend';
import {
  ChartRankedRowsView,
} from '../../runtime/chart-engine/presentation/react/projection/ranked-rows';
import type { ChartSummaryTable } from '../../contracts';

/**
 * Typed-required state copy: each non-ready state demands its own app copy,
 * mirroring the family-level state contract. Copy routes to the frame's
 * `stateLabel`/`stateDescription`/`stateAction`.
 */
export type ChartFamilyFrameStateProps =
  | {
      state?: 'ready';
      loadingLabel?: never;
      emptyLabel?: never;
      emptyDescription?: never;
      emptyAction?: never;
      errorLabel?: never;
      errorDescription?: never;
      errorAction?: never;
    }
  | {
      state: 'loading';
      /** Required visible and announced copy; the DS never hardcodes a locale. */
      loadingLabel: ReactNode;
      emptyLabel?: never;
      emptyDescription?: never;
      emptyAction?: never;
      errorLabel?: never;
      errorDescription?: never;
      errorAction?: never;
    }
  | {
      state: 'empty';
      loadingLabel?: never;
      /** Required visible and announced copy; the DS never hardcodes a locale. */
      emptyLabel: ReactNode;
      emptyDescription?: ReactNode;
      emptyAction?: ReactNode;
      errorLabel?: never;
      errorDescription?: never;
      errorAction?: never;
    }
  | {
      state: 'error';
      loadingLabel?: never;
      emptyLabel?: never;
      emptyDescription?: never;
      emptyAction?: never;
      /** Required visible and announced copy; the DS never hardcodes a locale. */
      errorLabel: ReactNode;
      errorDescription?: ReactNode;
      errorAction?: ReactNode;
    };

interface ChartFamilyFrameCommonProps {
  /** Serializable desktop/tablet/phone semantic projection policy. */
  readonly projection: ChartProjectionSpec;
  /** Visible title and accessible name for the frame. */
  readonly title: ReactNode;
  readonly question?: ReactNode;
  readonly description?: ReactNode;
  /** Deterministic, app-owned observation rendered after a ready view. */
  readonly insight?: ReactNode;
  readonly toolbar?: ReactNode;
  readonly legend?: ReactNode;
  readonly source?: ReactNode;
  readonly freshness?: ReactNode;
  /** Explicit resolution override for deterministic tests and controlled SSR. */
  readonly deviceClass?: ChartDeviceClass;
  readonly headingLevel?: ChartFrameHeadingLevel;
  /** The family's accessible summary table; feeds the ranked-rows projection. */
  readonly summary?: ChartSummaryTable;
  /** App copy naming the ranked-rows list; required by that projection. */
  readonly rankedRowsLabel?: string;
  /** Caps ranked rows on phone; the accessible summary keeps the full set. */
  readonly rankedRowsMaxRows?: number;
  /** App metric content; required by a `micro` projection. */
  readonly metric?: ChartMetricTrendContent;
  /** The family's own engine renderer for the `full` projection. */
  readonly renderFull: (view: ChartFullProjectionView) => ReactNode;
  readonly renderSummaryView?: (view: ChartSummaryProjectionView) => ReactNode;
  readonly renderTopNView?: (view: ChartTopNProjectionView) => ReactNode;
  readonly renderAlternateView?: (view: ChartAlternateProjectionView) => ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export type ChartFamilyFrameProps = ChartFamilyFrameCommonProps & ChartFamilyFrameStateProps;

function missingProjectionContent(mode: string, requirement: string): never {
  throw new TypeError(
    `[ChartFamilyFrame] A "${mode}" projection requires ${requirement}.`,
  );
}

/**
 * Renders a family through the semantic ChartFrame using an app-declared
 * projection. Non-ready states never mount any renderer (frame law).
 */
export function ChartFamilyFrame(props: ChartFamilyFrameProps): React.ReactElement {
  const {
    projection,
    title,
    question,
    description,
    insight,
    toolbar,
    legend,
    source,
    freshness,
    deviceClass,
    headingLevel,
    summary,
    rankedRowsLabel,
    rankedRowsMaxRows,
    metric,
    renderFull,
    renderSummaryView,
    renderTopNView,
    renderAlternateView,
    className,
    style,
  } = props;

  const renderView = (view: ChartProjectionView): ReactNode => {
    switch (view.mode) {
      case 'full':
        return renderFull(view);
      case 'micro': {
        if (!metric) missingProjectionContent(view.mode, 'the `metric` content prop');
        return <ChartMetricTrendView view={view} {...metric} />;
      }
      case 'ranked-rows': {
        if (!summary) missingProjectionContent(view.mode, 'the family `summary` table');
        if (!rankedRowsLabel) missingProjectionContent(view.mode, 'app-supplied `rankedRowsLabel` copy');
        return (
          <ChartRankedRowsView
            view={view}
            source={summary}
            ariaLabel={rankedRowsLabel}
            maxRows={rankedRowsMaxRows}
          />
        );
      }
      case 'summary': {
        if (!renderSummaryView) missingProjectionContent(view.mode, 'a `renderSummaryView` renderer');
        return renderSummaryView(view);
      }
      case 'top-n': {
        if (!renderTopNView) missingProjectionContent(view.mode, 'a `renderTopNView` renderer');
        return renderTopNView(view);
      }
      case 'alternate': {
        if (!renderAlternateView) missingProjectionContent(view.mode, 'a `renderAlternateView` renderer');
        return renderAlternateView(view);
      }
    }
  };

  const commonFrameProps = {
    title,
    question,
    description,
    insight,
    toolbar,
    legend,
    source,
    freshness,
    projection,
    deviceClass,
    headingLevel,
    renderView,
    className,
    style,
  };

  if (props.state === 'loading') {
    return (
      <ChartFrame {...commonFrameProps} state="loading" stateLabel={props.loadingLabel} />
    );
  }
  if (props.state === 'empty') {
    return (
      <ChartFrame
        {...commonFrameProps}
        state="empty"
        stateLabel={props.emptyLabel}
        stateDescription={props.emptyDescription}
        stateAction={props.emptyAction}
      />
    );
  }
  if (props.state === 'error') {
    return (
      <ChartFrame
        {...commonFrameProps}
        state="error"
        stateLabel={props.errorLabel}
        stateDescription={props.errorDescription}
        stateAction={props.errorAction}
      />
    );
  }

  return <ChartFrame {...commonFrameProps} />;
}
