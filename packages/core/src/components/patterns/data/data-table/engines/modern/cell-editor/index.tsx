'use client';

/**
 * @fileoverview InlineCellEditor -- renders the appropriate editor widget
 * inside a table cell when the cell enters edit mode. Handles keyboard
 * navigation (Enter to save, Escape to cancel, Tab to move between editable
 * cells), validation, and error display. F2 on the focused row opens it; when
 * it closes with focus inside, the engine returns focus to that row.
 *
 * This is an internal sub-component consumed only by the DataTable engines.
 */

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import type { EditableConfig } from '@/foundation/contracts/runtime/components/patterns/core';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import ModernCheckbox from '../../../../../../primitives/inputs/checkbox/engines/modern';
import ModernInput from '../../../../../../primitives/inputs/input/engines/modern';
import ModernSelect from '../../../../../../primitives/inputs/select/engines/modern';

const SAVE_FAILED_FALLBACK = 'Unable to save this change.';

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
  /** Called when the editor unmounts while focus is still inside its cell. */
  onExitFocused?: () => void;
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
  onExitFocused,
}: InlineCellEditorProps<T>): React.ReactElement {
  const [editValue, setEditValue] = useState<unknown>(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLElement>(null);
  const translate = useOptionalTranslation('components')?.t;
  // Every editor control is named after its column; without it a screen
  // reader focus landing inside the cell announces an unlabeled field.
  const accessibleName = columnLabel ?? columnKey;

  // A layout cleanup runs before the control leaves the document, so focus can
  // still be read on it; afterwards the browser has already moved it to <body>.
  const onExitFocusedRef = useRef(onExitFocused);
  onExitFocusedRef.current = onExitFocused;
  useLayoutEffect(
    () => () => {
      const focused = document.activeElement;
      if (focused instanceof Element && focused.closest('td[data-editing="true"]')) {
        onExitFocusedRef.current?.();
      }
    },
    [],
  );

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
      // A thrown Error's message outranks the catalog; no provider keeps the English floor.
      setError(
        saveError instanceof Error
          ? saveError.message
          : translate?.('table.save_failed') ?? SAVE_FAILED_FALLBACK,
      );
      return false;
    }
  }, [row, config, onSave, translate]);

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

  // Enter commits through the Input's IME-guarded submit intent (onPressEnter); here it only stays in the cell.
  const handleTextKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        return;
      }
      handleKeyDown(e);
    },
    [handleKeyDown],
  );

  const editorType = config.type ?? 'text';

  // The text and select editors are the chrome-less Input and Select, the checkbox the Checkbox primitive;
  // the table paints their frame and hands them type and radius through the editor-control channels.

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
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <ModernCheckbox
          className="ds-data-table__editor-checkbox"
          size="sm"
          aria-label={accessibleName}
          error={Boolean(error)}
          autoFocus
          checked={Boolean(editValue)}
          onChange={(checked) => {
            setEditValue(checked);
            // Checkbox saves immediately on change
            void saveValue(checked);
          }}
        />
        {/* The checkbox saves on toggle, so a rejected save has no other tell:
            without this node the failure is silent and never announced. */}
        {error && (
          <span data-part="editor-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }

  // Select editor
  if (editorType === 'select' && config.options) {
    return (
      <div data-part="editor-shell" onClick={(e) => e.stopPropagation()}>
        <ModernSelect
          ref={inputRef}
          chrome="none"
          size="sm"
          placeholder=""
          className="ds-data-table__editor-control"
          options={config.options.map((opt) => ({ value: String(opt.value), label: opt.label }))}
          value={String(editValue ?? '')}
          status={error ? 'error' : 'default'}
          aria-label={accessibleName}
          onChange={(next) => {
            const selected = config.options?.find((o) => String(o.value) === String(next));
            setEditValue(selected ? selected.value : next);
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

  // Text / Number / Date editor
  return (
    <div data-part="editor-shell" onClick={(e) => e.stopPropagation()}>
      <ModernInput
        ref={inputRef as React.RefObject<HTMLInputElement>}
        chrome="none"
        size="sm"
        className="ds-data-table__editor-control"
        type={editorType === 'number' ? 'number' : editorType === 'date' ? 'date' : 'text'}
        value={editValue == null ? '' : String(editValue)}
        placeholder={config.placeholder}
        min={config.min}
        max={config.max}
        status={error ? 'error' : 'default'}
        aria-label={accessibleName}
        onChange={(raw) => {
          if (editorType === 'number') {
            setEditValue(raw === '' ? null : Number(raw));
          } else {
            setEditValue(raw);
          }
          setError(null);
        }}
        onPressEnter={(e) => {
          e.preventDefault();
          void attemptSave();
        }}
        onKeyDown={handleTextKeyDown}
      />
      {error && (
        <span data-part="editor-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
