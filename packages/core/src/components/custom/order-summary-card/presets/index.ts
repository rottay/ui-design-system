import type { ComponentType } from 'react';
import type { OrderSummaryCardPreset, OrderSummaryCardProps } from '../core';

import Confirmation from './confirmation';
import Tracking from './tracking';

export const PRESETS: Record<OrderSummaryCardPreset, ComponentType<OrderSummaryCardProps>> = {
  confirmation: Confirmation,
  tracking: Tracking,
};
