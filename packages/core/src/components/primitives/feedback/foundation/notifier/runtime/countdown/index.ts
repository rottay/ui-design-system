'use client';

/**
 * @fileoverview The notifier lifetime: a countdown that freezes its remaining
 * budget while the pointer or keyboard focus is inside the surface (WCAG 2.2.1)
 * and resumes from where it stopped, never from the start.
 *
 * Pointer and focus are independent reasons to hold the budget: the countdown
 * runs again only once every applicable reason is gone.
 *
 * @module Notifier/Runtime/Countdown
 * @category Feedback
 * @package @rottay/design-system
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';

export interface NotifierCountdownOptions {
  /** Lifetime in milliseconds; 0 never expires. */
  durationMs: number;
  /** Stops the countdown, e.g. while the surface is leaving. */
  running: boolean;
  /** Whether the pointer holds the budget; keyboard focus always holds it. */
  pauseOnHover: boolean;
  /** Changes when the surface is refreshed in place; the lifetime restarts in full. */
  revision?: number;
  onExpire: () => void;
}

export interface NotifierCountdown {
  paused: boolean;
  handlers: {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onFocus?: () => void;
    onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  };
}

export function useNotifierCountdown({
  durationMs,
  running,
  pauseOnHover,
  revision,
  onExpire,
}: NotifierCountdownOptions): NotifierCountdown {
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const paused = (pauseOnHover && pointerInside) || focusInside;
  const remainingRef = useRef(durationMs);
  const startedAtRef = useRef(0);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  // A new lifetime, a refresh in place or a stop replaces the whole budget.
  // A pause only settles what the running timer used, against its own budget.
  useEffect(() => {
    remainingRef.current = durationMs;
  }, [durationMs, revision, running]);

  useEffect(() => {
    if (!running || durationMs <= 0 || paused) return;
    startedAtRef.current = Date.now();
    const timer = setTimeout(() => expireRef.current(), remainingRef.current);
    return () => {
      clearTimeout(timer);
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    };
  }, [running, durationMs, paused, revision]);

  const pointerEnter = useCallback(() => setPointerInside(true), []);
  const pointerLeave = useCallback(() => setPointerInside(false), []);
  const focusEnter = useCallback(() => setFocusInside(true), []);
  const focusLeave = useCallback((event: React.FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) setFocusInside(false);
  }, []);

  const focusHandlers = { onFocus: focusEnter, onBlur: focusLeave };

  return {
    paused,
    handlers: pauseOnHover
      ? { onMouseEnter: pointerEnter, onMouseLeave: pointerLeave, ...focusHandlers }
      : focusHandlers,
  };
}
