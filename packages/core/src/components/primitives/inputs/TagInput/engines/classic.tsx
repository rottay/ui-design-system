'use client';

/**
 * @fileoverview Classic engine for TagInput, powered by Ant Design's Select in `mode="tags"`.
 * Delegates tag creation, removal, and keyboard handling to AntSelect, keeping the
 * implementation thin while exposing duplicate/validation guards on top.
 *
 * @example
 * ```tsx
 * <TagInput engine="classic" maxTags={5} validateTag={(t) => t.length > 1} />
 * ```
 *
 * @module TagInput/Engines/Classic
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useCallback, useId } from 'react';
import { Select as AntSelect } from 'antd';
import type { TagInputProps } from '../TagInput.types';
import { TAGINPUT_DEFAULTS } from '../TagInput.types';

/** Maps DS size tokens to Ant Design's expected size literals. */
const ANT_SIZE_MAP = {
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
};

/**
 * Classic (Ant Design) implementation of TagInput.
 *
 * Leverages `AntSelect mode="tags"` with `open={false}` so the dropdown never shows --
 * the component behaves purely as a tag creator, not a picker. Comma is configured as
 * the token separator, and `maxCount` enforces the tag limit at the Ant level.
 *
 * @param props - Standard TagInputProps shared across all engines.
 * @returns A wrapped AntSelect configured for tag-only input with optional error display.
 */
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

  // Stable fallback id prevents SSR hydration mismatches
  const generatedId = useId();
  const inputId = providedId || `taginput-classic-${generatedId}`;

  const handleChange = useCallback((newValues: string[]) => {
    // Guard: enforce maxTags ceiling before propagating
    if (maxTags && newValues.length > maxTags) return;

    // Only the newly-added value needs duplicate/validation checks;
    // existing values were already validated on prior additions.
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
      {/* Error message renders below the input, matching Ant Form.Item positioning */}
      {error && errorMessage && (
        <span style={{ fontSize: 12, color: 'var(--ds-color-error-500, #ff4d4f)', marginTop: 4, display: 'block' }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}

ClassicTagInput.displayName = 'TagInput.Classic';
