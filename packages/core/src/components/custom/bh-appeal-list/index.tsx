/**
 * BhAppealList - Main Export
 * Appeal list with status tracking for BitHire ATS platform
 */

import type { BhAppealListProps } from './core';
import { BH_APPEAL_LIST_DEFAULTS } from './core';
import { BH_APPEAL_LIST_PRESETS } from './presets';

export {
  type BhAppealListProps,
  type BhAppealListPreset,
  type AppealListItem,
  BH_APPEAL_LIST_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhAppealList component
 * Renders the appropriate preset based on the preset prop
 */
export function BhAppealList(props: BhAppealListProps): React.ReactElement {
  const preset = props.preset ?? BH_APPEAL_LIST_DEFAULTS.preset ?? 'table';
  const PresetComponent = BH_APPEAL_LIST_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAppealList.displayName = 'BhAppealList';

export { TableBhAppealList, CompactBhAppealList } from './presets';
