'use client';

/**
 * TreeSelect - Classic Engine (Ant Design)
 */
import React from 'react';
import { TreeSelect as AntTreeSelect } from 'antd';
import type { TreeSelectProps } from '../TreeSelect.types';

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
          size={size}
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
