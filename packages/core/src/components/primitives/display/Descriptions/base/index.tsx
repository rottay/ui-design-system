/**
 * @file Descriptions - Base Component
 * @description Base implementation using CSS variables from design tokens.
 * This component provides consistent styling across all engines and can be
 * extended by engine-specific implementations.
 */

'use client';

import React, { forwardRef } from 'react';
import type { DescriptionsProps, DescriptionsItemProps } from '../types';
import { DESCRIPTIONS_DEFAULTS, SIZE_MAP, PADDING_MAP } from '../types';

/**
 * Resolves the column count based on configuration.
 * Handles both numeric and responsive column configurations.
 *
 * @param column - Column configuration (number or responsive object)
 * @returns The resolved column count
 */
function resolveColumnCount(column: DescriptionsProps['column']): number {
  if (typeof column === 'number') {
    return column;
  }
  // For responsive configuration, default to md or 3
  return column?.md ?? column?.lg ?? 3;
}

/**
 * Base Descriptions component using CSS variables.
 * Renders a structured list of key-value pairs with customizable layout.
 *
 * @example
 * ```tsx
 * <BaseDescriptions title="User Profile">
 *   <BaseDescriptions.Item label="Name">John Doe</BaseDescriptions.Item>
 *   <BaseDescriptions.Item label="Email">john@example.com</BaseDescriptions.Item>
 * </BaseDescriptions>
 * ```
 */
export const BaseDescriptions = forwardRef<HTMLDivElement, DescriptionsProps>(
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
      className = '',
      style,
    } = props;

    const columnCount = resolveColumnCount(column);
    const fontSize = SIZE_MAP[size] || SIZE_MAP.default;
    const padding = PADDING_MAP[size] || PADDING_MAP.default;

    // CSS custom properties for theming
    const descriptionsVars: React.CSSProperties = {
      '--descriptions-font-size': fontSize,
      '--descriptions-padding': padding,
      '--descriptions-column-count': columnCount,
      '--descriptions-border-color': 'var(--color-border, #e8e8e8)',
      '--descriptions-label-color': 'var(--color-text-secondary, #666)',
      '--descriptions-content-color': 'var(--color-text-primary, #333)',
      '--descriptions-title-color': 'var(--color-text-primary, #333)',
      '--descriptions-bg': 'var(--color-bg-container, #fff)',
    } as React.CSSProperties;

    // Container styles
    const containerStyle: React.CSSProperties = {
      ...descriptionsVars,
      fontSize: 'var(--descriptions-font-size)',
      ...style,
    };

    // Header styles
    const headerStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    };

    const titleStyle: React.CSSProperties = {
      fontSize: '18px',
      fontWeight: 600,
      color: 'var(--descriptions-title-color)',
      margin: 0,
    };

    // Content container styles
    const contentContainerStyle: React.CSSProperties = {
      border: bordered ? '1px solid var(--descriptions-border-color)' : 'none',
      borderRadius: bordered ? '8px' : '0',
      backgroundColor: bordered ? 'var(--descriptions-bg)' : 'transparent',
      overflow: 'hidden',
    };

    // Grid styles for horizontal layout
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      gap: '16px',
      padding: bordered ? 'var(--descriptions-padding)' : '0',
    };

    // Label base styles
    const labelBaseStyle: React.CSSProperties = {
      color: 'var(--descriptions-label-color)',
      fontSize: '13px',
      marginBottom: layout === 'vertical' ? '4px' : '0',
      ...labelStyle,
    };

    // Content base styles
    const contentBaseStyle: React.CSSProperties = {
      color: 'var(--descriptions-content-color)',
      ...contentStyle,
    };

    /**
     * Renders children in horizontal layout mode.
     * Items are arranged in a grid with configurable columns.
     */
    const renderHorizontalLayout = () => (
      <div style={gridStyle}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          const itemProps = child.props as DescriptionsItemProps;
          const span = itemProps.span || 1;

          return (
            <div
              className="rottay-descriptions__item"
              style={{
                gridColumn: `span ${span}`,
                borderBottom: bordered ? '1px solid var(--descriptions-border-color)' : 'none',
                paddingBottom: bordered ? '12px' : '0',
              }}
            >
              <div
                className="rottay-descriptions__label"
                style={{ ...labelBaseStyle, ...itemProps.labelStyle }}
              >
                {itemProps.label}
                {colon ? ':' : ''}
              </div>
              <div
                className="rottay-descriptions__content"
                style={{ ...contentBaseStyle, ...itemProps.contentStyle }}
              >
                {itemProps.children}
              </div>
            </div>
          );
        })}
      </div>
    );

    /**
     * Renders children in vertical layout mode.
     * Items are stacked with labels and values in separate rows.
     */
    const renderVerticalLayout = () => (
      <div className="rottay-descriptions__vertical">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          const itemProps = child.props as DescriptionsItemProps;

          return (
            <div
              className="rottay-descriptions__item"
              style={{
                display: 'flex',
                padding: '12px 16px',
                borderBottom: bordered ? '1px solid var(--descriptions-border-color)' : 'none',
              }}
            >
              <div
                className="rottay-descriptions__label"
                style={{
                  width: '33%',
                  ...labelBaseStyle,
                  ...itemProps.labelStyle,
                }}
              >
                {itemProps.label}
                {colon ? ':' : ''}
              </div>
              <div
                className="rottay-descriptions__content"
                style={{
                  flex: 1,
                  ...contentBaseStyle,
                  ...itemProps.contentStyle,
                }}
              >
                {itemProps.children}
              </div>
            </div>
          );
        })}
      </div>
    );

    return (
      <div
        ref={ref}
        className={`rottay-descriptions rottay-descriptions--${size} rottay-descriptions--${layout} ${className}`}
        style={containerStyle}
        data-bordered={bordered}
        data-layout={layout}
        data-size={size}
      >
        {/* Header section */}
        {(title || extra) && (
          <div className="rottay-descriptions__header" style={headerStyle}>
            {title && (
              <h3 className="rottay-descriptions__title" style={titleStyle}>
                {title}
              </h3>
            )}
            {extra && <div className="rottay-descriptions__extra">{extra}</div>}
          </div>
        )}

        {/* Content section */}
        <div className="rottay-descriptions__body" style={contentContainerStyle}>
          {layout === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout()}
        </div>
      </div>
    );
  }
);

BaseDescriptions.displayName = 'BaseDescriptions';

/**
 * Base Item component for Descriptions.
 * Used as a wrapper for individual key-value pairs.
 * The actual rendering is handled by the parent Descriptions component.
 *
 * @example
 * ```tsx
 * <Descriptions.Item label="Username" span={2}>
 *   john_doe
 * </Descriptions.Item>
 * ```
 */
export const BaseDescriptionsItem = forwardRef<HTMLDivElement, DescriptionsItemProps>(
  (props, ref) => {
    const { children, className, style } = props;
    // The actual rendering is handled by the parent Descriptions component
    // This component serves as a wrapper to collect props
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }
);

BaseDescriptionsItem.displayName = 'BaseDescriptions.Item';
