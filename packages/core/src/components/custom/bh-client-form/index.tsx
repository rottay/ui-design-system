/**
 * BhClientForm - Main Export
 * Client creation/edit form for BitHire ATS platform
 */

import type { BhClientFormProps } from './core';
import { BH_CLIENT_FORM_DEFAULTS } from './core';
import { BH_CLIENT_FORM_PRESETS } from './presets';

export {
  type BhClientFormProps,
  type BhClientFormPreset,
  type ClientFormData,
  BH_CLIENT_FORM_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhClientForm component
 * Renders the appropriate preset based on the preset prop
 */
export function BhClientForm(props: BhClientFormProps): React.ReactElement {
  const preset = props.preset ?? BH_CLIENT_FORM_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_CLIENT_FORM_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhClientForm.displayName = 'BhClientForm';
