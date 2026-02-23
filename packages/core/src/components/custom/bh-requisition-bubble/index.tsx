/**
 * BhRequisitionBubble - Main Export
 * SVG bubble chart for visualizing multi-dimensional requisition data.
 */

import type { BhRequisitionBubbleProps } from './core';
import { BH_REQUISITION_BUBBLE_DEFAULTS } from './core';
import { BH_REQUISITION_BUBBLE_PRESETS } from './presets';

export {
  type BhRequisitionBubbleProps,
  type BhRequisitionBubblePreset,
  type BubbleDataPoint,
  type BubbleAxis,
  type BubbleData,
  BH_REQUISITION_BUBBLE_DEFAULTS,
} from './core';
export * from './presets';

export function BhRequisitionBubble(props: BhRequisitionBubbleProps): React.ReactElement {
  const preset = props.preset ?? BH_REQUISITION_BUBBLE_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_REQUISITION_BUBBLE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhRequisitionBubble.displayName = 'BhRequisitionBubble';

export { StandardBhRequisitionBubble } from './presets';
