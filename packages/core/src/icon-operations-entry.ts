/**
 * Governed billing, commerce, workflow, and operations icon pack.
 *
 * Named imports remain tree-shakeable. OperationsIcon is the bounded dynamic
 * resolver for surfaces that receive a runtime semantic name.
 */
export * from './icons/semantic/generated/packs/operations';
export {
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_METADATA,
  OPERATIONS_ICON_NAMES,
} from './icons/semantic/generated/corpus';
export type {
  GeneratedIconMetadata,
  GeneratedIconStatus,
  OperationsIconName,
} from './icons/semantic/generated/corpus';
export type {
  SemanticIconComponent,
  SemanticIconProps,
} from './icons/semantic/runtime/create-semantic-icon';
