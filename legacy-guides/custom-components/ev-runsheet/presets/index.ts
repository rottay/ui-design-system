export { ProducerEvRunsheet } from './producer';
export { DisplayEvRunsheet } from './display';

import type { RunsheetPreset } from '../core';
import type { ComponentType } from 'react';
import type { RunsheetProps } from '../core';
import { ProducerEvRunsheet } from './producer';
import { DisplayEvRunsheet } from './display';

export const PRESETS: Record<RunsheetPreset, ComponentType<RunsheetProps>> = {
  producer: ProducerEvRunsheet,
  display: DisplayEvRunsheet,
};
