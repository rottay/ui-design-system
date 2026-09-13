/**
 * Drills of the certified prop-bag exemption: a certified path is accepted only
 * when the value it returns is proven free of `style`, however it is produced.
 */
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { packageRoot as findPackageRoot } from '../../repo-root/index.mjs';
import { countArc09PaintInFile } from './index.mjs';

const CORE = findPackageRoot(new URL('.', import.meta.url).pathname);
const BEHAVIOR = 'src/foundation/behavior';
/** The other certified producer the Input engine spreads, copied so the sandbox measures what the tree measures. */
const RESPONSIVE_STYLE = 'src/infrastructure/runtime/responsive/runtime/style-properties';
const FIELD_ACTION = `${BEHAVIOR}/composition/field-action/index.ts`;
const INPUT_ENGINE = 'src/components/primitives/inputs/input/engines/modern/index.tsx';

const HANDLER_BAG = '  return {\n    state,\n    handlers: {';

/** Copies the behavior facade and the Input engine into a sandbox core, edits the hook, counts the engine. */
function countInputWithFieldAction(edit) {
  const sandbox = mkdtempSync(join(tmpdir(), 'paint-inline-bag-'));
  try {
    const core = join(sandbox, 'packages/core');
    cpSync(join(CORE, BEHAVIOR), join(core, BEHAVIOR), { recursive: true });
    cpSync(join(CORE, RESPONSIVE_STYLE), join(core, RESPONSIVE_STYLE), { recursive: true });
    const engine = join(core, INPUT_ENGINE);
    mkdirSync(dirname(engine), { recursive: true });
    const source = readFileSync(join(CORE, INPUT_ENGINE), 'utf8');
    writeFileSync(engine, source);
    const hook = join(core, FIELD_ACTION);
    writeFileSync(hook, edit(readFileSync(hook, 'utf8')));
    return countArc09PaintInFile(source, engine);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

test('the Input engine really spreads the certified field-action handler bag', () => {
  const source = readFileSync(join(CORE, INPUT_ENGINE), 'utf8');
  assert.match(source, /import \{[^}]*\buseFieldAction\b[^}]*\} from '@\/foundation\/behavior'/);
  assert.match(source, /\{\.\.\.action\.handlers\}/);
  assert.ok(readFileSync(join(CORE, FIELD_ACTION), 'utf8').includes(HANDLER_BAG));
});

test('CONTROL: the shipped handler object is accepted through the facade and the JSX spread', () => {
  assert.equal(countInputWithFieldAction((text) => text), 0);
  assert.equal(countArc09PaintInFile(readFileSync(join(CORE, INPUT_ENGINE), 'utf8'), join(CORE, INPUT_ENGINE)), 0);
});

test('PLANT: a style payload written directly into the handler bag is counted at the spread', () => {
  const count = countInputWithFieldAction((text) =>
    text.replace(HANDLER_BAG, `${HANDLER_BAG}\n      style: { color: 'var(--ds-color-primary)' },`));
  assert.ok(count > 0, `expected authored inline paint to be counted, got ${count}`);
});

test('PLANT: a style payload added by a same-module helper around the handler bag is counted at the spread', () => {
  const count = countInputWithFieldAction((text) => {
    const wrapped = text
      .replace(HANDLER_BAG, '  return {\n    state,\n    handlers: addInlinePaint({')
      .replace(/(\n      onKeyUp: \(event\) => pressKey\(event, false\),\n    \})/u, '$1)');
    assert.notEqual(wrapped, text, 'the plant must wrap the real handler object');
    return `${wrapped}\nfunction addInlinePaint<T extends object>(bag: T) {\n  return { ...bag, style: { color: 'var(--ds-color-primary)' } };\n}\n`;
  });
  assert.ok(count > 0, `expected helper-produced inline paint to be counted, got ${count}`);
});

test('PLANT: a handler bag produced by a helper the lexer cannot resolve fails closed', () => {
  const count = countInputWithFieldAction((text) => {
    const wrapped = text
      .replace(HANDLER_BAG, '  return {\n    state,\n    handlers: externalBag({')
      .replace(/(\n      onKeyUp: \(event\) => pressKey\(event, false\),\n    \})/u, '$1)');
    assert.notEqual(wrapped, text);
    return `import { externalBag } from './bag';\n${wrapped}`;
  });
  assert.ok(count > 0, `expected an unresolved helper to leave the spread uncertified, got ${count}`);
});

const HANDLER_CLOSE = /(\n      onKeyUp: \(event\) => pressKey\(event, false\),\n    \})/u;

/** Wraps the shipped handler literal in a `useMemo(() => ({ … }), [])` call. */
function memoizeHandlerBag(text) {
  const wrapped = text
    .replace(HANDLER_BAG, '  return {\n    state,\n    handlers: useMemo<FieldActionHandlers>(() => ({')
    .replace(HANDLER_CLOSE, '$1), [])');
  assert.notEqual(wrapped, text, 'the plant must wrap the real handler object');
  return wrapped;
}

const PAINTED_MEMO = 'function useMemo<T extends object>(factory: () => T, _deps?: unknown[]) {\n  return { ...factory(), style: { color: \'var(--ds-color-primary)\' } };\n}\n';

test('CONTROL: the handler bag memoized by the React `useMemo` import stays certified at the spread', () => {
  const count = countInputWithFieldAction((text) => `import { useMemo } from 'react';\n${memoizeHandlerBag(text)}`);
  assert.equal(count, 0);
});

test('PLANT: a same-module helper spelled `useMemo` that returns painted handlers is counted at the spread', () => {
  const count = countInputWithFieldAction((text) => `${memoizeHandlerBag(text)}\n${PAINTED_MEMO}`);
  assert.ok(count > 0, `expected a local useMemo-named helper to leave the spread uncertified, got ${count}`);
});

test('PLANT: a local `useMemo` shadowing the React import inside the hook is counted at the spread', () => {
  const count = countInputWithFieldAction((text) => {
    const memoized = memoizeHandlerBag(text);
    const shadowed = memoized.replace(
      '  return {\n    state,\n    handlers: useMemo',
      '  const useMemo = paintedMemo;\n  return {\n    state,\n    handlers: useMemo',
    );
    assert.notEqual(shadowed, memoized, 'the shadow must live inside the hook body');
    return `import { useMemo } from 'react';\n${shadowed}\n${PAINTED_MEMO.replace('function useMemo', 'function paintedMemo')}`;
  });
  assert.ok(count > 0, `expected a shadowing useMemo to leave the spread uncertified, got ${count}`);
});
