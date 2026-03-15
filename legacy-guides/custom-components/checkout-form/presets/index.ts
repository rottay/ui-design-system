import type { ComponentType } from 'react';
import type { CheckoutFormPreset, CheckoutFormProps } from '../core';

import MultiStep from './multi-step';
import SinglePage from './single-page';

export const PRESETS: Record<CheckoutFormPreset, ComponentType<CheckoutFormProps>> = {
  'multi-step': MultiStep,
  'single-page': SinglePage,
};
