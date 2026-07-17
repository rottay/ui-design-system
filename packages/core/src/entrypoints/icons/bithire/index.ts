/**
 * BitHire-specific semantic icon pack.
 *
 * The vertical pack is separate from the shared foundation so other products
 * never pay for recruiting vocabulary. BithireIcon is its bounded dynamic
 * resolver; named imports are the preferred application API.
 */
export * from '../../../graphics/icons/presentation/semantic/generated/packs/bithire';
export {
  BITHIRE_ICON_NAMES,
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_METADATA,
} from '../../../graphics/icons/foundation/semantic/corpus/generated';
export type {
  BithireIconName,
  GeneratedIconMetadata,
  GeneratedIconStatus,
} from '../../../graphics/icons/foundation/semantic/corpus/generated';
export type {
  SemanticIconComponent,
  SemanticIconProps,
} from '../../../graphics/icons/runtime/semantic/create-icon';
