/**
 * Stack - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { StackProps } from './types';

export {
  type StackProps,
  type StackDirection,
  type StackAlign,
  type StackJustify,
  type StackSpacing,
  STACK_DEFAULTS,
} from './types';


// Export base component
export { BaseStack } from './base';

export const Stack = createEngineComponent<StackProps>('Stack', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
