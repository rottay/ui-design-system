import type { LocaleTranslations } from '@/foundation/i18n/kernel/contracts';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Recursively merges locale dictionaries while preserving namespace structure.
 *
 * A plain object spread would replace an entire translation namespace when an
 * app only wants to override one key. This helper keeps overrides surgical,
 * which is especially important for tenant-specific copy tweaks.
 */
export function mergeLocaleTranslations(
  baseTranslations?: Partial<LocaleTranslations>,
  overrideTranslations?: Partial<LocaleTranslations>
): Partial<LocaleTranslations> | undefined {
  if (!baseTranslations && !overrideTranslations) {
    return undefined;
  }

  if (!baseTranslations) {
    return overrideTranslations;
  }

  if (!overrideTranslations) {
    return baseTranslations;
  }

  const result: Record<string, unknown> = {
    ...baseTranslations,
  };

  for (const [key, value] of Object.entries(overrideTranslations)) {
    // `undefined` means "I wrote nothing here" at every layer of this merge,
    // just like it does in the config and token override partitions. It must
    // not erase a base value, a sibling, or a sibling branch.
    if (value === undefined) continue;

    const currentValue = result[key];

    if (isPlainObject(currentValue) && isPlainObject(value)) {
      result[key] = mergeLocaleTranslations(
        currentValue as Partial<LocaleTranslations>,
        value as Partial<LocaleTranslations>
      );
    } else {
      result[key] = value;
    }
  }

  return result as Partial<LocaleTranslations>;
}
