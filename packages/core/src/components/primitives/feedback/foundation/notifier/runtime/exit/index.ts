'use client';

/**
 * @fileoverview The notifier exit: the surface plays its governed exit and
 * reports once it finished. The exit animation's own `animationend` is the
 * primary signal; the fallback timer reads the resolved duration from the
 * computed style, so a retuned motion channel or reduced motion stays in sync.
 *
 * @module Notifier/Runtime/Exit
 * @category Feedback
 * @package @rottay/design-system
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { governedExitMs } from '@/graphics/motion/react/runtime/presence/duration';

export const NOTIFIER_EXIT_ANIMATION = 'ds-notifier-exit';

export interface NotifierExit<E extends HTMLElement> {
  leaving: boolean;
  ref: React.RefObject<E | null>;
  begin: () => void;
  cancel: () => void;
  onAnimationEnd: (event: React.AnimationEvent<E>) => void;
}

export function useNotifierExit<E extends HTMLElement>(onExited: () => void): NotifierExit<E> {
  const ref = useRef<E | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [leaving, setLeaving] = useState(false);
  const exitedRef = useRef(onExited);
  exitedRef.current = onExited;

  const clear = useCallback(() => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const finish = useCallback(() => {
    if (timerRef.current === null) return;
    clear();
    exitedRef.current();
  }, [clear]);

  const begin = useCallback(() => {
    if (timerRef.current !== null) return;
    setLeaving(true);
    const element = ref.current;
    timerRef.current = setTimeout(finish, element ? governedExitMs(element) : 0);
  }, [finish]);

  const cancel = useCallback(() => {
    clear();
    setLeaving(false);
  }, [clear]);

  const onAnimationEnd = useCallback(
    (event: React.AnimationEvent<E>) => {
      if (event.target === ref.current && event.animationName.startsWith(NOTIFIER_EXIT_ANIMATION)) finish();
    },
    [finish],
  );

  useEffect(() => clear, [clear]);

  return { leaving, ref, begin, cancel, onAnimationEnd };
}
