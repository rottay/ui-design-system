/**
 * Spinner - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { SpinnerProps } from './types';

export { type SpinnerProps, type SpinnerSize, SPINNER_DEFAULTS, SIZE_MAP } from './types';


// Export base component
export { BaseSpinner } from './base';

export const Spinner = createEngineComponent<SpinnerProps>('Spinner', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
