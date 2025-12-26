/**
 * @file Descriptions.Item - Compound Component
 * @description Individual item component for the Descriptions layout.
 * This component is used as a wrapper to pass props to the parent Descriptions
 * component, which handles the actual rendering.
 */

'use client';

import { forwardRef } from 'react';
import type { DescriptionsItemProps } from '../../types';

/**
 * Descriptions.Item component.
 * Represents a single key-value pair within the Descriptions component.
 *
 * @remarks
 * This component serves as a declarative wrapper to collect props.
 * The actual rendering is handled by the parent Descriptions component
 * which iterates over its children and extracts the props.
 *
 * @example
 * ```tsx
 * <Descriptions>
 *   <Descriptions.Item label="Name">John Doe</Descriptions.Item>
 *   <Descriptions.Item label="Email" span={2}>john@example.com</Descriptions.Item>
 * </Descriptions>
 * ```
 */
export const DescriptionsItem = forwardRef<HTMLDivElement, DescriptionsItemProps>(
  (props, ref) => {
    const { children, className, style } = props;

    // Note: The parent Descriptions component reads the props from this element
    // and renders the actual content. This component just serves as a container
    // for the child content when used standalone.
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }
);

DescriptionsItem.displayName = 'Descriptions.Item';

export default DescriptionsItem;
