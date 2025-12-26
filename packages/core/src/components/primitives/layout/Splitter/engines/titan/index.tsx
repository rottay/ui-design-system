'use client';

/**
 * Splitter - Titan Engine (Ant Design)
 */
import React from 'react';
import { Splitter as AntSplitter } from 'antd';
import type { SplitterProps, SplitterPanelProps } from '../../types';

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
Splitter.displayName = 'Splitter.Titan';

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
Panel.displayName = 'Splitter.Panel.Titan';

export default Splitter;
