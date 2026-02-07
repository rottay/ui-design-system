import React from 'react';
import type { OrderSummaryCardPreset } from '../core';

import Confirmation from './confirmation';
import Tracking from './tracking';

export const PRESETS: Record<OrderSummaryCardPreset, React.ComponentType<any>> = {
  confirmation: Confirmation,
  tracking: Tracking,
};
