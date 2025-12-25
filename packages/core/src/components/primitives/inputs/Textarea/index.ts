/**
 * Textarea - Engine Router
 * Exports the engine-routed Textarea component
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { TextareaProps } from './core';

export {
  type TextareaProps,
  type TextareaVariant,
  type TextareaSize,
  type TextareaStatus,
  TEXTAREA_DEFAULTS,
} from './core';

export const Textarea = createEngineComponent<TextareaProps>('Textarea', {
  titan: () => import('./titan'),
  hermes: () => import('./hermes'),
  apollo: () => import('./apollo'),
});
