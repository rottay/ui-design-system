/**
 * Tabs Component Types
 *
 * Unified type definitions for Tabs component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode, Key } from 'react';

/**
 * Individual tab item definition
 */
export interface TabItem {
  // Required
  key: string;
  label: ReactNode;

  // Optional
  children?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  closable?: boolean;

  // Accessibility
  'aria-label'?: string;
}

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface TabsBaseProps {
  // Tab items (primary way to define tabs)
  items?: TabItem[];

  // Active tab control
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Accessibility
  id?: string;
  'aria-label'?: string;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface TabsProps extends TabsBaseProps {
  // Visual variants
  type?: 'line' | 'card' | 'editable-card';
  size?: 'small' | 'default' | 'large';

  // Tab position (titan primary support)
  tabPosition?: 'top' | 'bottom' | 'left' | 'right';

  // Scrollable tabs for overflow
  centered?: boolean;

  // Closable tabs functionality (editable-card type)
  onEdit?: (targetKey: Key, action: 'add' | 'remove') => void;

  // Tab bar customization
  tabBarExtraContent?: ReactNode;
  tabBarGutter?: number;
  tabBarStyle?: CSSProperties;

  // Animation
  animated?: boolean | { inkBar: boolean; tabPane: boolean };

  // Keyboard navigation
  keyboard?: boolean;

  // Destroy inactive tab panes
  destroyInactiveTabPane?: boolean;

  // Custom rendering
  renderTabBar?: (
    props: TabsProps,
    DefaultTabBar: React.ComponentType<any>
  ) => React.ReactElement;

  // Additional handlers
  onTabClick?: (key: string, event: React.MouseEvent | React.KeyboardEvent) => void;
  onTabScroll?: (direction: 'left' | 'right') => void;
}

/**
 * Type guard to check if tabs are controlled
 */
export function isControlledTabs(props: TabsProps): boolean {
  return props.activeKey !== undefined;
}

/**
 * Type guard to check if tabs are uncontrolled
 */
export function isUncontrolledTabs(props: TabsProps): boolean {
  return props.activeKey === undefined && props.defaultActiveKey !== undefined;
}
