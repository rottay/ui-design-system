import type { AddressFormProps } from './core';
import { ADDRESS_FORM_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { AddressFormProps, AddressFormPreset, AddressData } from './core';
export { ADDRESS_FORM_DEFAULTS } from './core';

export function AddressForm(props: AddressFormProps): React.ReactElement {
  const preset = props.preset ?? ADDRESS_FORM_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

AddressForm.displayName = 'AddressForm';
