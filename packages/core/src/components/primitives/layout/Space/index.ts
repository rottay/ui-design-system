/**
 * Space - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { SpaceProps } from './types';

export {
  type SpaceProps,
  type SpaceSize,
  type SpaceDirection,
  type SpaceAlign,
  SPACE_DEFAULTS,
  SPACE_SIZE_MAP,
  SPACE_ALIGN_MAP,
} from './types';

export const Space = createEngineComponent<SpaceProps>('Space', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Space;
