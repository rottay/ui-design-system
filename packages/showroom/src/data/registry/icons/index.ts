/**
 * Icons Registry
 *
 * Read view of the public canonical semantic icon corpus exposed by
 * `@rottay/design-system/icons`. Every governed stable or candidate role is
 * listed; maturity is metadata, never a reason to omit a role. Categories are
 * the corpus domains themselves, derived at module load — there is no second
 * hand-maintained taxonomy. Historical named supplier glyphs stay private to
 * their component owners and are not this catalog's inventory.
 */

import {
  ICON_CORPUS,
  isIconName,
  type IconCorpusEntry,
  type IconName,
} from '@rottay/design-system/icons';

/** Explorer category; alias for the canonical corpus domain. */
export type IconCategory = IconCorpusEntry['domain'];

export interface IconEntry {
  /** Unique stable slug derived from the semantic id (`action.add` -> `action-add`). */
  slug: string;
  /** Canonical semantic name accepted by `<Icon name={...} />`. */
  name: IconName;
  /** Corpus domain; the explorer's grouping category. */
  category: IconCategory;
  /** Search text derived from canonical metadata: id, component name, and intent. */
  searchAlias: string;
  /** Governed corpus intent sentence. */
  intent: string;
  /** Corpus pack the role belongs to. */
  pack: IconCorpusEntry['pack'];
  /** Governance maturity; honest metadata, shown but never used to omit a role. */
  status: IconCorpusEntry['status'];
  defaultRole: IconCorpusEntry['defaultRole'];
  autoMirror: boolean;
  since: number;
}

function toStableSlug(name: string) {
  return name.replace(/\./g, '-');
}

function toCategoryLabel(domain: IconCategory) {
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

function toRegistryEntry(corpusEntry: IconCorpusEntry): IconEntry {
  return {
    slug: toStableSlug(corpusEntry.id),
    name: corpusEntry.name,
    category: corpusEntry.domain,
    searchAlias: `${corpusEntry.id} ${corpusEntry.componentName} ${corpusEntry.intent}`,
    intent: corpusEntry.intent,
    pack: corpusEntry.pack,
    status: corpusEntry.status,
    defaultRole: corpusEntry.defaultRole,
    autoMirror: corpusEntry.autoMirror,
    since: corpusEntry.since,
  };
}

/**
 * Clipboard-ready usage snippet for one governed role through `Icon`, the
 * standard semantic-product usage API; retained icon helpers stay supported.
 */
export function buildIconSnippet(name: IconName): string {
  return `import { Icon } from '@rottay/design-system/icons';\n\n<Icon name="${name}" decorative />`;
}

// ---------------------------------------------------------------------------
// Canonical projection
// ---------------------------------------------------------------------------

/** The full governed semantic corpus, in canonical order. */
export const icons: IconEntry[] = ICON_CORPUS.map(toRegistryEntry);

/** Corpus partitioned by domain; every role appears exactly once. */
export const iconsByCategory: Record<IconCategory, IconEntry[]> = {};

for (const entry of icons) {
  const group = iconsByCategory[entry.category] ?? [];
  if (group.length === 0) iconsByCategory[entry.category] = group;
  group.push(entry);
}

/** Domains in first-appearance corpus order, with derived labels and counts. */
export const iconCategories: { slug: IconCategory; label: string; count: number }[] = [];

for (const entry of icons) {
  const category = iconCategories.find((item) => item.slug === entry.category);
  if (category) {
    category.count += 1;
  } else {
    iconCategories.push({ slug: entry.category, label: toCategoryLabel(entry.category), count: 1 });
  }
}

/** Fail-closed guard re-exported so explorers and tests share one validation. */
export { isIconName };
