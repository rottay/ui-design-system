/**
 * BhClientPortal - All Presets
 */

export { ExecutiveBhClientPortal } from './executive';
export { OperationalBhClientPortal } from './operational';

import type { BhClientPortalPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhClientPortalProps } from '../core';
import { ExecutiveBhClientPortal } from './executive';
import { OperationalBhClientPortal } from './operational';

export const BH_CLIENT_PORTAL_PRESETS: Record<BhClientPortalPreset, ComponentType<BhClientPortalProps>> = {
  executive: ExecutiveBhClientPortal,
  operational: OperationalBhClientPortal,
};
