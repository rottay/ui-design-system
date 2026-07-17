/**
 * Supplier-free metadata entry for the governed semantic icon corpus.
 *
 * This entry intentionally exports no glyph components. Tooling, editors and
 * server-side registries can inspect names and semantics without loading an
 * icon supplier or a React renderer.
 */
export {
  BITHIRE_ICON_NAMES,
  FOUNDATION_ICON_NAMES,
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_METADATA,
  GENERATED_ICON_NAMES,
} from './icons/semantic/generated/corpus';
export type {
  BithireIconName,
  FoundationIconName,
  GeneratedIconMetadata,
  GeneratedIconName,
  GeneratedIconPack,
  GeneratedIconStatus,
} from './icons/semantic/generated/corpus';
