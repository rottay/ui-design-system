'use client';

/**
 * Cascader - Classic Engine (Ant Design)
 */
import React from 'react';
import { Cascader as AntCascader } from 'antd';
import type { CascaderProps } from '../../types';

export const Cascader = React.forwardRef<HTMLDivElement, CascaderProps>(
  (props, ref) => {
    const {
      options,
      value,
      defaultValue,
      onChange,
      displayRender,
      expandTrigger,
      multiple,
      placeholder,
      disabled,
      showSearch,
      allowClear,
      size,
      notFoundContent,
      loading,
      status,
      open,
      onDropdownVisibleChange,
      maxTagCount,
      fieldNames,
      className,
      style,
      popupClassName,
    } = props;

    const popupClassNames = popupClassName
      ? ({ popup: { root: popupClassName } } as const)
      : undefined;

    return (
      <div ref={ref} className={className} style={style}>
        <AntCascader
          options={options as any}
          value={value as any}
          defaultValue={defaultValue as any}
          onChange={onChange as any}
          displayRender={displayRender as any}
          expandTrigger={expandTrigger}
          multiple={multiple}
          placeholder={placeholder}
          disabled={disabled}
          showSearch={showSearch}
          allowClear={allowClear}
          size={size}
          notFoundContent={notFoundContent}
          loading={loading}
          status={status}
          open={open}
          onOpenChange={onDropdownVisibleChange}
          maxTagCount={maxTagCount}
          fieldNames={fieldNames}
          classNames={popupClassNames as any}
          style={{ width: '100%' }}
        />
      </div>
    );
  }
);

Cascader.displayName = 'Cascader.Classic';

export default Cascader;
