"use client";

import { useEffect, useRef, useState } from "react";

import type { MonoStatProps } from "./MonoStat.types";
import { useReveal } from "../_internal/motion";

import "./MonoStat.css";

const defaultFormat = (n: number): string =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.round(n) || 0);

/**
 * Ease-out cubic. Approximates the canon's ease-out feel (`--ds-commercial-motion-ease`, a
 * fast-start/long-settle curve) for the JS-driven number interpolation. The count-up cannot
 * ride a CSS transition since the animated value is text content, not a style property, so
 * this is a small local easing fn rather than a dependency.
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * MonoStat — a monospace statistic that counts up once on scroll-into-view (spec sections 4
 * and 6: tabular numerals as the data idiom; one-shot scroll-driven reveal for stats).
 *
 * Built for the commercial "proof wall" (e.g. `601` use cases, `9` modules, `130`
 * components): a large tabular-nums mono value with a small mono label beneath it. The label
 * is supplied by the consumer — the kit knows nothing about what is being counted.
 *
 * Accessibility: the animated digits are decorative motion and are marked `aria-hidden`. The
 * FINAL formatted value (prefix + formatted value + suffix) is exposed to screenreaders at
 * all times via a visually-hidden span, so assistive tech never encounters a mid-count
 * number. Under `prefers-reduced-motion: reduce` (`useReveal().animate === false`) the
 * visible digits render the final value instantly, with no count-up, matching the hidden
 * accessible text exactly. The reveal — and therefore the count-up — fires at most once.
 */
export function MonoStat({
  value,
  label,
  prefix = "",
  suffix = "",
  durationMs = 900,
  format = defaultFormat,
  className,
}: MonoStatProps): React.JSX.Element {
  const { ref, revealed, animate } = useReveal<HTMLDivElement>();
  // Start at the final value: the safe, legible state for SSR/first paint and for reduced
  // motion (spec section 6). It is only ever reset to 0 once `animate` is confirmed true.
  const [count, setCount] = useState(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!revealed) return;

    if (!animate) {
      setCount(value);
      return;
    }

    const start = performance.now();

    const tick = (now: number): void => {
      const elapsed = now - start;
      const progress = durationMs <= 0 ? 1 : Math.min(elapsed / durationMs, 1);
      setCount(value * easeOutCubic(progress));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [revealed, animate, value, durationMs]);

  const finalText = `${prefix}${format(value)}${suffix}`;
  const countingText = `${prefix}${format(count)}${suffix}`;
  const classes = ["rt-mono-stat", className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes}>
      <span className="rt-mono-stat__value" aria-hidden="true">
        {countingText}
      </span>
      <span className="rt-mono-stat__visually-hidden">{finalText}</span>
      <span className="rt-mono-stat__label">{label}</span>
    </div>
  );
}

export type { MonoStatProps } from "./MonoStat.types";
