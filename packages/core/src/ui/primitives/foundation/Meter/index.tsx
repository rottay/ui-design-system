/**
 * @fileoverview Meter - Rottay Design System
 *
 * The canonical scalar-reading gauge: score, capacity, health, signal,
 * quality or usage. A meter is NOT task progress — it owns no indeterminate
 * mode and no execution states; that contract belongs to `Progress`.
 *
 * It is the sanctioned raw-element tier (SemanticSurface/CodeBlock/
 * ResizeHandle precedent): one implementation with no per-engine siblings,
 * because a gauge's semantics do not vary by engine. Paint, track geometry,
 * threshold patterns and the ring arc all live in the canonical skins
 * (`presentation/components/meter.css` composing the shared
 * `presentation/components/arc.css` substrate); the TSX stamps data
 * attributes and only truly dynamic per-instance geometry (fill ratio,
 * tick positions, the registered arc sweep). Instance geometry is never a
 * tenant token.
 *
 * Semantics follow the WHATWG `<meter>` model, fail-closed: non-finite
 * `value`/`min`/`max` collapse to the platform defaults, `max` always remains
 * strictly above `min` for the ARIA meter pattern, and the reading is clamped
 * into [min, max] for geometry AND
 * for `aria-valuenow`/the visible text, so the number a screen reader hears
 * is always the number the bar shows. `low`/`high`/`optimum` take the WHATWG
 * defaults (min / max / midpoint) as soon as ANY of them is authored; with
 * none authored the meter is tone-only (`data-threshold='none'`).
 *
 * Threshold signaling: on `bar`/`compact`, shape (track ticks) + label
 * (localized `aria-valuetext` status) + pattern (governed static stripes).
 * On `ring`, the threshold reaches users through text — the localized
 * `aria-valuetext` and the center reading — not through shape.
 *
 * @example Usage reading against a quota
 * ```tsx
 * <Meter value={72} label="Storage" format="percent" low={60} high={85} optimum={100} />
 * ```
 *
 * @module Meter
 * @category Feedback
 * @package @rottay/design-system
 */
'use client';

import React, { forwardRef, useId, useMemo } from 'react';
import type { CSSProperties } from 'react';

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

import type {
  MeterFormat,
  MeterProps,
  MeterThreshold,
} from './contracts';

interface MeterRange {
  min: number;
  max: number;
  value: number;
  ratio: number;
  low: number;
  high: number;
  optimum: number;
  hasThresholds: boolean;
}

function clampNumber(candidate: number, floor: number, ceiling: number): number {
  return Math.min(ceiling, Math.max(floor, candidate));
}

/**
 * WHATWG `<meter>` sanitation: non-finite bounds fall to the contract
 * defaults (0 / 100), a ceiling at or below the floor receives a finite
 * positive span, the
 * reading clamps into the range (non-finite readings collapse to `min`,
 * the fail-closed empty state), and the threshold trio defaults to
 * min / max / midpoint the moment any of the three is authored.
 */
function resolveMeterRange(options: {
  value: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
}): MeterRange {
  let min = Number.isFinite(options.min as number) ? (options.min as number) : 0;
  const maxSeed = Number.isFinite(options.max as number) ? (options.max as number) : 100;
  let max = maxSeed;
  let rangeWasRejected = false;
  if (max <= min) {
    rangeWasRejected = true;
    const next = min + Math.max(1, Math.abs(min) * Number.EPSILON);
    if (Number.isFinite(next) && next > min) {
      max = next;
    } else {
      // No finite value exists above an extreme floor: reject the malformed
      // range as a unit instead of emitting an impossible ARIA interval.
      min = 0;
      max = 100;
    }
  }
  const value = clampNumber(
    !rangeWasRejected && Number.isFinite(options.value) ? options.value : min,
    min,
    max
  );
  const hasThresholds =
    options.low != null || options.high != null || options.optimum != null;
  const low = clampNumber(
    Number.isFinite(options.low as number) ? (options.low as number) : min,
    min,
    max
  );
  const highSeed = Number.isFinite(options.high as number) ? (options.high as number) : max;
  const high = clampNumber(highSeed < low ? low : highSeed, low, max);
  const optimum = clampNumber(
    Number.isFinite(options.optimum as number) ? (options.optimum as number) : (min + max) / 2,
    min,
    max
  );
  const ratio = max > min ? (value - min) / (max - min) : 0;
  return { min, max, value, ratio, low, high, optimum, hasThresholds };
}

/**
 * WHATWG `<meter>` region algorithm over the sanitized range: the region
 * containing `optimum` is the optimal one; when the middle region is optimal
 * both outer regions are suboptimal, otherwise the middle is suboptimal and
 * the far outer region is critical. Authoring ANY of `low`/`high`/`optimum`
 * engages the algorithm with WHATWG defaults for the missing members
 * (low ← min, high ← max, optimum ← midpoint); authoring none yields `none`.
 */
export function resolveMeterThreshold(options: {
  value: number;
  min: number;
  max: number;
  low?: number;
  high?: number;
  optimum?: number;
}): MeterThreshold {
  const range = resolveMeterRange(options);
  if (!range.hasThresholds) return 'none';

  const region =
    range.value < range.low ? 'low' : range.value > range.high ? 'high' : 'middle';
  const optimumRegion =
    range.optimum < range.low ? 'low' : range.optimum > range.high ? 'high' : 'middle';
  if (region === optimumRegion) return 'optimal';
  if (optimumRegion === 'middle') return 'suboptimal';
  return region === 'middle' ? 'suboptimal' : 'critical';
}

const THRESHOLD_TEXT_KEY: Record<Exclude<MeterThreshold, 'none'>, string> = {
  optimal: 'meter.threshold.optimal',
  suboptimal: 'meter.threshold.suboptimal',
  critical: 'meter.threshold.critical',
};

const THRESHOLD_TEXT_FLOOR: Record<Exclude<MeterThreshold, 'none'>, string> = {
  optimal: 'optimal range',
  suboptimal: 'suboptimal range',
  critical: 'critical range',
};

export const Meter = forwardRef<HTMLSpanElement, MeterProps>(function Meter(props, ref) {
  const {
    value,
    min = 0,
    max = 100,
    low,
    high,
    optimum,
    label,
    description,
    format = 'number',
    locale: localeProp,
    formatValue,
    size = 'md',
    variant = 'bar',
    tone,
    showValue = true,
    className,
    style,
    id,
  } = props;

  const i18n = useOptionalTranslation('components');
  // Deterministic floor: the DS global `en` fallback, never the ambient
  // runtime locale — a server without an i18n provider must format exactly
  // like the hydrating client.
  const resolvedLocale = localeProp ?? i18n?.locale ?? 'en';

  const range = resolveMeterRange({ value, min, max, low, high, optimum });
  const threshold = resolveMeterThreshold({ value, min, max, low, high, optimum });

  const formatter = useMemo(() => {
    if (format === 'percent') {
      return new Intl.NumberFormat(resolvedLocale, { style: 'percent' });
    }
    if (format === 'score') {
      return new Intl.NumberFormat(resolvedLocale, { maximumFractionDigits: 2 });
    }
    return new Intl.NumberFormat(resolvedLocale);
  }, [format, resolvedLocale]);

  const formatted = formatter.format(format === 'percent' ? range.ratio : range.value);
  const valueNode = formatValue ? formatValue(formatted, range.value) : formatted;

  const thresholdText =
    threshold === 'none'
      ? undefined
      : i18n?.tOr(THRESHOLD_TEXT_KEY[threshold], THRESHOLD_TEXT_FLOOR[threshold]) ??
        THRESHOLD_TEXT_FLOOR[threshold];

  const autoId = useId();
  const labelId = label != null ? `${autoId}-label` : undefined;
  const descriptionId = description != null ? `${autoId}-description` : undefined;

  const meterA11y = {
    role: 'meter',
    'aria-valuemin': range.min,
    'aria-valuemax': range.max,
    'aria-valuenow': range.value,
    'aria-valuetext': thresholdText ? `${formatted}, ${thresholdText}` : formatted,
    'aria-labelledby': labelId,
    'aria-label': labelId ? undefined : props['aria-label'],
    'aria-describedby': descriptionId,
  } as const;

  const rootClassName = ['ds-meter', className].filter(Boolean).join(' ');

  const boundaryRatio = (boundary: number): number =>
    range.max > range.min ? (boundary - range.min) / (range.max - range.min) : 0;

  const ticks =
    range.hasThresholds && variant !== 'ring' ? (
      <>
        <span
          data-part="tick"
          data-tick="low"
          style={{ insetInlineStart: `${boundaryRatio(range.low) * 100}%` }}
        />
        <span
          data-part="tick"
          data-tick="high"
          style={{ insetInlineStart: `${boundaryRatio(range.high) * 100}%` }}
        />
      </>
    ) : null;

  return (
    <span
      ref={ref}
      id={id}
      className={rootClassName}
      style={style}
      data-part="root"
      data-variant={variant}
      data-size={size}
      data-tone={tone}
      data-threshold={threshold}
      data-testid={props['data-testid']}
    >
      {label != null || (showValue && variant !== 'ring') ? (
        <span data-part="header">
          {label != null ? (
            <span data-part="label" id={labelId}>
              {label}
            </span>
          ) : null}
          {showValue && variant !== 'ring' ? (
            <span data-part="value" aria-hidden="true">
              {valueNode}
            </span>
          ) : null}
        </span>
      ) : null}

      {variant === 'ring' ? (
        <span
          className="ds-arc"
          data-part="ring"
          {...meterA11y}
          style={{ '--_ds-arc-value': range.ratio * 100 } as CSSProperties}
        >
          {showValue ? (
            <span data-part="value" aria-hidden="true">
              {valueNode}
            </span>
          ) : null}
        </span>
      ) : (
        <span data-part="track" {...meterA11y}>
          <span
            data-part="fill"
            style={{ '--_meter-ratio': range.ratio } as CSSProperties}
          />
          {ticks}
        </span>
      )}

      {description != null ? (
        <span data-part="description" id={descriptionId}>
          {description}
        </span>
      ) : null}
    </span>
  );
});

Meter.displayName = 'Meter';

export type {
  MeterFormat,
  MeterProps,
  MeterSize,
  MeterThreshold,
  MeterTone,
  MeterVariant,
} from './contracts';
