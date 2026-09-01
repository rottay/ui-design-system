'use client';

/**
 * Chart viewport controller: the single domain authority that unifies the
 * drag-select brush (kept as the selection presentation in `../brush`) with
 * wheel/keyboard zoom, pan, and reset.
 *
 * The controller is renderer-neutral. It owns only the active data domain per
 * axis and the transforms between it and the base (home) domain. Marks are
 * clipped by the consuming renderer, which recomputes geometry from the active
 * domain or clips the plot to it. The controller introduces no animation: every
 * transform is a synchronous state commit, so reduced-motion needs no branch and
 * no timer or animation frame is ever scheduled here.
 *
 * Controlled operation is selected by passing `domain`; otherwise the hook keeps
 * uncontrolled state seeded from `defaultDomain ?? baseDomain`. Every transform
 * routes through one clamp so the active domain can never exceed the base bounds
 * (no pan or zoom-out past the full extent) nor collapse below the zoom extent.
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import type { BrushSelection } from '../../foundation/brush-selection';

/** A closed numeric interval `[min, max]` in data space for one axis. */
export type ChartAxisInterval = readonly [number, number];

/** Per-axis active domain. An absent axis is not viewport-controllable. */
export interface ChartDomain {
  readonly x?: ChartAxisInterval;
  readonly y?: ChartAxisInterval;
}

export type ChartViewportAxis = 'x' | 'y';
export type ChartViewportBrushAxis = ChartViewportAxis | 'xy';

export interface ChartViewportBrushConfig {
  readonly enabled: boolean;
  /** Axis the brush selects. Defaults to `x`. */
  readonly axis?: ChartViewportBrushAxis;
}

export interface ChartViewportZoomConfig {
  readonly enabled: boolean;
  /** Whether wheel gestures zoom. Defaults to `false` (keyboard path is always on). */
  readonly wheel?: boolean;
  /**
   * Allowed zoom factor `[minFactor, maxFactor]` where factor = baseSpan/span.
   * `minFactor` bounds zoom-out (1 forbids exceeding the base extent);
   * `maxFactor` bounds zoom-in. Defaults to `[1, Infinity]`.
   */
  readonly extent?: readonly [number, number];
}

export interface ChartViewportConfig {
  /** The full unzoomed domain and the reset target. Only its present axes are controllable. */
  readonly baseDomain: ChartDomain;
  readonly brush?: ChartViewportBrushConfig;
  readonly zoom?: ChartViewportZoomConfig;
  /** Controlled active domain. Presence selects controlled operation. */
  readonly domain?: ChartDomain;
  /** Uncontrolled initial domain. Defaults to `baseDomain`. */
  readonly defaultDomain?: ChartDomain;
  readonly onDomainChange?: (domain: ChartDomain) => void;
  /** App-owned accessible label for the reset control. The DS supplies no copy. */
  readonly resetLabel?: string;
}

/** Pixel rectangle of the plot area, used to map wheel focus to a data fraction. */
export interface ChartViewportPlotRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ChartViewportPropsExtent {
  readonly plot: ChartViewportPlotRect;
}

export interface ChartViewportRootProps {
  readonly tabIndex?: number;
  readonly onWheel?: (event: React.WheelEvent<Element>) => void;
  readonly onKeyDown?: (event: React.KeyboardEvent<Element>) => void;
  readonly 'data-chart-viewport'?: 'default' | 'zoomed';
}

export interface ChartViewportResetButtonProps {
  readonly type: 'button';
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly 'aria-label'?: string;
  readonly 'data-part': 'viewport-reset';
  readonly 'data-chart-viewport': 'default' | 'zoomed';
}

/** Minimal scale shape consumed by `useChartBrush` for pixel-to-data inversion. */
export interface ChartViewportBrushScale {
  readonly invert: (px: number) => number;
}

export interface ChartViewportState {
  /** The active (clamped) domain the renderer clips marks to. */
  readonly domain: ChartDomain;
  /** True when the active domain equals the base domain on every controllable axis. */
  readonly isDefault: boolean;
  readonly resetLabel: string | undefined;
  /** Restore the base domain. */
  readonly reset: () => void;
  /** Multiply the current zoom by `factor` (>1 zooms in) about `focusFraction` [0,1]. */
  readonly zoomAt: (axis: ChartViewportAxis, factor: number, focusFraction: number) => void;
  readonly zoomIn: (axis?: ChartViewportAxis) => void;
  readonly zoomOut: (axis?: ChartViewportAxis) => void;
  /** Shift the domain by `deltaFraction` of the current span (clamped to base). */
  readonly pan: (axis: ChartViewportAxis, deltaFraction: number) => void;
  /** Replace one axis interval directly (clamped). */
  readonly setAxisDomain: (axis: ChartViewportAxis, interval: ChartAxisInterval) => void;
  /** Apply a brush selection (data coordinates) to the brush axis. */
  readonly applyBrushSelection: (interval: ChartAxisInterval) => void;
  /** Adapter for `useChartBrush`'s `onBrushEnd`; null selection is a no-op. */
  readonly handleBrushEnd: (selection: BrushSelection | null) => void;
  /** Build the `xScale` `useChartBrush` inverts, given the plot pixel width. */
  readonly getBrushScale: (plotPixelSize: number) => ChartViewportBrushScale;
  /** Props for the interaction root: wheel (if enabled) + keyboard zoom/pan/reset. */
  readonly getRootProps: (extent: ChartViewportPropsExtent) => ChartViewportRootProps;
  readonly getResetButtonProps: () => ChartViewportResetButtonProps;
}

const DEFAULT_ZOOM_EXTENT: readonly [number, number] = [1, Number.POSITIVE_INFINITY];
const AXIS_EPSILON = 1e-9;
const ZOOM_IN_FACTOR = 1.25;
const ZOOM_OUT_FACTOR = 0.8;
const KEYBOARD_PAN_FRACTION = 0.1;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function sortedInterval(interval: ChartAxisInterval): [number, number] {
  const [a, b] = interval;
  return a <= b ? [a, b] : [b, a];
}

function intervalsEqual(a: ChartAxisInterval | undefined, b: ChartAxisInterval | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return Math.abs(a[0] - b[0]) <= AXIS_EPSILON && Math.abs(a[1] - b[1]) <= AXIS_EPSILON;
}

/**
 * Clamp a proposed interval to the base bounds and the zoom-factor extent. The
 * span is bounded first, then the interval is re-centred and slid back inside
 * the base so zoom and pan can never escape the full extent.
 */
function clampInterval(
  proposed: ChartAxisInterval,
  base: ChartAxisInterval,
  extent: readonly [number, number],
): [number, number] {
  const [baseMin, baseMax] = sortedInterval(base);
  const baseSpan = baseMax - baseMin;
  if (!(baseSpan > 0)) return [baseMin, baseMax];

  const [minFactor, maxFactor] = extent;
  const safeMinFactor = Number.isFinite(minFactor) && minFactor > 0 ? minFactor : 1;
  const maxSpan = baseSpan / safeMinFactor;
  const minSpan = Number.isFinite(maxFactor) && maxFactor > 0
    ? baseSpan / maxFactor
    : baseSpan * 1e-6;

  let [lower, upper] = sortedInterval(proposed);
  if (!Number.isFinite(lower) || !Number.isFinite(upper)) return [baseMin, baseMax];

  const span = clamp(upper - lower, minSpan, maxSpan);
  const mid = (lower + upper) / 2;
  lower = mid - span / 2;
  upper = mid + span / 2;

  if (lower < baseMin) {
    upper += baseMin - lower;
    lower = baseMin;
  }
  if (upper > baseMax) {
    lower -= upper - baseMax;
    upper = baseMax;
  }
  return [Math.max(baseMin, lower), Math.min(baseMax, upper)];
}

function readFocusFraction(event: React.WheelEvent<Element>, plot: ChartViewportPlotRect, axis: ChartViewportAxis): number {
  const native = event.nativeEvent as WheelEvent & { offsetX?: number; offsetY?: number };
  if (axis === 'x') {
    const offset = typeof native.offsetX === 'number' ? native.offsetX : plot.x + plot.width / 2;
    return plot.width > 0 ? clamp((offset - plot.x) / plot.width, 0, 1) : 0.5;
  }
  const offset = typeof native.offsetY === 'number' ? native.offsetY : plot.y + plot.height / 2;
  return plot.height > 0 ? clamp((offset - plot.y) / plot.height, 0, 1) : 0.5;
}

/**
 * Domain controller for a chart viewport. See the module header for the
 * controlled/uncontrolled contract and the no-motion guarantee.
 */
export function useChartViewport(config: ChartViewportConfig): ChartViewportState {
  const {
    baseDomain,
    brush,
    zoom,
    domain: controlledDomain,
    defaultDomain,
    onDomainChange,
    resetLabel,
  } = config;

  const isControlled = controlledDomain !== undefined;
  const [uncontrolledDomain, setUncontrolledDomain] = useState<ChartDomain>(
    () => defaultDomain ?? baseDomain,
  );
  const activeDomain = isControlled ? (controlledDomain as ChartDomain) : uncontrolledDomain;

  const brushAxis: ChartViewportBrushAxis = brush?.axis ?? 'x';
  const zoomExtent = zoom?.extent ?? DEFAULT_ZOOM_EXTENT;

  // Stable refs so the returned callbacks never re-map listeners on each render.
  const stateRef = useRef({ activeDomain, baseDomain, zoomExtent, isControlled, onDomainChange });
  stateRef.current = { activeDomain, baseDomain, zoomExtent, isControlled, onDomainChange };

  const commit = useCallback((next: ChartDomain) => {
    const { isControlled: controlled, onDomainChange: notify } = stateRef.current;
    if (!controlled) setUncontrolledDomain(next);
    notify?.(next);
  }, []);

  const withAxis = useCallback((axis: ChartViewportAxis, interval: [number, number]): ChartDomain => {
    const current = stateRef.current.activeDomain;
    return axis === 'x' ? { ...current, x: interval } : { ...current, y: interval };
  }, []);

  const setAxisDomain = useCallback((axis: ChartViewportAxis, interval: ChartAxisInterval) => {
    const { activeDomain: current, baseDomain: base, zoomExtent: extent } = stateRef.current;
    const baseInterval = base[axis];
    if (!baseInterval || !current[axis]) return;
    commit(withAxis(axis, clampInterval(interval, baseInterval, extent)));
  }, [commit, withAxis]);

  const zoomAt = useCallback((axis: ChartViewportAxis, factor: number, focusFraction: number) => {
    const { activeDomain: current, baseDomain: base, zoomExtent: extent } = stateRef.current;
    const interval = current[axis];
    const baseInterval = base[axis];
    if (!interval || !baseInterval || !(factor > 0)) return;
    const [lower, upper] = interval;
    const span = upper - lower;
    if (!(span > 0)) return;
    const focus = lower + clamp(focusFraction, 0, 1) * span;
    const nextSpan = span / factor;
    const nextLower = focus - clamp(focusFraction, 0, 1) * nextSpan;
    commit(withAxis(axis, clampInterval([nextLower, nextLower + nextSpan], baseInterval, extent)));
  }, [commit, withAxis]);

  const pan = useCallback((axis: ChartViewportAxis, deltaFraction: number) => {
    const { activeDomain: current, baseDomain: base, zoomExtent: extent } = stateRef.current;
    const interval = current[axis];
    const baseInterval = base[axis];
    if (!interval || !baseInterval) return;
    const [lower, upper] = interval;
    const delta = (upper - lower) * deltaFraction;
    commit(withAxis(axis, clampInterval([lower + delta, upper + delta], baseInterval, extent)));
  }, [commit, withAxis]);

  const zoomIn = useCallback((axis: ChartViewportAxis = 'x') => zoomAt(axis, ZOOM_IN_FACTOR, 0.5), [zoomAt]);
  const zoomOut = useCallback((axis: ChartViewportAxis = 'x') => zoomAt(axis, ZOOM_OUT_FACTOR, 0.5), [zoomAt]);

  const applyBrushSelection = useCallback((interval: ChartAxisInterval) => {
    const axis: ChartViewportAxis = brushAxis === 'y' ? 'y' : 'x';
    setAxisDomain(axis, interval);
  }, [brushAxis, setAxisDomain]);

  const handleBrushEnd = useCallback((selection: BrushSelection | null) => {
    if (!selection) return;
    if (!Number.isFinite(selection.start) || !Number.isFinite(selection.end)) return;
    if (Math.abs(selection.end - selection.start) <= AXIS_EPSILON) return;
    applyBrushSelection([selection.start, selection.end]);
  }, [applyBrushSelection]);

  const reset = useCallback(() => {
    commit(stateRef.current.baseDomain);
  }, [commit]);

  const getBrushScale = useCallback((plotPixelSize: number): ChartViewportBrushScale => {
    const axis: ChartViewportAxis = brushAxis === 'y' ? 'y' : 'x';
    const interval = stateRef.current.activeDomain[axis];
    const [lower, upper] = interval ?? [0, 1];
    const span = upper - lower;
    return {
      invert: (px: number): number => {
        if (!(plotPixelSize > 0)) return lower;
        return lower + (px / plotPixelSize) * span;
      },
    };
  }, [brushAxis]);

  const isDefault = useMemo(() => {
    const axes: ChartViewportAxis[] = ['x', 'y'];
    return axes.every((axis) => baseDomain[axis] === undefined
      || intervalsEqual(activeDomain[axis], baseDomain[axis]));
  }, [activeDomain, baseDomain]);

  const interactive = (zoom?.enabled ?? false) || (brush?.enabled ?? false);
  const wheelEnabled = (zoom?.enabled ?? false) && (zoom?.wheel ?? false);

  const getRootProps = useCallback((extent: ChartViewportPropsExtent): ChartViewportRootProps => {
    const props: {
      tabIndex?: number;
      onWheel?: (event: React.WheelEvent<Element>) => void;
      onKeyDown?: (event: React.KeyboardEvent<Element>) => void;
      'data-chart-viewport'?: 'default' | 'zoomed';
    } = {
      'data-chart-viewport': isDefault ? 'default' : 'zoomed',
    };
    if (!interactive) return props;

    props.tabIndex = 0;
    props.onKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          pan('x', -KEYBOARD_PAN_FRACTION);
          break;
        case 'ArrowRight':
          pan('x', KEYBOARD_PAN_FRACTION);
          break;
        case 'ArrowUp':
          if (stateRef.current.baseDomain.y) pan('y', -KEYBOARD_PAN_FRACTION);
          else return;
          break;
        case 'ArrowDown':
          if (stateRef.current.baseDomain.y) pan('y', KEYBOARD_PAN_FRACTION);
          else return;
          break;
        case '+':
        case '=':
          zoomIn('x');
          break;
        case '-':
        case '_':
          zoomOut('x');
          break;
        case 'Escape':
        case 'Home':
        case '0':
          reset();
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    if (wheelEnabled) {
      props.onWheel = (event) => {
        const focus = readFocusFraction(event, extent.plot, 'x');
        // Wheel up (negative deltaY) zooms in; down zooms out.
        zoomAt('x', event.deltaY < 0 ? ZOOM_IN_FACTOR : ZOOM_OUT_FACTOR, focus);
        event.preventDefault();
      };
    }
    return props;
  }, [interactive, wheelEnabled, isDefault, pan, zoomIn, zoomOut, zoomAt, reset]);

  const getResetButtonProps = useCallback((): ChartViewportResetButtonProps => ({
    type: 'button',
    onClick: reset,
    disabled: isDefault,
    ...(resetLabel === undefined ? {} : { 'aria-label': resetLabel }),
    'data-part': 'viewport-reset',
    'data-chart-viewport': isDefault ? 'default' : 'zoomed',
  }), [reset, isDefault, resetLabel]);

  return {
    domain: activeDomain,
    isDefault,
    resetLabel,
    reset,
    zoomAt,
    zoomIn,
    zoomOut,
    pan,
    setAxisDomain,
    applyBrushSelection,
    handleBrushEnd,
    getBrushScale,
    getRootProps,
    getResetButtonProps,
  };
}
