'use client';

/**
 * @fileoverview Rustic (zero-dependency) engine for TagInput, using pure HTML and inline CSS.
 * Provides the same tag-creation UX as Modern but without any framework dependency,
 * making it suitable for lightweight or SSR-only contexts where DaisyUI is not loaded.
 *
 * @example
 * ```tsx
 * <TagInput engine="rustic" maxTags={8} allowDuplicates={false} />
 * ```
 *
 * @module TagInput/Engines/Rustic
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback, useId, useRef } from 'react';

import type { TagInputProps } from '../../contracts';
import { TAGINPUT_DEFAULTS } from '../../contracts';

/** Per-size visual tokens controlling container height, font, and tag chip padding. */
const SIZE_STYLES: Record<string, { minHeight: number; fontSize: number; tagPadding: string }> = {
  sm: { minHeight: 32, fontSize: 13, tagPadding: '2px 6px' },
  md: { minHeight: 40, fontSize: 14, tagPadding: '3px 8px' },
  lg: { minHeight: 48, fontSize: 16, tagPadding: '4px 10px' },
};

/**
 * Rustic (vanilla HTML/CSS) implementation of TagInput.
 *
 * All non-paint layout is handled through inline CSSProperties; border,
 * background, and the focus ring are painted by the unlayered skin CSS from
 * native `:focus`/`:has()` and the `data-error`/`data-disabled` attributes.
 *
 * @param props - Standard TagInputProps shared across all engines.
 * @returns A styled container of tag chips with an inline text input and optional error span.
 */
export default function RusticTagInput(props: TagInputProps): React.ReactElement {
  const {
    value = [],
    onChange,
    placeholder = 'Type and press Enter',
    maxTags,
    allowDuplicates = TAGINPUT_DEFAULTS.allowDuplicates,
    separator = TAGINPUT_DEFAULTS.separator,
    disabled = TAGINPUT_DEFAULTS.disabled,
    size = TAGINPUT_DEFAULTS.size,
    error = TAGINPUT_DEFAULTS.error,
    errorMessage,
    className = '',
    style,
    id: providedId,
    name,
    autoFocus,
    onRemove,
    validateTag,
  } = props;

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = providedId || `taginput-rustic-${generatedId}`;
  const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.md;

  /** Validates and appends a single tag, enforcing max/duplicate/custom rules. */
  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (maxTags && value.length >= maxTags) return;
    if (!allowDuplicates && value.includes(trimmed)) return;
    if (validateTag && !validateTag(trimmed)) return;
    onChange?.([...value, trimmed]);
  }, [value, maxTags, allowDuplicates, onChange, validateTag]);

  /** Removes tag at index and fires both onChange and the dedicated onRemove callback. */
  const removeTag = useCallback((index: number) => {
    const tag = value[index];
    const newTags = value.filter((_, i) => i !== index);
    onChange?.(newTags);
    onRemove?.(tag, index);
  }, [value, onChange, onRemove]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === separator) {
      e.preventDefault();
      addTag(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Empty input + Backspace removes the last tag for quick correction
      removeTag(value.length - 1);
    }
  }, [inputValue, separator, addTag, value, removeTag]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // When the separator appears mid-string (e.g. paste), split into individual tags
    if (val.includes(separator)) {
      const parts = val.split(separator);
      parts.forEach((part) => addTag(part));
      setInputValue('');
    } else {
      setInputValue(val);
    }
  }, [separator, addTag]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    minHeight: sizeConfig.minHeight,
    padding: '4px 8px',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.6 : 1,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'var(--ds-font-family-base, inherit)',
    ...style,
  };

  /** Each tag chip uses compact padding; color comes from the skin. */
  const tagStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: sizeConfig.tagPadding,
    fontSize: sizeConfig.fontSize - 2,
    lineHeight: 1.4,
    userSelect: 'none',
  };

  return (
    <div className={`rottay-taginput-rustic ${className}`}>
      <div
        className="ds-tag-input ds-tag-input--rustic"
        data-part="root"
        data-error={error ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        style={containerStyle}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          <span key={`${tag}-${index}`} data-part="tag-chip" style={tagStyle}>
            {tag}
            {!disabled && (
              <button
                type="button"
                data-part="tag-remove"
                onClick={(e) => { e.stopPropagation(); removeTag(index); }}
                aria-label={`Remove ${tag}`}
                style={{
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: sizeConfig.fontSize - 2,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                x
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          data-part="input"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          autoFocus={autoFocus}
          style={{
            flex: 1,
            minWidth: 60,
            fontSize: sizeConfig.fontSize,
            padding: 0,
            fontFamily: 'inherit',
          }}
        />
      </div>
      {error && errorMessage && (
        <span data-part="error-message" style={{
          fontSize: 12,
          marginTop: 4,
          display: 'block',
        }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}

RusticTagInput.displayName = 'TagInput.Rustic';
