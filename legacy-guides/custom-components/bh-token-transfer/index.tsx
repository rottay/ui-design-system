/**
 * BhTokenTransfer - Main Export
 * Timeline of token transfers between teams
 */

import type { BhTokenTransferProps } from './core';
import { BH_TOKEN_TRANSFER_DEFAULTS } from './core';
import { BH_TOKEN_TRANSFER_PRESETS } from './presets';

export {
  type BhTokenTransferProps,
  type BhTokenTransferPreset,
  type TokenTransfer,
  type TokenTransferTeam,
  BH_TOKEN_TRANSFER_DEFAULTS,
} from './core';
export * from './presets';

export function BhTokenTransfer(props: BhTokenTransferProps): React.ReactElement {
  const preset = props.preset ?? BH_TOKEN_TRANSFER_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = BH_TOKEN_TRANSFER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTokenTransfer.displayName = 'BhTokenTransfer';
