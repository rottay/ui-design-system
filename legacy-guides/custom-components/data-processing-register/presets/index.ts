/**
 * DataProcessingRegister - All Presets
 */

import type { DataProcessingRegisterPreset, DataProcessingRegisterProps } from '../core';
import type { ComponentType } from 'react';
import { RegisterDataProcessingRegister } from './register';
import { FlowDiagramDataProcessingRegister } from './flow-diagram';
import { CardDataProcessingRegister } from './card';

export { RegisterDataProcessingRegister } from './register';
export { FlowDiagramDataProcessingRegister } from './flow-diagram';
export { CardDataProcessingRegister } from './card';

export const DATA_PROCESSING_REGISTER_PRESETS: Record<DataProcessingRegisterPreset, ComponentType<DataProcessingRegisterProps>> = {
  register: RegisterDataProcessingRegister,
  'flow-diagram': FlowDiagramDataProcessingRegister,
  card: CardDataProcessingRegister,
};
