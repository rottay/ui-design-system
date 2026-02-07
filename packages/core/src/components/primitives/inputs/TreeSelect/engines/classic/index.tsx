'use client';

/**
 * TreeSelect - Classic Engine (Ant Design)
 */
import React from 'react';
import { TreeSelect as AntTreeSelect } from 'antd';
import type { TreeSelectProps } from '../../types';

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
      className,
      style,
      popupClassName,
    } = props;

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
          onTreeExpand={onTreeExpand}
          placeholder={placeholder}
          disabled={disabled}
          allowClear={allowClear}
          size={size}
          maxTagCount={maxTagCount}
          status={status}
          notFoundContent={notFoundContent}
          loading={loading}
          open={open}
          onDropdownVisibleChange={onDropdownVisibleChange}
          fieldNames={fieldNames}
          treeLine={treeLine}
          popupClassName={popupClassName}
          style={{ width: '100%' }}
        />
      </div>
    );
  }
);

TreeSelect.displayName = 'TreeSelect.Classic';

export default TreeSelect;
