'use client';

/**
 * @fileoverview TreeSelect Classic Engine -- Ant Design adapter for the Rottay
 * Design System. Delegates all rendering, keyboard navigation, and accessibility
 * to Ant Design's `<TreeSelect>` while mapping the DS-neutral TreeSelectProps.
 *
 * @example
 * ```tsx
 * <TreeSelect engine="classic" treeData={nodes} placeholder="Pick a node" />
 * ```
 *
 * @module ClassicTreeSelect
 * @category Inputs
 * @package @rottay/design-system
 */
import React from 'react';
import { TreeSelect as AntTreeSelect } from 'antd';
import type { TreeSelectProps } from '../TreeSelect.types';
import { toLegacySize } from '../../../../../contracts/common';

/**
 * Classic (Ant Design) engine for the TreeSelect component.
 *
 * Thin wrapper that forwards every standardized DS prop straight to
 * `antd/TreeSelect`. Type casts (`as any`) bridge minor contract differences
 * between the DS interface and Ant Design's internal rc-tree types without
 * affecting runtime behaviour.
 *
 * @param props - Standardized TreeSelectProps from the design system contract.
 * @param ref   - Forwarded ref attached to the outer `<div>` wrapper.
 * @returns The rendered Ant Design TreeSelect inside a ref-able container.
 */
export const TreeSelect = React.forwardRef<HTMLDivElement, TreeSelectProps>(
  (props, ref) => {
    const {
      treeData,
      value,
      defaultValue,
      onChange,
      multiple,
      treeCheckable,
      treeCheckStrictly,
      showSearch,
      filterTreeNode,
      treeDefaultExpandAll,
      treeDefaultExpandedKeys,
      treeExpandedKeys,
      onTreeExpand,
      placeholder,
      disabled,
      allowClear,
      size,
      maxTagCount,
      status,
      notFoundContent,
      loading,
      open,
      onDropdownVisibleChange,
      fieldNames,
      treeLine,
      loadData,
      className,
      style,
      popupClassName,
    } = props;

    // Ant Design v5+ uses a `classNames` prop with a nested `popup.root` key
    // instead of a flat `popupClassName`, so we restructure when provided.
    const popupClassNames = popupClassName
      ? ({ popup: { root: popupClassName } } as const)
      : undefined;

    return (
      <div ref={ref} className={className} style={style}>
        <AntTreeSelect
          treeData={treeData as any}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange as any}
          multiple={multiple}
          treeCheckable={treeCheckable}
          treeCheckStrictly={treeCheckStrictly}
          showSearch={showSearch}
          filterTreeNode={filterTreeNode as any}
          treeDefaultExpandAll={treeDefaultExpandAll}
          treeDefaultExpandedKeys={treeDefaultExpandedKeys}
          treeExpandedKeys={treeExpandedKeys}
          /**
           * Ant Design's rc-tree uses a narrower internal safe-key type than
           * our public DS contract. The values we pass are still string/number
           * keys, so this cast only bridges that library boundary.
           */
          onTreeExpand={onTreeExpand as any}
          placeholder={placeholder}
          disabled={disabled}
          allowClear={allowClear}
          size={toLegacySize(size)}
          maxTagCount={maxTagCount}
          status={status}
          notFoundContent={notFoundContent}
          loading={loading}
          open={open}
          onOpenChange={onDropdownVisibleChange}
          fieldNames={fieldNames}
          treeLine={treeLine}
          loadData={loadData as any}
          classNames={popupClassNames as any}
          style={{ width: '100%' }}
        />
      </div>
    );
  }
);

TreeSelect.displayName = 'TreeSelect.Classic';

export default TreeSelect;
