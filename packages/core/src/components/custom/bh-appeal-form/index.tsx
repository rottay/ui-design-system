/**
 * BhAppealForm - Main Export
 * Appeal submission form for BitHire ATS platform
 */

import type { BhAppealFormProps } from './core';
import { BH_APPEAL_FORM_DEFAULTS } from './core';
import { BH_APPEAL_FORM_PRESETS } from './presets';

export {
  type BhAppealFormProps,
  type BhAppealFormPreset,
  BH_APPEAL_FORM_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhAppealForm component
 * Renders the appropriate preset based on the preset prop
 */
export function BhAppealForm(props: BhAppealFormProps): React.ReactElement {
  const preset = props.preset ?? BH_APPEAL_FORM_DEFAULTS.preset ?? 'form';
  const PresetComponent = BH_APPEAL_FORM_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAppealForm.displayName = 'BhAppealForm';

export { FormBhAppealForm, CompactBhAppealForm } from './presets';
