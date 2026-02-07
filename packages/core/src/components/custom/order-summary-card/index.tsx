import React from 'react';
import type { OrderSummaryCardProps } from './core';
import { ORDER_SUMMARY_CARD_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { OrderSummaryCardProps, OrderSummaryCardPreset, OrderItem, TrackingStep } from './core';
export { ORDER_SUMMARY_CARD_DEFAULTS } from './core';

export function OrderSummaryCard(props: OrderSummaryCardProps): React.ReactElement {
  const preset = props.preset ?? ORDER_SUMMARY_CARD_DEFAULTS.preset ?? 'confirmation';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
OrderSummaryCard.displayName = 'OrderSummaryCard';
