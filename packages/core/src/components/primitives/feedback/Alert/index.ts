/**
 * Alert Component with compound components
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { AlertProps } from './types';
import { AlertDescription } from './compound';

export { type AlertProps, type AlertType, ALERT_DEFAULTS } from './types';

export { BaseAlert } from './base';

export { AlertDescription };
export type { AlertDescriptionProps } from './compound';

export const Alert = Object.assign(
  createEngineComponent<AlertProps>('Alert', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Description: AlertDescription,
  }
);
