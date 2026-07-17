"use client";

/**
 * @fileoverview CountUp motion primitive - Rottay Design System
 *
 * Animates a numeric value from a starting number to a target number with a
 * cancelable, duration-bound frame loop. Server/no-JS output is always the
 * final value; enhancement starts only after the element enters the viewport.
 *
 * @example
 * ```tsx
 * <CountUp from={0} to={1250} suffix="+" formatter={(n) => `$${n}`} />
 * ```
 */

import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { useInView } from "motion/react";
import type { CountUpProps } from "@/graphics/motion/foundation/contracts";
import { useMotionPersonality } from "@/graphics/motion/react/runtime";
import { resolveMotionMilliseconds } from "@/graphics/motion/foundation/timing";
import { I18nContext } from '@/infrastructure/runtime/i18n';

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function resolveFractionDigits(decimals: number | undefined): number {
  if (decimals === undefined || !Number.isFinite(decimals)) return 0;
  return Math.min(20, Math.max(0, Math.trunc(decimals)));
}

function formatCountUpValue(
  value: number,
  fractionDigits: number,
  formatter: ((value: number) => string) | undefined,
  prefix: string,
  suffix: string,
  locale: string,
): string {
  const factor = 10 ** fractionDigits;
  const rounded = Math.round(value * factor) / factor;
  const formatted = formatter
    ? formatter(rounded)
    : rounded.toLocaleString(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });
  return `${prefix}${formatted}${suffix}`;
}

/**
 * Animate a number from `from` to `to` when the element enters the viewport.
 *
 * Writes directly to the DOM on each frame to avoid per-frame React renders.
 * The easing is bounded and the frame is cancelable, so the requested duration
 * remains authoritative instead of competing with spring physics.
 *
 * @param props - {@link CountUpProps}
 * @param props.from - Starting numeric value. Defaults to `0`.
 * @param props.to - Target numeric value the counter animates toward.
 * @param props.durationMs - Animation duration in milliseconds. Defaults to `2000`.
 * @param props.delayMs - Delay before the count begins in milliseconds.
 * @param props.prefix - Static text rendered before the number (e.g. `"$"`).
 * @param props.suffix - Static text rendered after the number (e.g. `"%"`).
 * @param props.decimals - Fixed decimal places for the default formatter.
 * @param props.locale - Explicit number locale. Falls back to I18nContext, then `en-US`.
 * @param props.formatter - Custom formatter applied to the precision-rounded value on each frame.
 * @param props.className - CSS class applied to the outer `<span>`.
 * @param props.style - Inline styles applied to the outer `<span>`.
 * @returns A `<span>` element whose text content animates from `from` to `to`.
 */
export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  durationMs,
  delayMs,
  duration,
  delay,
  prefix = "",
  suffix = "",
  decimals,
  locale,
  formatter,
  className,
  style,
}) => {
  const motionPersonality = useMotionPersonality();
  const i18nContext = useContext(I18nContext);
  const resolvedLocale = locale ?? i18nContext?.locale ?? "en-US";

  // Respect both the OS-level reduced-motion preference AND the tenant-level
  // countUpEnabled flag so administrators can disable counting animations
  // independently of other motion primitives.
  const shouldReduceMotion =
    motionPersonality.shouldReduceMotion || !motionPersonality.countUpEnabled;
  const resolvedStaticRef = useRef(shouldReduceMotion);
  if (shouldReduceMotion) {
    resolvedStaticRef.current = true;
  }
  const resolvedStatic = resolvedStaticRef.current;
  const resolvedDurationMs = resolveMotionMilliseconds({
    milliseconds: durationMs,
    legacy: duration,
    fallbackMilliseconds: 2000,
  });
  const resolvedDelayMs = resolveMotionMilliseconds({
    milliseconds: delayMs,
    legacy: delay,
    fallbackMilliseconds: 0,
  });
  const fractionDigits = resolveFractionDigits(decimals);

  const ref = useRef<HTMLSpanElement>(null);

  // `amount: 0.5` ensures the element is at least half-visible before counting
  // begins, preventing wasted animation cycles off-screen.
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const displayRef = useRef<HTMLSpanElement>(null);
  const latestValueRef = useRef(from);
  const hasEnhancedRef = useRef(false);

  // -- Enhance the final SSR value with a cancelable client-side count --------
  // Layout timing prevents the final SSR baseline from flashing before a
  // client-only eligible counter is reset to its starting value.
  useIsomorphicLayoutEffect(() => {
    let frameId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const writeValue = (latest: number) => {
      if (displayRef.current) {
        displayRef.current.textContent = formatCountUpValue(
          latest,
          fractionDigits,
          formatter,
          prefix,
          suffix,
          resolvedLocale,
        );
      }
      latestValueRef.current = latest;
    };

    // The final value is the baseline for SSR, no-JS and reduced-motion users.
    if (resolvedStatic || !isInView) {
      writeValue(to);
      return undefined;
    }

    // The initial enhancement starts at `from`; subsequent target changes
    // retarget from the last painted numeric value so live metrics never snap
    // backwards to their original baseline.
    const animationStart = hasEnhancedRef.current
      ? latestValueRef.current
      : from;
    hasEnhancedRef.current = true;
    writeValue(animationStart);

    const start = () => {
      if (cancelled) return;
      if (resolvedDurationMs === 0 || animationStart === to) {
        writeValue(to);
        return;
      }

      let startedAt: number | undefined;
      const tick = (timestamp: number) => {
        if (cancelled) return;
        startedAt ??= timestamp;
        const progress = Math.min(
          1,
          Math.max(0, (timestamp - startedAt) / resolvedDurationMs)
        );
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        writeValue(animationStart + (to - animationStart) * easedProgress);
        if (progress < 1) {
          frameId = requestAnimationFrame(tick);
        } else {
          writeValue(to);
        }
      };
      frameId = requestAnimationFrame(tick);
    };

    if (resolvedDelayMs > 0) {
      timeoutId = setTimeout(start, resolvedDelayMs);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [
    formatter,
    fractionDigits,
    from,
    isInView,
    resolvedLocale,
    prefix,
    resolvedDelayMs,
    resolvedDurationMs,
    resolvedStatic,
    suffix,
    to,
  ]);

  return (
    <span
      ref={ref}
      className={className}
      style={style}
      data-ds-motion-primitive="count-up"
    >
      {/* ds-nums-tabular (CRA-01, foundation/base/typography.css) locks every
          digit to a fixed advance width so the ticking value never jitters
          column-to-column as digits change on each animation frame. */}
      <span ref={displayRef} className="ds-nums-tabular">
        {formatCountUpValue(
          to,
          fractionDigits,
          formatter,
          prefix,
          suffix,
          resolvedLocale,
        )}
      </span>
    </span>
  );
};

CountUp.displayName = "CountUp";
