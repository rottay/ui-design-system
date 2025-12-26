/**
 * Box - Engine Router
 * A fundamental layout primitive that provides a styled container
 * with configurable spacing, borders, shadows, and other layout properties.
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { BoxProps } from './types';

// Export types
export type {
  BoxProps,
  BoxSpacing,
  BoxBorderRadius,
  BoxShadow,
  BoxDisplay,
  BoxPosition,
  BoxOverflow,
} from './types';

// Export constants
export { BOX_DEFAULTS, SPACING_MAP, RADIUS_MAP, SHADOW_MAP } from './types';

// Export base component
export { BaseBox, buildBoxStyles, filterBoxProps } from './base';

// Create engine-aware Box component
export const Box = createEngineComponent<BoxProps>('Box', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
