import {
  GENERATED_ICON_NAMES,
  getGeneratedIconMetadata,
  isGeneratedIconName,
  type GeneratedIconMetadata,
  type GeneratedIconName,
} from '../../semantic/corpus/generated';

/** Canonical semantic names, generated from the governed corpus manifest. */
export const ICON_NAMES = GENERATED_ICON_NAMES;

/** Maturity is metadata: every governed stable or candidate name is valid. */
export type IconName = GeneratedIconName;

export interface IconCorpusEntry extends GeneratedIconMetadata {
  /** Compatibility alias for the generated metadata `id`. */
  readonly name: IconName;
  /** Compatibility alias for the generated metadata `defaultRole`. */
  readonly role: GeneratedIconMetadata['defaultRole'];
}

/** Public, supplier-free corpus metadata for app registries and canaries. */
export const ICON_CORPUS: readonly IconCorpusEntry[] = Object.freeze(
  ICON_NAMES.map((name) => getGeneratedIconMetadata(name)).map((metadata) => Object.freeze({
    ...metadata,
    name: metadata.id,
    role: metadata.defaultRole,
  })),
);

const CORPUS_BY_NAME = new Map<IconName, IconCorpusEntry>(
  ICON_CORPUS.map((entry) => [entry.name, entry]),
);

/** Fail-closed guard for untyped JavaScript, persisted config, and host input. */
export function isIconName(value: unknown): value is IconName {
  return isGeneratedIconName(value);
}

export function getIconCorpusEntry(name: IconName): IconCorpusEntry {
  // ICON_NAMES and ICON_CORPUS are constructed together; this is exhaustive.
  return CORPUS_BY_NAME.get(name) as IconCorpusEntry;
}
