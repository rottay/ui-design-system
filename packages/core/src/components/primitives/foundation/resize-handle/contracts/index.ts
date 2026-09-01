/**
 * @fileoverview ResizeHandle contracts - Rottay Design System
 *
 * The adjustable-separator contract shared by every drag-to-resize edge in the
 * system. It carries semantics and keyboard operation only: geometry, cursor,
 * hit expansion and paint stay with the owning skin, addressed through
 * `className` and the `anatomy` data attributes.
 *
 * @module ResizeHandle/Contracts
 * @category Layout
 * @package @rottay/design-system
 */

import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from 'react';

/**
 * Orientation of the separator itself, as WAI-ARIA defines it: a `vertical`
 * separator is a vertical bar and therefore adjusts along the inline axis; a
 * `horizontal` separator is a horizontal bar and adjusts along the block axis.
 */
export type ResizeHandleOrientation = 'horizontal' | 'vertical';

/** The four adjustments an adjustable separator can request. */
export type ResizeHandleIntent = 'decrease' | 'increase' | 'minimize' | 'maximize';

/**
 * Which arrow keys the handle answers to, and what "increase" means.
 *
 * - `position` — the handle moves a boundary between two regions, so only the
 *   arrows along the separator's own adjustment axis apply and "increase"
 *   means "push the boundary forward" (right in LTR, down for a horizontal
 *   separator). This is the Splitter gutter contract.
 * - `size` — the handle grows or shrinks the region that owns it, so both
 *   axes are accepted and "more" always reads as forward-or-up
 *   (ArrowRight/ArrowUp). This is the widget-resize contract.
 */
export type ResizeHandleArrowPolicy = 'position' | 'size';

/**
 * Anatomy attributes stamped verbatim on the handle. The skin owns the
 * vocabulary (`data-part`, `data-edge`, `data-dragging`, …); the primitive
 * only guarantees they reach the DOM unchanged.
 */
export type ResizeHandleAnatomy = Readonly<
  Record<`data-${string}`, string | undefined>
>;

/** Props for the {@link ResizeHandle} primitive. */
export interface ResizeHandleProps {
  /** Accessible name. Required whenever the handle is operable. */
  label?: string;

  /** Orientation of the separator itself. */
  orientation: ResizeHandleOrientation;

  /** Lower bound reported as `aria-valuemin`. */
  min?: number;

  /** Upper bound reported as `aria-valuemax`. */
  max?: number;

  /** Current position reported as `aria-valuenow`. */
  value?: number;

  /** Human-readable rendering of `value`, reported as `aria-valuetext`. */
  valueText?: string;

  /** Keyboard hint reported as `aria-keyshortcuts`. */
  keyShortcuts?: string;

  /**
   * Whether this handle is exposed as a keyboard-operable separator. A
   * non-operable handle is a pointer-only hit area: it is removed from the
   * accessibility tree and never takes a tab stop, which is only honest when a
   * keyboard-operable handle exists for the same dimension.
   * @default true
   */
  operable?: boolean;

  /**
   * Arrow-key policy. See {@link ResizeHandleArrowPolicy}.
   * @default 'size'
   */
  arrows?: ResizeHandleArrowPolicy;

  /** Keyboard adjustment request. Not called when `operable` is false. */
  onAdjust?: (
    intent: ResizeHandleIntent,
    event: KeyboardEvent<HTMLDivElement>
  ) => void;

  /** Pointer drag start. The owner keeps the drag math and the pointer capture. */
  onPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;

  /** Skin class that owns geometry, cursor, hit expansion and paint. */
  className?: string;

  /** Anatomy data attributes stamped verbatim. */
  anatomy?: ResizeHandleAnatomy;

  /** Rail, indicator or any other skin-owned decoration. */
  children?: ReactNode;

  /** Runtime geometry only; chrome belongs in the skin. */
  style?: CSSProperties;

  /** DOM id. */
  id?: string;
}

/** Defaults applied by {@link ResizeHandle}. */
export const RESIZE_HANDLE_DEFAULTS = {
  operable: true,
  arrows: 'size',
} as const satisfies Pick<ResizeHandleProps, 'operable' | 'arrows'>;
