'use client';

/**
 * @fileoverview TagInput Classic Engine - Rottay Design System
 * @description Ant Design implementation of the TagInput component.
 * Uses Ant Design Select with mode="tags".
 *
 * @module TagInput/Engines/Classic
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useCallback, useId } from 'react';
import { Select as AntSelect } from 'antd';
import type { TagInputProps } from '../TagInput.types';
import { TAGINPUT_DEFAULTS } from '../TagInput.types';

const ANT_SIZE_MAP = {
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
};

export default function ClassicTagInput(props: TagInputProps): React.ReactElement {
  const {
    value = [],
    onChange,
    placeholder = 'Type and press Enter',
    maxTags,
    allowDuplicates = TAGINPUT_DEFAULTS.allowDuplicates,
    disabled = TAGINPUT_DEFAULTS.disabled,
    size = TAGINPUT_DEFAULTS.size,
    error = TAGINPUT_DEFAULTS.error,
    errorMessage,
    className,
    style,
    id: providedId,
    autoFocus,
    validateTag,
  } = props;

  const generatedId = useId();
  const inputId = providedId || `taginput-classic-${generatedId}`;

  const handleChange = useCallback((newValues: string[]) => {
    if (maxTags && newValues.length > maxTags) return;

    const lastValue = newValues[newValues.length - 1];
    if (lastValue && !allowDuplicates && value.includes(lastValue)) return;
    if (lastValue && validateTag && !validateTag(lastValue)) return;

    onChange?.(newValues);
  }, [maxTags, allowDuplicates, value, onChange, validateTag]);

  return (
    <div className={`rottay-taginput-classic ${className || ''}`} style={style}>
      <AntSelect
        id={inputId}
        mode="tags"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        size={ANT_SIZE_MAP[size]}
        status={error ? 'error' : undefined}
        style={{ width: '100%' }}
        tokenSeparators={[',']}
        open={false}
        suffixIcon={null}
        autoFocus={autoFocus}
        maxCount={maxTags}
      />
      {error && errorMessage && (
        <span style={{ fontSize: 12, color: 'var(--ds-color-error-500, #ff4d4f)', marginTop: 4, display: 'block' }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}

ClassicTagInput.displayName = 'TagInput.Classic';
