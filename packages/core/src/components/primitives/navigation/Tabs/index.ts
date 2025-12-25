/**
 * Tabs - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { TabsProps } from './types';

export { type TabsProps, type TabItem, type TabsType, type TabsSize, TABS_DEFAULTS } from './types';


// Export base component
export { BaseTabs } from './base';

export const Tabs = createEngineComponent<TabsProps>('Tabs', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
