/**
 * Titan Select Engine
 *
 * Adapter that converts unified SelectProps to Ant Design Select.
 * Explicitly maps each prop to avoid type incompatibilities.
 */

'use client';

import { Select as AntSelect } from 'antd';
import type { SelectProps, SelectOption } from '../../../../types/components/select';

/**
 * Titan Select - Ant Design implementation with unified SelectProps
 */
function TitanSelect({
  value,
  defaultValue,
  options,
  placeholder,
  disabled,
  onChange,
  className,
  style,
  id,
  size,
  loading,
  allowClear,
  showSearch,
  filterOption,
  searchValue,
  onSearch,
  status,
  mode,
  maxTagCount,
  popupClassName,
  dropdownMatchSelectWidth,
  onFocus,
  onBlur,
  onDropdownVisibleChange,
  autoFocus,
  notFoundContent,
  virtual,
}: SelectProps) {
  // Handle onChange - map AntD option to unified SelectOption
  const handleChange = onChange
    ? (newValue: string | number | (string | number)[], option: unknown) => {
        // AntD option has { value, label, ... } - extract only what we need
        const mapOption = (opt: unknown): SelectOption | undefined => {
          if (!opt || typeof opt !== 'object') return undefined;
          const o = opt as { value?: string | number; label?: string };
          if (o.value === undefined) return undefined;
          return { value: o.value, label: o.label ?? String(o.value) };
        };

        const mappedOption = Array.isArray(option)
          ? option.map(mapOption).filter((o): o is SelectOption => o !== undefined)
          : mapOption(option);

        onChange(newValue, mappedOption);
      }
    : undefined;

  return (
    <AntSelect
      value={value}
      defaultValue={defaultValue}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      onChange={handleChange}
      className={className}
      style={style}
      id={id}
      size={size}
      loading={loading}
      allowClear={allowClear}
      showSearch={showSearch}
      filterOption={filterOption}
      searchValue={searchValue}
      onSearch={onSearch}
      status={status}
      mode={mode}
      maxTagCount={maxTagCount}
      popupClassName={popupClassName}
      popupMatchSelectWidth={dropdownMatchSelectWidth}
      onFocus={onFocus}
      onBlur={onBlur}
      onDropdownVisibleChange={onDropdownVisibleChange}
      autoFocus={autoFocus}
      notFoundContent={notFoundContent}
      virtual={virtual}
    />
  );
}

TitanSelect.displayName = 'TitanSelect';

export default TitanSelect;
