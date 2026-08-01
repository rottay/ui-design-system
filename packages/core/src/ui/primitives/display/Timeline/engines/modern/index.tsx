/**
 * @fileoverview Modern engine for the Timeline component.
 * Renders a vertical timeline with automatic alternate positioning and
 * color-coded dots. All paint AND geometry (the item grid, the connectors,
 * dot placement) live in the modern skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/timeline.css`), keyed on
 * the `data-part` / `data-side` / `data-tone` / `data-edge` hooks stamped here.
 * The pending node's loading indicator composes the canonical Spinner
 * primitive (iconography law: loading states never grow a private CSS
 * spinner); the skin only lays the composed part out. The DaisyUI `timeline`
 * / `timeline-start` / `timeline-middle` / `timeline-end` classes are gone --
 * the skin is the single paint owner, and the grid is direction-aware, so the
 * start/end sides flip with RTL.
 *
 * @example
 * ```tsx
 * <Timeline engine="modern" mode="alternate">
 *   <Timeline.Item color="green">Task completed</Timeline.Item>
 * </Timeline>
 * ```
 *
 * @module Timeline/engines/modern
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import { LoadingIndicator } from '../../../../foundation/loading-indicator';
import type { TimelineProps, TimelineItemProps } from '../../contracts';
import { TIMELINE_DEFAULTS } from '../../contracts';

/**
 * Scope class for the root. Per-item dot fill is selected from the item's
 * `data-tone` by `foundation/tokens/css/runtime/engines/modern/skin/timeline.css`, which resolves an
 * unrecognised tone to the primary fill. Both the class and `data-tone`
 * must reach the DOM for the color to paint.
 */
const SCOPE_CLASSES = 'rottay-timeline rottay-timeline--modern';

/**
 * ModernTimeline - skin-painted Timeline (modern engine).
 *
 * Features:
 * - Item grid and connectors owned by the modern skin (no DaisyUI classes)
 * - Direction-aware start/end placement (flips with RTL)
 * - Responsive and customizable
 *
 * @example
 * ```tsx
 * <Timeline engine="modern" mode="alternate">
 *   <Timeline.Item color="green">Task completed</Timeline.Item>
 *   <Timeline.Item color="blue">In progress</Timeline.Item>
 * </Timeline>
 * ```
 */
function ModernTimeline(props: TimelineProps): React.ReactElement {
  const {
    mode = TIMELINE_DEFAULTS.mode,
    pending,
    pendingDot,
    reverse = TIMELINE_DEFAULTS.reverse,
    items,
    children,
    className = '',
    style,
  } = props;

  // Normalise data source: items array prop takes priority over JSX children.
  // React.Children.toArray strips nulls and assigns stable keys.
  const timelineItems = items || React.Children.toArray(children);
  const orderedItems = reverse ? [...timelineItems].reverse() : timelineItems;

  /**
   * Resolves the side an item's content lands on for a given index.
   * In 'alternate' mode, even items go left and odd items go right.
   */
  const getSide = (index: number): 'start' | 'end' => {
    if (mode === 'left') return 'start';
    if (mode === 'right') return 'end';
    return index % 2 === 0 ? 'start' : 'end';
  };

  return (
    /* A timeline is a chronological sequence: the list is ORDERED (ol), not
       ul. The skin resets list styling, so the change is purely semantic. */
    <ol
      className={`${SCOPE_CLASSES}${className ? ` ${className}` : ''}`}
      data-part="root"
      data-mode={mode}
      style={style}
    >
      {orderedItems.map((item, index) => {
        // Items can arrive as React elements (JSX children) or plain objects
        // (items prop). Extract props uniformly for consistent rendering.
        const isElement = React.isValidElement(item);
        const itemProps: TimelineItemProps = isElement
          ? (item.props as TimelineItemProps)
          : (item as TimelineItemProps);

        // Per-item position override takes precedence over the mode-based default
        const side = itemProps.position
          ? itemProps.position === 'left' ? 'start' : 'end'
          : getSide(index);

        return (
          <li key={index} data-part="item" data-side={side} data-tone={itemProps.color || 'primary'}>
            {/* Connectors are pure visual rails between nodes: hidden from AT
                so the sequence reads as exactly its items (an hr would
                otherwise announce as a separator between every row). */}
            {index > 0 && <hr aria-hidden="true" data-part="connector" data-edge="leading" />}
            <div data-part="content" data-side={side}>
              {itemProps.label && (
                <div data-part="label">
                  {itemProps.label}
                </div>
              )}
              <div className={itemProps.className} data-part="body" style={itemProps.style}>
                {itemProps.children}
              </div>
            </div>
            <div data-part="dot">
              {itemProps.dot || (
                <div data-part="dot-marker" />
              )}
            </div>
            {index < orderedItems.length - 1 && <hr aria-hidden="true" data-part="connector" data-edge="trailing" />}
          </li>
        );
      })}

      {/* Pending item: the loading indicator composes the canonical Spinner
          primitive (its own governed ring, role=status announcement and
          reduced-motion/forced-colors skins) as the timeline's `spinner`
          part (P-79 caller-wins); the contract's pendingDot slot replaces
          the pulsing marker when provided. `aria-busy` marks the row as the
          live edge of the sequence. */}
      {pending && (
        <li data-part="item" data-side="start" data-pending="true" aria-busy="true">
          <hr aria-hidden="true" data-part="connector" data-edge="leading" />
          <div data-part="content" data-side="start">
            <LoadingIndicator size="sm" data-part="spinner" />
            {pending}
          </div>
          <div data-part="dot" data-pending="true">
            {pendingDot || <div data-part="dot-marker" />}
          </div>
        </li>
      )}
    </ol>
  );
}

ModernTimeline.displayName = 'ModernTimeline';

/**
 * ModernTimelineItem - modern Timeline.Item.
 *
 * Note: This is primarily a pass-through component. The actual rendering
 * is handled by the parent Timeline component.
 *
 * @example
 * ```tsx
 * <Timeline.Item color="green" label="Jan 2024">
 *   Task completed successfully
 * </Timeline.Item>
 * ```
 */
const ModernTimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  (props, ref) => {
    const { children } = props;
    return <div ref={ref}>{children}</div>;
  }
);

ModernTimelineItem.displayName = 'ModernTimelineItem';

/**
 * Default export for the modern Timeline engine.
 *
 * @param props - {@link TimelineProps} controlling mode, items, and pending state.
 * @returns A skin-painted vertical timeline element.
 */
export default ModernTimeline;
export { ModernTimeline as Timeline, ModernTimelineItem as Item };
