/**
 * Divider - Engine Router
 * A visual separator that can be horizontal or vertical, with optional text content.
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { DividerProps } from './types';

// Export types
export {
  type DividerProps,
  type DividerOrientation,
  type DividerVariant,
  type DividerTextPosition,
  type DividerThickness,
  type DividerThicknessPreset,
  type DividerSpacing,
  DIVIDER_DEFAULTS,
  SPACING_MAP,
  THICKNESS_MAP,
  DEFAULT_COLORS,
  getThicknessValue,
} from './types';

// Export base component
export { BaseDivider } from './base';

// Create engine-aware Divider component
export const Divider = createEngineComponent<DividerProps>('Divider', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
