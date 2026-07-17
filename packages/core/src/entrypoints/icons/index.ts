/**
 * Dedicated public icon entry for `@rottay/design-system/icons`.
 *
 * `Icon` is the supplier-independent product facade. The named Lucide-shaped
 * catalog remains exported only as a compatibility surface during migration.
 * The entry file deliberately does not shadow the canonical
 * `src/graphics/icons/` owner.
 * Only this focused package subpath can reach the Phosphor adapter.
 */
export * from '../../graphics/icons';
export { Icon } from '../../graphics/icons/presentation/semantic-icon';
export {
  ICON_CORPUS,
  ICON_NAMES,
  isIconName,
} from '../../graphics/icons/foundation/contracts/registry';
export { ICON_PROVENANCE } from '../../graphics/icons/foundation/contracts/provenance';
export type { IconCorpusEntry, IconName } from '../../graphics/icons/foundation/contracts/registry';
export type { IconProps } from '../../graphics/icons/foundation/contracts/registry/semantic';
export type {
  IconMirroring,
  IconProvenance,
  IconRole,
  IconState,
  IconTone,
  SemanticIconSize,
} from '../../graphics/icons/foundation/contracts';
