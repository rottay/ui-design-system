/**
 * @file Descriptions - Classic Engine (Ant Design)
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
 * Classic engine Descriptions component.
 * Uses Ant Design's Descriptions component as the underlying implementation.
 *
 * @remarks
 * This implementation provides full compatibility with Ant Design's feature set
 * including responsive column configurations, bordered variants, and colon customization.
 *
 * @example
 * ```tsx
 * <ClassicDescriptions title="User Info" bordered>
 *   <ClassicDescriptions.Item label="Name">John Doe</ClassicDescriptions.Item>
 *   <ClassicDescriptions.Item label="Phone">1234567890</ClassicDescriptions.Item>
 * </ClassicDescriptions>
 * ```
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
 * Wrapper around Ant Design's Descriptions.Item component.
 *
 * @example
 * ```tsx
 * <ClassicItem label="Username" span={2}>
 *   john_doe
 * </ClassicItem>
 * ```
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

// Named exports for engine routing
export { ClassicDescriptions as Descriptions, ClassicItem as Item };

// Default export for dynamic imports
export default ClassicDescriptions;
