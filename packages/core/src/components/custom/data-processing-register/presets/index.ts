/**
 * DataProcessingRegister - All Presets
 */

import type { DataProcessingRegisterPreset } from '../core';
import { RegisterDataProcessingRegister } from './register';
import { FlowDiagramDataProcessingRegister } from './flow-diagram';
import { CardDataProcessingRegister } from './card';

export { RegisterDataProcessingRegister } from './register';
export { FlowDiagramDataProcessingRegister } from './flow-diagram';
export { CardDataProcessingRegister } from './card';

export const DATA_PROCESSING_REGISTER_PRESETS: Record<DataProcessingRegisterPreset, React.ComponentType<any>> = {
  register: RegisterDataProcessingRegister,
  'flow-diagram': FlowDiagramDataProcessingRegister,
  card: CardDataProcessingRegister,
};
