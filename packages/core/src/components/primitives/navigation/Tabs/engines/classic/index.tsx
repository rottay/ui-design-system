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

import React from 'react';
import { Tabs as AntTabs } from 'antd';
import type { TabsProps, TabItem, TabsType, TabsSize } from '../../types';
import { TABS_DEFAULTS } from '../../types';

// ============================================================================
// Type Mappings
// ============================================================================

/**
 * Maps Rottay tab types to Ant Design tab types.
 * 'pills' maps to 'card' as closest equivalent.
 */
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
    size = TABS_DEFAULTS.size,
    centered = TABS_DEFAULTS.centered,
    onChange,
    className,
    style,
  } = props;

  // ============================================================================
  // Transform Items to Ant Design Format
  // ============================================================================

  /**
   * Convert Rottay TabItems to Ant Design's item format.
   * Handles icon rendering within the label.
   */
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
    />
  );
}
