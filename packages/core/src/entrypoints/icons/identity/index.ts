/**
 * Governed identity, security, access, compliance, and privacy icon pack.
 *
 * Named imports remain tree-shakeable. IdentityIcon is the bounded dynamic
 * resolver for surfaces that receive a runtime semantic name.
 */
export * from '../../../graphics/icons/presentation/semantic/generated/packs/identity';
export {
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_METADATA,
  IDENTITY_ICON_NAMES,
} from '../../../graphics/icons/foundation/semantic/corpus/generated';
export type {
  GeneratedIconMetadata,
  GeneratedIconStatus,
  IdentityIconName,
} from '../../../graphics/icons/foundation/semantic/corpus/generated';
export type {
  SemanticIconComponent,
  SemanticIconProps,
} from '../../../graphics/icons/runtime/semantic/create-icon';
