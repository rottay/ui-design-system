/**
 * BhPositionForm - Main Export
 * Position creation/edit form for BitHire ATS platform
 */

import type { BhPositionFormProps } from './core';
import { BH_POSITION_FORM_DEFAULTS } from './core';
import { BH_POSITION_FORM_PRESETS } from './presets';

export {
  type BhPositionFormProps,
  type BhPositionFormPreset,
  type PositionFormData,
  BH_POSITION_FORM_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhPositionForm component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPositionForm(props: BhPositionFormProps): React.ReactElement {
  const preset = props.preset ?? BH_POSITION_FORM_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_POSITION_FORM_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPositionForm.displayName = 'BhPositionForm';
