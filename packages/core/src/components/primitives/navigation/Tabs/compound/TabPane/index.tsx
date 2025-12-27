/**
 * Tabs.TabPane - Compound Component
 *
 * Used for declarative tab content definition.
 * Alternative to the `items` prop approach.
 *
 * @example
 * ```tsx
 * <Tabs>
 *   <Tabs.TabPane tab="Tab 1" key="1">Content 1</Tabs.TabPane>
 *   <Tabs.TabPane tab="Tab 2" key="2">Content 2</Tabs.TabPane>
 * </Tabs>
 * ```
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';

export interface TabPaneProps {
  /** Tab label */
  tab: ReactNode;
  /** Unique key for the tab */
  key?: string;
  /** Tab content */
  children?: ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Force render content even when inactive */
  forceRender?: boolean;
  /** Close icon for closable tabs */
  closeIcon?: ReactNode;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

export const TabPane = forwardRef<HTMLDivElement, TabPaneProps>(
  (props, ref) => {
    const { children, className = '', style = {} } = props;

    return (
      <div ref={ref} className={`rottay-tabs-tabpane ${className}`} style={style}>
        {children}
      </div>
    );
  }
);

TabPane.displayName = 'Tabs.TabPane';

export default TabPane;
