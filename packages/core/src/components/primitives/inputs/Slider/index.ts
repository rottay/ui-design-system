/**
 * Slider - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { SliderProps } from './types';

export {
  type SliderProps,
  type SliderMarks,
  SLIDER_DEFAULTS,
} from './types';

export const Slider = createEngineComponent<SliderProps>('Slider', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Slider;
