'use client';

/**
 * AutoComplete - Classic Engine (Ant Design)
 */
import React from 'react';
import { AutoComplete as AntAutoComplete } from 'antd';
import type { AutoCompleteProps } from '../AutoComplete.types';

export const AutoComplete = React.forwardRef<HTMLDivElement, AutoCompleteProps>(
  (props, ref) => {
    const {
      options,
      value,
      defaultValue,
      onChange,
      onSearch,
      onSelect,
      filterOption,
      placeholder,
      disabled,
      allowClear,
      autoFocus,
      defaultOpen,
      open,
      onDropdownVisibleChange,
      size,
      status,
      notFoundContent,
      popupClassName,
      popupMatchSelectWidth,
      className,
      style,
    } = props;

    const popupClassNames = popupClassName
      ? ({ popup: { root: popupClassName } } as const)
      : undefined;

    return (
      <div ref={ref} className={className} style={style}>
        <AntAutoComplete
          options={options}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onSearch={onSearch}
          onSelect={onSelect}
          filterOption={filterOption as any}
          placeholder={placeholder}
          disabled={disabled}
          allowClear={allowClear}
          autoFocus={autoFocus}
          defaultOpen={defaultOpen}
          open={open}
          onOpenChange={onDropdownVisibleChange}
          size={size}
          status={status}
          notFoundContent={notFoundContent}
          classNames={popupClassNames as any}
          popupMatchSelectWidth={popupMatchSelectWidth}
          style={{ width: '100%' }}
        />
      </div>
    );
  }
);

AutoComplete.displayName = 'AutoComplete.Classic';

export default AutoComplete;
