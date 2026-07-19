'use client';

/**
 * @fileoverview Spotlight cutout geometry for the Tour overlay.
 *
 * This is the one Tour measurement the shared overlay positioning runtime
 * (`ui/primitives/runtime/overlay/positioning`) cannot supply: that contract
 * places an overlay BESIDE an anchor and never exposes the anchor's own rect,
 * while the spotlight must COVER the target -- its rect plus breathing
 * padding, painted by the engine skins as a 9999px box-shadow scrim with a
 * transparent center.
 *
 * Listener discipline mirrors the runtime's measured branch (window `resize`
 * plus capture-phase `scroll`) so the cutout and the step surface re-measure
 * on the same events and cannot drift apart while the page scrolls.
 */

import { useLayoutEffect, useState } from 'react';

export interface TourSpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Measures the padded cutout rect for a tour target. Returns null while no
 * target element is resolved (the step surface then centers in the viewport
 * and the engines render no spotlight).
 *
 * @param target - The live target element of the active step, or null.
 * @param padding - Breathing room kept around the target on every side.
 */
export function useTourSpotlightRect(
  target: HTMLElement | null,
  padding: number,
): TourSpotlightRect | null {
  const [rect, setRect] = useState<TourSpotlightRect | null>(null);

  useLayoutEffect(() => {
    if (!target || typeof window === 'undefined') {
      setRect(null);
      return undefined;
    }

    const update = (): void => {
      const measured = target.getBoundingClientRect();
      const next: TourSpotlightRect = {
        top: measured.top - padding,
        left: measured.left - padding,
        width: measured.width + padding * 2,
        height: measured.height + padding * 2,
      };
      setRect((prev) =>
        prev &&
        prev.top === next.top &&
        prev.left === next.left &&
        prev.width === next.width &&
        prev.height === next.height
          ? prev
          : next,
      );
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [target, padding]);

  return rect;
}
