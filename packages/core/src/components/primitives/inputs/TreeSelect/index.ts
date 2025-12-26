/**
 * TreeSelect - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { TreeSelectProps } from './types';

export {
  type TreeSelectProps,
  type TreeSelectNode,
  type TreeSelectValue,
  type TreeSelectSize,
  TREESELECT_DEFAULTS,
} from './types';

export const TreeSelect = createEngineComponent<TreeSelectProps>('TreeSelect', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default TreeSelect;
