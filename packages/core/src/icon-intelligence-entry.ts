/**
 * Governed analytics, data, and AI semantic icon pack.
 *
 * Named imports remain tree-shakeable. IntelligenceIcon is the bounded
 * dynamic resolver for surfaces that receive a runtime semantic name.
 */
export * from './icons/semantic/generated/packs/intelligence';
export {
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_METADATA,
  INTELLIGENCE_ICON_NAMES,
} from './icons/semantic/generated/corpus';
export type {
  GeneratedIconMetadata,
  GeneratedIconStatus,
  IntelligenceIconName,
} from './icons/semantic/generated/corpus';
export type {
  SemanticIconComponent,
  SemanticIconProps,
} from './icons/semantic/runtime/create-semantic-icon';
