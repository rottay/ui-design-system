'use client';

/**
 * @fileoverview Form Hooks - Rottay Design System
 * @description React hooks for form state management including auto-save,
 * draft persistence, and change tracking. Use these hooks to enhance form
 * UX with automatic saving, recoverable drafts, and visual diff indicators.
 *
 * @remarks
 * Three complementary hooks that can be composed together:
 *
 * - **useAutoSave** - Debounced auto-save with status tracking (idle/saving/saved/error).
 *   Ideal for inline editing and settings forms.
 * - **useDraftSave** - localStorage-based draft persistence with TTL expiration.
 *   Prevents data loss from accidental navigation or tab closure.
 * - **useFormDiff** - Deep-compares original and current form data, returning
 *   a list of changed fields with before/after values for visual indicators.
 *
 * @example Composing auto-save with draft recovery
 * ```tsx
 * const { draft, saveDraft, clearDraft } = useDraftSave({ key: 'settings-form', ttl: 3600 });
 * const { status, trigger } = useAutoSave({ data: formData, onSave: submitToServer });
 * ```
 *
 * @status app-facing
 * @module System/Hooks/Form
 * @category System
 * @package @rottay/design-system
 */

// -- Auto-Save --
// Debounced persistence with status tracking. The debounce delay prevents
// excessive API calls during rapid typing while the status state machine
// (idle -> saving -> saved | error) enables save-indicator UI.
export { useAutoSave } from './auto-save';
export type {
  AutoSaveStatus,
  UseAutoSaveOptions,
  UseAutoSaveReturn,
} from './auto-save';

// -- Draft Save --
// localStorage/sessionStorage persistence with automatic TTL expiration.
// Recovers unsaved work after accidental navigation, tab closure, or crash.
export { useDraftSave } from './draft-save';
export type {
  UseDraftSaveOptions,
  UseDraftSaveReturn,
} from './draft-save';

// -- Form Diff --
// Deep comparison between original and current form state. Returns per-field
// change entries useful for "unsaved changes" warnings and visual diff markers.
export { useFormDiff } from './form-diff';
export type {
  FormDiffEntry,
  UseFormDiffOptions,
  UseFormDiffReturn,
} from './form-diff';
