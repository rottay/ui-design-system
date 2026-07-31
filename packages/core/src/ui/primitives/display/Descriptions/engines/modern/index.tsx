/**
 * @fileoverview Modern engine for the Descriptions component.
 * Renders label-value pairs in either a horizontal CSS grid or vertical stacked
 * layout. All paint and static geometry (header chrome, grid tracks, row boxes,
 * label/content typography) live in the modern skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/descriptions.css`), keyed
 * on the `data-part` / `data-layout` / `data-bordered` hooks stamped here.
 * Inline styles are reserved for the two CSS-variable channels the skin reads
 * (`--ds-descriptions-column-count`, `--ds-descriptions-item-span`) and the
 * public `styles.label` / `styles.content` override props.
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
import type { DescriptionsProps, DescriptionsItemProps } from '../../contracts';
import { DESCRIPTIONS_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

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
 * Modern implementation of the Descriptions component.
 *
 * Iterates over children with React.Children.map and extracts their props
 * to build either a CSS grid (horizontal) or a stacked (vertical) layout.
 * This is why the companion ModernItem component renders nothing itself.
 *
 * @param props - Unified DescriptionsProps from the design system type contract
 * @param ref - Forwarded ref attached to the outer container div
 * @returns A skin-painted description list
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

    const i18n = useOptionalTranslation('components');
    // English fallback when no I18nProvider is mounted or the locale catalog
    // does not carry the key yet (the translator echoes the full key back for
    // a miss, which is what the endsWith guard detects).
    const regionKey = 'descriptions.region_label';
    const translatedRegion = i18n?.t(regionKey);
    const regionLabel =
      translatedRegion && !translatedRegion.endsWith(regionKey)
        ? translatedRegion
        : 'Description list';

    // Resolve responsive column config to a concrete number for CSS grid
    const columnCount = resolveColumnCount(column);
    const itemElements = React.Children.toArray(children).filter(React.isValidElement);
    const hasHeader = !!(title || extra);

    return (
      <div
        ref={ref}
        className={`rottay-descriptions rottay-descriptions--modern${layout === 'vertical' ? ' rottay-descriptions-vertical' : ''}${!bordered ? ' rottay-descriptions-borderless' : ''} ${className}`}
        style={{
          '--ds-descriptions-column-count': columnCount,
          ...style,
        } as React.CSSProperties}
        data-part="root"
        data-engine="modern"
        data-layout={layout}
        data-bordered={bordered ? 'true' : 'false'}
        data-size={size}
        data-column-count={columnCount}
        data-item-count={itemElements.length}
        data-has-header={hasHeader}
        data-has-extra={!!extra}
        role="region"
        aria-label={typeof title === 'string' ? title : regionLabel}
      >
        {/* Header section with title and extra content */}
        {(title || extra) && (
          <div className="rottay-descriptions-title" data-part="header">
            {title && (
              <h3 data-part="title">
                {title}
              </h3>
            )}
            {extra && <div data-part="extra">{extra}</div>}
          </div>
        )}

        {/* Content section */}
        <div data-part="body">
          {layout === 'horizontal' ? (
            // Horizontal: CSS grid with configurable columns; items can span multiple cells.
            // Semantics: a description LIST — <dl> with <dt>/<dd> pairs (the div row
            // wrapper is spec-legal inside <dl>); the role attributes stay for the
            // pinned test contract.
            <dl
              data-part="rows"
              role="list"
            >
              {itemElements.map((child, index) => {
                const itemProps = child.props as DescriptionsItemProps;
                const span = itemProps.span || 1;

                return (
                  <div
                    key={child.key ?? index}
                    className="rottay-descriptions-row"
                    data-part="row"
                    data-index={index}
                    data-span={span}
                    role="listitem"
                    style={{
                      '--ds-descriptions-item-span': span,
                    } as React.CSSProperties}
                  >
                    <dt
                      className="rottay-descriptions-label"
                      data-part="label"
                      style={{ ...styles?.label, ...itemProps.styles?.label }}
                    >
                      {itemProps.label}
                      {colon ? ':' : ''}
                    </dt>
                    <dd
                      className="rottay-descriptions-content"
                      data-part="content"
                      data-empty={itemProps.children == null || itemProps.children === ''}
                      style={{ ...styles?.content, ...itemProps.styles?.content }}
                    >
                      {itemProps.children}
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : (
            // Vertical: label column on the inline-start side, value on the
            // inline-end side; the skin owns the track split (with a subgrid
            // upgrade where supported). Same <dl>/<dt>/<dd> semantics.
            <dl data-part="rows" role="list">
              {itemElements.map((child, index) => {
                const itemProps = child.props as DescriptionsItemProps;

                return (
                  <div
                    key={child.key ?? index}
                    className="rottay-descriptions-row"
                    data-part="row"
                    data-index={index}
                    data-span={itemProps.span || 1}
                    role="listitem"
                  >
                    <dt
                      className="rottay-descriptions-label"
                      data-part="label"
                      style={{ ...styles?.label, ...itemProps.styles?.label }}
                    >
                      {itemProps.label}
                      {colon ? ':' : ''}
                    </dt>
                    <dd
                      className="rottay-descriptions-content"
                      data-part="content"
                      data-empty={itemProps.children == null || itemProps.children === ''}
                      style={{ ...styles?.content, ...itemProps.styles?.content }}
                    >
                      {itemProps.children}
                    </dd>
                  </div>
                );
              })}
            </dl>
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
