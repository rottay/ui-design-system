/**
 * @fileoverview Modern engine for the Descriptions component, backed by DaisyUI/Tailwind.
 * Renders label-value pairs in either a horizontal CSS grid or vertical stacked
 * layout using Tailwind utility classes and DaisyUI's base-content colour tokens.
 *
 * @example
 * ```tsx
 * <Descriptions engine="modern" title="Profile" bordered>
 *   <Descriptions.Item label="Name">John</Descriptions.Item>
 * </Descriptions>
 * ```
 */

'use client';

import React, { forwardRef } from 'react';
import type { DescriptionsProps, DescriptionsItemProps } from '../Descriptions.types';
import { DESCRIPTIONS_DEFAULTS } from '../Descriptions.types';

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
 * Modern (DaisyUI) implementation of the Descriptions component.
 *
 * Iterates over children with React.Children.map and extracts their props
 * to build either a CSS grid (horizontal) or a divide-y stack (vertical).
 * This is why the companion ModernItem component renders nothing itself.
 *
 * @param props - Unified DescriptionsProps from the design system type contract
 * @param ref - Forwarded ref attached to the outer container div
 * @returns A Tailwind-styled description list
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

    // Map DS size tokens to Tailwind text-size classes for body content
    const sizeClass = {
      default: 'text-base',
      small: 'text-sm',
      middle: 'text-base',
    }[size];

    // Bordered mode adds a visible container outline using DS border token
    const borderClass = bordered ? 'border rounded-lg' : '';
    const borderStyle: React.CSSProperties = bordered ? { borderColor: 'var(--ds-color-border)' } : {};
    // Resolve responsive column config to a concrete number for CSS grid
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
              <h3 className="text-lg font-semibold" style={{ color: 'var(--ds-color-text-primary)' }}>
                {title}
              </h3>
            )}
            {extra && <div>{extra}</div>}
          </div>
        )}

        {/* Content section */}
        <div className={`${borderClass} ${sizeClass}`} style={borderStyle}>
          {layout === 'horizontal' ? (
            // Horizontal: CSS grid with configurable columns; items can span multiple cells
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
                        ? 'border-b pb-2 last:border-b-0'
                        : ''
                    }
                    style={{
                      gridColumn: `span ${span}`,
                      ...(bordered && { borderColor: 'var(--ds-color-border)' }),
                    }}
                  >
                    <div
                      className="text-sm mb-1"
                      style={{ color: 'var(--ds-color-text-secondary)', ...styles?.label, ...itemProps.styles?.label }}
                    >
                      {itemProps.label}
                      {colon ? ':' : ''}
                    </div>
                    <div
                      style={{ color: 'var(--ds-color-text-primary)', ...styles?.content, ...itemProps.styles?.content }}
                    >
                      {itemProps.children}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Vertical: label on the left (1/3 width), value on the right, separated by dividers
            <div className="divide-y" style={{ '--tw-divide-color': 'var(--ds-color-border)' } as React.CSSProperties}>
              {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return null;
                const itemProps = child.props as DescriptionsItemProps;

                return (
                  <div className="flex p-3">
                    <div
                      className="w-1/3"
                      style={{ color: 'var(--ds-color-text-secondary)', ...styles?.label, ...itemProps.styles?.label }}
                    >
                      {itemProps.label}
                      {colon ? ':' : ''}
                    </div>
                    <div
                      className="flex-1"
                      style={{ color: 'var(--ds-color-text-primary)', ...styles?.content, ...itemProps.styles?.content }}
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
 * Modern engine Descriptions.Item -- a "phantom" component.
 *
 * Never renders its own DOM. The parent ModernDescriptions iterates children
 * via React.Children.map and reads each Item's props (label, span, styles)
 * to build the actual layout. This pattern avoids an extra wrapper div per
 * item while keeping the JSX API consistent across engines.
 *
 * @param props - Item-level props including label, span, and styles overrides
 * @param _ref - Unused; included for API parity with the Classic engine
 * @returns A React fragment containing only the children (rendered by parent)
 */
export const ModernItem = forwardRef<HTMLDivElement, DescriptionsItemProps>(
  (props, _ref) => {
    const { children } = props;
    // This component is a props container only; the parent reads our props directly
    return <>{children}</>;
  }
);

ModernItem.displayName = 'Descriptions.Item.Modern';

// Named exports consumed by the engine router to wire up <Descriptions> and <Descriptions.Item>
export { ModernDescriptions as Descriptions, ModernItem as Item };

// Default export enables dynamic import via React.lazy or the DS engine loader
export default ModernDescriptions;
