/**
 * Titan AutoComplete Engine
 *
 * Adapter that converts unified AutoCompleteProps to Ant Design AutoComplete.
 */

'use client';

import { AutoComplete as AntAutoComplete } from 'antd';
import type {
  AutoCompleteProps,
  AutoCompleteOption,
  AutoCompleteOptionGroup,
} from '../../../../types/components/autocomplete';
import { isOptionGroup, isStringOption } from '../../../../types/components/autocomplete';

/**
 * AntD option type
 */
type AntOption = {
  value: string | number;
  label?: React.ReactNode;
  disabled?: boolean;
  options?: AntOption[];
};

/**
 * Convert unified options to AntD format
 */
function convertOptions(
  options?: (AutoCompleteOption | AutoCompleteOptionGroup | string)[]
): AntOption[] {
  if (!options) return [];

  return options.map((opt): AntOption => {
    if (isStringOption(opt)) {
      return { value: opt };
    }
    if (isOptionGroup(opt)) {
      // For option groups, we use a placeholder value (AntD expects value)
      // but the nested options are what gets rendered/selected
      return {
        value: `__group_${String(opt.label)}`,
        label: opt.label,
        options: opt.options.map((o) => ({
          value: o.value,
          label: o.label,
          disabled: o.disabled,
        })),
      };
    }
    return {
      value: opt.value,
      label: opt.label,
      disabled: opt.disabled,
    };
  });
}

/**
 * Titan AutoComplete - Ant Design implementation with unified AutoCompleteProps
 */
function TitanAutoComplete({
  value,
  defaultValue,
  options,
  placeholder,
  disabled,
  size,
  status,
  allowClear,
  bordered,
  variant,
  open,
  defaultOpen,
  popupPlacement,
  popupClassName,
  popupMatchSelectWidth,
  notFoundContent,
  getPopupContainer,
  autoFocus,
  defaultActiveFirstOption,
  backfill,
  filterOption,
  onChange,
  onSelect,
  onDropdownVisibleChange,
  onFocus,
  onBlur,
  onSearch,
  onClear,
  onKeyDown,
  className,
  style,
  id,
  listHeight,
  children,
}: AutoCompleteProps) {
  const antOptions = convertOptions(options);

  // Handle unified onSelect
  const handleSelect = onSelect
    ? (val: string | number, option: { value: string | number; label?: React.ReactNode }) => {
        onSelect(val, { value: option.value, label: option.label });
      }
    : undefined;

  // Handle filterOption conversion
  const antFilterOption =
    filterOption === true || filterOption === false
      ? filterOption
      : filterOption
        ? (inputValue: string, option: { value?: string | number; label?: React.ReactNode } | undefined) => {
            if (!option) return false;
            return filterOption(inputValue, {
              value: option.value ?? '',
              label: option.label,
            });
          }
        : undefined;

  return (
    <AntAutoComplete
      value={value}
      defaultValue={defaultValue}
      options={antOptions}
      placeholder={placeholder}
      disabled={disabled}
      size={size}
      status={status}
      allowClear={allowClear}
      bordered={bordered}
      variant={variant}
      open={open}
      defaultOpen={defaultOpen}
      placement={popupPlacement}
      popupClassName={popupClassName}
      popupMatchSelectWidth={popupMatchSelectWidth}
      notFoundContent={notFoundContent}
      getPopupContainer={getPopupContainer}
      autoFocus={autoFocus}
      defaultActiveFirstOption={defaultActiveFirstOption}
      backfill={backfill}
      filterOption={antFilterOption}
      onChange={onChange}
      onSelect={handleSelect}
      onDropdownVisibleChange={onDropdownVisibleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onSearch={onSearch}
      onClear={onClear}
      onKeyDown={onKeyDown}
      className={className}
      style={style}
      id={id}
      listHeight={listHeight}
    >
      {children}
    </AntAutoComplete>
  );
}

TitanAutoComplete.displayName = 'TitanAutoComplete';

export default TitanAutoComplete;
