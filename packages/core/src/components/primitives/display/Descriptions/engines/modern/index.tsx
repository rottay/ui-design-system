/**
 * @file Descriptions - Modern Engine (DaisyUI/Tailwind)
 * @description DaisyUI/Tailwind CSS implementation of the Descriptions component.
 * Provides a lightweight, utility-first approach with DaisyUI theming support.
 */

'use client';

import React, { forwardRef } from 'react';
import type { DescriptionsProps, DescriptionsItemProps } from '../../types';
import { DESCRIPTIONS_DEFAULTS } from '../../types';

/**
 * Resolves column count from column configuration.
 *
 * @param column - Column configuration (number or responsive object)
 * @returns Resolved column count as a number
 */
function resolveColumnCount(column: DescriptionsProps['column']): number {
  if (typeof column === 'number') return column;
  return column?.md ?? column?.lg ?? 3;
}

/**
 * Modern engine Descriptions component.
 * Uses DaisyUI utility classes for styling with Tailwind CSS.
 *
 * @remarks
 * This implementation is optimized for lightweight bundle size while
 * maintaining full functionality. Uses DaisyUI's color system for
 * consistent theming across the design system.
 *
 * @example
 * ```tsx
 * <ModernDescriptions title="Profile" bordered>
 *   <ModernDescriptions.Item label="Name">John</ModernDescriptions.Item>
 * </ModernDescriptions>
 * ```
 */
export const ModernDescriptions = forwardRef<HTMLDivElement, DescriptionsProps>(
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
      className = '',
      style,
    } = props;

    // Size variant classes
    const sizeClass = {
      default: 'text-base',
      small: 'text-sm',
      middle: 'text-base',
    }[size];

    // Border classes
    const borderClass = bordered ? 'border border-base-300 rounded-lg' : '';
    const columnCount = resolveColumnCount(column);

    return (
      <div
        ref={ref}
        className={`${className}`}
        style={style}
        data-engine="modern"
      >
        {/* Header section with title and extra content */}
        {(title || extra) && (
          <div className="flex justify-between items-center mb-4">
            {title && (
              <h3 className="text-lg font-semibold text-base-content">
                {title}
              </h3>
            )}
            {extra && <div>{extra}</div>}
          </div>
        )}

        {/* Content section */}
        <div className={`${borderClass} ${sizeClass}`}>
          {layout === 'horizontal' ? (
            // Horizontal layout: grid-based with columns
            <div
              className="grid gap-4 p-4"
              style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
            >
              {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return null;
                const itemProps = child.props as DescriptionsItemProps;
                const span = itemProps.span || 1;

                return (
                  <div
                    className={
                      bordered
                        ? 'border-b border-base-300 pb-2 last:border-b-0'
                        : ''
                    }
                    style={{ gridColumn: `span ${span}` }}
                  >
                    <div
                      className="text-base-content/60 text-sm mb-1"
                      style={{ ...styles?.label, ...itemProps.styles?.label }}
                    >
                      {itemProps.label}
                      {colon ? ':' : ''}
                    </div>
                    <div
                      className="text-base-content"
                      style={{ ...styles?.content, ...itemProps.styles?.content }}
                    >
                      {itemProps.children}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Vertical layout: stacked rows
            <div className="divide-y divide-base-300">
              {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return null;
                const itemProps = child.props as DescriptionsItemProps;

                return (
                  <div className="flex p-3">
                    <div
                      className="text-base-content/60 w-1/3"
                      style={{ ...styles?.label, ...itemProps.styles?.label }}
                    >
                      {itemProps.label}
                      {colon ? ':' : ''}
                    </div>
                    <div
                      className="flex-1 text-base-content"
                      style={{ ...styles?.content, ...itemProps.styles?.content }}
                    >
                      {itemProps.children}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ModernDescriptions.displayName = 'Descriptions.Modern';

/**
 * Modern engine Descriptions.Item component.
 * Wrapper component for individual description items.
 *
 * @remarks
 * In the Modern implementation, this component serves as a props container.
 * The parent Descriptions component handles the actual rendering by
 * iterating over children and extracting their props.
 *
 * @example
 * ```tsx
 * <ModernItem label="Email" span={2}>
 *   user@example.com
 * </ModernItem>
 * ```
 */
export const ModernItem = forwardRef<HTMLDivElement, DescriptionsItemProps>(
  (props, _ref) => {
    const { children } = props;
    // Parent component handles rendering; this is a wrapper for props collection
    return <>{children}</>;
  }
);

ModernItem.displayName = 'Descriptions.Item.Modern';

// Named exports for engine routing
export { ModernDescriptions as Descriptions, ModernItem as Item };

// Default export for dynamic imports
export default ModernDescriptions;
