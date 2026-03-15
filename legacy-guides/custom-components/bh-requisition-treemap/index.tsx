/**
 * BhRequisitionTreemap - Main Export
 * SVG treemap for visualizing hierarchical requisition data.
 */

import type { BhRequisitionTreemapProps } from './core';
import { BH_REQUISITION_TREEMAP_DEFAULTS } from './core';
import { BH_REQUISITION_TREEMAP_PRESETS } from './presets';

export {
  type BhRequisitionTreemapProps,
  type BhRequisitionTreemapPreset,
  type TreemapNode,
  type TreemapData,
  BH_REQUISITION_TREEMAP_DEFAULTS,
} from './core';
export * from './presets';

export function BhRequisitionTreemap(props: BhRequisitionTreemapProps): React.ReactElement {
  const preset = props.preset ?? BH_REQUISITION_TREEMAP_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_REQUISITION_TREEMAP_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhRequisitionTreemap.displayName = 'BhRequisitionTreemap';

export { StandardBhRequisitionTreemap } from './presets';
