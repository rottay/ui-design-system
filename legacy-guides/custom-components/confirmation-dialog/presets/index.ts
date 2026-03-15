import { standardPreset } from './standard';
import { destructivePreset } from './destructive';
import type { ConfirmationDialogPreset } from '../core';

export { standardPreset, destructivePreset };

export const PRESETS: Record<ConfirmationDialogPreset, typeof standardPreset> = {
  standard: standardPreset,
  destructive: destructivePreset,
};
