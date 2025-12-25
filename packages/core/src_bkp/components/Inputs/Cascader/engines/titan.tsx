/**
 * Titan Cascader Engine
 *
 * Adapter that converts unified CascaderProps to Ant Design Cascader.
 */

'use client';

import { Cascader as AntCascader } from 'antd';
import type { CascaderProps, CascaderOption, CascaderValue } from '../../../../types/components/cascader';

/**
 * Titan Cascader - Ant Design implementation with unified CascaderProps
 */
function TitanCascader({
  options,
  value,
  defaultValue,
  placeholder,
  disabled,
  multiple,
  showCheckedStrategy,
  changeOnSelect,
  size,
  status,
  allowClear,
  bordered,
  variant,
  showSearch,
  suffixIcon,
  expandIcon,
  maxTagCount,
  maxTagPlaceholder,
  displayRender,
  fieldNames,
  open,
  placement,
  popupClassName,
  expandTrigger,
  getPopupContainer,
  notFoundContent,
  loadData,
  onChange,
  onDropdownVisibleChange,
  onSearch,
  onFocus,
  onBlur,
  className,
  style,
  id,
  autoFocus,
  dropdownRender,
  tagRender,
}: CascaderProps) {
  // Handle onChange - convert to unified format
  const handleChange = onChange
    ? (val: CascaderValue, selectedOptions: CascaderOption[] | CascaderOption[][]) => {
        onChange(val, selectedOptions);
      }
    : undefined;

  // Convert showCheckedStrategy to AntD format
  const antShowCheckedStrategy = showCheckedStrategy
    ? showCheckedStrategy === 'SHOW_PARENT'
      ? AntCascader.SHOW_PARENT
      : AntCascader.SHOW_CHILD
    : undefined;

  return (
    <AntCascader
      options={options}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      multiple={multiple}
      showCheckedStrategy={antShowCheckedStrategy}
      changeOnSelect={changeOnSelect}
      size={size}
      status={status}
      allowClear={allowClear}
      bordered={bordered}
      variant={variant}
      showSearch={showSearch}
      suffixIcon={suffixIcon}
      expandIcon={expandIcon}
      maxTagCount={maxTagCount}
      maxTagPlaceholder={maxTagPlaceholder}
      displayRender={displayRender}
      fieldNames={fieldNames}
      open={open}
      placement={placement}
      popupClassName={popupClassName}
      expandTrigger={expandTrigger}
      getPopupContainer={getPopupContainer}
      notFoundContent={notFoundContent}
      loadData={loadData}
      onChange={handleChange}
      onDropdownVisibleChange={onDropdownVisibleChange}
      onSearch={onSearch}
      onFocus={onFocus}
      onBlur={onBlur}
      className={className}
      style={style}
      id={id}
      autoFocus={autoFocus}
      dropdownRender={dropdownRender}
      tagRender={tagRender}
    />
  );
}

TitanCascader.displayName = 'TitanCascader';

export default TitanCascader;
