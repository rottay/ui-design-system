import type { ReactNode } from "react";

export interface MonoStatProps {
  /** The final value the stat counts up to. */
  value: number;
  /**
   * Mono label rendered below the value (e.g. "USE CASES"). Domain-agnostic — supplied by
   * the consumer; the kit itself knows nothing about what is being counted.
   */
  label: ReactNode;
  /** Text prepended to the formatted value, inside the counted and accessible text (e.g. `"$"`). */
  prefix?: string;
  /** Text appended to the formatted value, inside the counted and accessible text (e.g. `"+"`). */
  suffix?: string;
  /** Count-up duration in milliseconds. Defaults to `900`. Ignored under reduced motion. */
  durationMs?: number;
  /**
   * Formats a number for display. Called on every animation frame with the current
   * (possibly fractional) interpolated value, and with the final `value`. Defaults to
   * `Intl.NumberFormat` rounded to the nearest integer, with grouping (spec section 4:
   * tabular numerals everywhere data renders).
   */
  format?: (n: number) => string;
  /** Extra class names on the root element. */
  className?: string;
}
