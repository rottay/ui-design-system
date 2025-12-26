/**
 * Rate - Engine Router
 * Star rating component with support for multiple engines
 * @module Rate
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { RateProps } from './types';

// Export types
export type {
  RateProps,
  RateSize,
  RateEngine,
  RateCharacterProps,
} from './types';

export { RATE_DEFAULTS, RATE_SIZE_MAP } from './types';

// Export base component for direct usage
export { BaseRate } from './base';

// Create engine-aware Rate component
export const Rate = createEngineComponent<RateProps>('Rate', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Rate;
