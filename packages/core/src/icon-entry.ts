/**
 * Dedicated public icon entry for `@rottay/design-system/icons`.
 *
 * `Icon` is the supplier-independent product facade. The named Lucide-shaped
 * catalog remains exported only as a compatibility surface during migration.
 * The entry file deliberately does not shadow the `src/icons/` directory.
 * Internal `../icons` imports therefore resolve to the legacy internal barrel,
 * while this focused package subpath alone can reach the Phosphor adapter.
 */
export * from './icons/index';
export {
  Icon,
  ICON_CORPUS,
  ICON_NAMES,
  ICON_PROVENANCE,
  isIconName,
} from './icons/semantic';
export type {
  IconCorpusEntry,
  IconMirroring,
  IconName,
  IconProps,
  IconProvenance,
  IconRole,
  IconState,
  IconTone,
  SemanticIconSize,
} from './icons/semantic';
