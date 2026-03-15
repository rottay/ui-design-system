export { StandardEntityForm } from './standard';
export { CardEntityForm } from './card';

import type { EntityFormPreset } from '../core';
import type { ComponentType } from 'react';
import type { EntityFormProps } from '../core';
import { StandardEntityForm } from './standard';
import { CardEntityForm } from './card';

export const ENTITY_FORM_PRESETS: Record<EntityFormPreset, ComponentType<EntityFormProps>> = {
  standard: StandardEntityForm,
  card: CardEntityForm,
};
