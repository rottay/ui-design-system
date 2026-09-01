import type React from 'react';

/**
 * Size axis. Resolves through the canonical Modern spinner skin's
 * `data-size` track; the substrate never fixes pixels in the TSX.
 */
export type LoadingIndicatorSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Contract for the engine-neutral LoadingIndicator substrate.
 *
 * @description LoadingIndicator is the ONE busy glyph every primitive family
 * composes (Spinner, Switch, Tree, TreeSelect, AutoComplete, Timeline) so no
 * family rebuilds a local spinner with private geometry or cadence. Geometry,
 * paint and motion stay owned by the canonical Modern spinner skin; callers
 * stamp semantics only.
 *
 * Accessibility contract: the glyph is decorative BY DEFAULT. It is announced
 * only when `statusLabel` is supplied, which promotes the inner element to
 * `role="status"`. A composing owner that already carries `aria-busy` must
 * leave `statusLabel` unset so the busy state is announced exactly once.
 */
export interface LoadingIndicatorProps {
  size?: LoadingIndicatorSize;
  /** Overrides the spinner ink channel for this instance. */
  color?: string;
  /** Visible supporting copy rendered beside the indicator. */
  label?: string;
  /**
   * Announces this indicator as a status. Omit when the composing owner
   * already carries aria-busy and the glyph is decorative.
   */
  statusLabel?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Part name stamped on the root, so a host family can address the slot. */
  'data-part'?: string;
}
