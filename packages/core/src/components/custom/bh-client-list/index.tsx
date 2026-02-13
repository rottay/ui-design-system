/**
 * BhClientList - Main Export
 * Client DataTable + grid view for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhClientListProps } from './core';
import { BH_CLIENT_LIST_DEFAULTS } from './core';
import { BH_CLIENT_LIST_PRESETS } from './presets';

export {
  type BhClientListProps,
  type BhClientListPreset,
  type ClientListItem,
  BH_CLIENT_LIST_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhClientList component
 * Renders the appropriate preset based on the preset prop
 */
export function BhClientList(props: BhClientListProps): React.ReactElement {
  const preset = props.preset ?? BH_CLIENT_LIST_DEFAULTS.preset ?? 'table';
  const PresetComponent = BH_CLIENT_LIST_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhClientList.displayName = 'BhClientList';

export { TableBhClientList, GridBhClientList } from './presets';
