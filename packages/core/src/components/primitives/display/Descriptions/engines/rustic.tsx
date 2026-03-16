/**
 * @fileoverview Rustic engine for the Descriptions component, using pure HTML/CSS.
 * Zero external dependencies -- inline styles backed by CSS custom properties
 * (--ds-descriptions-*), with ARIA roles for screen reader accessibility.
 *
 * @example
 * ```tsx
 * <Descriptions engine="rustic" title="Details" bordered layout="vertical">
 *   <Descriptions.Item label="Status">Active</Descriptions.Item>
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
 * Size to font size mapping for Rustic implementation.
 */
const SIZE_FONT_MAP: Record<string, string> = {
  default: 'var(--ds-descriptions-font-size-default, 14px)',
  small: 'var(--ds-descriptions-font-size-small, 12px)',
  middle: 'var(--ds-descriptions-font-size-default, 14px)',
};

/**
 * Rustic (pure HTML/CSS) implementation of the Descriptions component.
 *
 * Uses ARIA roles (region, list, listitem) for screen reader navigation.
 * All visual properties come from CSS custom properties with hardcoded
 * fallbacks, so the component works even without a loaded theme stylesheet.
 *
 * @param props - Unified DescriptionsProps from the design system type contract
 * @param ref - Forwarded ref attached to the outer container div
 * @returns A semantically structured description list using only inline styles
 */
export const RusticDescriptions = forwardRef<HTMLDivElement, DescriptionsProps>(
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

    const fontSize = SIZE_FONT_MAP[size] || SIZE_FONT_MAP.default;
    const columnCount = resolveColumnCount(column);

    // Root container only sets font size; other styles live on inner elements
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
      fontSize: 'var(--ds-descriptions-title-font-size, 18px)',
      fontWeight: 600,
      margin: 0,
      color: 'var(--ds-descriptions-title-color, var(--ds-color-text-primary, #333))',
    };

    // Content area gets border/radius/bg only in bordered mode; transparent otherwise
    const contentContainerStyle: React.CSSProperties = {
      border: bordered ? '1px solid var(--ds-descriptions-border-color, #e8e8e8)' : 'none',
      borderRadius: bordered ? 'var(--ds-descriptions-radius, 8px)' : '0',
      backgroundColor: bordered ? 'var(--ds-descriptions-bg, #fff)' : 'transparent',
      overflow: 'hidden',
    };

    // Grid styles for horizontal layout
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      gap: '16px',
      padding: bordered ? '16px' : '0',
    };

    // Label uses a secondary colour and smaller font to visually differentiate from values.
    // Component-level styles.label is merged first, then item-level overrides on top.
    const labelBaseStyle: React.CSSProperties = {
      color: 'var(--ds-descriptions-label-color, var(--ds-color-text-secondary, #666))',
      fontSize: 'var(--ds-descriptions-label-font-size, 13px)',
      marginBottom: layout === 'vertical' ? '4px' : '0',
      ...styles?.label,
    };

    // Base content styles
    const contentBaseStyle: React.CSSProperties = {
      color: 'var(--ds-descriptions-content-color, var(--ds-color-text-primary, #333))',
      ...styles?.content,
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
                borderBottom: bordered ? '1px solid var(--ds-descriptions-item-border-color, #f0f0f0)' : 'none',
                paddingBottom: bordered ? '12px' : '0',
              }}
            >
              <div style={{ ...labelBaseStyle, ...itemProps.styles?.label }}>
                {itemProps.label}
                {colon ? ':' : ''}
              </div>
              <div style={{ ...contentBaseStyle, ...itemProps.styles?.content }}>
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
                borderBottom: bordered ? '1px solid var(--ds-descriptions-item-border-color, #f0f0f0)' : 'none',
              }}
            >
              <div
                style={{
                  width: '33%',
                  ...labelBaseStyle,
                  ...itemProps.styles?.label,
                }}
              >
                {itemProps.label}
                {colon ? ':' : ''}
              </div>
              <div
                style={{
                  flex: 1,
                  ...contentBaseStyle,
                  ...itemProps.styles?.content,
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
        data-engine="rustic"
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

RusticDescriptions.displayName = 'Descriptions.Rustic';

/**
 * Rustic engine Descriptions.Item -- a "phantom" component.
 *
 * Never renders its own DOM. The parent RusticDescriptions iterates children
 * via React.Children.map and reads each Item's props (label, span, styles)
 * to build the actual layout. This pattern avoids an extra wrapper div per
 * item while keeping the JSX API consistent across engines.
 *
 * @param props - Item-level props including label, span, and styles overrides
 * @param _ref - Unused; included for API parity with the Classic engine
 * @returns A React fragment containing only the children (rendered by parent)
 */
export const RusticItem = forwardRef<HTMLDivElement, DescriptionsItemProps>(
  (props, _ref) => {
    const { children } = props;
    // This component is a props container only; the parent reads our props directly
    return <>{children}</>;
  }
);

RusticItem.displayName = 'Descriptions.Item.Rustic';

// Named exports consumed by the engine router to wire up <Descriptions> and <Descriptions.Item>
export { RusticDescriptions as Descriptions, RusticItem as Item };

// Default export enables dynamic import via React.lazy or the DS engine loader
export default RusticDescriptions;
