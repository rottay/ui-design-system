/**
 * Breadcrumb - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { BreadcrumbProps } from './types';

export { type BreadcrumbProps, type BreadcrumbItem, BREADCRUMB_DEFAULTS } from './types';


// Export base component
export { BaseBreadcrumb } from './base';

export const Breadcrumb = createEngineComponent<BreadcrumbProps>('Breadcrumb', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
