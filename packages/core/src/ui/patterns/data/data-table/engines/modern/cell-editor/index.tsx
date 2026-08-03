'use client';

/**
 * @fileoverview InlineCellEditor -- renders the appropriate editor widget
 * inside a table cell when the cell enters edit mode. Handles keyboard
 * navigation (Enter to save, Escape to cancel, Tab to move between editable
 * cells), validation, and error display.
 *
 * This is an internal sub-component consumed only by the DataTable engines.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { EditableConfig } from '@/foundation/contracts/runtime/components/patterns/core';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface InlineCellEditorProps<T = unknown> {
  /** Current cell value. */
  value: unknown;
  /** The full row data object. */
  row: T;
  /** Column key for this cell. */
  columnKey: string;
  /**
   * Human column label used as the editor control's accessible name. The
   * engines pass the resolved column header; the column key is the floor.
   */
  columnLabel?: string;
  /** Editable configuration (resolved from ColumnDef.editable). */
  config: EditableConfig<T>;
  /** Called when the user saves the edit. */
  onSave: (newValue: unknown) => void | Promise<void>;
  /** Called when the user cancels the edit. */
  onCancel: () => void;
  /** Called when the user presses Tab to move to the next editable cell. */
  onTabNext?: () => void;
  /** Called when the user presses Shift+Tab to move to the previous editable cell. */
  onTabPrev?: () => void;
  /** Registers external controls used by the row-level edit action buttons. */
  onControlsChange?: (controls: { save: () => Promise<boolean>; cancel: () => void } | null) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InlineCellEditor<T>({
  value,
  row,
  columnKey,
  columnLabel,
  config,
  onSave,
  onCancel,
  onTabNext,
  onTabPrev,
  onControlsChange,
}: InlineCellEditorProps<T>): React.ReactElement {
  const [editValue, setEditValue] = useState<unknown>(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  // Every editor control is named after its column; without it a screen
  // reader focus landing inside the cell announces an unlabeled field.
  const accessibleName = columnLabel ?? columnKey;

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Select all text in text/number inputs
        if (inputRef.current instanceof HTMLInputElement && inputRef.current.type !== 'checkbox') {
          inputRef.current.select();
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const saveValue = useCallback(async (nextValue: unknown) => {
    if (config.validate) {
      const validationError = config.validate(nextValue, row);
      if (validationError) {
        setError(validationError);
        return false;
      }
    }
    setError(null);
    try {
      await onSave(nextValue);
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this change.');
      return false;
    }
  }, [row, config, onSave]);

  const attemptSave = useCallback(
    () => saveValue(editValue),
    [editValue, saveValue],
  );

  useEffect(() => {
    onControlsChange?.({ save: attemptSave, cancel: onCancel });
    return () => onControlsChange?.(null);
  }, [attemptSave, onCancel, onControlsChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          void attemptSave();
          break;
        case 'Escape':
          e.preventDefault();
          onCancel();
          break;
        case 'Tab': {
          e.preventDefault();
          const moveBackward = e.shiftKey;
          void attemptSave().then((saved) => {
            if (!saved) return;
            if (moveBackward) {
              onTabPrev?.();
            } else {
              onTabNext?.();
            }
          });
          break;
        }
      }
    },
    [attemptSave, onCancel, onTabNext, onTabPrev],
  );

  const editorType = config.type ?? 'text';

  // Geometry (width, padding, font, error anchoring) lives in the modern
  // engine skin keyed on data-part='editor-shell'/'editor-input'/'editor-
  // error'/'editor-checkbox'. Paint (border rest/error, radius, background,
  // color, outline, accent-color) stays in the agnostic data-table-mobile
  // skin, keyed on data-part='editor-input' and the data-invalid stamp.

  // Custom editor
  if (editorType === 'custom' && config.render) {
    return (
      <div
        data-part="editor-shell"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        {config.render(value, row, async (nextValue) => {
          setEditValue(nextValue);
          await saveValue(nextValue);
        }, onCancel)}
      </div>
    );
  }

  // Checkbox editor
  if (editorType === 'checkbox') {
    return (
      <div
        data-part="editor-shell"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="checkbox"
          data-part="editor-checkbox"
          aria-label={accessibleName}
          checked={Boolean(editValue)}
          onChange={(e) => {
            setEditValue(e.target.checked);
            // Checkbox saves immediately on change
            void saveValue(e.target.checked);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  // Select editor
  if (editorType === 'select' && config.options) {
    return (
      <div data-part="editor-shell" onClick={(e) => e.stopPropagation()}>
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={String(editValue ?? '')}
          data-part="editor-input"
          data-invalid={error ? 'true' : 'false'}
          aria-label={accessibleName}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            const selected = config.options?.find((o) => String(o.value) === e.target.value);
            setEditValue(selected ? selected.value : e.target.value);
          }}
          onKeyDown={handleKeyDown}
        >
          {config.options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span data-part="editor-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }

  // Text / Number / Date editor
  return (
    <div data-part="editor-shell" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={editorType === 'number' ? 'number' : editorType === 'date' ? 'date' : 'text'}
        value={editValue == null ? '' : String(editValue)}
        placeholder={config.placeholder}
        min={config.min}
        max={config.max}
        data-part="editor-input"
        data-invalid={error ? 'true' : 'false'}
        aria-label={accessibleName}
        aria-invalid={error ? true : undefined}
        onChange={(e) => {
          const raw = e.target.value;
          if (editorType === 'number') {
            setEditValue(raw === '' ? null : Number(raw));
          } else {
            setEditValue(raw);
          }
          setError(null);
        }}
        onKeyDown={handleKeyDown}
      />
      {error && (
        <span data-part="editor-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
