/**
 * BhRequisitionBubble - All Presets
 */

import type { BhRequisitionBubblePreset, BhRequisitionBubbleProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhRequisitionBubble } from './standard';

export { StandardBhRequisitionBubble } from './standard';

export const BH_REQUISITION_BUBBLE_PRESETS: Record<BhRequisitionBubblePreset, ComponentType<BhRequisitionBubbleProps>> = {
  standard: StandardBhRequisitionBubble,
};
