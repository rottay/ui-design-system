import type { EntityFormProps } from './core';
import { ENTITY_FORM_DEFAULTS } from './core';
import { ENTITY_FORM_PRESETS } from './presets';

export {
  type EntityFormProps,
  type EntityFormPreset,
  type FormFieldConfig,
  type FormFieldType,
  type FormFieldOption,
  type FormSection,
  ENTITY_FORM_DEFAULTS,
} from './core';
export * from './presets';

export function EntityForm(props: EntityFormProps): React.ReactElement {
  const preset = props.preset ?? ENTITY_FORM_DEFAULTS.preset ?? 'standard';
  const PresetComponent = ENTITY_FORM_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EntityForm.displayName = 'EntityForm';
