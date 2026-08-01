'use client';

/**
 * @fileoverview Splitter Modern Engine - Rottay Design System
 * @description Modern (token-driven) implementation of the Splitter compound component.
 * Skin-owned structure and interactive paint; pointer-event drag-to-resize
 * handled by the engine, keyboard operation by the canonical ResizeHandle
 * primitive (`primitives/foundation/ResizeHandle` -- never a rebuilt native
 * control, Lote 6).
 *
 * @remarks
 * The Modern engine provides:
 * - Skin-owned structure and interactive paint (`splitter.css`); the engine
 *   stamps anatomy (class pair, data parts) and measured sizes only
 * - Pointer-event drag handling (mouse AND touch) with RTL-mirrored math,
 *   pointer capture on the gutter and `pointercancel` cleanup
 * - Keyboard-operable gutters (`role="separator"`, arrow/Home/End resize)
 * - Percentage-based panel sizing initialized from each panel's
 *   `defaultSize` contract prop (equal shares when none specify one)
 * - Size constraints via min/max props, honored by BOTH the pointer drag
 *   and the keyboard steppers (the pair sum stays conserved)
 * - `resizable={false}` panels: the gutter between two panels is operable
 *   only while both sides allow resizing; a locked boundary renders as an
 *   inert separator (no tab stop, no drag, static skin state)
 * - A panel sized to 0 leaves the tab order and the accessibility tree
 *   (`aria-hidden` + `inert`), like every collapsed disclosure region
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

/** Per-panel constraint metadata the drag/keyboard updaters consult. */
interface PanelMeta {
  min: SplitterPanelProps['min'];
  max: SplitterPanelProps['max'];
  resizable: boolean;
}

/** Read the constraint metadata of a panel child (non-element children
 *  carry no constraints and are always resizable). */
function readPanelMeta(child: React.ReactNode): PanelMeta {
  if (!isValidElement(child)) return { min: undefined, max: undefined, resizable: true };
  const props = (child as React.ReactElement<SplitterPanelProps>).props;
  return { min: props.min, max: props.max, resizable: props.resizable !== false };
}

/** Resolve a panel's `defaultSize` prop to a percentage. Numbers are
 *  percentages per the contract; '%' strings parse as percentages; any
 *  other string form (e.g. px) cannot be resolved before the container is
 *  measured and falls back to an equal share (documented debt). */
function resolveDefaultSize(value: SplitterPanelProps['defaultSize']): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : undefined;
  }
  if (typeof value === 'string' && value.trim().endsWith('%')) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : undefined;
  }
  return undefined;
}

/** Clamp `value` into a panel's [min, max] contract range. The modern
 *  engine reads numeric min/max as percentages — the SAME unit the Panel
 *  flex-basis clamp below already applies, so constraints propagate
 *  consistently through render, drag and keyboard (the contract docblock
 *  says pixels; that unit mismatch is recorded debt, not silently
 *  reinterpreted here). */
function clampToPanelRange(
  value: number,
  min: SplitterPanelProps['min'],
  max: SplitterPanelProps['max']
): number {
  const floor = typeof min === 'number' && Number.isFinite(min) ? min : 0;
  const ceil = typeof max === 'number' && Number.isFinite(max) ? max : 100;
  return Math.min(ceil, Math.max(floor, value));
}

/** Redistribute `deltaPercent` between the two panels adjacent to gutter
 *  `index`, honoring each side's [min, max] contract range. The pair's
 *  total is conserved: the leading panel clamps into its range AND
 *  [0, pairSum], the trailing panel derives from the remainder and clamps
 *  into its own range, and the lead re-derives from that — so dragging
 *  past a container edge, a full Home/End step or a constraint boundary
 *  can never inflate or shrink the pair. When the two ranges are mutually
 *  impossible (minLead + minTrail > pairSum), the trailing panel's floor
 *  wins; impossible specs resolve deterministically instead of fighting. */
function redistributePair(
  prevSizes: number[],
  index: number,
  deltaPercent: number,
  meta: ReadonlyArray<PanelMeta>
): number[] {
  const newSizes = [...prevSizes];
  if (index >= newSizes.length - 1) return newSizes;
  const pairSum = prevSizes[index] + prevSizes[index + 1];
  let lead = clampToPanelRange(prevSizes[index] + deltaPercent, meta[index]?.min, meta[index]?.max);
  lead = Math.min(pairSum, Math.max(0, lead));
  let trail = clampToPanelRange(pairSum - lead, meta[index + 1]?.min, meta[index + 1]?.max);
  trail = Math.min(pairSum, Math.max(0, trail));
  newSizes[index] = pairSum - trail;
  newSizes[index + 1] = trail;
  return newSizes;
}

/**
 * Modern engine implementation of the Splitter.Panel sub-component.
 * Uses percentage-based `flex: 0 0 {size}%` to size each panel, with
 * min/max constraints clamped in the 0-100 percentage range.
 * The `size` prop is injected at runtime by the parent Splitter via cloneElement.
 * The overflow contract is skin-owned (`splitter.css`).
 * A panel sized to exactly 0 (Home/End keyboard collapse or an edge drag)
 * is invisible: it also leaves the tab order and the accessibility tree
 * (`aria-hidden` + `inert`), so focus can never land on hidden content.
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
        aria-hidden={clampedSize === 0 ? true : undefined}
        inert={clampedSize === 0 ? true : undefined}
        style={{
          flex: `0 0 ${clampedSize}%`,
          // Prevent content from forcing the panel wider than its flex-basis
          minInlineSize: 0,
          minBlockSize: 0,
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

    const childArray = Children.toArray(children);

    // Initialize each panel from its `defaultSize` contract prop; panels
    // without one share the remainder equally, and when NO panel specifies
    // one (or the spec is impossible) the historical equal-share layout
    // holds.
    const [sizes, setSizes] = useState<number[]>(() => {
      const childCount = childArray.length;
      if (childCount === 0) return [];
      const defaults = childArray.map((child) =>
        isValidElement(child)
          ? resolveDefaultSize((child as React.ReactElement<SplitterPanelProps>).props.defaultSize)
          : undefined
      );
      const specifiedSum = defaults.reduce<number>((sum, value) => sum + (value ?? 0), 0);
      const unspecifiedCount = defaults.filter((value) => value === undefined).length;
      if (unspecifiedCount === childCount || specifiedSum <= 0) {
        return Array(childCount).fill(100 / childCount);
      }
      if (unspecifiedCount === 0) {
        // Every panel specified: normalize the spec proportionally to 100.
        const factor = 100 / specifiedSum;
        return defaults.map((value) => (value ?? 0) * factor);
      }
      if (specifiedSum >= 100) {
        // Impossible spec (no room left for the unspecified panels):
        // fall back to equal shares rather than starving one side.
        return Array(childCount).fill(100 / childCount);
      }
      const remainderEach = (100 - specifiedSum) / unspecifiedCount;
      return defaults.map((value) => value ?? remainderEach);
    });
    // The drag stream updates sizes many times per gesture; the pointerup
    // closure was captured at pointerdown, so `onResizeEnd` must read the
    // freshest sizes, never the render-closure ones.
    const sizesRef = useRef(sizes);
    sizesRef.current = sizes;
    const isDragging = useRef(false);
    // The index of the gutter being dragged (-1 = idle), purely for the
    // data-dragging anatomy attribute -- the drag math binds the gutter
    // index at pointerdown and reads fresh sizes inside the state updater.
    const [draggingIndex, setDraggingIndex] = useState<number>(-1);

    // Fresh per-panel constraint metadata for the drag/keyboard updaters:
    // a gesture outlives the render it started in, so constraints are read
    // through a ref (same stale-closure class as sizesRef).
    const panelsMetaRef = useRef<PanelMeta[]>([]);
    panelsMetaRef.current = childArray.map(readPanelMeta);

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
     *  `index`, honoring each side's [min, max] contract range. Reads the
     *  FRESH sizes inside the updater -- the render-closure ones go stale
     *  after the first move of a drag stream. */
    const applyDelta = useCallback((index: number, deltaPercent: number) => {
      setSizes((prevSizes: number[]) => {
        const newSizes = redistributePair(prevSizes, index, deltaPercent, panelsMetaRef.current);
        onResize?.(newSizes);
        return newSizes;
      });
    }, [onResize]);

    /** Move gutter `index` so the cumulative size of the panels before (and
     *  including) it equals `percentage`, honoring each side's [min, max]
     *  contract range. Reads the FRESH sizes inside the updater -- a drag is
     *  a stream of events and the render-closure sizes go stale after the
     *  first move. */
    const applyPointerPercentage = useCallback((index: number, percentage: number) => {
      setSizes((prevSizes: number[]) => {
        const beforeSum = prevSizes.slice(0, index + 1).reduce((a, b) => a + b, 0);
        const newSizes = redistributePair(prevSizes, index, percentage - beforeSum, panelsMetaRef.current);
        onResize?.(newSizes);
        return newSizes;
      });
    }, [onResize]);

    // Returns a pointerdown handler bound to a specific gutter index.
    // On pointerdown, document-level listeners are attached to track the drag
    // and cleaned up on pointerup/pointercancel to avoid stale handlers.
    const handlePointerDown = useCallback((index: number) => (e: React.PointerEvent) => {
      e.preventDefault();
      // preventDefault stops text selection during the drag but also swallows
      // the native focus move, so focus the separator explicitly -- a
      // pointer-dragged gutter must keep its focus ring contract.
      const target = e.currentTarget as HTMLElement;
      target.focus();
      // Pointer capture keeps the drag stream (and the resize cursor) on the
      // gutter when the pointer leaves its 8px rail or the window mid-drag.
      // Guarded best-effort: jsdom neither implements capture nor needs it.
      if (typeof target.setPointerCapture === 'function' && typeof e.pointerId === 'number') {
        try {
          target.setPointerCapture(e.pointerId);
        } catch {
          /* capture is optional; the document-level listeners below still track the drag */
        }
      }
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

      const endDrag = () => {
        if (isDragging.current) {
          isDragging.current = false;
          setDraggingIndex(-1);
          onResizeEnd?.(sizesRef.current);
        }
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', endDrag);
        document.removeEventListener('pointercancel', endDrag);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', endDrag);
      // A cancelled touch drag (browser gesture takeover) must still release
      // the drag state and report the final sizes, not leak `data-dragging`.
      document.addEventListener('pointercancel', endDrag);
    }, [isVertical, onResizeStart, onResizeEnd, applyPointerPercentage]);

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

    // A gutter is operable only while BOTH adjacent panels allow resizing;
    // a `resizable={false}` panel locks its boundary into an inert
    // separator (no tab stop, no drag handlers, static skin state).
    const gutterOperable = childArray.map(
      (_, index) =>
        panelsMetaRef.current[index]?.resizable !== false &&
        panelsMetaRef.current[index + 1]?.resizable !== false
    );

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
                operable={gutterOperable[index]}
                label={i18n?.t('splitter.resize_gutter') ?? 'Resize panels'}
                min={0}
                max={100}
                value={Math.round(arrayValueAt(sizes, index) ?? 0)}
                valueText={`${Math.round(arrayValueAt(sizes, index) ?? 0)}%`}
                keyShortcuts={
                  isVertical
                    ? 'ArrowUp ArrowDown Home End'
                    : 'ArrowLeft ArrowRight Home End'
                }
                onPointerDown={gutterOperable[index] ? handlePointerDown(index) : undefined}
                onAdjust={gutterOperable[index] ? handleAdjust(index) : undefined}
                anatomy={{
                  'data-part': 'gutter',
                  'data-orientation': isVertical ? 'vertical' : 'horizontal',
                  'data-dragging': draggingIndex === index ? 'true' : 'false',
                  'data-resizable': gutterOperable[index] ? 'true' : 'false',
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
