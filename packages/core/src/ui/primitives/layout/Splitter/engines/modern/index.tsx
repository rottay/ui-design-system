'use client';

/**
 * @fileoverview Splitter Modern Engine - Rottay Design System
 * @description Modern (token-driven) implementation of the Splitter compound component.
 * Uses Tailwind CSS utilities with custom mouse event handling for drag-to-resize.
 *
 * @remarks
 * The Modern engine provides:
 * - Skin-owned structure and interactive paint (`splitter.css`); the engine
 *   stamps anatomy (class pair, data parts) and measured sizes only
 * - Pointer-event drag handling (mouse AND touch) with RTL-mirrored math
 * - Keyboard-operable gutters (`role="separator"`, arrow/Home/End resize)
 * - Percentage-based panel sizing
 * - Size constraints via min/max props
 *
 * Implementation details:
 * - Panels use `flex: 0 0 {size}%` for sizing
 * - Gutter cursor/sizing/hit expansion live in the skin per orientation
 * - Uses React refs for container measurements
 * - Clones children to inject calculated sizes
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Splitter } from '@rottay/design-system';
 *
 * // Tailwind-styled splitter
 * <Splitter engine="modern" layout="vertical">
 *   <Splitter.Panel engine="modern" defaultSize={40}>
 *     Top Panel
 *   </Splitter.Panel>
 *   <Splitter.Panel engine="modern">
 *     Bottom Panel
 *   </Splitter.Panel>
 * </Splitter>
 * ```
 *
 * @see {@link Splitter} - The main engine-aware component
 * @module Splitter/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */
import React, { useState, useRef, useCallback, Children, cloneElement, isValidElement } from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ResizeHandle, type ResizeHandleIntent } from '../../../../foundation/ResizeHandle';
import type { SplitterProps, SplitterPanelProps } from '../../contracts';
import { SPLITTER_DEFAULTS } from '../../contracts';

/**
 * Modern engine implementation of the Splitter.Panel sub-component.
 * Uses percentage-based `flex: 0 0 {size}%` to size each panel, with
 * min/max constraints clamped in the 0-100 percentage range.
 * The `size` prop is injected at runtime by the parent Splitter via cloneElement.
 * The overflow contract is skin-owned (`splitter.css`).
 *
 * @param props - Panel configuration plus injected `size` percentage
 * @returns A div acting as a resizable panel
 */
export const Panel = React.forwardRef<HTMLDivElement, SplitterPanelProps & { size?: number }>(
  (props, ref) => {
    const { size, min, max, children, className = '', style } = props;

    // Normalize min/max to numeric percentages; default to the full 0-100 range
    // so panels without constraints behave naturally.
    const minSize = typeof min === 'number' ? min : 0;
    const maxSize = typeof max === 'number' ? max : 100;
    const clampedSize = Math.min(Math.max(size ?? 50, minSize), maxSize);

    return (
      <div
        ref={ref}
        className={className || undefined}
        data-part="panel"
        style={{
          flex: `0 0 ${clampedSize}%`,
          // Prevent content from forcing the panel wider than its flex-basis
          minWidth: 0,
          minHeight: 0,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);
Panel.displayName = 'Splitter.Panel.Modern';

/**
 * Modern engine implementation of the Splitter container.
 * Manages panel sizes via React state and handles drag-to-resize through
 * document-level pointer events (pointer, not mouse, so touch drag works).
 * Gutters are real `role="separator"` keyboard controls: Tab reaches them,
 * arrow keys resize (mirrored in RTL for the horizontal orientation), and
 * `aria-valuenow` reports the leading panel's percentage. Interactive paint
 * (hover/dragging/focus ring, hit expansion, cursor) is skin-owned
 * (`splitter.css`); the engine stamps anatomy and measured sizes only.
 *
 * @param props - Splitter configuration (layout direction, resize callbacks)
 * @returns A flex container with interleaved gutter drag handles
 */
export const Splitter = React.forwardRef<HTMLDivElement, SplitterProps>(
  (props, ref) => {
    // Optional so standalone renders (no I18nProvider mounted, e.g. direct
    // engine renders in tests/Storybook isolation) fall back to the
    // documented English accessibility string instead of throwing.
    const i18n = useOptionalTranslation('components');

    const {
      layout = SPLITTER_DEFAULTS.layout,
      onResize,
      onResizeStart,
      onResizeEnd,
      children,
      className = '',
      style,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize each panel to an equal share of the container (100 / N percent)
    const [sizes, setSizes] = useState<number[]>(() => {
      const childCount = Children.count(children);
      return Array(childCount).fill(100 / childCount);
    });
    const isDragging = useRef(false);
    // The index of the gutter being dragged (-1 = idle), purely for the
    // data-dragging anatomy attribute -- the drag math binds the gutter
    // index at pointerdown and reads fresh sizes inside the state updater.
    const [draggingIndex, setDraggingIndex] = useState<number>(-1);

    const isVertical = layout === 'vertical';

    /** The writing direction at the container. The `dir` attribute chain is
     *  read first (the common RTL channel -- and the only one jsdom
     *  resolves); a CSS-only `direction: rtl` with no dir attribute falls
     *  back to the computed style. */
    const readDirection = (): 'ltr' | 'rtl' => {
      const node = containerRef.current;
      if (!node) return 'ltr';
      const dirAttr = node.closest('[dir]')?.getAttribute('dir');
      if (dirAttr === 'rtl' || dirAttr === 'ltr') return dirAttr;
      if (typeof getComputedStyle === 'function') {
        return getComputedStyle(node).direction === 'rtl' ? 'rtl' : 'ltr';
      }
      return 'ltr';
    };

    /** Redistribute `deltaPercent` between the two panels adjacent to gutter
     *  `index`. The pair's total is conserved: the leading panel clamps into
     *  [0, pairSum], so dragging past a container edge or a full Home/End
     *  step can never inflate or shrink the pair. */
    const applyDelta = useCallback((index: number, deltaPercent: number) => {
      setSizes((prevSizes: number[]) => {
        const newSizes = [...prevSizes];
        if (index < newSizes.length - 1) {
          const pairSum = prevSizes[index] + prevSizes[index + 1];
          newSizes[index] = Math.min(pairSum, Math.max(0, prevSizes[index] + deltaPercent));
          newSizes[index + 1] = pairSum - newSizes[index];
        }
        onResize?.(newSizes);
        return newSizes;
      });
    }, [onResize]);

    /** Move gutter `index` so the cumulative size of the panels before (and
     *  including) it equals `percentage`. Reads the FRESH sizes inside the
     *  updater -- a drag is a stream of events and the render-closure sizes
     *  go stale after the first move. */
    const applyPointerPercentage = useCallback((index: number, percentage: number) => {
      setSizes((prevSizes: number[]) => {
        const newSizes = [...prevSizes];
        const beforeSum = prevSizes.slice(0, index + 1).reduce((a, b) => a + b, 0);
        const diff = percentage - beforeSum;
        if (index < newSizes.length - 1) {
          const pairSum = prevSizes[index] + prevSizes[index + 1];
          newSizes[index] = Math.min(pairSum, Math.max(0, prevSizes[index] + diff));
          newSizes[index + 1] = pairSum - newSizes[index];
        }
        onResize?.(newSizes);
        return newSizes;
      });
    }, [onResize]);

    // Returns a pointerdown handler bound to a specific gutter index.
    // On pointerdown, document-level listeners are attached to track the drag
    // and cleaned up on pointerup to avoid stale handlers.
    const handlePointerDown = useCallback((index: number) => (e: React.PointerEvent) => {
      e.preventDefault();
      // preventDefault stops text selection during the drag but also swallows
      // the native focus move, so focus the separator explicitly -- a
      // pointer-dragged gutter must keep its focus ring contract.
      (e.currentTarget as HTMLElement).focus();
      isDragging.current = true;
      setDraggingIndex(index);
      onResizeStart?.();

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        // Convert the pointer position to a percentage of the container's
        // total dimension. Horizontal drag math is mirrored in RTL: the flex
        // row lays panels out from the inline-end, so the offset must be
        // measured from the container's right edge.
        const rect = containerRef.current.getBoundingClientRect();
        const totalSize = isVertical ? rect.height : rect.width;
        const offset = isVertical
          ? moveEvent.clientY - rect.top
          : readDirection() === 'rtl'
            ? rect.right - moveEvent.clientX
            : moveEvent.clientX - rect.left;
        const percentage = (offset / totalSize) * 100;
        applyPointerPercentage(index, percentage);
      };

      const handlePointerUp = () => {
        if (isDragging.current) {
          isDragging.current = false;
          setDraggingIndex(-1);
          onResizeEnd?.(sizes);
        }
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    }, [isVertical, onResizeStart, onResizeEnd, sizes, applyPointerPercentage]);

    // Keyboard resize (WAI separator pattern): the ResizeHandle primitive owns
    // key-to-intent translation, including the RTL mirroring of the horizontal
    // arrows. The gutter is a boundary rather than a size, so it uses the
    // `position` arrow policy: arrows step the two adjacent panels along the
    // separator's own axis and Home/End collapse fully to either side.
    const handleAdjust = useCallback((index: number) => (intent: ResizeHandleIntent) => {
      const STEP = 2;
      if (intent === 'increase') applyDelta(index, STEP);
      else if (intent === 'decrease') applyDelta(index, -STEP);
      else if (intent === 'minimize') applyDelta(index, -100);
      else applyDelta(index, 100);
    }, [applyDelta]);

    const childArray = Children.toArray(children);

    return (
      <div
        // Merge the internal containerRef with the forwarded ref so both
        // the resize logic and the consumer can access the DOM node.
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`rottay-splitter rottay-splitter--modern ${className}`}
        style={style}
        data-part="root"
        data-orientation={isVertical ? 'vertical' : 'horizontal'}
      >
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {/* Inject the calculated size percentage into each Panel child */}
            {isValidElement(child)
              ? cloneElement(child as React.ReactElement<SplitterPanelProps & { size?: number }>, { size: arrayValueAt(sizes, index) })
              : child}
            {/* Render a gutter drag handle between each pair of panels */}
            {index < childArray.length - 1 && (
              <ResizeHandle
                orientation={isVertical ? 'horizontal' : 'vertical'}
                arrows="position"
                label={i18n?.t('splitter.resize_gutter') ?? 'Resize panels'}
                min={0}
                max={100}
                value={Math.round(arrayValueAt(sizes, index) ?? 0)}
                onPointerDown={handlePointerDown(index)}
                onAdjust={handleAdjust(index)}
                anatomy={{
                  'data-part': 'gutter',
                  'data-orientation': isVertical ? 'vertical' : 'horizontal',
                  'data-dragging': draggingIndex === index ? 'true' : 'false',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
);
Splitter.displayName = 'Splitter.Modern';

export default Splitter;
