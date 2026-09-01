import type { CSSProperties, ReactNode } from 'react';

/**
 * Size axis. Bar thickness, ring diameter and value type scale ride the
 * canonical sizing channels × the effective density; the TSX fixes no pixels.
 */
export type MeterSize = 'sm' | 'md' | 'lg';

/**
 * `bar` (track + fill with threshold ticks), `compact` (single-row micro
 * meter) and `ring` (governed arc with a textual center). There is no
 * indeterminate mode and no execution state: that is `Progress`'s contract.
 */
export type MeterVariant = 'bar' | 'compact' | 'ring';

/** Explicit tone. When provided it wins over threshold-derived signaling. */
export type MeterTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Value presentation: `number` (locale plain), `percent` (locale percent of
 * the value's ratio inside [min, max]) and `score` (locale number capped at
 * two fraction digits). All three render with tabular figures.
 */
export type MeterFormat = 'number' | 'percent' | 'score';

/**
 * Deterministic threshold level resolved from `low`/`high`/`optimum` with the
 * WHATWG `<meter>` region algorithm. Authoring ANY of the three engages the
 * algorithm with WHATWG defaults for the missing members (low ← min,
 * high ← max, optimum ← midpoint); `none` means none was authored, so the
 * meter renders tone-only.
 */
export type MeterThreshold = 'none' | 'optimal' | 'suboptimal' | 'critical';

/**
 * Contract for the engine-independent Meter primitive.
 *
 * @description Meter reports a known scalar — a score, capacity, health,
 * signal, quality or usage reading — never the advance of a task. It carries
 * `role="meter"` semantics (`aria-valuemin/max/now` plus a localized
 * `aria-valuetext`) so assistive technology announces value and range
 * correctly.
 *
 * Thresholds resolve deterministically. On `bar`/`compact` they are signaled
 * by shape (track tick marks at `low`/`high`), label (the localized value
 * text and the screen-reader threshold status) and pattern (governed stripe
 * fills) — never by color alone. On `ring` the threshold reaches users
 * through text — the localized `aria-valuetext` and the center reading —
 * not through shape.
 *
 * Numbers localize through the existing i18n runtime: the optional
 * translation context supplies the active locale, the `locale` prop wins when
 * provided, and English is the deterministic standalone floor.
 */
interface MeterBaseProps {
  /**
   * Current reading. Clamped into [min, max] for geometry AND for the
   * emitted `aria-valuenow`/visible text, so what assistive technology
   * hears is always what the bar shows. Non-finite readings (NaN,
   * Infinity) collapse fail-closed to `min` — an empty meter, never a
   * full one.
   */
  value: number;
  /** Range floor. Non-finite values fall back to the default. @default 0 */
  min?: number;
  /**
   * Range ceiling. Non-finite values fall back to the default; a ceiling at
   * or below `min` receives a finite positive span so the ARIA range stays
   * non-degenerate.
   * @default 100
   */
  max?: number;
  /** Low-region boundary. WHATWG default when any threshold is authored: `min`. */
  low?: number;
  /** High-region boundary. WHATWG default when any threshold is authored: `max`. */
  high?: number;
  /**
   * The "good" point that decides which region is optimal. WHATWG default
   * when any threshold is authored: the range midpoint.
   */
  optimum?: number;
  /** Supporting text, associated via `aria-describedby`. */
  description?: ReactNode;
  /** @default 'number' */
  format?: MeterFormat;
  /**
   * BCP-47 locale override for `Intl.NumberFormat`. Defaults to the active
   * i18n-runtime locale, then to the DS global `en` floor — never the
   * ambient runtime locale, so server and hydrating client format
   * identically without a provider.
   */
  locale?: string;
  /**
   * Declarative value slot: full control over the rendered reading. Receives
   * the already-localized string and sanitized value; paint stays with the skin.
   */
  formatValue?: (formattedValue: string, value: number) => ReactNode;
  /** @default 'md' */
  size?: MeterSize;
  /** @default 'bar' */
  variant?: MeterVariant;
  /** Explicit tone; overrides threshold-derived signaling. */
  tone?: MeterTone;
  /** Render the localized reading. @default true */
  showValue?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  'data-testid'?: string;
}

type MeterVisibleLabel = {
  /** Declarative visible label, associated via `aria-labelledby`. */
  label: Exclude<ReactNode, null | undefined | boolean>;
  /** Optional explicit override; the visible label remains the primary name. */
  'aria-label'?: string;
};

type MeterAriaLabel = {
  label?: never;
  /** Accessible name required when no visible label is rendered. */
  'aria-label': string;
};

/** Every meter has an accessible name by construction. */
export type MeterProps = MeterBaseProps & (MeterVisibleLabel | MeterAriaLabel);
