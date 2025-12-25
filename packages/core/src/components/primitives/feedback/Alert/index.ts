/**
 * Alert - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { AlertProps } from './types';

export { type AlertProps, type AlertType, ALERT_DEFAULTS } from './types';


// Export base component
export { BaseAlert } from './base';

export const Alert = createEngineComponent<AlertProps>('Alert', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
