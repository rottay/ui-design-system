import type { IconRole } from './types';

/**
 * Fixed v1 semantic corpus. Names describe product meaning, never supplier glyphs.
 * Additions require an explicit corpus/version review; aliases do not belong here.
 */
export const ICON_NAMES = [
  'action.add',
  'action.edit',
  'action.delete',
  'action.copy',
  'action.search',
  'action.filter',
  'action.close',
  'action.confirm',
  'action.retry',
  'action.play',
  'navigation.home',
  'navigation.back',
  'navigation.forward',
  'navigation.expand',
  'navigation.menu',
  'navigation.settings',
  'navigation.profile',
  'status.success',
  'status.warning',
  'status.error',
  'status.info',
  'status.loading',
  'status.secure',
  'communication.email',
  'communication.message',
  'communication.notification',
  'communication.voice',
  'communication.call',
  'data.chart',
  'data.table',
  'data.gauge',
  'data.trend',
  'ai.assistant',
  'ai.reasoning',
  'ai.sparkles',
  'ai.tool',
  'bithire.candidate',
  'bithire.interview',
  'bithire.pipeline',
  'bithire.evidence',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export interface IconCorpusEntry {
  readonly name: IconName;
  readonly role: IconRole;
  /** Directional glyphs use CSS logical direction and never inspect document. */
  readonly autoMirror: boolean;
}

const ICON_NAME_SET: ReadonlySet<string> = new Set(ICON_NAMES);
const AUTO_MIRRORED_NAMES: ReadonlySet<IconName> = new Set([
  'navigation.back',
  'navigation.forward',
]);

function roleForName(name: IconName): IconRole {
  if (name.startsWith('navigation.')) return 'navigation';
  if (name.startsWith('status.')) return 'status';
  if (name.startsWith('data.') || name.startsWith('ai.') || name.startsWith('bithire.')) {
    return 'feature';
  }
  return 'control';
}

/** Public, supplier-free corpus metadata for app registries and canaries. */
export const ICON_CORPUS: readonly IconCorpusEntry[] = Object.freeze(
  ICON_NAMES.map((name) => Object.freeze({
    name,
    role: roleForName(name),
    autoMirror: AUTO_MIRRORED_NAMES.has(name),
  })),
);

const CORPUS_BY_NAME = new Map<IconName, IconCorpusEntry>(
  ICON_CORPUS.map((entry) => [entry.name, entry]),
);

/** Fail-closed guard for untyped JavaScript, persisted config, and host input. */
export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && ICON_NAME_SET.has(value);
}

export function getIconCorpusEntry(name: IconName): IconCorpusEntry {
  // ICON_NAMES and ICON_CORPUS are constructed together; this is exhaustive.
  return CORPUS_BY_NAME.get(name) as IconCorpusEntry;
}
