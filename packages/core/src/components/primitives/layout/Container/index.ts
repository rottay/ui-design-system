/**
 * Container - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { ContainerProps } from './types';

export {
  type ContainerProps,
  type ContainerMaxWidth,
  type ContainerPadding,
  CONTAINER_DEFAULTS,
  CONTAINER_MAX_WIDTHS,
  CONTAINER_PADDINGS,
} from './types';

export const Container = createEngineComponent<ContainerProps>('Container', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Container;
