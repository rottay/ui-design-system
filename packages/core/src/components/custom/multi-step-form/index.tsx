import type { MultiStepFormProps } from './core';
import { MULTI_STEP_FORM_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { MultiStepFormProps, MultiStepFormPreset, FormStep } from './core';
export { MULTI_STEP_FORM_DEFAULTS } from './core';

export function MultiStepForm(props: MultiStepFormProps): React.ReactElement {
  const preset = props.preset ?? MULTI_STEP_FORM_DEFAULTS.preset ?? 'stepper';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

MultiStepForm.displayName = 'MultiStepForm';
