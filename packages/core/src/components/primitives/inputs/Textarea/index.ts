/**
 * Textarea - Engine Router
 * Exports the engine-routed Textarea component
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { TextareaProps } from './types';

export {
  type TextareaProps,
  type TextareaVariant,
  type TextareaSize,
  type TextareaStatus,
  TEXTAREA_DEFAULTS,
} from './types';

export const Textarea = createEngineComponent<TextareaProps>('Textarea', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
