import React from 'react';
import type { CheckoutFormPreset } from '../core';

import MultiStep from './multi-step';
import SinglePage from './single-page';

export const PRESETS: Record<CheckoutFormPreset, React.ComponentType<any>> = {
  'multi-step': MultiStep,
  'single-page': SinglePage,
};
