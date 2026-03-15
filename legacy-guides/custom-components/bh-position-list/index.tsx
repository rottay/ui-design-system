/**
 * BhPositionList - Main Export
 * Position DataTable with filters for BitHire ATS platform
 */

import type { BhPositionListProps } from './core';
import { BH_POSITION_LIST_DEFAULTS } from './core';
import { BH_POSITION_LIST_PRESETS } from './presets';

export {
  type BhPositionListProps,
  type BhPositionListPreset,
  type PositionListItem,
  BH_POSITION_LIST_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhPositionList component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPositionList(props: BhPositionListProps): React.ReactElement {
  const preset = props.preset ?? BH_POSITION_LIST_DEFAULTS.preset ?? 'table';
  const PresetComponent = BH_POSITION_LIST_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPositionList.displayName = 'BhPositionList';
