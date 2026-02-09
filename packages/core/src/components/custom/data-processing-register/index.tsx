/**
 * DataProcessingRegister - Main Export
 * Automatically selects preset based on props
 */

import type { DataProcessingRegisterProps } from './core';
import { DATA_PROCESSING_REGISTER_DEFAULTS } from './core';
import { DATA_PROCESSING_REGISTER_PRESETS } from './presets';

export { type DataProcessingRegisterProps, type DataProcessingRegisterPreset, type ProcessingActivity, type LawfulBasis, type DataCategory, DATA_PROCESSING_REGISTER_DEFAULTS } from './core';
export { getLawfulBasisColors, getDataCategoryColors, getDataCategoryIcon } from './core';
export * from './presets';

/**
 * DataProcessingRegister component
 * Renders the appropriate preset based on the preset prop
 */
export function DataProcessingRegister(props: DataProcessingRegisterProps): React.ReactElement {
  const preset = props.preset ?? DATA_PROCESSING_REGISTER_DEFAULTS.preset ?? 'register';
  const PresetComponent = DATA_PROCESSING_REGISTER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

DataProcessingRegister.displayName = 'DataProcessingRegister';

export { RegisterDataProcessingRegister, FlowDiagramDataProcessingRegister, CardDataProcessingRegister } from './presets';
