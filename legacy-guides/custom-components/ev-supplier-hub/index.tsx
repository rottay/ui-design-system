/**
 * EvSupplierHub - Main Export
 * Supplier management
 * Automatically selects preset based on props
 */

import type { EvSupplierHubProps } from './core';
import { EV_SUPPLIER_HUB_DEFAULTS } from './core';
import { EV_SUPPLIER_HUB_PRESETS } from './presets';

export {
  type EvSupplierHubProps,
  type EvSupplierHubPreset,
  type Supplier as EvSupplierHubSupplier,
  type SupplierOrder as EvSupplierHubSupplierOrder,
  EV_SUPPLIER_HUB_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvSupplierHub component
 * Renders the appropriate preset based on the preset prop
 */
export function EvSupplierHub(props: EvSupplierHubProps): React.ReactElement {
  const preset = props.preset ?? EV_SUPPLIER_HUB_DEFAULTS.preset ?? 'directory';
  const PresetComponent = EV_SUPPLIER_HUB_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvSupplierHub.displayName = 'EvSupplierHub';

export { DirectoryEvSupplierHub, OrdersEvSupplierHub } from './presets';
