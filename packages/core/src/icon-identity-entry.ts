/**
 * Governed identity, security, access, compliance, and privacy icon pack.
 *
 * Named imports remain tree-shakeable. IdentityIcon is the bounded dynamic
 * resolver for surfaces that receive a runtime semantic name.
 */
export * from './icons/semantic/generated/packs/identity';
export {
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_METADATA,
  IDENTITY_ICON_NAMES,
} from './icons/semantic/generated/corpus';
export type {
  GeneratedIconMetadata,
  GeneratedIconStatus,
  IdentityIconName,
} from './icons/semantic/generated/corpus';
export type {
  SemanticIconComponent,
  SemanticIconProps,
} from './icons/semantic/runtime/create-semantic-icon';
