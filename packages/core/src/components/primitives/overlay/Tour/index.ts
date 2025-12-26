/**
 * Tour - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { TourProps } from './types';

export {
  type TourProps,
  type TourStepProps,
  type TourPlacement,
  type TourType,
  TOUR_DEFAULTS,
} from './types';

export const Tour = createEngineComponent<TourProps>('Tour', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Tour;
