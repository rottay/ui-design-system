/**
 * Dropdown - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { DropdownProps } from './types';

export {
  type DropdownProps,
  type DropdownMenuItem,
  type DropdownMenuProps,
  type DropdownTrigger,
  type DropdownPlacement,
  DROPDOWN_DEFAULTS,
} from './types';

export const Dropdown = createEngineComponent<DropdownProps>('Dropdown', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Dropdown;
