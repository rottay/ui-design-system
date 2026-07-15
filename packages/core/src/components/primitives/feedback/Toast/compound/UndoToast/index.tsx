'use client';

/**
 * @fileoverview UndoToast - undo-window Toast recipe for the async-state law.
 * @description Composes the Toast primitive's Undo action with a countdown
 * affordance (ring or bar) over the undo window. The window is owned here (a
 * single setTimeout, pausable on hover) so the countdown and the dismissal stay
 * in step, and the depletion is driven by ONE CSS animation — never a
 * requestAnimationFrame loop. Under `prefers-reduced-motion` the animation is
 * disabled: the affordance renders static and the window still elapses.
 *
 * Renders `BaseToast` (not the public `Toast` wrapper) to avoid an import cycle
 * with `Toast.tsx`, and drives the toast with `duration={0}` / `showProgress={false}`
 * so the engine's own auto-dismiss and progress rAF stay dormant.
 *
 * @module Toast/Compound/UndoToast
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useBreakpoints } from '../../../../../../hooks';
import { BaseToast } from '../../base';
import type { ToastVariant, ToastCountdownVariant } from '../../Toast.types';

// Ring geometry. A small leading badge that depletes as the window runs out.
const RING_SIZE = 24;
const RING_STROKE = 2.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CENTER = RING_SIZE / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Props for {@link UndoToast}.
 */
export interface UndoToastProps {
  /** Undo handler; invoked when the user chooses Undo before the window elapses. */
  onUndo: () => void;

  /** Called when the window elapses or the toast is dismissed. */
  onClose?: () => void;

  /** Primary line. */
  title?: ReactNode;

  /** Secondary line. */
  description?: ReactNode;

  /**
   * Undo button label.
   * @default 'Undo'
   */
  undoLabel?: ReactNode;

  /**
   * Length of the undo window in milliseconds.
   * @default 5000
   */
  duration?: number;

  /**
   * Toast colour variant.
   * @default 'default'
   */
  variant?: ToastVariant;

  /**
   * Countdown affordance shown for the window.
   * @default 'ring'
   */
  countdown?: ToastCountdownVariant;

  /**
   * Whether the window pauses while the toast is hovered.
   * @default true
   */
  pauseOnHover?: boolean;

  /**
   * Whether the toast shows a manual close button.
   * @default true
   */
  closable?: boolean;
}

/**
 * Undo-window Toast recipe.
 *
 * Shows a Toast with an Undo action and a countdown affordance that depletes
 * over `duration`, auto-dismissing when the window elapses. The countdown is a
 * single CSS animation (paused on hover, disabled under reduced motion), so it
 * never loops and never drives a per-frame JS callback.
 *
 * @param props - {@link UndoToastProps}
 * @returns The composed undo Toast, or null once dismissed.
 *
 * @example
 * ```tsx
 * {removed && (
 *   <Toast.Undo
 *     title="Item deleted"
 *     onUndo={restore}
 *     onClose={() => setRemoved(false)}
 *   />
 * )}
 * ```
 */
export function UndoToast({
  onUndo,
  onClose,
  title,
  description,
  undoLabel = 'Undo',
  duration = 5000,
  variant = 'default',
  countdown = 'ring',
  pauseOnHover = true,
  closable = true,
}: UndoToastProps): React.ReactElement | null {
  const { prefersReducedMotion } = useBreakpoints();

  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  const uid = useId().replace(/:/g, '');
  const ringAnimName = `ds-toast-undo-ring-${uid}`;
  const barAnimName = `ds-toast-undo-bar-${uid}`;

  // Latest callbacks in refs so the window timer never closes over stale state.
  const onUndoRef = useRef(onUndo);
  onUndoRef.current = onUndo;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Window timer owned here so the countdown and dismissal pause together.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);

  // Both timer helpers close over refs and the stable setVisible only, so they
  // are identity-stable and can be effect dependencies without re-arming the
  // undo window on every render.
  const clearWindowTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startWindowTimer = useCallback((ms: number) => {
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setVisible(false);
    }, Math.max(0, ms));
  }, []);

  useEffect(() => {
    if (duration <= 0) {
      return;
    }
    remainingRef.current = duration;
    startWindowTimer(duration);
    return () => clearWindowTimer();
  }, [duration, startWindowTimer, clearWindowTimer]);

  const handleMouseEnter = () => {
    if (!pauseOnHover || timerRef.current === null) {
      return;
    }
    setPaused(true);
    clearWindowTimer();
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
  };

  const handleMouseLeave = () => {
    if (!pauseOnHover || !visible || duration <= 0 || timerRef.current !== null) {
      return;
    }
    setPaused(false);
    startWindowTimer(remainingRef.current);
  };

  const handleUndo = () => {
    clearWindowTimer();
    onUndoRef.current();
  };

  const handleBaseClose = () => {
    clearWindowTimer();
    onCloseRef.current?.();
  };

  // The depletion animation is suppressed for motion-sensitive viewers and for a
  // zero/negative window (no countdown to run).
  const animate = !prefersReducedMotion && duration > 0 && countdown !== 'none';

  const keyframes =
    countdown === 'ring'
      ? `@keyframes ${ringAnimName}{from{stroke-dashoffset:0}to{stroke-dashoffset:${RING_CIRCUMFERENCE}px}}`
      : countdown === 'bar'
        ? `@keyframes ${barAnimName}{from{width:100%}to{width:0%}}`
        : '';

  const ringNode =
    countdown === 'ring' && duration > 0 ? (
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <circle
          data-part="track"
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke="var(--ds-color-border)"
          strokeWidth={RING_STROKE}
        />
        <circle
          data-part="fill"
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke="var(--ds-color-primary)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
          style={
            animate
              ? {
                  animationName: ringAnimName,
                  animationDuration: `${duration}ms`,
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards',
                  animationPlayState: paused ? 'paused' : 'running',
                }
              : { strokeDashoffset: 0 }
          }
        />
      </svg>
    ) : undefined;

  return (
    <div
      data-part="root"
      className="rottay-undo-toast"
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {animate && keyframes && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}

      <BaseToast
        variant={variant}
        title={title}
        description={description}
        icon={ringNode}
        duration={0}
        showProgress={false}
        pauseOnHover={false}
        closable={closable}
        visible={visible}
        onClose={handleBaseClose}
        action={{ label: undoLabel, onClick: handleUndo, closeOnClick: true }}
      />

      {countdown === 'bar' && duration > 0 && (
        <div
          data-part="track"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            data-part="fill"
            style={{
              height: '100%',
              width: '100%',
              ...(animate
                ? {
                    animationName: barAnimName,
                    animationDuration: `${duration}ms`,
                    animationTimingFunction: 'linear',
                    animationFillMode: 'forwards',
                    animationPlayState: paused ? 'paused' : 'running',
                  }
                : {}),
            }}
          />
        </div>
      )}
    </div>
  );
}

UndoToast.displayName = 'Toast.Undo';
