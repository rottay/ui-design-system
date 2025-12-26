/**
 * @file Descriptions - Titan Engine (Ant Design)
 * @description Ant Design implementation of the Descriptions component.
 * Leverages the full feature set of Ant Design's Descriptions component
 * including responsive columns, bordered styles, and layout variations.
 */

'use client';

import { forwardRef } from 'react';
import { Descriptions as AntDescriptions } from 'antd';
import type { DescriptionsProps, DescriptionsItemProps } from '../../types';
import { DESCRIPTIONS_DEFAULTS } from '../../types';

/**
 * Titan engine Descriptions component.
 * Uses Ant Design's Descriptions component as the underlying implementation.
 *
 * @remarks
 * This implementation provides full compatibility with Ant Design's feature set
 * including responsive column configurations, bordered variants, and colon customization.
 *
 * @example
 * ```tsx
 * <TitanDescriptions title="User Info" bordered>
 *   <TitanDescriptions.Item label="Name">John Doe</TitanDescriptions.Item>
 *   <TitanDescriptions.Item label="Phone">1234567890</TitanDescriptions.Item>
 * </TitanDescriptions>
 * ```
 */
export const TitanDescriptions = forwardRef<HTMLDivElement, DescriptionsProps>(
  (props, ref) => {
    const {
      title,
      extra,
      bordered = DESCRIPTIONS_DEFAULTS.bordered,
      column = DESCRIPTIONS_DEFAULTS.column,
      layout = DESCRIPTIONS_DEFAULTS.layout,
      size = DESCRIPTIONS_DEFAULTS.size,
      colon = DESCRIPTIONS_DEFAULTS.colon,
      labelStyle,
      contentStyle,
      children,
      className,
      style,
    } = props;

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
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          {children}
        </AntDescriptions>
      </div>
    );
  }
);

TitanDescriptions.displayName = 'Descriptions.Titan';

/**
 * Titan engine Descriptions.Item component.
 * Wrapper around Ant Design's Descriptions.Item component.
 *
 * @example
 * ```tsx
 * <TitanItem label="Username" span={2}>
 *   john_doe
 * </TitanItem>
 * ```
 */
export const TitanItem = forwardRef<HTMLDivElement, DescriptionsItemProps>(
  (props, ref) => {
    const {
      label,
      children,
      span,
      labelStyle,
      contentStyle,
      className,
      style,
    } = props;

    return (
      <AntDescriptions.Item
        label={label}
        span={span}
        labelStyle={labelStyle}
        contentStyle={contentStyle}
        className={className}
        style={style}
      >
        <span ref={ref}>{children}</span>
      </AntDescriptions.Item>
    );
  }
);

TitanItem.displayName = 'Descriptions.Item.Titan';

// Named exports for engine routing
export { TitanDescriptions as Descriptions, TitanItem as Item };

// Default export for dynamic imports
export default TitanDescriptions;
