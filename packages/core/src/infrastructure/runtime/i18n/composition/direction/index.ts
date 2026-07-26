'use client';

/**
 * @fileoverview Hook for reading the active text direction.
 *
 * Replaces the ad-hoc DOM probe that 13 component files each re-implemented:
 *
 *   element.closest('[dir]')?.dir === 'rtl'
 *     || getComputedStyle(element).direction === 'rtl'
 *
 * That probe has three defects. It is unavailable during SSR (no `document`,
 * no layout), so server-rendered markup always assumes LTR. It forces a style
 * recalculation on the client at the exact moment a popover or drag handler is
 * deciding its geometry. And it re-derives, from paint, a fact the i18n
 * provider already knows — so the two can disagree, most visibly in the window
 * between first paint and the effect that writes `dir` onto the document.
 *
 * Direction here is derived from the active locale's `LocaleConfig`, so it is
 * identical on server and client.
 */

import type { TextDirection } from '@/foundation/i18n/kernel/contracts';
import { useI18nContext } from '@/infrastructure/runtime/i18n/runtime/context';

/**
 * Returns the active text direction.
 *
 * @example
 * const direction = useDirection();
 * const inlineDelta = direction === 'rtl' ? -deltaX : deltaX;
 */
export function useDirection(): TextDirection {
  return useI18nContext().direction;
}

/**
 * Non-throwing direction hook for primitives that keep a standalone rendering
 * contract. Without an `I18nProvider` it returns `'ltr'`, matching the
 * documented standalone behavior of the primitives that use
 * `useOptionalTranslation`, so a component rendered outside a provider does not
 * crash and does not silently invert its geometry.
 */
export function useOptionalDirection(): TextDirection {
  // The hook call stays unconditional. `useI18nContext` only throws when its
  // context is absent, so the catch path is a provider-presence fallback, not
  // conditional hook execution.
  try {
    return useDirection();
  } catch {
    return 'ltr';
  }
}
