/**
 * Popover - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { PopoverProps } from './types';

export {
  type PopoverProps,
  type PopoverTrigger,
  type PopoverPlacement,
  POPOVER_DEFAULTS,
} from './types';

export const Popover = createEngineComponent<PopoverProps>('Popover', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Popover;
