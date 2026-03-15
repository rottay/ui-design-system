import type { CartSummaryProps, CartSummaryPreset } from '../core';
import { PanelPreset } from './panel';
import { CompactPreset } from './compact';

export const PRESETS: Record<CartSummaryPreset, React.ComponentType<CartSummaryProps>> = {
  panel: PanelPreset,
  compact: CompactPreset,
};
