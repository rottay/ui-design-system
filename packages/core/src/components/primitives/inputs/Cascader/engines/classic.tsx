'use client';

/**
 * @fileoverview Cascader Classic Engine - Rottay Design System.
 * Wraps Ant Design's Cascader, forwarding the DS prop interface to the
 * underlying AntCascader. Provides hierarchical option selection with
 * built-in search, async loading, and keyboard navigation from Ant Design.
 *
 * @example
 * ```tsx
 * <Cascader engine="classic" options={provinces} onChange={handleChange} />
 * ```
 *
 * @module Cascader/Engines/Classic
 * @category Inputs
 * @package @rottay/design-system
 */
import React from 'react';
import { Cascader as AntCascader } from 'antd';
import type { CascaderProps } from '../Cascader.types';

/**
 * Classic Cascader component backed by Ant Design.
 *
 * Destructures the DS-level CascaderProps and maps them to Ant Design's API.
 * The wrapper `<div>` exists solely to attach the forwarded ref, since Ant
 * Design's Cascader does not directly accept a ref to a DOM element.
 *
 * @param props - {@link CascaderProps}
 * @returns A div-wrapped Ant Design Cascader
 */
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

    // Ant Design v5 uses classNames.popup.root instead of popupClassName.
    // This adapter bridges the DS-level flat prop to the nested structure.
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
          // Full width by default so the cascader fills its container
          style={{ width: '100%' }}
        />
      </div>
    );
  }
);

Cascader.displayName = 'Cascader.Classic';

export default Cascader;
