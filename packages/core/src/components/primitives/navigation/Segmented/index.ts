/**
 * Segmented - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { SegmentedProps } from './types';

export { type SegmentedProps, type SegmentedOption, SEGMENTED_DEFAULTS } from './types';

export const Segmented = createEngineComponent<SegmentedProps>('Segmented', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Segmented;
