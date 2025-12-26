/**
 * @file Descriptions - Apollo Engine (Vanilla HTML/CSS)
 * @description Pure HTML/CSS implementation of the Descriptions component.
 * Provides maximum accessibility and zero external dependencies beyond React.
 * Ideal for applications requiring minimal bundle size or custom styling.
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
 * Size to font size mapping for Apollo implementation.
 */
const SIZE_FONT_MAP: Record<string, string> = {
  default: '14px',
  small: '12px',
  middle: '14px',
};

/**
 * Apollo engine Descriptions component.
 * Uses pure inline styles for maximum portability and zero dependencies.
 *
 * @remarks
 * This implementation focuses on accessibility and semantic HTML structure.
 * All styles are applied inline to avoid CSS conflicts and ensure
 * consistent rendering across different environments.
 *
 * @example
 * ```tsx
 * <ApolloDescriptions title="Details" bordered layout="vertical">
 *   <ApolloDescriptions.Item label="Status">Active</ApolloDescriptions.Item>
 * </ApolloDescriptions>
 * ```
 */
export const ApolloDescriptions = forwardRef<HTMLDivElement, DescriptionsProps>(
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

    const fontSize = SIZE_FONT_MAP[size] || SIZE_FONT_MAP.default;
    const columnCount = resolveColumnCount(column);

    // Container styles
    const containerStyle: React.CSSProperties = {
      fontSize,
      ...style,
    };

    // Header styles
    const headerStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    };

    // Title styles
    const titleStyle: React.CSSProperties = {
      fontSize: '18px',
      fontWeight: 600,
      margin: 0,
      color: '#333',
    };

    // Content container styles
    const contentContainerStyle: React.CSSProperties = {
      border: bordered ? '1px solid #e8e8e8' : 'none',
      borderRadius: bordered ? '8px' : '0',
      backgroundColor: bordered ? '#fff' : 'transparent',
      overflow: 'hidden',
    };

    // Grid styles for horizontal layout
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      gap: '16px',
      padding: bordered ? '16px' : '0',
    };

    // Base label styles
    const labelBaseStyle: React.CSSProperties = {
      color: '#666',
      fontSize: '13px',
      marginBottom: layout === 'vertical' ? '4px' : '0',
      ...labelStyle,
    };

    // Base content styles
    const contentBaseStyle: React.CSSProperties = {
      color: '#333',
      ...contentStyle,
    };

    /**
     * Renders items in horizontal grid layout.
     */
    const renderHorizontalLayout = () => (
      <div style={gridStyle} role="list">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          const itemProps = child.props as DescriptionsItemProps;
          const span = itemProps.span || 1;

          return (
            <div
              role="listitem"
              style={{
                gridColumn: `span ${span}`,
                borderBottom: bordered ? '1px solid #f0f0f0' : 'none',
                paddingBottom: bordered ? '12px' : '0',
              }}
            >
              <div style={{ ...labelBaseStyle, ...itemProps.labelStyle }}>
                {itemProps.label}
                {colon ? ':' : ''}
              </div>
              <div style={{ ...contentBaseStyle, ...itemProps.contentStyle }}>
                {itemProps.children}
              </div>
            </div>
          );
        })}
      </div>
    );

    /**
     * Renders items in vertical stacked layout.
     */
    const renderVerticalLayout = () => (
      <div role="list">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          const itemProps = child.props as DescriptionsItemProps;

          return (
            <div
              role="listitem"
              style={{
                display: 'flex',
                padding: '12px 16px',
                borderBottom: bordered ? '1px solid #f0f0f0' : 'none',
              }}
            >
              <div
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
        className={className}
        style={containerStyle}
        data-engine="apollo"
        role="region"
        aria-label={typeof title === 'string' ? title : 'Description list'}
      >
        {/* Header section */}
        {(title || extra) && (
          <div style={headerStyle}>
            {title && <h3 style={titleStyle}>{title}</h3>}
            {extra && <div>{extra}</div>}
          </div>
        )}

        {/* Content section */}
        <div style={contentContainerStyle}>
          {layout === 'horizontal'
            ? renderHorizontalLayout()
            : renderVerticalLayout()}
        </div>
      </div>
    );
  }
);

ApolloDescriptions.displayName = 'Descriptions.Apollo';

/**
 * Apollo engine Descriptions.Item component.
 * Wrapper component for individual description items.
 *
 * @remarks
 * In the Apollo implementation, this component acts as a props container.
 * The parent Descriptions component reads the props from children and
 * handles the actual DOM rendering.
 *
 * @example
 * ```tsx
 * <ApolloItem label="Created" labelStyle={{ fontWeight: 'bold' }}>
 *   2024-01-15
 * </ApolloItem>
 * ```
 */
export const ApolloItem = forwardRef<HTMLDivElement, DescriptionsItemProps>(
  (props, _ref) => {
    const { children } = props;
    // Parent component handles rendering; this is a wrapper for props collection
    return <>{children}</>;
  }
);

ApolloItem.displayName = 'Descriptions.Item.Apollo';

// Named exports for engine routing
export { ApolloDescriptions as Descriptions, ApolloItem as Item };

// Default export for dynamic imports
export default ApolloDescriptions;
