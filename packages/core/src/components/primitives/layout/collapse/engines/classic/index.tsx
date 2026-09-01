'use client';

/**
 * @fileoverview Collapse Classic Engine - Rottay Design System.
 * Ant Design implementation of the Collapse compound component. Wraps
 * AntCollapse in a `.ds-collapse` token container that receives CSS custom
 * properties for multi-tenant theming via `useCollapseTokens`.
 *
 * @example
 * ```tsx
 * <Collapse engine="classic" accordion bordered>
 *   <Collapse.Panel engine="classic" header="Panel 1" panelKey="1">
 *     Ant Design styled content with tenant theming
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 *
 * @see {@link useCollapseTokens} - Token generation hook
 * @module Collapse/Engines/Classic
 * @category Layout
 * @package @rottay/design-system
 */
import React, { useMemo } from 'react';
import { Collapse as AntCollapse } from 'antd';
import type { CollapseProps, CollapsePanelProps } from '../../contracts';
import { useCollapseTokens } from '../../runtime/tokens';
import { toLegacySize } from '../../../../../../foundation/contracts/kernel/common';

/**
 * Converts JSX `<Collapse.Panel>` children into the `items` array format
 * expected by Ant Design's Collapse component (v5+ items API).
 *
 * Filters out non-element children and elements whose displayName does not
 * start with "Collapse.Panel", ensuring only valid panel children are rendered.
 * The `disabled` prop is translated to Ant's `collapsible: 'disabled'` API.
 */
function convertCollapseChildren(children: React.ReactNode): NonNullable<React.ComponentProps<typeof AntCollapse>['items']> {
  return React.Children.toArray(children).flatMap((child) => {
    // Skip text nodes, null, and other non-element children
    if (!React.isValidElement(child)) {
      return [];
    }

    // Identify panel components by displayName rather than direct reference
    // so that any engine's Panel component can be recognized
    const displayName =
      typeof child.type === 'string'
        ? child.type
        : ((child.type as { displayName?: string }).displayName ?? '');

    if (!displayName.startsWith('Collapse.Panel')) {
      return [];
    }

    const panelProps = child.props as CollapsePanelProps;

    return [{
      key: panelProps.panelKey ?? 'panel',
      label: panelProps.header,
      children: panelProps.children,
      extra: panelProps.extra,
      showArrow: panelProps.showArrow,
      forceRender: panelProps.forceRender,
      collapsible: panelProps.disabled ? 'disabled' : undefined,
      className: [
        'ds-collapse-panel',
        panelProps.disabled && 'ds-collapse-panel--disabled',
        panelProps.className,
      ]
        .filter(Boolean)
        .join(' '),
      style: panelProps.style,
    }];
  });
}

/**
 * Classic (Ant Design) Collapse with token-based theming.
 *
 * Wraps Ant Design's Collapse in a `.ds-collapse` container that receives
 * CSS custom properties for theming. This enables tenant-specific styling
 * without modifying the underlying Ant Design components.
 *
 * @param props - {@link CollapseProps} including accordion, bordered, ghost, size, and children.
 * @returns A token-wrapped Ant Design Collapse component.
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
      size: sizeProp = 'middle',
      children,
      className,
      style,
    } = props;

    // AntCollapse and useCollapseTokens key their size lookups by the legacy
    // 'small' | 'middle' | 'large' spelling; toLegacySize resolves either spelling to it.
    const size = toLegacySize(sizeProp);

    // Derive variant from boolean flags for token resolution:
    // ghost takes priority, then bordered, then default
    const { rootStyle, classNames } = useCollapseTokens({
      variant: ghost ? 'ghost' : bordered ? 'bordered' : 'default',
      size,
      ghost,
      bordered,
      className,
      style,
    });

    // Convert JSX Panel children to Ant's items API; memoized to avoid
    // re-converting on every render when only activeKey changes
    const items = useMemo(() => convertCollapseChildren(children), [children]);

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
          items={items.length > 0 ? items : undefined}
        />
      </div>
    );
  }
);
Collapse.displayName = 'Collapse.Classic';

/**
 * Classic (Ant Design) Collapse Panel.
 *
 * Renders an individual Ant Design Collapse.Panel with DS class names.
 * Note: In practice, the parent Collapse converts Panel children into the
 * items API via `convertCollapseChildren`, so this component mainly serves
 * as a declarative authoring surface and fallback for direct rendering.
 *
 * @param props - {@link CollapsePanelProps} with panelKey, header, disabled, and content.
 * @returns An Ant Design Collapse.Panel wrapped with DS class names.
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

    // Build BEM-style class names; disabled state adds a modifier class
    // for CSS targeting within the .ds-collapse token wrapper
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
Panel.displayName = 'Collapse.Panel.Classic';

export default Collapse;
