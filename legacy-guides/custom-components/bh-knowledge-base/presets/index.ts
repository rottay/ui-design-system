/**
 * BhKnowledgeBase - All Presets
 */

export { WikiBhKnowledgeBase } from './wiki';

import type { BhKnowledgeBasePreset } from '../core';
import type { ComponentType } from 'react';
import type { BhKnowledgeBaseProps } from '../core';
import { WikiBhKnowledgeBase } from './wiki';

export const BH_KNOWLEDGE_BASE_PRESETS: Record<BhKnowledgeBasePreset, ComponentType<BhKnowledgeBaseProps>> = {
  wiki: WikiBhKnowledgeBase,
};
