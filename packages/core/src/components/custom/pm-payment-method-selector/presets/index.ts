/**
 * PmPaymentMethodSelector - All Presets
 */

export { GridPmPaymentMethodSelector } from './grid';
export { ListPmPaymentMethodSelector } from './list';

import type { PmPaymentMethodSelectorPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmPaymentMethodSelectorProps } from '../core';
import { GridPmPaymentMethodSelector } from './grid';
import { ListPmPaymentMethodSelector } from './list';

export const PM_PAYMENT_METHOD_SELECTOR_PRESETS: Record<PmPaymentMethodSelectorPreset, ComponentType<PmPaymentMethodSelectorProps>> = {
  grid: GridPmPaymentMethodSelector,
  list: ListPmPaymentMethodSelector,
};
