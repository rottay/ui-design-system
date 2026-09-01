/**
 * @fileoverview Classic engine for the Descriptions component, backed by Ant Design.
 * Thin wrapper around antd's Descriptions that maps the DS prop contract through,
 * preserving Ant Design features like responsive columns and bordered layouts.
 *
 * @example
 * ```tsx
 * <Descriptions engine="classic" title="User Info" bordered>
 *   <Descriptions.Item label="Name">John Doe</Descriptions.Item>
 * </Descriptions>
 * ```
 */

'use client';

import { forwardRef } from 'react';
import { Descriptions as AntDescriptions } from 'antd';
import type { DescriptionsProps, DescriptionsItemProps } from '../../contracts';
import { DESCRIPTIONS_DEFAULTS } from '../../contracts';

/**
 * Classic (Ant Design) implementation of the Descriptions component.
 *
 * Passes all DS props through to antd's Descriptions unchanged. A wrapper
 * `<div>` with the forwarded ref sits around the antd component so consumers
 * can attach refs without reaching into Ant Design internals.
 *
 * @param props - Unified DescriptionsProps from the design system type contract
 * @param ref - Forwarded ref attached to the outer wrapper div
 * @returns Ant Design Descriptions wrapped in a ref-able container
 */
export const ClassicDescriptions = forwardRef<HTMLDivElement, DescriptionsProps>(
  (props, ref) => {
    const {
      title,
      extra,
      bordered = DESCRIPTIONS_DEFAULTS.bordered,
      column = DESCRIPTIONS_DEFAULTS.column,
      layout = DESCRIPTIONS_DEFAULTS.layout,
      size = DESCRIPTIONS_DEFAULTS.size,
      colon = DESCRIPTIONS_DEFAULTS.colon,
      styles,
      children,
      className,
      style,
    } = props;

    // Outer div exposes the forwarded ref; antd Descriptions handles all
    // layout logic including responsive column breakpoints internally
    return (
      <div ref={ref} className={className} style={style}>
        <AntDescriptions
          title={title}
          extra={extra}
          bordered={bordered}
          column={column}
          layout={layout}
          size={size}
          colon={colon}
          styles={styles}
        >
          {children}
        </AntDescriptions>
      </div>
    );
  }
);

ClassicDescriptions.displayName = 'Descriptions.Classic';

/**
 * Classic engine Descriptions.Item component.
 *
 * Wraps antd's Descriptions.Item and injects a `<span ref>` around children
 * so the forwarded ref has a concrete DOM node to attach to.
 *
 * @param props - Item-level props including label, span, and styles overrides
 * @param ref - Forwarded ref attached to a span wrapping the item content
 * @returns An antd Descriptions.Item element
 */
export const ClassicItem = forwardRef<HTMLDivElement, DescriptionsItemProps>(
  (props, ref) => {
    const {
      label,
      children,
      span,
      styles,
      className,
      style,
    } = props;

    return (
      <AntDescriptions.Item
        label={label}
        span={span}
        styles={styles}
        className={className}
        style={style}
      >
        <span ref={ref}>{children}</span>
      </AntDescriptions.Item>
    );
  }
);

ClassicItem.displayName = 'Descriptions.Item.Classic';

// Named exports consumed by the engine router to wire up <Descriptions> and <Descriptions.Item>
export { ClassicDescriptions as Descriptions, ClassicItem as Item };

// Default export enables dynamic import via React.lazy or the DS engine loader
export default ClassicDescriptions;
