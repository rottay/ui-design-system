/**
 * Governed foundation semantic icon pack.
 *
 * Applications import semantic components from this focused entry instead of
 * importing a supplier. Named imports remain tree-shakeable; FoundationIcon is
 * the bounded dynamic resolver for screens that genuinely need runtime names.
 */
export * from './icons/semantic/generated/packs/foundation';
export {
  FOUNDATION_ICON_NAMES,
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_METADATA,
} from './icons/semantic/generated/corpus';
export type {
  FoundationIconName,
  GeneratedIconMetadata,
  GeneratedIconStatus,
} from './icons/semantic/generated/corpus';
export type {
  SemanticIconComponent,
  SemanticIconProps,
} from './icons/semantic/runtime/create-semantic-icon';
