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

/** Smallest first. `xxl` is the contract's spelling of the scale's `2xl` tier. */
const COLUMN_BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

/** A zero/negative/fractional count makes `repeat()` invalid, so it falls back. */
function normalizeColumnCount<T>(raw: number | undefined, fallback: T): number | T {
  return typeof raw === 'number' && Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : fallback;
}

interface ColumnProjection {
  /** `fixed` keeps the single inline count; `responsive` hands the tiers to the skin. */
  mode: 'fixed' | 'responsive';
  /** Widest authored count: the span clamp and the narrow-container hooks key on it. */
  count: number;
  style: React.CSSProperties;
}

// A scalar stays an inline count; a `ResponsiveColumn` publishes one channel per
// tier and writes NO inline count, which would outrank the skin's media queries.
function projectColumns(column: DescriptionsProps['column']): ColumnProjection {
  const fixed = (count: number): ColumnProjection => ({
    mode: 'fixed',
    count,
    style: { '--ds-descriptions-column-count': count } as React.CSSProperties,
  });

  if (typeof column === 'number' || column == null) {
    return fixed(normalizeColumnCount(column as number | undefined, 3));
  }

  // An object that declares no usable tier is the contract default, not a
  // one-column list.
  const declaresATier = COLUMN_BREAKPOINTS.some(
    (tier) => normalizeColumnCount(column[tier], null) !== null
  );
  if (!declaresATier) return fixed(3);

  // Static channel keys, never a computed `style[key] = …`: that is an
  // unresolvable paint site to the inline-paint census, whose counter only falls.
  let carried = 1;
  const counts = COLUMN_BREAKPOINTS.map((tier) => {
    carried = normalizeColumnCount(column[tier], carried);
    return carried;
  });
  const [xs, sm, md, lg, xl, xxl] = counts;

  return {
    mode: 'responsive',
    count: Math.max(...counts),
    style: {
      '--_ds-descriptions-columns-xs': xs,
      '--_ds-descriptions-columns-sm': sm,
      '--_ds-descriptions-columns-md': md,
      '--_ds-descriptions-columns-lg': lg,
      '--_ds-descriptions-columns-xl': xl,
      '--_ds-descriptions-columns-xxl': xxl,
    } as React.CSSProperties,
  };
}

/**
 * Clamps an item's `span` to the row's track count.
 *
 * `span` is caller data and the contract does not bound it. CSS grid grows
 * IMPLICIT columns to fit a span wider than the explicit track list, so one
 * `span={5}` item in a 3-column grid silently re-tracks the whole list and
 * every other row inherits the skew.
 */
function clampSpan(span: number | undefined, columnCount: number): number {
  if (typeof span !== 'number' || !Number.isFinite(span)) return 1;
  return Math.min(Math.max(Math.floor(span), 1), columnCount);
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
      'data-part': dataPart,
      'aria-label': ariaLabel,
      // Caller passthrough (id / aria-* / data-* / data-testid): forwarded to
      // the root element. It spreads BEFORE the engine's own stamps so the
      // skin contract always lands last.
      ...rest
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

    // Resolve the column config onto the grid: a scalar count inline, or the
    // declared per-breakpoint tiers as channels the skin's queries read.
    const columns = projectColumns(column);
    const columnCount = columns.count;
    const itemElements = React.Children.toArray(children).filter(React.isValidElement);
    const hasHeader = !!(title || extra);

    return (
      <div
        {...rest}
        ref={ref}
        className={`rottay-descriptions rottay-descriptions--modern${layout === 'vertical' ? ' rottay-descriptions-vertical' : ''}${!bordered ? ' rottay-descriptions-borderless' : ''} ${className}`}
        style={{
          ...columns.style,
          ...style,
        } as React.CSSProperties}
        data-part={dataPart ?? 'root'}
        data-engine="modern"
        data-layout={layout}
        data-bordered={bordered ? 'true' : 'false'}
        data-size={size}
        data-columns={columns.mode}
        data-column-count={columnCount}
        data-item-count={itemElements.length}
        data-has-header={hasHeader}
        data-has-extra={!!extra}
        role="region"
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : regionLabel)}
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
                const span = clampSpan(itemProps.span, columnCount);

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
                    data-span={clampSpan(itemProps.span, columnCount)}
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
