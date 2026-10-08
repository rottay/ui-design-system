import assert from 'node:assert/strict';
import test from 'node:test';

import { STRUCTURE_LAWS, lawDefinitions } from '../laws/index.mjs';
import { reanchorStructureBaseline, tightenStructureBaseline } from './index.mjs';

const finding = (rule, id) => ({ rule, id: `${rule}:${id}`, path: id, message: '' });

function result(ids, totalFiles = 10) {
  return { findings: ids.map((id) => finding('flat-authored-module', id)), inventory: { totalFiles } };
}

function laws(members) {
  return { definitions: lawDefinitions(), members: Object.fromEntries(STRUCTURE_LAWS.map((law) => [law, members[law] ?? []])) };
}

function baseline({ ids = ['a', 'b'], lawMembers, totalFiles = 10 } = {}) {
  return {
    schemaVersion: 1,
    policy: {},
    snapshot: { inventory: { totalFiles }, findings: { 'flat-authored-module': ids.map((id) => `flat-authored-module:${id}`) } },
    ...(lawMembers ? { laws: laws(lawMembers) } : {}),
  };
}

test('tighten drops resolved findings and stale law pins, and carries the inventory forward', () => {
  const stored = baseline({ lawMembers: { 'single-child-folder': ['x', 'y'] }, totalFiles: 10 });
  const produced = tightenStructureBaseline({
    result: result(['a'], 99),
    laws: laws({ 'single-child-folder': ['x'] }),
    baseline: stored,
  });
  assert.deepEqual(produced.refused, []);
  assert.deepEqual(produced.removed.findings, ['flat-authored-module:b']);
  assert.deepEqual(produced.removed.laws['single-child-folder'], ['y']);
  assert.deepEqual(produced.baseline.snapshot.findings, { 'flat-authored-module': ['flat-authored-module:a'] });
  assert.deepEqual(produced.baseline.laws.members['single-child-folder'], ['x']);
  assert.equal(produced.baseline.snapshot.inventory.totalFiles, 10, 'a tighten never rewrites the inventory');
});

test('tighten refuses any increase and writes nothing: a new finding, a new law member, unpinned laws', () => {
  const stored = baseline({ lawMembers: { 'single-child-folder': ['x'] } });
  const newFinding = tightenStructureBaseline({ result: result(['a', 'b', 'c']), laws: laws({ 'single-child-folder': ['x'] }), baseline: stored });
  assert.match(newFinding.refused.join('\n'), /1 new finding/u);
  assert.equal(newFinding.baseline, stored);

  const newMember = tightenStructureBaseline({ result: result(['a']), laws: laws({ 'single-child-folder': ['x', 'w'] }), baseline: stored });
  assert.match(newMember.refused.join('\n'), /single-child-folder: 1 new member/u);

  const unpinned = tightenStructureBaseline({ result: result(['a']), laws: laws({}), baseline: baseline() });
  assert.match(unpinned.refused.join('\n'), /pins no structure laws/u);
});

test('re-anchor adopts unpinned laws and re-anchors the inventory once, then refuses', () => {
  const adopted = reanchorStructureBaseline({
    result: result(['a'], 20),
    laws: laws({ 'showroom-loose-file': ['app/x.tsx'] }),
    baseline: baseline({ totalFiles: 10 }),
  });
  assert.deepEqual(adopted.refused, []);
  assert.equal(adopted.previous.inventory.totalFiles, 10);
  assert.equal(adopted.baseline.snapshot.inventory.totalFiles, 20);
  assert.deepEqual(adopted.baseline.laws.members['showroom-loose-file'], ['app/x.tsx']);

  const again = reanchorStructureBaseline({ result: result(['a'], 30), laws: laws({}), baseline: adopted.baseline });
  assert.match(again.refused.join('\n'), /only --update-baseline \(tighten\) may write/u);
});

test('re-anchor re-keys pins after a definition change but never admits a new finding id', () => {
  const stored = baseline({ lawMembers: {} });
  const reruled = { ...laws({ 'repeated-path-word': ['data/data-table'] }), definitions: { ...lawDefinitions(), 'repeated-path-word': { ...lawDefinitions()['repeated-path-word'], definition: 'word-any' } } };
  assert.deepEqual(reanchorStructureBaseline({ result: result(['a']), laws: reruled, baseline: stored }).refused, []);
  const withNewFinding = reanchorStructureBaseline({ result: result(['a', 'new']), laws: reruled, baseline: stored });
  assert.match(withNewFinding.refused.join('\n'), /never admits a finding id/u);
});

const flipD2 = (members) => ({ ...laws(members), definitions: { ...lawDefinitions(), 'repeated-path-word': { ...lawDefinitions()['repeated-path-word'], definition: 'word-any' } } });

test('M1 drill: a D2 flip cannot launder new debt in a law whose definition did not change', () => {
  const stored = baseline({ lawMembers: { 'authored-line-count': ['big.ts'], 'showroom-loose-file': ['app/a.tsx'] } });
  const produced = reanchorStructureBaseline({
    result: result(['a', 'b']),
    laws: flipD2({
      'authored-line-count': ['big.ts', 'new-big.ts'],
      'showroom-loose-file': ['app/a.tsx', 'app/new-loose.tsx'],
      'repeated-path-word': ['data/data-table'],
    }),
    baseline: stored,
  });
  assert.match(produced.refused.join('\n'), /authored-line-count: definition unchanged, so 1 new member/u);
  assert.match(produced.refused.join('\n'), /showroom-loose-file: definition unchanged, so 1 new member/u);
  assert.equal(produced.baseline, stored, 'a refused re-anchor writes nothing');
});

test('M1 drill: the same flip re-keys only the changed law and tightens the others', () => {
  const stored = baseline({ lawMembers: { 'authored-line-count': ['big.ts', 'fixed.ts'], 'showroom-loose-file': ['app/a.tsx'] } });
  const produced = reanchorStructureBaseline({
    result: result(['a', 'b']),
    laws: flipD2({
      'authored-line-count': ['big.ts'],
      'showroom-loose-file': ['app/a.tsx'],
      'repeated-path-word': ['data/data-table', 'runtime/tenant/runtime'],
    }),
    baseline: stored,
  });
  assert.deepEqual(produced.refused, []);
  assert.deepEqual(produced.rekeyed, ['repeated-path-word']);
  assert.deepEqual(produced.baseline.laws.members['repeated-path-word'], ['data/data-table', 'runtime/tenant/runtime']);
  assert.deepEqual(produced.baseline.laws.members['authored-line-count'], ['big.ts'], 'an unchanged law is tightened, never raised');
  assert.equal(produced.baseline.laws.definitions['repeated-path-word'].definition, 'word-any');
});

test('a changed definition also stops the plain tighten, naming only that law', () => {
  const stored = baseline({ lawMembers: {} });
  const produced = tightenStructureBaseline({ result: result(['a', 'b']), laws: flipD2({}), baseline: stored });
  assert.deepEqual(produced.refused, ['repeated-path-word: definition changed: re-key it with one sighted --re-anchor']);
});
