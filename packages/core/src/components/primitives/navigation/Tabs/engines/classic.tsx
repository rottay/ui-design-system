/**
 * @fileoverview Tabs Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Tabs component.
 * Provides a full-featured tabs experience with rich animations and interactions.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Tabs component, adapting it to
 * Rottay's unified API. This ensures consistency across all engine
 * implementations while leveraging Ant Design's battle-tested features.
 *
 * Features provided by this engine:
 * - Smooth tab switching animations
 * - Built-in keyboard navigation
 * - Accessibility out of the box
 * - Responsive behavior
 * - Full ARIA support
 *
 * @example
 * ```tsx
 * // Classic is the default engine
 * <Tabs items={items} defaultActiveKey="1" />
 *
 * // Or explicitly specify
 * <Tabs engine="classic" items={items} />
 * ```
 *
 * @see {@link Tabs} for the main component documentation
 * @see {@link TabsProps} for prop definitions
 *
 * @module Tabs/Engines/Classic
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useId } from 'react';
import { Tabs as AntTabs } from 'antd';
import type { TabsProps, TabItem, TabsType, TabsSize } from '../Tabs.types';
import { TABS_DEFAULTS } from '../Tabs.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

const TABS_SIZE_STYLES: Record<string, { padding: string; fontSize: string }> = {
  sm: { padding: '4px 12px', fontSize: '0.875rem' },
  md: { padding: '8px 16px', fontSize: '1rem' },
  lg: { padding: '12px 20px', fontSize: '1.125rem' },
};

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

// ============================================================================
// Type Mappings
// ============================================================================

/**
 * Maps Rottay tab types to Ant Design tab types.
 * 'pills' maps to 'card' as closest equivalent.
 */
// Antd only supports 'line' and 'card' tab types natively.
// Our 'pills' variant has no direct antd equivalent, so it maps to 'card'
// as the closest visual match (raised appearance with background fill).
const TYPE_MAP = {
  line: 'line' as const,
  card: 'card' as const,
  pills: 'card' as const,
};

/**
 * Maps Rottay sizes to Ant Design sizes.
 */
const SIZE_MAP = {
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
};

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * Classic engine implementation of Tabs.
 *
 * @description
 * Renders the Tabs component using Ant Design's Tabs.
 * Transforms Rottay's unified props to Ant Design's API.
 *
 * @remarks
 * - Converts items array to Ant Design's format
 * - Maps type and size props to Ant Design equivalents
 * - Preserves all accessibility features from Ant Design
 * - Supports controlled and uncontrolled modes
 *
 * @param props - {@link TabsProps}
 * @returns React element rendered with Ant Design
 *
 * @example
 * ```tsx
 * <ClassicTabs
 *   items={[
 *     { key: '1', label: 'Tab 1', children: <Content /> },
 *   ]}
 *   type="line"
 *   size="md"
 * />
 * ```
 */
export default function ClassicTabs(props: TabsProps): React.ReactElement {
  const {
    items,
    activeKey,
    defaultActiveKey,
    type = TABS_DEFAULTS.type,
    size: sizeProp = TABS_DEFAULTS.size,
    centered = TABS_DEFAULTS.centered,
    onChange,
    className,
    style,
  } = props;

  // Responsive size handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'padding',
      value: sizeProp,
      resolve: (v: TabsSize) => `${(TABS_SIZE_STYLES[v as keyof typeof TABS_SIZE_STYLES] || TABS_SIZE_STYLES.md).padding} !important`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: TabsSize) => `${(TABS_SIZE_STYLES[v as keyof typeof TABS_SIZE_STYLES] || TABS_SIZE_STYLES.md).fontSize} !important`,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `tabs-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const size = scalarOrUndefined(sizeProp) ?? (TABS_DEFAULTS.size as TabsSize);

  // ============================================================================
  // Transform Items to Ant Design Format
  // ============================================================================

  /**
   * Convert Rottay TabItems to Ant Design's item format.
   * Handles icon rendering within the label.
   */
  // Antd expects `label` to be a ReactNode. We compose the icon and text
  // into a single fragment so both render together in the tab header.
  // The `children` prop becomes the tab panel content.
  const antItems = items.map((item: TabItem) => ({
    key: item.key,
    label: (
      <>
        {item.icon} {item.label}
      </>
    ),
    children: item.children,
    disabled: item.disabled,
  }));

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      <AntTabs
        items={antItems}
        activeKey={activeKey}
        defaultActiveKey={defaultActiveKey}
        type={TYPE_MAP[type as TabsType]}
        size={SIZE_MAP[size as TabsSize]}
        centered={centered}
        onChange={onChange}
        className={className}
        style={style}
        {...(responsive ? responsive.attrs : {})}
      />
    </>
  );
}
