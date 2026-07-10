'use client';

/**
 * @fileoverview AutoComplete Classic engine -- thin wrapper around Ant Design's AutoComplete.
 * Delegates all filtering, keyboard navigation, and dropdown rendering to Ant Design,
 * keeping this layer focused on prop normalization for the DS contract.
 *
 * @example
 * ```tsx
 * <AutoComplete engine="classic" options={cities} onSearch={fetchCities} />
 * ```
 *
 * @module ClassicAutoComplete
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import { AutoComplete as AntAutoComplete } from 'antd';
import type { AutoCompleteProps } from '../AutoComplete.types';
import { toLegacySize } from '../../../../../contracts/common';

/**
 * Classic (Ant Design) implementation of the AutoComplete input.
 *
 * Wraps `antd/AutoComplete` and maps Rottay DS props (e.g. `onDropdownVisibleChange`)
 * to the Ant Design API (e.g. `onOpenChange`). A container `<div>` is rendered around
 * the Ant component so the forwarded ref always resolves to a plain DOM element,
 * avoiding Ant's internal class-component ref.
 *
 * @param props - Standardized AutoCompleteProps from the DS type contract.
 * @param ref   - Forwarded ref attached to the outer wrapper div.
 * @returns A controlled or uncontrolled autocomplete input rendered via Ant Design.
 */
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

    // Ant Design v5 renamed `popupClassName` to a nested `classNames.popup.root`
    // structure. We translate the DS flat prop to the nested format so consumers
    // do not need to know about Ant's internal class-names API.
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
          // Cast required because Ant expects its own FilterOption type which is
          // structurally compatible but nominally different from the DS type.
          filterOption={filterOption as any}
          placeholder={placeholder}
          disabled={disabled}
          allowClear={allowClear}
          autoFocus={autoFocus}
          defaultOpen={defaultOpen}
          open={open}
          // DS uses `onDropdownVisibleChange` while Ant v5 renamed to `onOpenChange`.
          onOpenChange={onDropdownVisibleChange}
          size={toLegacySize(size)}
          status={status}
          notFoundContent={notFoundContent}
          classNames={popupClassNames as any}
          popupMatchSelectWidth={popupMatchSelectWidth}
          // Force full-width so the input stretches to its container,
          // matching the modern and rustic engines' default behavior.
          style={{ width: '100%' }}
        />
      </div>
    );
  }
);

AutoComplete.displayName = 'AutoComplete.Classic';

export default AutoComplete;
