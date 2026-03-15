/**
 * PmSubscriptionManager - All Presets
 */

export { TablePmSubscriptionManager } from './table';
export { CardsPmSubscriptionManager } from './cards';

import type { PmSubscriptionManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmSubscriptionManagerProps } from '../core';
import { TablePmSubscriptionManager } from './table';
import { CardsPmSubscriptionManager } from './cards';

export const PM_SUBSCRIPTION_MANAGER_PRESETS: Record<PmSubscriptionManagerPreset, ComponentType<PmSubscriptionManagerProps>> = {
  table: TablePmSubscriptionManager,
  cards: CardsPmSubscriptionManager,
};
