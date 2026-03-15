'use client';

/**
 * @fileoverview TagInput Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the TagInput component.
 * Uses DaisyUI input + badge list.
 *
 * @module TagInput/Engines/Modern
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback, useId, useRef } from 'react';
import type { TagInputProps } from '../TagInput.types';
import { TAGINPUT_DEFAULTS } from '../TagInput.types';

const SIZE_CLASSES = {
  sm: 'input-sm',
  md: '',
  lg: 'input-lg',
};

const BADGE_SIZE_CLASSES = {
  sm: 'badge-sm',
  md: '',
  lg: 'badge-lg',
};

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

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = providedId || `taginput-modern-${generatedId}`;

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (maxTags && value.length >= maxTags) return;
    if (!allowDuplicates && value.includes(trimmed)) return;
    if (validateTag && !validateTag(trimmed)) return;
    onChange?.([...value, trimmed]);
  }, [value, maxTags, allowDuplicates, onChange, validateTag]);

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
      removeTag(value.length - 1);
    }
  }, [inputValue, separator, addTag, value, removeTag]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
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
