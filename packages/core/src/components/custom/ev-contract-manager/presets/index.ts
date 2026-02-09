/**
 * EvContractManager - All Presets
 */

export { ListEvContractManager } from './list';
export { EditorEvContractManager } from './editor';

import type { EvContractManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvContractManagerProps } from '../core';
import { ListEvContractManager } from './list';
import { EditorEvContractManager } from './editor';

export const EV_CONTRACT_MANAGER_PRESETS: Record<EvContractManagerPreset, ComponentType<EvContractManagerProps>> = {
  list: ListEvContractManager,
  editor: EditorEvContractManager,
};
