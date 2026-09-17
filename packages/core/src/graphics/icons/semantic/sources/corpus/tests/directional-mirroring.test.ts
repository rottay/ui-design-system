/**
 * Corpus gate: a directional glyph cannot land in the corpus unflagged.
 *
 * Every row whose pinned supplier glyph belongs to a directional family must
 * either mirror (`autoMirror: true`) or appear below with an adjudicated
 * reason. The two bands are deliberately different things: NON_MIRRORING is a
 * decision (the glyph's axis is not the reading axis), FROZEN_PREFIX_DEBT is a
 * defect that cannot be repaired here (the v4 126-row prefix is fingerprinted
 * by the generator, so flipping one of those rows fails corpus validation).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  isDirectionalGlyphFamily,
  mirrorsInRtl,
} from '../../../../glyphs/foundation/directionality';

interface CorpusEntry {
  readonly id: string;
  readonly autoMirror: boolean;
  readonly review?: string;
}

interface AdapterEntry {
  readonly id: string;
  readonly exportName: string;
}

const PACKAGE_ROOT = resolve(__dirname, '../../../../../../..');

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(resolve(PACKAGE_ROOT, relativePath), 'utf8')) as T;
}

const corpus = readJson<{ entries: CorpusEntry[] }>(
  'src/graphics/icons/semantic/sources/corpus/manifest.json',
);
const adapter = readJson<{ entries: AdapterEntry[] }>(
  'src/graphics/icons/semantic/sources/adapters/phosphor-2.1.10.json',
);

/** Directional-family rows that must NOT mirror, each with the reason. */
const NON_MIRRORING: ReadonlyMap<string, string> = new Map([
  ['action.retry', 'ArrowClockwise is rotational; its axis is not the reading axis.'],
  ['action.refresh', 'ArrowsClockwise is rotational; its axis is not the reading axis.'],
  ['action.sort', 'ArrowsDownUp is a vertical pair; RTL does not flip the block axis.'],
  ['navigation.up', 'ArrowUp points along the block axis.'],
  ['navigation.down', 'ArrowDown points along the block axis.'],
  ['navigation.expand', 'ArrowsOutSimple is symmetric about both axes.'],
  ['navigation.collapse', 'ArrowsInSimple is symmetric about both axes.'],
  [
    'identity.credential-rotation',
    'ArrowsCounterClockwise is rotational; rotation direction is not reading direction.',
  ],
]);

/**
 * Rows that SHOULD mirror and cannot be flagged inside the v4 frozen prefix.
 * Draining this band requires an owner ruling on the corpus fingerprint; it is
 * named debt, not an exemption.
 */
const FROZEN_PREFIX_DEBT: ReadonlyMap<string, string> = new Map([
  [
    'action.open-external',
    'ArrowSquareOut leaves toward the reading end (Material mirrors launch/open_in_new); row 54 is inside the fingerprinted v4 prefix.',
  ],
  [
    'system.workflow',
    'FlowArrow runs along the reading axis; row 99 is inside the fingerprinted v4 prefix.',
  ],
]);

/**
 * Rows the family net does not catch, adjudicated by hand and pinned so the
 * decision is executable rather than prose.
 */
const ADJUDICATED_NON_FAMILY: ReadonlyMap<string, string> = new Map([
  [
    'communication.send',
    'PaperPlaneTilt: a vehicle in flight, not a reading-direction arrow. Dissent recorded: Material mirrors its own send glyph. Row 82 is inside the fingerprinted v4 prefix, so a reversal is an owner ruling.',
  ],
  ['billing.subscription', 'Repeat is a closed cycle; rotation is not reading direction.'],
  ['workflow.loop', 'RepeatOnce is a closed cycle; rotation is not reading direction.'],
]);

const glyphById = new Map(adapter.entries.map((entry) => [entry.id, entry.exportName]));

/**
 * The gate itself. Both the live corpus run and the planted-row drill execute
 * this exact loop, so the drill proves the shipped gate refuses the row rather
 * than proving a restatement of it.
 */
function unflaggedDirectionalRows(
  entries: readonly CorpusEntry[],
  glyphLookup: ReadonlyMap<string, string>,
): string[] {
  const unflagged: string[] = [];
  for (const entry of entries) {
    const glyph = glyphLookup.get(entry.id);
    expect(glyph, `${entry.id} has no pinned supplier glyph`).toBeDefined();
    if (!isDirectionalGlyphFamily(glyph!)) continue;
    if (entry.autoMirror) continue;
    if (NON_MIRRORING.has(entry.id) || FROZEN_PREFIX_DEBT.has(entry.id)) continue;
    unflagged.push(entry.id);
  }
  return unflagged;
}

describe('semantic icon corpus directionality', () => {
  it('flags or adjudicates every directional-family row', () => {
    expect(unflaggedDirectionalRows(corpus.entries, glyphById)).toEqual([]);
  });

  it('keeps the affirmative name rule and the corpus flag in agreement', () => {
    const disagreements: string[] = [];
    for (const entry of corpus.entries) {
      const glyph = glyphById.get(entry.id)!;
      if (!isDirectionalGlyphFamily(glyph)) continue;
      if (!mirrorsInRtl(glyph)) continue;
      if (entry.autoMirror || FROZEN_PREFIX_DEBT.has(entry.id)) continue;
      disagreements.push(`${entry.id} (${glyph})`);
    }
    expect(disagreements).toEqual([]);
  });

  it('holds every adjudicated exception to its recorded decision', () => {
    for (const [id, reason] of [...NON_MIRRORING, ...FROZEN_PREFIX_DEBT, ...ADJUDICATED_NON_FAMILY]) {
      const entry = corpus.entries.find((candidate) => candidate.id === id);
      expect(entry, `${id} is listed but absent from the corpus`).toBeDefined();
      expect(entry!.autoMirror, `${id}: ${reason}`).toBe(false);
      expect(reason.length).toBeGreaterThan(20);
    }
  });

  it('refuses a planted directional row that carries no decision', () => {
    const planted: CorpusEntry = { id: 'workflow.handoff', autoMirror: false };
    const plantedGlyphs = new Map([...glyphById, [planted.id, 'ArrowBendDownRightIcon']]);

    expect(unflaggedDirectionalRows([...corpus.entries, planted], plantedGlyphs)).toEqual([
      'workflow.handoff',
    ]);
  });

  it('records the rows that now mirror', () => {
    const mirrored = corpus.entries.filter((entry) => entry.autoMirror).map((entry) => entry.id);
    expect(mirrored).toEqual([
      'navigation.back',
      'navigation.forward',
      'action.undo',
      'action.redo',
      'layout.sidebar-start',
      'access.login',
      'access.logout',
      'data.pipeline',
      'data.sync',
      'commerce.shipping',
      'commerce.delivery',
      'communication.reply',
    ]);
  });
});
