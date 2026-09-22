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
import { auditCertifiedInlineStyleProducers, countArc09PaintInFile } from './index.mjs';

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

/**
 * Relocation drill: a certified producer is keyed by the module that exports
 * it, so moving that module without re-keying the registry must make its
 * spread read as opaque paint again.
 */
const TYPOGRAPHY = 'src/components/primitives/display/typography';
const CRAFT_OWNER = `${TYPOGRAPHY}/runtime/legacy-craft`;

const CRAFT_CONSUMER = `import type { CSSProperties } from 'react';

import { resolveTypographyCraftStyle } from 'SPECIFIER';

export function CraftFixture(): React.ReactElement {
  const style: CSSProperties = {
    ...resolveTypographyCraftStyle({ textStyle: 'body' }),
  };
  return <span style={style} />;
}
`;

/** Copies the craft producer into a sandbox core, optionally under a new owner, and counts a consumer that spreads it. */
function countCraftConsumer(relocatedOwner) {
  const sandbox = mkdtempSync(join(tmpdir(), 'paint-inline-relocation-'));
  try {
    const core = join(sandbox, 'packages/core');
    cpSync(join(CORE, `${TYPOGRAPHY}/contracts`), join(core, `${TYPOGRAPHY}/contracts`), { recursive: true });
    cpSync(join(CORE, `${TYPOGRAPHY}/runtime/index.ts`), join(core, `${TYPOGRAPHY}/runtime/index.ts`), { recursive: true });
    const owner = relocatedOwner ?? CRAFT_OWNER;
    cpSync(join(CORE, CRAFT_OWNER), join(core, owner), { recursive: true });
    const consumer = join(core, `${TYPOGRAPHY}/engines/fixture/index.tsx`);
    mkdirSync(dirname(consumer), { recursive: true });
    const source = CRAFT_CONSUMER.replace('SPECIFIER', `@/${owner.slice('src/'.length)}`);
    writeFileSync(consumer, source);
    return countArc09PaintInFile(source, consumer);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

test('the craft producer really lives in the owner the registry names', () => {
  const source = readFileSync(join(CORE, `${CRAFT_OWNER}/index.ts`), 'utf8');
  assert.match(source, /export function resolveTypographyCraftStyle\b/u);
  assert.equal(countArc09PaintInFile(source, join(CORE, `${CRAFT_OWNER}/index.ts`)), 0);
  assert.doesNotMatch(
    readFileSync(join(CORE, `${TYPOGRAPHY}/runtime/index.ts`), 'utf8'),
    /resolveTypographyCraftStyle/u,
    'the pre-relocation owner must not re-export the symbol, so only the new key can certify it',
  );
});

test('CONTROL: the re-keyed craft owner certifies the spread at zero', () => {
  assert.equal(countCraftConsumer(null), 0);
});

test('PLANT: a certified producer whose module moves without a registry re-key reads as opaque paint', () => {
  const count = countCraftConsumer(`${TYPOGRAPHY}/runtime/relocated-craft`);
  assert.equal(count, 1, `expected the unkeyed owner to leave the spread opaque, got ${count}`);
});

// ---------------------------------------------------------------------------
// Pass-through spreads: a certified prop bag may hand back a transparent
// argument and a locally proven bag without becoming unreadable
// ---------------------------------------------------------------------------

const TABLE_PARTS = 'src/components/primitives/display/table/engines/modern/parts';
const PART_KERNEL = `${TABLE_PARTS}/kernel`;
const BODY_ROW = `${TABLE_PARTS}/presentation/body-row/index.tsx`;
const KERNEL_RETURN =
  '  return { state: stamped ? state : {}, props: { ...props, ...composed } as P };';

/** Copies the part kernel (optionally under a new owner) plus the row consumer, edits the kernel, counts the row. */
function countBodyRowWithKernel(edit, kernelOwner = PART_KERNEL) {
  const sandbox = mkdtempSync(join(tmpdir(), 'paint-inline-part-kernel-'));
  try {
    const core = join(sandbox, 'packages/core');
    cpSync(join(CORE, BEHAVIOR), join(core, BEHAVIOR), { recursive: true });
    cpSync(join(CORE, PART_KERNEL), join(core, kernelOwner), { recursive: true });
    const kernelFile = join(core, kernelOwner, 'index.ts');
    writeFileSync(kernelFile, edit(readFileSync(kernelFile, 'utf8')));
    const consumer = join(core, BODY_ROW);
    mkdirSync(dirname(consumer), { recursive: true });
    const source = readFileSync(join(CORE, BODY_ROW), 'utf8').replace(
      "from '../../kernel'",
      `from '@/${kernelOwner.slice('src/'.length)}'`,
    );
    assert.match(source, /from '@\//u, 'the consumer import must be rewritten to the sandbox owner');
    writeFileSync(consumer, source);
    return countArc09PaintInFile(source, consumer);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

test('the part kernel really returns a transparent argument beside a local handler bag', () => {
  const kernel = readFileSync(join(CORE, PART_KERNEL, 'index.ts'), 'utf8');
  assert.ok(kernel.includes(KERNEL_RETURN), 'the drills below edit the shipped return statement');
  assert.match(kernel, /export function usePartInteraction<P extends PartInteractionHandlers>\(\n  props: P,/u);
  assert.match(readFileSync(join(CORE, BODY_ROW), 'utf8'), /\{\.\.\.props\}/u);
});

test('CONTROL: the eight table part components spread the kernel bag at zero inline paint', () => {
  for (const part of [
    'body-cell', 'body-row', 'expand-button', 'field',
    'header-cell', 'pagination-button', 'resize-handle', 'selection-control',
  ]) {
    const file = join(CORE, TABLE_PARTS, 'presentation', part, 'index.tsx');
    const source = readFileSync(file, 'utf8');
    assert.match(source, /usePartInteraction\(/u, `${part} must really use the kernel`);
    assert.equal(countArc09PaintInFile(source, file), 0, part);
  }
  assert.equal(countBodyRowWithKernel((text) => text), 0);
});

test('PLANT: a spread of a bag that is neither transparent nor locally proven stays a hazard', () => {
  const count = countBodyRowWithKernel((text) => {
    const planted = text.replace(
      KERNEL_RETURN,
      KERNEL_RETURN.replace('...composed }', '...composed, ...externalBag() }'),
    );
    assert.notEqual(planted, text, 'the plant must edit the real return statement');
    return `import { externalBag } from './bag';\n${planted}`;
  });
  assert.equal(count, 1, `expected the unreadable spread to leave the row opaque, got ${count}`);
});

test('PLANT: a style key added to the certified bag is counted at the consumer spread', () => {
  const count = countBodyRowWithKernel((text) => {
    const planted = text.replace(
      KERNEL_RETURN,
      KERNEL_RETURN.replace(
        '...composed }',
        "...composed, style: { color: 'var(--ds-color-primary)' } }",
      ),
    );
    assert.notEqual(planted, text);
    return planted;
  });
  assert.ok(count > 0, `expected an undeclared style key to be counted, got ${count}`);
});

test('PLANT: a `style` written onto the local bag AFTER its literal is counted at the consumer spread', () => {
  // The proof that admits `...composed` is read from its declaration, so a
  // later mutation must invalidate it -- this hook does assign onto that bag.
  const count = countBodyRowWithKernel((text) => {
    const planted = text.replace(
      KERNEL_RETURN,
      `  composed.style = { color: 'var(--ds-color-primary)' } as never;\n${KERNEL_RETURN}`,
    );
    assert.notEqual(planted, text);
    return planted;
  });
  assert.ok(count > 0, `expected a post-literal style mutation to be counted, got ${count}`);
});

test('PLANT: a computed write onto the local bag fails closed', () => {
  const count = countBodyRowWithKernel((text) => {
    const planted = text.replace(
      KERNEL_RETURN,
      `  (composed as Record<string, unknown>)[String(stamped)] = 1;\n${KERNEL_RETURN}`,
    );
    assert.notEqual(planted, text);
    return planted;
  });
  assert.equal(count, 1, `expected an unreadable key to leave the row opaque, got ${count}`);
});

test('CONTROL: a non-style write onto the local bag keeps it pass-through', () => {
  const count = countBodyRowWithKernel((text) => {
    const planted = text.replace(
      KERNEL_RETURN,
      `  composed.onKeyUp = undefined;\n${KERNEL_RETURN}`,
    );
    assert.notEqual(planted, text);
    return planted;
  });
  assert.equal(count, 0, `a handler write must not invalidate the proof, got ${count}`);
});

test('PLANT: the part kernel moved off its registry key reads as opaque paint again', () => {
  const count = countBodyRowWithKernel((text) => text, `${TABLE_PARTS}/relocated-kernel`);
  assert.equal(count, 1, `expected the unkeyed kernel to leave the row opaque, got ${count}`);
});

test('the five local `use*Button` hooks of the same shape need no registry row', () => {
  // They are module-private, so the counter resolves them in the consuming
  // file and follows their spread back to the component's own parameter.
  for (const owner of [
    'src/components/primitives/feedback/modal/engines/modern/index.tsx',
    'src/components/primitives/overlay/tour/engines/modern/index.tsx',
    'src/components/primitives/inputs/time-picker/engines/modern/index.tsx',
    'src/components/primitives/inputs/transfer/engines/modern/index.tsx',
    'src/components/primitives/inputs/date-picker/engines/modern/index.tsx',
  ]) {
    const file = join(CORE, owner);
    const source = readFileSync(file, 'utf8');
    assert.match(source, /^function use[A-Za-z]*Button/mu, `${owner} must really declare the hook`);
    assert.match(source, /\.\.\.rest,/u);
    assert.equal(countArc09PaintInFile(source, file), 0, owner);
  }
});

// ---------------------------------------------------------------------------
// The certified registry must stay bound to the tree it certifies
// ---------------------------------------------------------------------------

test('every certified producer key resolves on disk and exports its symbol', () => {
  // A stale key is silent by construction: the producer stops being certified,
  // every consumer that spreads it falls opaque, and a paint counter moves
  // without one line of product source moving. 171e7dbfe relocated the
  // typography craft resolver and left exactly that hole, so the registry is
  // proven against the tree here rather than trusted.
  const rows = auditCertifiedInlineStyleProducers();
  assert.ok(rows.length >= 30, `only ${rows.length} certified pairs read back -- an empty audit is never a pass`);
  const stale = rows.filter((row) => row.stale);
  assert.deepEqual(
    stale.map((row) => `${row.stale}: ${row.packagePath} -> ${row.symbol}`),
    [],
  );
});

test('the audit is not vacuous: a root that holds none of the modules is all stale', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'paint-inline-registry-'));
  try {
    const rows = auditCertifiedInlineStyleProducers(join(sandbox, 'packages/core/src'));
    assert.ok(rows.length > 0);
    assert.ok(rows.every((row) => row.stale === 'module'), 'an unresolvable key must be reported, never passed');
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('a key that names a module which no longer exports the symbol is reported by NAME', () => {
  // The 171e7dbfe shape, replayed: the craft resolver lives in `legacy-craft`
  // and the owner it moved away from must not answer for it any more.
  const rows = auditCertifiedInlineStyleProducers();
  const craft = rows.find((row) => row.symbol === 'resolveTypographyCraftStyle');
  assert.equal(craft.packagePath, 'components/primitives/display/typography/runtime/legacy-craft/index');
  assert.equal(craft.stale, null);
  const sandbox = mkdtempSync(join(tmpdir(), 'paint-inline-relocate-'));
  try {
    const owner = 'src/components/primitives/display/typography/runtime/legacy-craft';
    const core = join(sandbox, 'packages/core');
    cpSync(join(CORE, owner), join(core, owner), { recursive: true });
    const file = join(core, owner, 'index.ts');
    const source = readFileSync(file, 'utf8');
    writeFileSync(file, source.replaceAll('resolveTypographyCraftStyle', 'resolveTypographyCraftStyleMoved'));
    const stale = auditCertifiedInlineStyleProducers(join(core, 'src'))
      .filter((row) => row.stale === 'symbol');
    assert.deepEqual(stale.map((row) => row.symbol), ['resolveTypographyCraftStyle']);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});
