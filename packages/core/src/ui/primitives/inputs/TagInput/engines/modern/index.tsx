'use client';

/**
 * @fileoverview Modern engine for TagInput: skin-painted container with the
 * public Tag primitive composed for chips, plus a native text input.
 * Manages its own local input state and converts keystrokes / separator characters into tags,
 * giving full control over the creation flow unlike the Classic (Ant) delegation approach.
 *
 * @remarks
 * Chip paint has exactly one owner: the composed `Tag` (its own certified
 * skin, keyboard-focusable close control and `common.remove` localized
 * accessible name). This file owns semantics and behavior only; container
 * paint lives in the `tag-input.css` modern skin keyed on `data-part`,
 * `data-size`, `data-error` and `data-disabled`.
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

import React, { useState, useCallback, useEffect, useId, useRef } from 'react';
import { VisuallyHidden } from '../../../../foundation';
import type { TagInputProps } from '../../contracts';
import { TAGINPUT_DEFAULTS } from '../../contracts';
import { Tag } from '../../../../facade';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Rejection reasons that stay silent in the value contract but must surface
 *  as feedback (duplicate / max-count / custom-validation refusals). */
type TagRejectionReason = 'duplicate' | 'max' | 'invalid';

interface TagRejection {
  reason: TagRejectionReason;
  tag: string;
}

/** How long the rejected posture stays painted and announced before the
 *  field settles back to rest (transitions out on the governed channels). */
const REJECTION_FEEDBACK_MS = 1400;

/**
 * Modern (skin-painted) implementation of TagInput.
 *
 * Renders tags as composed `Tag` chips inside a bordered input container. A hidden native
 * text input captures keystrokes; tags are created on Enter, the configured separator
 * character, or when the separator appears via paste. Backspace on an empty input
 * removes the last tag for quick editing.
 *
 * @param props - Standard TagInputProps shared across all engines.
 * @returns A flex container of Tag chips with an inline text input and optional error label.
 */
export default function ModernTagInput(props: TagInputProps): React.ReactElement {
  const {
    value = [],
    onChange,
    placeholder: placeholderProp,
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
    'aria-label': ariaLabel,
  } = props;

  const i18n = useOptionalTranslation('components');
  /**
   * Localized label with an English floor: when the catalogue entry has not
   * landed yet the provider echoes the full key, which must never reach the
   * placeholder or an aria-label.
   */
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };

  // Explicit prop wins; otherwise the localized placeholder with an EN floor
  // (the pre-i18n default, kept as the floor so behavior never regresses).
  const placeholder = placeholderProp ?? tOr('taginput.placeholder', 'Type and press Enter');

  // Local state tracks the text being typed before it becomes a tag
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = providedId || `taginput-modern-${generatedId}`;
  const errorId = `${inputId}-error`;

  // Rejection feedback: add-refusals (duplicate / maxTags / validateTag) used
  // to fail silently. They now paint a transient warning posture on the root
  // (`data-rejected`) and announce the reason through a polite live region;
  // the region returns to empty after the beat so a repeated refusal on the
  // same value is announced again.
  const [rejection, setRejection] = useState<TagRejection | null>(null);
  const rejectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyRejection = useCallback((reason: TagRejectionReason, tag: string) => {
    setRejection({ reason, tag });
    if (rejectionTimer.current) clearTimeout(rejectionTimer.current);
    rejectionTimer.current = setTimeout(() => setRejection(null), REJECTION_FEEDBACK_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (rejectionTimer.current) clearTimeout(rejectionTimer.current);
    };
  }, []);

  /** Validates and appends a single tag, enforcing max/duplicate/custom rules.
   *  Returns true when the tag was accepted; refusals raise feedback. */
  const addTag = useCallback((tag: string): boolean => {
    const trimmed = tag.trim();
    if (!trimmed) return false;
    if (maxTags && value.length >= maxTags) {
      notifyRejection('max', trimmed);
      return false;
    }
    if (!allowDuplicates && value.includes(trimmed)) {
      notifyRejection('duplicate', trimmed);
      return false;
    }
    if (validateTag && !validateTag(trimmed)) {
      notifyRejection('invalid', trimmed);
      return false;
    }
    onChange?.([...value, trimmed]);
    return true;
  }, [value, maxTags, allowDuplicates, onChange, validateTag, notifyRejection]);

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
      // A refused tag keeps the typed text so the user can correct it instead
      // of retyping; only an accepted tag clears the drafting value.
      if (addTag(inputValue)) setInputValue('');
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

  const rejectionMessage = rejection
    ? `${tOr(`taginput.feedback_${rejection.reason}`, {
        duplicate: 'Tag already exists',
        max: 'Maximum number of tags reached',
        invalid: 'Tag is not allowed',
      }[rejection.reason])}: ${rejection.tag}`
    : '';

  return (
    <div className={`ds-tag-input-shell ds-tag-input-shell--modern ${className || ''}`.trim()} style={style} data-part="field">
      {/* Container mimics an input but uses flex-wrap so chips flow naturally */}
      <div
        className="ds-tag-input ds-tag-input--modern"
        data-part="root"
        data-size={size}
        data-error={error ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        data-rejected={rejection?.reason}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          // Chip paint/keyboard/close-label belong to the composed Tag; the
          // remove path (onChange + onRemove) is preserved through onClose.
          <Tag
            key={`${tag}-${index}`}
            data-part="tag-chip"
            size={size}
            tone="primary"
            closable={!disabled}
            onClose={() => removeTag(index)}
          >
            {tag}
          </Tag>
        ))}
        {/* Inline input grows to fill remaining space; placeholder only shows when empty.
            The accessible name prefers the explicit prop and falls back to the
            (non-empty) placeholder text -- with chips present the placeholder
            collapses to '', which must not become an empty aria-label. */}
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
          aria-label={ariaLabel || placeholder || undefined}
          aria-invalid={error || undefined}
          aria-describedby={error && errorMessage ? errorId : undefined}
        />
      </div>
      {/* Polite announcements for add-refusals (duplicate/max/invalid): the
          visible posture is the transient `data-rejected` frame on the root;
          this region is the non-color, non-visual channel. Empties itself
          after the beat so identical refusals re-announce. */}
      <VisuallyHidden data-part="feedback" role="status" aria-live="polite">
        {rejectionMessage}
      </VisuallyHidden>
      {error && errorMessage && (
        <div data-part="error-wrapper">
          <span data-part="error-message" id={errorId}>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

ModernTagInput.displayName = 'TagInput.Modern';
