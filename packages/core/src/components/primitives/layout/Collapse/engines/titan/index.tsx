'use client';

/**
 * Collapse - Titan Engine (Ant Design)
 */
import React from 'react';
import { Collapse as AntCollapse } from 'antd';
import type { CollapseProps, CollapsePanelProps } from '../../types';

export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  (props, ref) => {
    const {
      activeKey,
      defaultActiveKey,
      accordion,
      bordered,
      ghost,
      expandIconPosition,
      onChange,
      collapsible,
      size,
      children,
      className,
      style,
    } = props;

    return (
      <AntCollapse
        ref={ref}
        activeKey={activeKey}
        defaultActiveKey={defaultActiveKey}
        accordion={accordion}
        bordered={bordered}
        ghost={ghost}
        expandIconPosition={expandIconPosition}
        onChange={onChange}
        collapsible={collapsible}
        size={size}
        className={className}
        style={style}
      >
        {children}
      </AntCollapse>
    );
  }
);
Collapse.displayName = 'Collapse.Titan';

export const Panel = React.forwardRef<HTMLDivElement, CollapsePanelProps>(
  (props, _ref) => {
    const {
      panelKey = 'panel',
      header,
      disabled,
      showArrow,
      extra,
      forceRender,
      children,
      className,
      style,
    } = props;

    return (
      <AntCollapse.Panel
        key={panelKey}
        header={header}
        disabled={disabled}
        showArrow={showArrow}
        extra={extra}
        forceRender={forceRender}
        className={className}
        style={style}
      >
        {children}
      </AntCollapse.Panel>
    );
  }
);
Panel.displayName = 'Collapse.Panel.Titan';

export default Collapse;
