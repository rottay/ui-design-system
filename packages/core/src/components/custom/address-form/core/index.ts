import type { EngineAwareProps } from '../../../../types';

export type AddressFormPreset = 'standard' | 'compact';

export interface AddressData {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface AddressFormProps extends EngineAwareProps {
  preset?: AddressFormPreset;
  value?: AddressData;
  onChange?: (value: AddressData) => void;
  onSubmit?: (value: AddressData) => void;
  countries?: { code: string; name: string }[];
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ADDRESS_FORM_DEFAULTS = {
  preset: 'standard' as AddressFormPreset,
  required: false,
  countries: [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
  ],
};
