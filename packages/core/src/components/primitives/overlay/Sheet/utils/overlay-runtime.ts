'use client';

import { useCallback, useEffect, useRef } from 'react';

const overlayStack: symbol[] = [];
let scrollLockCount = 0;
let originalBodyOverflow: string | null = null;

function acquireBodyScrollLock(): void {
  if (typeof document === 'undefined') return;
  if (scrollLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
  }
  scrollLockCount += 1;
  document.body.style.overflow = 'hidden';
}

function releaseBodyScrollLock(): void {
  if (typeof document === 'undefined' || scrollLockCount === 0) return;
  scrollLockCount -= 1;
  if (scrollLockCount === 0) {
    document.body.style.overflow = originalBodyOverflow ?? '';
    originalBodyOverflow = null;
  }
}

/** Coordinates stack order and a shared, non-LIFO-safe body scroll lock. */
export function useSheetOverlayRuntime(open: boolean): { isTopmost: () => boolean } {
  const tokenRef = useRef(Symbol('rottay-sheet-overlay'));

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    const token = tokenRef.current;
    const existingIndex = overlayStack.indexOf(token);
    if (existingIndex >= 0) overlayStack.splice(existingIndex, 1);
    overlayStack.push(token);
    acquireBodyScrollLock();

    return () => {
      const index = overlayStack.indexOf(token);
      if (index >= 0) overlayStack.splice(index, 1);
      releaseBodyScrollLock();
    };
  }, [open]);

  const isTopmost = useCallback(
    () => overlayStack[overlayStack.length - 1] === tokenRef.current,
    [],
  );

  return { isTopmost };
}
