'use client';

/**
 * @fileoverview Form Hooks - Rottay Design System
 * @description React hooks for form state management including auto-save,
 * draft persistence, and related form utilities.
 *
 * @module System/Hooks/Form
 * @category System
 * @package @rottay/design-system
 */

export { useAutoSave } from './auto-save';
export type {
  AutoSaveStatus,
  UseAutoSaveOptions,
  UseAutoSaveReturn,
} from './auto-save';

export { useDraftSave } from './draft-save';
export type {
  UseDraftSaveOptions,
  UseDraftSaveReturn,
} from './draft-save';

export { useFormDiff } from './form-diff';
export type {
  FormDiffEntry,
  UseFormDiffOptions,
  UseFormDiffReturn,
} from './form-diff';
