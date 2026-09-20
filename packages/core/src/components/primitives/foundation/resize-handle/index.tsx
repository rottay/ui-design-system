/**
 * @fileoverview ResizeHandle - Rottay Design System
 *
 * The canonical drag-to-resize edge. Every resizable owner in the system —
 * splitter gutters, widget edges — reaches for this primitive instead of
 * rebuilding separator semantics on a native control.
 *
 * It is the sanctioned raw-element tier (SemanticSurface/code-block precedent):
 * one implementation, no per-engine siblings, because a separator's semantics
 * and keyboard operation do not vary by engine. Geometry, cursor, hit
 * expansion and paint stay with the owning skin via `className` and the
 * `anatomy` data attributes. It does decide one thing for them: the
 * hover/press/focus triad, stamped as `data-state` on the node it renders,
 * because it is the only tier that holds the pointer and the tab stop.
 *
 * It lives under `primitives/foundation/` rather than beside Splitter in
 * `primitives/layout/`: peer component categories must not depend sideways on
 * each other, so a capability several of them share has to sit below them all.
 *
 * A resize edge is an adjustable separator, not a button and not a slider: it
 * carries `role="separator"` with `aria-valuemin`/`aria-valuemax`/
 * `aria-valuenow`, an explicit `aria-orientation`, and arrow/Home/End
 * operation. Pointer-only hit areas opt out with `operable={false}`, which is
 * only honest when a keyboard-operable handle covers the same dimension.
 *
 * @example Keyboard-operable width edge
 * ```tsx
 * <ResizeHandle
 *   orientation="vertical"
 *   label="Resize width: Pipeline"
 *   min={0}
 *   max={3}
 *   value={2}
 *   onAdjust={(intent) => applyIntent(intent)}
 *   onPointerDown={beginResize}
 * />
 * ```
 *
 * @module ResizeHandle
 * @category Layout
 * @package @rottay/design-system
 */
'use client';

import React, { forwardRef, useCallback, useMemo } from 'react';

import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { composeHandlers } from '@/foundation/behavior/runtime/compose-handlers';
import { useOptionalDirection } from '@/infrastructure/runtime/i18n';

import {
  RESIZE_HANDLE_DEFAULTS,
  type ResizeHandleArrowPolicy,
  type ResizeHandleIntent,
  type ResizeHandleOrientation,
  type ResizeHandleProps,
} from './contracts';

/**
 * Translate a key into an adjustment intent. Inline arrows mirror in RTL so
 * the keyboard agrees with the pointer, which already measures from the
 * inline-start edge.
 */
export function resolveResizeIntent(
  key: string,
  orientation: ResizeHandleOrientation,
  arrows: ResizeHandleArrowPolicy,
  direction: 'ltr' | 'rtl'
): ResizeHandleIntent | null {
  if (key === 'Home') return 'minimize';
  if (key === 'End') return 'maximize';

  const inlineIncrease = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const inlineDecrease = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

  if (arrows === 'position') {
    if (orientation === 'vertical') {
      if (key === inlineIncrease) return 'increase';
      if (key === inlineDecrease) return 'decrease';
      return null;
    }
    if (key === 'ArrowDown') return 'increase';
    if (key === 'ArrowUp') return 'decrease';
    return null;
  }

  if (key === inlineIncrease || key === 'ArrowUp') return 'increase';
  if (key === inlineDecrease || key === 'ArrowDown') return 'decrease';
  return null;
}

export const ResizeHandle = forwardRef<HTMLDivElement, ResizeHandleProps>(
  (props, ref) => {
    const {
      label,
      orientation,
      min,
      max,
      value,
      valueText,
      keyShortcuts,
      operable = RESIZE_HANDLE_DEFAULTS.operable,
      arrows = RESIZE_HANDLE_DEFAULTS.arrows,
      onAdjust,
      onPointerDown,
      className,
      anatomy,
      children,
      style,
      id,
    } = props;

    // The writing direction comes from the shared authority, not from a DOM
    // probe of this node's `dir` chain: the locale knows it on the server too,
    // and a probe re-derives from paint a fact the provider already holds.
    const direction = useOptionalDirection();

    // The node was only ever held to probe its `dir` chain; the forward is
    // all that is left of it.
    const setNode = useCallback(
      (node: HTMLDivElement | null) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!onAdjust) return;
        // Alt/Ctrl/Meta arrow chords are browser and OS commands (history
        // navigation, document scroll); only Shift stays with the separator.
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const intent = resolveResizeIntent(event.key, orientation, arrows, direction);
        if (!intent) return;
        event.preventDefault();
        onAdjust(intent, event);
      },
      [arrows, direction, onAdjust, orientation]
    );

    // F-37: the hover / press / focus triad every owner's skin paints through
    // `:is([data-state~='x'], :x)` is decided HERE, once. The owners hand down
    // `anatomy` and a class; this primitive is the one that holds the pointer
    // and the tab stop, so it is the only place that can answer when the edge
    // is hovered or pressed.
    //
    // The kernel is deliberately not gated on `operable`. That flag says
    // "pointer-only hit area", not "inert": a widget-board corner is
    // pointer-only and fully painted, while a locked splitter gutter is
    // refused by its own skin through `:not([data-resizable='false'])`. The
    // twin must see exactly what the pseudo-class arm sees, and the owner's
    // own vocabulary keeps its authority.
    const { state, handlers: kernel } = useInteractionState();

    // React's focus events are `focusin`/`focusout`, so focus landing on a
    // decoration inside the handle would otherwise light the handle's own
    // ring -- something `:focus-visible`, the arm this mirrors, never does.
    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return;
        kernel.onFocus(event);
      },
      [kernel]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return;
        kernel.onBlur(event);
      },
      [kernel]
    );

    // The owner's pointerdown begins the drag and calls `preventDefault()` to
    // stop text selection -- which is exactly the signal `composeHandlers`
    // reads as "stop the chain". The kernel therefore runs FIRST: the press is
    // decided before the drag starts, and the explicit `focus()` an owner does
    // next arrives with the pointer already known to be down, so the separator
    // takes no focus ring from a mouse drag.
    const handlePointerDown = useMemo(
      () =>
        composeHandlers<React.PointerEvent<HTMLDivElement>>(
          kernel.onPointerDown,
          onPointerDown
        ),
      [kernel, onPointerDown]
    );

    // Spread BEFORE `anatomy`, never after: the contract is that anatomy
    // attributes reach the DOM unchanged, so an owner that decides this edge's
    // state itself keeps the last word on `data-state`.
    const stateProps = {
      ...partAttributes('resize-handle', state),
      onPointerEnter: kernel.onPointerEnter,
      onPointerLeave: kernel.onPointerLeave,
      onPointerDown: handlePointerDown,
      onPointerUp: kernel.onPointerUp,
      // Pointer capture stops the boundary events, so a gesture the browser
      // takes over mid-drag would otherwise latch the press with no leave.
      onPointerCancel: kernel.onPointerUp,
      onFocus: handleFocus,
      onBlur: handleBlur,
    };

    // A pointer-only hit area carries no role and no tab stop: duplicating the
    // separator semantics behind `aria-hidden` would only add noise to the
    // accessibility tree.
    if (!operable) {
      return (
        <div
          ref={setNode}
          id={id}
          className={className}
          style={style}
          aria-hidden
          tabIndex={-1}
          {...stateProps}
          {...anatomy}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={setNode}
        id={id}
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-orientation={orientation}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
        aria-keyshortcuts={keyShortcuts}
        className={className}
        style={style}
        {...stateProps}
        onKeyDown={handleKeyDown}
        {...anatomy}
      >
        {children}
      </div>
    );
  }
);

ResizeHandle.displayName = 'ResizeHandle';

export { RESIZE_HANDLE_DEFAULTS } from './contracts';
export type {
  ResizeHandleAnatomy,
  ResizeHandleArrowPolicy,
  ResizeHandleIntent,
  ResizeHandleOrientation,
  ResizeHandleProps,
} from './contracts';

export default ResizeHandle;
