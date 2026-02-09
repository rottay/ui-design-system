/**
 * W3PaymentSession - All Presets
 */

export { TrackerW3PaymentSession } from './tracker';
export { CardW3PaymentSession } from './card';

import type { W3PaymentSessionPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3PaymentSessionProps } from '../core';
import { TrackerW3PaymentSession } from './tracker';
import { CardW3PaymentSession } from './card';

export const W3_PAYMENT_SESSION_PRESETS: Record<W3PaymentSessionPreset, ComponentType<W3PaymentSessionProps>> = {
  tracker: TrackerW3PaymentSession,
  card: CardW3PaymentSession,
};
