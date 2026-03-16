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
import type { TagInputProps } from '../TagInput.types';
import { TAGINPUT_DEFAULTS } from '../TagInput.types';

/** DaisyUI size classes for the outer input container. */
const SIZE_CLASSES = {
  sm: 'input-sm',
  md: '',
  lg: 'input-lg',
};

/** DaisyUI size classes for individual tag badges. */
const BADGE_SIZE_CLASSES = {
  sm: 'badge-sm',
  md: '',
  lg: 'badge-lg',
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
    <div className={`form-control ${className || ''}`} style={style}>
      {/* Container mimics a DaisyUI input but uses flex-wrap so tags flow naturally */}
      <div
        className={`flex flex-wrap items-center gap-1 input input-bordered ${SIZE_CLASSES[size]} ${error ? 'input-error' : ''} ${disabled ? 'input-disabled opacity-50' : ''}`}
        style={{ height: 'auto', minHeight: size === 'sm' ? 32 : size === 'lg' ? 48 : 40, paddingBlock: 4 }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          <span key={`${tag}-${index}`} className={`badge badge-primary gap-1 ${BADGE_SIZE_CLASSES[size]}`}>
            {tag}
            {!disabled && (
              <button
                type="button"
                className="btn btn-ghost btn-xs p-0 min-h-0 h-auto"
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
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          autoFocus={autoFocus}
          className="flex-1 outline-none bg-transparent min-w-[60px] border-none"
          style={{ padding: 0 }}
        />
      </div>
      {error && errorMessage && (
        <label className="label">
          <span className="label-text-alt text-error">{errorMessage}</span>
        </label>
      )}
    </div>
  );
}

ModernTagInput.displayName = 'TagInput.Modern';
