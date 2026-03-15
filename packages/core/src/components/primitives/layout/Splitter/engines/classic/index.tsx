'use client';

/**
 * @fileoverview Splitter Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Splitter compound component.
 * Wraps Ant Design's Splitter component with full feature parity.
 *
 * @remarks
 * The Classic engine provides:
 * - Direct passthrough to Ant Design Splitter and Panel components
 * - Full Ant Design styling and theming support
 * - Native resizable panels with smooth drag handling
 * - Collapsible panel support
 * - Size constraints (min/max)
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Splitter } from '@rottay/design-system';
 *
 * <Splitter engine="classic" layout="horizontal">
 *   <Splitter.Panel engine="classic" defaultSize={30} min={100}>
 *     Sidebar
 *   </Splitter.Panel>
 *   <Splitter.Panel engine="classic">
 *     Main Content
 *   </Splitter.Panel>
 * </Splitter>
 * ```
 *
 * @see {@link Splitter} - The main engine-aware component
 * @module Splitter/Engines/Classic
 * @category Layout
 * @package @rottay/design-system
 */
import React from 'react';
import { Splitter as AntSplitter } from 'antd';
import type { SplitterProps, SplitterPanelProps } from '../../Splitter.types';

export const Splitter = React.forwardRef<HTMLDivElement, SplitterProps>(
  (props, _ref) => {
    const { layout, onResize, onResizeStart, onResizeEnd, children, className, style } = props;
    return (
      <AntSplitter
        layout={layout}
        onResize={onResize}
        onResizeStart={onResizeStart}
        onResizeEnd={onResizeEnd}
        className={className}
        style={style}
      >
        {children}
      </AntSplitter>
    );
  }
);
Splitter.displayName = 'Splitter.Classic';

export const Panel = React.forwardRef<HTMLDivElement, SplitterPanelProps>(
  (props, _ref) => {
    const { defaultSize, min, max, collapsible, resizable, children, className, style } = props;
    return (
      <AntSplitter.Panel
        defaultSize={defaultSize}
        min={min}
        max={max}
        collapsible={collapsible}
        resizable={resizable}
        className={className}
        style={style}
      >
        {children}
      </AntSplitter.Panel>
    );
  }
);
Panel.displayName = 'Splitter.Panel.Classic';

export default Splitter;
