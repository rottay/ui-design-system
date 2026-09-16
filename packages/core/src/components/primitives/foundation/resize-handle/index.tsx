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
 * `anatomy` data attributes.
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

import React, { forwardRef, useCallback } from 'react';

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
          onPointerDown={onPointerDown}
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
        onPointerDown={onPointerDown}
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
