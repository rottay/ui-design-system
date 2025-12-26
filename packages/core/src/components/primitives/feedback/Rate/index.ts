/**
 * Rate - Engine Router
 * Star rating component
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { RateProps } from './types';

export {
  type RateProps,
  RATE_DEFAULTS,
} from './types';

export const Rate = createEngineComponent<RateProps>('Rate', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Rate;
