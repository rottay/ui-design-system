/**
 * BhAgentStudio - All Presets
 */

export { FullBhAgentStudio } from './full';
export { GuidedBhAgentStudio } from './guided';

import type { BhAgentStudioPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhAgentStudioProps } from '../core';
import { FullBhAgentStudio } from './full';
import { GuidedBhAgentStudio } from './guided';

export const BH_AGENT_STUDIO_PRESETS: Record<BhAgentStudioPreset, ComponentType<BhAgentStudioProps>> = {
  full: FullBhAgentStudio,
  guided: GuidedBhAgentStudio,
};
