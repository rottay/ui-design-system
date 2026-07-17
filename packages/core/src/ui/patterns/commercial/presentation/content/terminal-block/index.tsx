"use client";

import { useEffect, useMemo, useState } from "react";

import type { TerminalBlockProps } from '../../../foundation/contracts/content/terminal-block';
import { useReveal } from '../../../runtime/reveal';

import "./TerminalBlock.css";

const CHAR_INTERVAL_MS = 22;
const LINE_GAP_MS = 220;
const FIELD_SEPARATOR = String.fromCharCode(0);

interface StreamState {
  activeIndex: number;
  activeCount: number;
}

const IDLE_STATE: StreamState = { activeIndex: -1, activeCount: 0 };

function doneState(lineCount: number): StreamState {
  return { activeIndex: lineCount, activeCount: 0 };
}

/**
 * TerminalBlock - a $-prompt framed panel that streams (types) its lines in sequence, once,
 * on scroll-into-view (spec sections 3 and 6).
 *
 * Every line's real text is the visible content from first paint (SSR/no-JS safe, matching
 * the kit's MonoStat convention) and is duplicated into a permanent visually-hidden span so
 * screenreaders always have the complete line; the $ prompt markers and the in-progress
 * typed glyphs are a separate aria-hidden layer. Kept self-contained on purpose - it does
 * not import Typewriter, even though it reuses the same typing feel. Under
 * prefers-reduced-motion: reduce all lines render instantly with no streaming.
 */
export function TerminalBlock({
  lines,
  title,
  streaming = true,
  className,
}: TerminalBlockProps): React.JSX.Element {
  const { ref, revealed, animate } = useReveal<HTMLDivElement>();

  // A content signature, not the array reference, gates the effect below: an inline `lines`
  // literal from the caller must not restart the one-shot stream on an unrelated re-render.
  // Joining fields/lines on a NUL byte keeps the signature collision-free no matter what the
  // line text itself contains.
  const linesKey = useMemo(
    () =>
      lines
        .map((line) => (line.prompt ? "1" : "0") + FIELD_SEPARATOR + line.text)
        .join(FIELD_SEPARATOR),
    [lines],
  );

  // Start with every line fully shown: safe for SSR/first paint/no-JS and for reduced motion.
  // It is only ever reset to the idle (nothing shown) state once `animate` is confirmed true.
  const [stream, setStream] = useState<StreamState>(doneState(lines.length));

  useEffect(() => {
    if (!streaming) {
      setStream(doneState(lines.length));
      return;
    }
    if (!revealed) return;

    if (!animate) {
      setStream(doneState(lines.length));
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function step(index: number, count: number): void {
      if (cancelled || index >= lines.length) return;
      const length = lines[index].text.length;
      if (count > length) {
        timer = setTimeout(() => step(index + 1, 0), LINE_GAP_MS);
        return;
      }
      setStream({ activeIndex: index, activeCount: count });
      timer = setTimeout(() => step(index, count + 1), CHAR_INTERVAL_MS);
    }

    setStream(IDLE_STATE);
    step(0, 0);

    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
    // linesKey stands in for `lines` so an unstable array literal from the caller does not
    // restart the one-shot stream on an unrelated re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming, revealed, animate, linesKey]);

  const classes = ["rt-terminal-block", className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes}>
      <div className="rt-terminal-block__scanlines" aria-hidden="true" />
      {title != null && <div className="rt-terminal-block__title-bar">{title}</div>}
      <div className="rt-terminal-block__body">
        {lines.map((line, index) => {
          const started = index <= stream.activeIndex;
          const typedCount =
            index < stream.activeIndex
              ? line.text.length
              : index === stream.activeIndex
                ? stream.activeCount
                : 0;
          return (
            <div className="rt-terminal-block__line" key={index}>
              <span className="rt-terminal-block__visually-hidden">{line.text}</span>
              {started && (
                <span className="rt-terminal-block__visual" aria-hidden="true">
                  {line.prompt && <span className="rt-terminal-block__prompt">{"$ "}</span>}
                  {line.text.slice(0, typedCount)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type {
  TerminalBlockProps,
  TerminalBlockLine,
} from '../../../foundation/contracts/content/terminal-block';
