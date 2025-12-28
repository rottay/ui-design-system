'use client';

/**
 * @fileoverview Collapse Titan Engine - Rottay Design System
 * @description Titan (Ant Design) implementation of the Collapse compound component
 * with engine-agnostic token architecture for multi-tenant theming.
 *
 * @remarks
 * The Titan engine provides:
 * - **Token wrapper**: `.ds-collapse` wrapper for tenant customization
 * - **CSS Variables**: Dynamic styling via design tokens
 * - **Ant Design integration**: Full feature parity with underlying library
 * - **Theme inheritance**: Respects tenant color palette and spacing
 *
 * Architecture:
 * ```
 * <div class="ds-collapse" style="--ds-collapse-*">
 *   <AntCollapse>
 *     <AntCollapse.Panel />
 *   </AntCollapse>
 * </div>
 * ```
 *
 * The outer wrapper receives CSS custom properties, while inner Ant Design
 * components are styled via CSS that targets `.ds-collapse .ant-collapse-*`.
 *
 * @example Using Titan Engine with tokens
 * ```tsx
 * import { Collapse } from '@rottay/design-system';
 *
 * <Collapse engine="titan" accordion bordered>
 *   <Collapse.Panel engine="titan" header="Panel 1" panelKey="1">
 *     Ant Design styled content with tenant theming
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 *
 * @see {@link Collapse} - The main engine-aware component
 * @see {@link useCollapseTokens} - Token generation hook
 * @module Collapse/Engines/Titan
 * @category Layout
 * @package @rottay/design-system
 */
import React, { useMemo } from 'react';
import { Collapse as AntCollapse } from 'antd';
import type { CollapseProps, CollapsePanelProps } from '../../types';
import { useCollapseTokens } from '../../../../../../system/hooks/components';

/**
 * Titan (Ant Design) implementation of Collapse with token architecture.
 *
 * Wraps Ant Design's Collapse in a `.ds-collapse` container that receives
 * CSS custom properties for theming. This enables tenant-specific styling
 * without modifying the underlying Ant Design components.
 */
export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  (props, ref) => {
    const {
      activeKey,
      defaultActiveKey,
      accordion,
      bordered = true,
      ghost,
      expandIconPosition,
      onChange,
      collapsible,
      size = 'middle',
      children,
      className,
      style,
    } = props;

    // Generate tokens using the hook
    const { rootStyle, classNames } = useCollapseTokens({
      variant: ghost ? 'ghost' : bordered ? 'bordered' : 'default',
      size,
      ghost,
      bordered,
      className,
      style,
    });

    return (
      <div ref={ref} className={classNames.root} style={rootStyle}>
        <AntCollapse
          activeKey={activeKey}
          defaultActiveKey={defaultActiveKey}
          accordion={accordion}
          bordered={bordered}
          ghost={ghost}
          expandIconPosition={expandIconPosition}
          onChange={onChange}
          collapsible={collapsible}
          size={size}
        >
          {children}
        </AntCollapse>
      </div>
    );
  }
);
Collapse.displayName = 'Collapse.Titan';

/**
 * Titan (Ant Design) implementation of Collapse.Panel with token architecture.
 *
 * Panel components work within the token context established by the parent
 * Collapse wrapper, inheriting CSS custom property values.
 */
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

    // Generate panel-specific class names
    const panelClassNames = useMemo(
      () =>
        [
          'ds-collapse-panel',
          disabled && 'ds-collapse-panel--disabled',
          className,
        ]
          .filter(Boolean)
          .join(' '),
      [disabled, className]
    );

    return (
      <AntCollapse.Panel
        key={panelKey}
        header={header}
        disabled={disabled}
        showArrow={showArrow}
        extra={extra}
        forceRender={forceRender}
        className={panelClassNames}
        style={style}
      >
        {children}
      </AntCollapse.Panel>
    );
  }
);
Panel.displayName = 'Collapse.Panel.Titan';

export default Collapse;
