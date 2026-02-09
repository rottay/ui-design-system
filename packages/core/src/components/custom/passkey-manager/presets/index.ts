import type { PasskeyManagerPreset } from '../core';
import { ListPasskeyManager } from './list';
import { CardsPasskeyManager } from './cards';

export { ListPasskeyManager } from './list';
export { CardsPasskeyManager } from './cards';

export const PASSKEY_MANAGER_PRESETS: Record<PasskeyManagerPreset, React.ComponentType<any>> = {
  list: ListPasskeyManager,
  cards: CardsPasskeyManager,
};
