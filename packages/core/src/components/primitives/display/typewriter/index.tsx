"use client";

import { useEffect, useState } from "react";

import type { TypewriterProps } from './contracts';
import { useReveal } from '@/graphics/motion/react/runtime/reveal';

const DECODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+=-_?/\\|~";

/**
 * Fallback for the typing cadence (milliseconds per character) — the contract's documented
 * default. The effective cadence resolves as: explicit `speed` prop, else the family-private
 * channel `--_ds-typewriter-cadence` (a `<time>` read from the reveal root at animation
 * start), else this constant.
 */
const DEFAULT_SPEED_MS = 28;
const CADENCE_AXIS = "--_ds-typewriter-cadence";

/**
 * Reads a family-private `<time>` channel from the resolved style of `node`, falling back to
 * `fallbackMs` when the channel is undeclared or unparseable. Called only inside effects, once
 * per reveal run. (Local copy of the kit's cadence reader — merge candidate.)
 */
function readCadenceTimeMs(node: HTMLElement | null, axis: string, fallbackMs: number): number {
  if (node === null || typeof getComputedStyle !== "function") return fallbackMs;
  const raw = getComputedStyle(node).getPropertyValue(axis).trim();
  const parsed = raw.endsWith("ms")
    ? Number.parseFloat(raw)
    : raw.endsWith("s")
      ? Number.parseFloat(raw) * 1000
      : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackMs;
}

/**
 * The decode noise is DETERMINISTIC: a 32-bit mixer over `(charCode, position,
 * step)`. It still looks like noise — every step re-scrambles every unsettled
 * glyph — but the same text produces the same reveal on the server, on the
 * client and in a test, so the effect is reproducible instead of merely
 * observed once.
 */
function decodeCharAt(source: string, index: number, step: number): string {
  let hash = (source.charCodeAt(index) ^ (index * 0x9e3779b1) ^ (step * 0x85ebca6b)) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 15), 0x2545f491) >>> 0;
  return DECODE_CHARS[hash % DECODE_CHARS.length];
}

/** A copy of `source` from `from` onward with every non-space character replaced by noise. */
function scrambledSuffix(source: string, from: number): string {
  let out = "";
  for (let i = from; i < source.length; i += 1) {
    out += source[i] === " " ? " " : decodeCharAt(source, i, from);
  }
  return out;
}

/**
 * One-shot typed or decoded text reveal, triggered once the element scrolls into view
 * (spec sections 3 and 6).
 *
 * The real text is the visible content from first paint (SSR/no-JS safe, matching the kit's
 * `MonoStat` convention) and is duplicated into a permanent visually-hidden span so
 * screenreaders always have the complete value; the animated glyphs are a separate
 * `aria-hidden` layer. The reveal fires at most once, driven by `useReveal`, and collapses to
 * the final text with no animation under `prefers-reduced-motion: reduce`.
 */
export function Typewriter({
  text,
  mode = "type",
  speed,
  as: As = "span",
  className,
}: TypewriterProps): React.JSX.Element {
  const { ref, revealed, animate } = useReveal<HTMLElement>();
  // Start at the final text: safe for SSR/first paint/no-JS and for reduced motion. It is
  // only ever reset to the empty/scrambled starting point once `animate` is confirmed true.
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!revealed) return;

    if (!animate) {
      setDisplay(text);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // An explicit `speed` prop always wins; otherwise the governed cadence axis, with the
    // contract default as the final fallback (never a bare constant).
    const stepMs = Math.max(1, speed ?? readCadenceTimeMs(ref.current, CADENCE_AXIS, DEFAULT_SPEED_MS));

    function step(count: number): void {
      if (cancelled) return;
      const settled = text.slice(0, count);
      const next =
        mode === "decode" && count < text.length ? settled + scrambledSuffix(text, count) : settled;
      setDisplay(next);
      if (count < text.length) {
        timer = setTimeout(() => step(count + 1), stepMs);
      }
    }

    step(0);

    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [revealed, animate, text, mode, speed]);

  const classes = ["rt-typewriter", className].filter(Boolean).join(" ");

  return (
    <As ref={ref} className={classes} data-part="root" data-mode={mode}>
      <span className="rt-typewriter__visually-hidden">{text}</span>
      <span className="rt-typewriter__visual" data-part="visual" aria-hidden="true">
        {display}
      </span>
    </As>
  );
}

export type {
  TypewriterProps,
  TypewriterMode,
} from './contracts';
