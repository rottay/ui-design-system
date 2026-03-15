import type { AddressFormPreset, AddressFormProps } from '../core';
import { StandardPreset } from './standard';
import { CompactPreset } from './compact';

export const PRESETS: Record<
  AddressFormPreset,
  React.ComponentType<AddressFormProps>
> = {
  standard: StandardPreset,
  compact: CompactPreset,
};
