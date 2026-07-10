'use client';

/**
 * @fileoverview Presence - Rottay Design System
 *
 * Declarative wrapper around {@link usePresence}: renders `children` (via a
 * render-prop, so the caller controls exactly which native element receives
 * the ref/data-state) until `present` goes false AND that element's own
 * exit transition/animation has finished playing. Deliberately CSS +
 * DOM-events driven -- no animation library.
 *
 * @example
 * ```tsx
 * <Presence present={open}>
 *   {({ dataState, ref }) => (
 *     <div ref={ref} data-state={dataState} className="ds-overlay-panel">
 *       {children}
 *     </div>
 *   )}
 * </Presence>
 * ```
 */

import type { ReactElement } from 'react';
import { usePresence } from '../../hooks/use-presence';
import type { UsePresenceOptions, UsePresenceResult } from '../../hooks/use-presence';

export interface PresenceRenderState {
  dataState: UsePresenceResult['dataState'];
  ref: UsePresenceResult['ref'];
}

export interface PresenceProps extends Pick<UsePresenceOptions, 'onExitComplete' | 'reducedMotion'> {
  /** Whether the wrapped element should be present (mounted + open). */
  present: boolean;
  /** Render-prop: receives `dataState`/`ref` to attach to the single element that owns the exit motion. */
  children: (state: PresenceRenderState) => ReactElement | null;
}

/** Keeps `children`'s element mounted through its own exit motion before unmounting. See {@link usePresence}. */
export function Presence({ present, children, onExitComplete, reducedMotion }: PresenceProps): ReactElement | null {
  const { shouldRender, dataState, ref } = usePresence(present, { onExitComplete, reducedMotion });
  if (!shouldRender) return null;
  return children({ dataState, ref });
}

Presence.displayName = 'Presence';
