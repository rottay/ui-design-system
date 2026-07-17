/**
 * Governed billing, commerce, workflow, and operations icon pack.
 *
 * Named imports remain tree-shakeable. OperationsIcon is the bounded dynamic
 * resolver for surfaces that receive a runtime semantic name.
 */
export * from '../../../graphics/icons/presentation/semantic/generated/packs/operations';
export {
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_METADATA,
  OPERATIONS_ICON_NAMES,
} from '../../../graphics/icons/foundation/semantic/corpus/generated';
export type {
  GeneratedIconMetadata,
  GeneratedIconStatus,
  OperationsIconName,
} from '../../../graphics/icons/foundation/semantic/corpus/generated';
export type {
  SemanticIconComponent,
  SemanticIconProps,
} from '../../../graphics/icons/runtime/semantic/create-icon';
