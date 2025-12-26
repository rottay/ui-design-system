/**
 * Flex - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { FlexProps } from './types';

export {
  type FlexProps,
  type FlexDirection,
  type FlexWrap,
  type FlexJustify,
  type FlexAlign,
  FLEX_DEFAULTS,
  FLEX_JUSTIFY_MAP,
  FLEX_ALIGN_MAP,
} from './types';

export const Flex = createEngineComponent<FlexProps>('Flex', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Flex;
