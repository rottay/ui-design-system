/**
 * BhKnowledgeBase - Main Export
 * Knowledge base wiki for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhKnowledgeBaseProps } from './core';
import { BH_KNOWLEDGE_BASE_DEFAULTS } from './core';
import { BH_KNOWLEDGE_BASE_PRESETS } from './presets';

export {
  type BhKnowledgeBaseProps,
  type BhKnowledgeBasePreset,
  type WikiArticle,
  type WikiCategory,
  type KnowledgeBaseData,
  BH_KNOWLEDGE_BASE_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhKnowledgeBase component
 * Renders the appropriate preset based on the preset prop
 */
export function BhKnowledgeBase(props: BhKnowledgeBaseProps): React.ReactElement {
  const preset = props.preset ?? BH_KNOWLEDGE_BASE_DEFAULTS.preset ?? 'wiki';
  const PresetComponent = BH_KNOWLEDGE_BASE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhKnowledgeBase.displayName = 'BhKnowledgeBase';

export { WikiBhKnowledgeBase } from './presets';
