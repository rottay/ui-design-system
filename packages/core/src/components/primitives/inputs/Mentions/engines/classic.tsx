'use client';

/**
 * @fileoverview Mentions Classic Engine - Rottay Design System.
 * Thin wrapper around Ant Design's Mentions component, forwarding every
 * prop from the unified MentionsProps contract without custom logic.
 *
 * @example
 * ```tsx
 * <Mentions engine="classic" options={users} prefix="@" onSelect={handleSelect} />
 * ```
 *
 * @module ClassicMentions
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import { Mentions as AntMentions } from 'antd';
import type { MentionsProps } from '../Mentions.types';

/**
 * Classic engine Mentions backed by Ant Design's Mentions component.
 * All mention detection, dropdown positioning, and keyboard navigation
 * are delegated to the underlying Ant Design implementation.
 *
 * @param props - Unified MentionsProps from the design system contract.
 * @param ref - Forwarded ref attached to the Ant Design textarea element.
 * @returns The rendered Ant Design Mentions component.
 */
export const Mentions = React.forwardRef<HTMLTextAreaElement, MentionsProps>(
  (props, ref) => {
    const {
      options,
      value,
      defaultValue,
      onChange,
      onSelect,
      onSearch,
      prefix,
      split,
      placeholder,
      disabled,
      readOnly,
      autoSize,
      rows,
      status,
      placement,
      notFoundContent,
      loading,
      filterOption,
      className,
      style,
    } = props;

    // Direct delegation to Ant Design; width defaults to 100% for layout consistency
    return (
      <AntMentions
        ref={ref as any}
        options={options}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onSelect={onSelect as any}
        onSearch={onSearch}
        prefix={prefix}
        split={split}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        autoSize={autoSize}
        rows={rows}
        status={status}
        placement={placement}
        notFoundContent={notFoundContent}
        loading={loading}
        filterOption={filterOption as any}
        className={className}
        style={{ width: '100%', ...style }}
      />
    );
  }
);

Mentions.displayName = 'Mentions.Classic';

export default Mentions;
