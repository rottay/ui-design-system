/**
 * Stack - Engine Router
 * A layout primitive for stacking elements vertically or horizontally
 * with configurable spacing, alignment, and dividers.
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { StackProps } from './types';

// Export types
export type {
  StackProps,
  StackDirection,
  StackAlign,
  StackJustify,
  StackSpacing,
  StackSpacingPreset,
} from './types';

// Export constants
export {
  STACK_DEFAULTS,
  SPACING_MAP,
  ALIGN_MAP,
  JUSTIFY_MAP,
  resolveSpacing,
} from './types';

// Export base component and utilities
export {
  BaseStack,
  buildStackStyles,
  filterStackProps,
  renderStackChildren,
} from './base';

// Create engine-aware Stack component
export const Stack = createEngineComponent<StackProps>('Stack', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
