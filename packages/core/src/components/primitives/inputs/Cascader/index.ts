/**
 * Cascader - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { CascaderProps } from './types';

export {
  type CascaderProps,
  type CascaderOption,
  type CascaderValue,
  type CascaderSize,
  type CascaderExpandTrigger,
  CASCADER_DEFAULTS,
} from './types';

export const Cascader = createEngineComponent<CascaderProps>('Cascader', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Cascader;
