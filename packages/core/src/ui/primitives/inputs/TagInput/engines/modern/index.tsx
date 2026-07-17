'use client';

/**
 * @fileoverview Modern engine for TagInput, built with DaisyUI badges and a native text input.
 * Manages its own local input state and converts keystrokes / separator characters into tags,
 * giving full control over the creation flow unlike the Classic (Ant) delegation approach.
 *
 * @example
 * ```tsx
 * <TagInput engine="modern" placeholder="Add skills..." separator="," maxTags={10} />
 * ```
 *
 * @module TagInput/Engines/Modern
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback, useId, useRef } from 'react';
import type { TagInputProps } from '../../contracts';
import { TAGINPUT_DEFAULTS } from '../../contracts';

/** Inline size styles for the outer input container. */
const SIZE_MIN_HEIGHTS: Record<string, number> = {
  sm: 32,
  md: 40,
  lg: 48,
};

/** Inline size styles for individual tag badges. */
const BADGE_SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { fontSize: 11, padding: '1px 6px', gap: 2 },
  md: { fontSize: 12, padding: '2px 8px', gap: 4 },
  lg: { fontSize: 14, padding: '4px 10px', gap: 4 },
};

/**
 * Modern (DaisyUI) implementation of TagInput.
 *
 * Renders tags as DaisyUI badges inside a bordered input container. A hidden native
 * text input captures keystrokes; tags are created on Enter, the configured separator
 * character, or when the separator appears via paste. Backspace on an empty input
 * removes the last tag for quick editing.
 *
 * @param props - Standard TagInputProps shared across all engines.
 * @returns A flex container of badge tags with an inline text input and optional error label.
 */
export default function ModernTagInput(props: TagInputProps): React.ReactElement {
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
    className,
    style,
    id: providedId,
    name,
    autoFocus,
    onRemove,
    validateTag,
  } = props;

  // Local state tracks the text being typed before it becomes a tag
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = providedId || `taginput-modern-${generatedId}`;

  /** Validates and appends a single tag, enforcing max/duplicate/custom rules. */
  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (maxTags && value.length >= maxTags) return;
    if (!allowDuplicates && value.includes(trimmed)) return;
    if (validateTag && !validateTag(trimmed)) return;
    onChange?.([...value, trimmed]);
  }, [value, maxTags, allowDuplicates, onChange, validateTag]);

  /** Removes tag at index and notifies parent via both onChange and onRemove. */
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
    // Separator found mid-value means paste or fast typing -- split into multiple tags
    if (val.includes(separator)) {
      const parts = val.split(separator);
      parts.forEach((part) => addTag(part));
      setInputValue('');
    } else {
      setInputValue(val);
    }
  }, [separator, addTag]);

  return (
    <div className={className || ''} style={{ display: 'flex', flexDirection: 'column', width: '100%', ...style }}>
      {/* Container mimics a DaisyUI input but uses flex-wrap so tags flow naturally */}
      <div
        className="ds-tag-input ds-tag-input--modern"
        data-part="root"
        data-error={error ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, height: 'auto', minHeight: SIZE_MIN_HEIGHTS[size] || 40, paddingBlock: 4, paddingInline: 8, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'text' }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          <span key={`${tag}-${index}`} data-part="tag-chip" style={{ display: 'inline-flex', alignItems: 'center', ...(BADGE_SIZE_STYLES[size] || BADGE_SIZE_STYLES.md) }}>
            {tag}
            {!disabled && (
              <button
                type="button"
                data-part="tag-remove"
                style={{ height: 'auto', padding: 0, fontSize: 12, cursor: 'pointer', minHeight: 0, lineHeight: 1 }}
                onClick={(e) => { e.stopPropagation(); removeTag(index); }}
                aria-label={`Remove ${tag}`}
              >
                x
              </button>
            )}
          </span>
        ))}
        {/* Inline input grows to fill remaining space; placeholder only shows when empty */}
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
          style={{ flex: 1, minWidth: 60, padding: 0 }}
        />
      </div>
      {error && errorMessage && (
        <div style={{ marginTop: 4 }}>
          <span data-part="error-message" style={{ fontSize: 12, lineHeight: '16px' }}>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

ModernTagInput.displayName = 'TagInput.Modern';
