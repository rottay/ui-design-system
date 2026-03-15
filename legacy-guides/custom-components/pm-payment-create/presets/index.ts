/**
 * PmPaymentCreate - All Presets
 */

export { FormPmPaymentCreate } from './form';
export { CheckoutPmPaymentCreate } from './checkout';

import type { PmPaymentCreatePreset } from '../core';
import type { ComponentType } from 'react';
import type { PmPaymentCreateProps } from '../core';
import { FormPmPaymentCreate } from './form';
import { CheckoutPmPaymentCreate } from './checkout';

export const PM_PAYMENT_CREATE_PRESETS: Record<PmPaymentCreatePreset, ComponentType<PmPaymentCreateProps>> = {
  form: FormPmPaymentCreate,
  checkout: CheckoutPmPaymentCreate,
};
