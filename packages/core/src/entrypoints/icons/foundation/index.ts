/**
 * Governed foundation semantic icon pack.
 *
 * Applications import semantic components from this focused entry instead of
 * importing a supplier. Named imports remain tree-shakeable; FoundationIcon is
 * the bounded dynamic resolver for screens that genuinely need runtime names.
 */
export * from '../../../graphics/icons/presentation/semantic/generated/packs/foundation';
export {
  FOUNDATION_ICON_NAMES,
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_METADATA,
} from '../../../graphics/icons/foundation/semantic/corpus/generated';
export type {
  FoundationIconName,
  GeneratedIconMetadata,
  GeneratedIconStatus,
} from '../../../graphics/icons/foundation/semantic/corpus/generated';
export type {
  SemanticIconComponent,
  SemanticIconProps,
} from '../../../graphics/icons/runtime/semantic/create-icon';
