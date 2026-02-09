/**
 * EvContractManager - Main Export
 * Artist contracts management
 * Automatically selects preset based on props
 */

import type { EvContractManagerProps } from './core';
import { EV_CONTRACT_MANAGER_DEFAULTS } from './core';
import { EV_CONTRACT_MANAGER_PRESETS } from './presets';

export {
  type EvContractManagerProps,
  type EvContractManagerPreset,
  type ArtistContract as EvContractManagerArtistContract,
  type PaymentSchedule as EvContractManagerPaymentSchedule,
  EV_CONTRACT_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvContractManager component
 * Renders the appropriate preset based on the preset prop
 */
export function EvContractManager(props: EvContractManagerProps): React.ReactElement {
  const preset = props.preset ?? EV_CONTRACT_MANAGER_DEFAULTS.preset ?? 'list';
  const PresetComponent = EV_CONTRACT_MANAGER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvContractManager.displayName = 'EvContractManager';

export { ListEvContractManager, EditorEvContractManager } from './presets';
