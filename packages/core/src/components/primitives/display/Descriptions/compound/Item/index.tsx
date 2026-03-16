/**
 * @fileoverview Descriptions.Item compound component.
 * Represents a single label-value pair inside a Descriptions layout.
 * Accessed via `Descriptions.Item` dot-notation in consumer code.
 * The parent Descriptions component reads each Item's props to build the
 * final grid/table layout; this component itself is a thin declarative wrapper.
 */

'use client';

import { forwardRef } from 'react';
import type { DescriptionsItemProps } from '../../Descriptions.types';

/**
 * Descriptions.Item -- declares one key-value entry within a
 * {@link Descriptions} component.
 *
 * **How it works:** The parent `Descriptions` component iterates over its
 * children, reads each `Descriptions.Item`'s props (label, span, etc.),
 * and renders the final grid/table structure. This component exists
 * primarily to provide a clean declarative API; it renders a simple `<div>`
 * wrapper when used in isolation (e.g. during testing).
 *
 * @param props - {@link DescriptionsItemProps} including `label`, `span`,
 *                and child content representing the value.
 * @returns A `<div>` container that wraps the value content.
 *
 * @example
 * ```tsx
 * <Descriptions title="User Info" column={2}>
 *   <Descriptions.Item label="Name">John Doe</Descriptions.Item>
 *   <Descriptions.Item label="Email" span={2}>john@example.com</Descriptions.Item>
 * </Descriptions>
 * ```
 */
export const DescriptionsItem = forwardRef<HTMLDivElement, DescriptionsItemProps>(
  (props, ref) => {
    const { children, className, style } = props;

    // The parent Descriptions component reads the full props object from this
    // React element (including `label` and `span`) to drive its own rendering.
    // This <div> acts only as a minimal standalone container.
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }
);

DescriptionsItem.displayName = 'Descriptions.Item';

export default DescriptionsItem;
