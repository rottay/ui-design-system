'use client';

/**
 * Mentions - Titan Engine (Ant Design)
 */
import React from 'react';
import { Mentions as AntMentions } from 'antd';
import type { MentionsProps } from '../../types';

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

Mentions.displayName = 'Mentions.Titan';

export default Mentions;
