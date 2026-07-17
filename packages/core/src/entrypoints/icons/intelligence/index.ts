/**
 * Governed analytics, data, and AI semantic icon pack.
 *
 * Named imports remain tree-shakeable. IntelligenceIcon is the bounded
 * dynamic resolver for surfaces that receive a runtime semantic name.
 */
export * from '../../../graphics/icons/presentation/semantic/generated/packs/intelligence';
export {
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_METADATA,
  INTELLIGENCE_ICON_NAMES,
} from '../../../graphics/icons/foundation/semantic/corpus/generated';
export type {
  GeneratedIconMetadata,
  GeneratedIconStatus,
  IntelligenceIconName,
} from '../../../graphics/icons/foundation/semantic/corpus/generated';
export type {
  SemanticIconComponent,
  SemanticIconProps,
} from '../../../graphics/icons/runtime/semantic/create-icon';
