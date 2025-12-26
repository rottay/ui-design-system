/**
 * Watermark - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { WatermarkProps } from './types';

export {
  type WatermarkProps,
  type WatermarkFont,
  WATERMARK_DEFAULTS,
} from './types';

export const Watermark = createEngineComponent<WatermarkProps>('Watermark', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Watermark;
