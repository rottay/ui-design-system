import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { FIRST_PARTY_VERTICAL_SLUGS } from '@/foundation/contracts/kernel/verticals';
import { BRAND_MARK_NAMES, CLOUD_PROVIDERS, CLOUD_SERVICES } from '../../marks/foundation/catalog';
import { FEATURE_PICTOGRAM_CORPUS } from '../../pictograms/foundation/catalog';

const GRAPHICS_ROOT = resolve(__dirname, '../..');

interface CorpusEntry {
  readonly key: string;
  /** Classification fields that may name an owner: family, pack, domain. */
  readonly classes: readonly string[];
}

interface SemanticIconRow {
  readonly id: string;
  readonly pack: string;
  readonly domain: string;
}

const semanticIconRows = (): readonly SemanticIconRow[] =>
  (
    JSON.parse(
      readFileSync(join(GRAPHICS_ROOT, 'icons/semantic/sources/corpus/manifest.json'), 'utf8'),
    ) as { entries: SemanticIconRow[] }
  ).entries;

/** Every shared corpus of the graphics tier, by its authoring file. Per-vertical presets
 * (`icons/semantic/sources/presets/<vertical>`) are the sanctioned home for vertical vocabulary. */
const SHARED_CORPORA: Readonly<Record<string, () => readonly CorpusEntry[]>> = {
  'pictograms/foundation/catalog/index.ts': () =>
    FEATURE_PICTOGRAM_CORPUS.map((entry) => ({ key: entry.name, classes: [entry.family] })),
  'marks/foundation/catalog/index.ts': () => [
    ...BRAND_MARK_NAMES.map((name) => ({ key: name, classes: [] })),
    ...CLOUD_PROVIDERS.map((name) => ({ key: name, classes: [] })),
    ...CLOUD_SERVICES.map((name) => ({ key: name, classes: [] })),
  ],
  'icons/semantic/sources/corpus/manifest.json': () =>
    semanticIconRows().map((row) => ({ key: row.id, classes: [row.pack, row.domain] })),
};

/**
 * The six BitHire roles conserved in the shared icon corpus by WO-RET-01 E6
 * (domain ownership open in WO-RET-06). Exact by id: the set may only shrink.
 */
const CONSERVED_VERTICAL_ENTRIES: Readonly<Record<string, readonly string[]>> = {
  'icons/semantic/sources/corpus/manifest.json': [
    'bithire.candidate',
    'bithire.evidence',
    'bithire.interview',
    'bithire.job',
    'bithire.offer',
    'bithire.pipeline',
  ],
};

function verticalSemantics(
  entries: readonly CorpusEntry[],
  verticals: readonly string[] = FIRST_PARTY_VERTICAL_SLUGS,
): string[] {
  const owned = new Set(verticals);
  return entries
    .filter(
      (entry) =>
        entry.key.split(/[./\-_]/u).some((segment) => owned.has(segment))
        || entry.classes.some((value) => owned.has(value)),
    )
    .map((entry) => entry.key)
    .sort();
}

function corpusSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return corpusSourceFiles(path);
    const rel = relative(GRAPHICS_ROOT, path);
    const isCatalog = /(^|\/)foundation\/catalog\/index\.ts$/u.test(rel);
    const isCorpus = /(^|\/)sources\/corpus\/[^/]+\.json$/u.test(rel) && !rel.endsWith('.schema.json');
    return isCatalog || isCorpus ? [rel] : [];
  });
}

describe('shared graphics corpora carry no vertical semantics', () => {
  it('registers every shared corpus source in the graphics tier', () => {
    expect(corpusSourceFiles(GRAPHICS_ROOT).sort()).toEqual(Object.keys(SHARED_CORPORA).sort());
  });

  it.each(Object.entries(SHARED_CORPORA))('%s names no first-party vertical', (source, read) => {
    expect(verticalSemantics(read())).toEqual([...(CONSERVED_VERTICAL_ENTRIES[source] ?? [])].sort());
  });

  it('catches a vertical entry by name segment and by classification (drill)', () => {
    expect(
      verticalSemantics([
        { key: 'analytics-insight', classes: ['data'] },
        { key: 'candidate-evidence', classes: ['bithire'] },
        { key: 'evnto.ticket', classes: [] },
        { key: 'event-moment', classes: ['evnto'] },
      ]),
    ).toEqual(['candidate-evidence', 'event-moment', 'evnto.ticket']);
  });
});
