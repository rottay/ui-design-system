import type { PasskeyManagerPreset, PasskeyManagerProps } from '../core';
import type { ComponentType } from 'react';
import { ListPasskeyManager } from './list';
import { CardsPasskeyManager } from './cards';

export { ListPasskeyManager } from './list';
export { CardsPasskeyManager } from './cards';

export const PASSKEY_MANAGER_PRESETS: Record<PasskeyManagerPreset, ComponentType<PasskeyManagerProps>> = {
  list: ListPasskeyManager,
  cards: CardsPasskeyManager,
};
