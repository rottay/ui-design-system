/**
 * BarSupplierDirectory - Main Export
 * Supplier management table
 */

import type { BarSupplierDirectoryProps } from './core';
import { BAR_SUPPLIER_DIRECTORY_DEFAULTS } from './core';
import { BAR_SUPPLIER_DIRECTORY_PRESETS } from './presets';

export {
  type BarSupplierDirectoryProps,
  type BarSupplierDirectoryPreset,
  type Supplier as BarSupplier,
  BAR_SUPPLIER_DIRECTORY_DEFAULTS,
} from './core';
export * from './presets';

export function BarSupplierDirectory(props: BarSupplierDirectoryProps): React.ReactElement {
  const preset = props.preset ?? BAR_SUPPLIER_DIRECTORY_DEFAULTS.preset ?? 'table';
  const PresetComponent = BAR_SUPPLIER_DIRECTORY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BarSupplierDirectory.displayName = 'BarSupplierDirectory';

export { TableBarSupplierDirectory, CardsBarSupplierDirectory } from './presets';
