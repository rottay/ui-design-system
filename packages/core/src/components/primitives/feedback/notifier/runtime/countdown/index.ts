'use client';

/**
 * @fileoverview The notifier lifetime: a countdown that freezes its remaining
 * budget while the pointer or keyboard focus is inside the surface (WCAG 2.2.1)
 * and resumes from where it stopped, never from the start.
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
  pauseOnHover: boolean;
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
  onExpire,
}: NotifierCountdownOptions): NotifierCountdown {
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(durationMs);
  const startedAtRef = useRef(0);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  const previousDurationRef = useRef(durationMs);
  if (previousDurationRef.current !== durationMs) {
    previousDurationRef.current = durationMs;
    remainingRef.current = durationMs;
  }

  useEffect(() => {
    if (!running || durationMs <= 0 || paused) return;
    startedAtRef.current = Date.now();
    const timer = setTimeout(() => expireRef.current(), remainingRef.current);
    return () => {
      clearTimeout(timer);
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    };
  }, [running, durationMs, paused]);

  useEffect(() => {
    if (running) return;
    remainingRef.current = durationMs;
  }, [running, durationMs]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);
  const resumeWhenFocusLeaves = useCallback((event: React.FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) setPaused(false);
  }, []);

  return {
    paused,
    handlers: pauseOnHover
      ? { onMouseEnter: pause, onMouseLeave: resume, onFocus: pause, onBlur: resumeWhenFocusLeaves }
      : {},
  };
}
