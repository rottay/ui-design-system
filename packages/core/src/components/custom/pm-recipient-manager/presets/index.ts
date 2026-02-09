/**
 * PmRecipientManager - All Presets
 */

export { TablePmRecipientManager } from './table';
export { CardsPmRecipientManager } from './cards';

import type { PmRecipientManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmRecipientManagerProps } from '../core';
import { TablePmRecipientManager } from './table';
import { CardsPmRecipientManager } from './cards';

export const PM_RECIPIENT_MANAGER_PRESETS: Record<PmRecipientManagerPreset, ComponentType<PmRecipientManagerProps>> = {
  table: TablePmRecipientManager,
  cards: CardsPmRecipientManager,
};
