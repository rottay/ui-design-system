'use client';

/**
 * @fileoverview Semantic, renderer-neutral frame for projected chart views.
 *
 * The frame owns stable chart anatomy and lifecycle semantics. It deliberately
 * does not inspect a tenant, aggregate data, or know which renderer implements
 * a view. It maps the shared responsive device class to an app-declared
 * projection and delegates that resolved view through `renderView`.
 */

import {
  useId,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { useResponsive } from '@/runtime/responsive';
import { useResolvedChartPersonality } from '@/runtime/personality';
import {
  resolveChartSeriesVariables,
  useResolvedChartGrammar,
} from './grammar';
import {
  resolveChartProjection,
  type ChartDeviceClass,
  type ChartProjectionSpec,
  type ChartProjectionView,
} from './ChartProjection';

export type ChartFrameStatus = 'ready' | 'loading' | 'empty' | 'error';

export type ChartFrameHeadingLevel = 2 | 3 | 4 | 5 | 6;

interface ChartFrameCommonProps {
  /** Visible title and accessible name for the frame. */
  title: ReactNode;
  /** Analytical question answered by the visualization. */
  question?: ReactNode;
  /** Concise explanation of scope, units, or comparison context. */
  description?: ReactNode;
  /** Deterministic, app-owned observation rendered after a ready view. */
  insight?: ReactNode;
  /** App-owned controls such as filters, table access, or export. */
  toolbar?: ReactNode;
  /** Legend for the currently rendered projection. */
  legend?: ReactNode;
  /** App-owned provenance copy or source link. */
  source?: ReactNode;
  /** App-owned freshness timestamp or status. */
  freshness?: ReactNode;
  /** Serializable desktop/tablet/phone semantic projection policy. */
  projection: ChartProjectionSpec;
  /**
   * Explicit resolution override for deterministic tests and controlled SSR.
   * Production consumers normally inherit the nearest ResponsiveProvider.
   */
  deviceClass?: ChartDeviceClass;
  /** Selects the registered application renderer for the resolved view. */
  renderView: (view: ChartProjectionView) => ReactNode;
  /** Heading depth used by the containing page hierarchy. Defaults to 2. */
  headingLevel?: ChartFrameHeadingLevel;
  className?: string;
  style?: CSSProperties;
}

interface ChartFrameReadyStateProps {
  state?: 'ready';
  stateLabel?: never;
  stateDescription?: never;
  stateAction?: never;
}

interface ChartFrameFeedbackStateProps {
  state: Exclude<ChartFrameStatus, 'ready'>;
  /** Required visible and announced copy; the DS never hardcodes a locale. */
  stateLabel: ReactNode;
  stateDescription?: ReactNode;
  stateAction?: ReactNode;
}

export type ChartFrameProps = ChartFrameCommonProps &
  (ChartFrameReadyStateProps | ChartFrameFeedbackStateProps);

function joinIds(ids: Array<string | undefined>): string | undefined {
  const value = ids.filter(Boolean).join(' ');
  return value.length > 0 ? value : undefined;
}

/**
 * Renders a stable semantic shell around one responsive chart projection.
 *
 * Non-ready states never mount the renderer, preventing stale or misleading
 * marks from remaining interactive beneath loading, empty, or error feedback.
 */
export function ChartFrame(props: ChartFrameProps): React.ReactElement {
  const {
    title,
    question,
    description,
    insight,
    toolbar,
    legend,
    source,
    freshness,
    projection,
    deviceClass: deviceClassOverride,
    renderView,
    headingLevel = 2,
    className,
    style,
  } = props;

  const titleId = useId();
  const questionId = useId();
  const descriptionId = useId();
  const { deviceClass: responsiveDeviceClass } = useResponsive();
  const grammar = useResolvedChartGrammar();
  const chartPersonality = useResolvedChartPersonality();
  const deviceClass = deviceClassOverride ?? responsiveDeviceClass;
  const resolvedView = resolveChartProjection(projection, deviceClass);
  const state = props.state ?? 'ready';
  const feedback = props.state && props.state !== 'ready' ? props : null;
  const describedBy = joinIds([
    question ? questionId : undefined,
    description ? descriptionId : undefined,
  ]);
  const frameClassName = ['ds-chart-frame', className].filter(Boolean).join(' ');
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const colorScheme = chartPersonality.colorScheme ?? 'default';
  const frameStyle = useMemo<CSSProperties>(
    () => ({
      ...resolveChartSeriesVariables(colorScheme),
      ...style,
    }),
    [colorScheme, style],
  );

  return (
    <section
      className={frameClassName}
      data-part="chart-frame"
      data-state={state}
      data-device-class={deviceClass}
      data-projection-mode={resolvedView.mode}
      data-renderer-id={resolvedView.rendererId}
      data-chart-grammar={grammar.id}
      data-chart-posture={grammar.posture}
      data-chart-grid={grammar.grid}
      data-chart-axes={grammar.axes}
      data-chart-marks={grammar.marks}
      data-chart-annotations={grammar.annotations}
      data-chart-motion={grammar.motion}
      data-chart-color-scheme={colorScheme}
      data-chart-line-style={chartPersonality.lineStyle}
      data-chart-show-dots={chartPersonality.showDots ? 'true' : 'false'}
      data-chart-gradient-fill={chartPersonality.useGradientFill ? 'true' : 'false'}
      data-chart-tooltip-style={chartPersonality.tooltipStyle}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      aria-busy={state === 'loading' ? true : undefined}
      style={frameStyle}
    >
      <header data-part="header">
        <div data-part="copy">
          <Heading id={titleId} data-part="title">
            {title}
          </Heading>
          {question ? (
            <p id={questionId} data-part="question">
              {question}
            </p>
          ) : null}
          {description ? (
            <div id={descriptionId} data-part="description">
              {description}
            </div>
          ) : null}
        </div>
        {toolbar ? <div data-part="toolbar">{toolbar}</div> : null}
      </header>

      {state === 'ready' ? (
        <>
          <div
            data-part="view"
            data-projection-mode={resolvedView.mode}
            data-renderer-id={resolvedView.rendererId}
            role="group"
            aria-labelledby={titleId}
            aria-describedby={describedBy}
          >
            {renderView(resolvedView)}
          </div>
          {legend ? <div data-part="legend">{legend}</div> : null}
          {insight ? <aside data-part="insight">{insight}</aside> : null}
        </>
      ) : feedback ? (
        <div
          data-part="state"
          data-state={state}
          role={state === 'error' ? 'alert' : 'status'}
          aria-live={state === 'error' ? 'assertive' : 'polite'}
          aria-atomic="true"
        >
          <div data-part="state-label">{feedback.stateLabel}</div>
          {feedback.stateDescription ? (
            <div data-part="state-description">{feedback.stateDescription}</div>
          ) : null}
          {feedback.stateAction ? (
            <div data-part="state-action">{feedback.stateAction}</div>
          ) : null}
        </div>
      ) : null}

      {source || freshness ? (
        <footer data-part="metadata">
          {source ? <div data-part="source">{source}</div> : null}
          {freshness ? <div data-part="freshness">{freshness}</div> : null}
        </footer>
      ) : null}
    </section>
  );
}
