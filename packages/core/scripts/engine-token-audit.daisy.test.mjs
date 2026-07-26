/**
 * Regression guard for the `daisy.classConsumers` counter.
 *
 * The counter this replaced was two regex passes over raw file text with no
 * comment handling, so a comment containing an apostrophe ("usePresence's")
 * opened a phantom string whose contents were tokenized as class names. Adding
 * that ONE comment to Modal's modern engine moved the ratchet by one, and the
 * agent who hit the resulting failure changed PRODUCTION CODE -- rewriting the
 * expressive `kind: 'modal'` into a constant lookup -- to get the number back
 * down. The gate was extracting payment in source quality for prose.
 *
 * These tests hold the two properties that make that impossible:
 *   - editing comment prose can never move the counter (any prose, any
 *     apostrophes, any Daisy class name spelled out in full);
 *   - a genuinely rendered Daisy class always moves it.
 *
 * Plus the position discrimination that the regex could not express: a string
 * counts because of WHERE it is, not because of what it spells.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  DAISY_PAINTED_CLASSES,
  DaisyResolverBudgetError,
  RESOLVER_LIMITS,
  collectDaisyClassConsumers,
  countDaisyClassConsumers,
  createModuleGraph,
  findDaisyClassesInText,
  listDaisyClassConsumers,
} from './lib/daisy-class-consumer-counter.mjs';
import { isEngineSourceFile, modernEngineFiles } from './lib/engine-corpus.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = dirname(scriptDir);
const uiDir = join(packageDir, 'src/ui');

/** The exact corpus `engine-token-audit.mjs` counts, from the same walk it uses. */
function auditedModernFiles() {
  return modernEngineFiles(uiDir);
}

/** The budget error `run` raises, or a failure if it raises nothing. */
function budgetErrorFrom(run) {
  try {
    run();
  } catch (error) {
    assert.ok(
      error instanceof DaisyResolverBudgetError,
      `expected a DaisyResolverBudgetError, got ${error?.name}: ${error?.message}`,
    );
    return error;
  }
  return assert.fail('an exhausted budget must fail the audit, not return a lower count');
}

/** Classes found in a `.tsx` source, as a sorted array. */
function classesIn(source) {
  return [...findDaisyClassesInText(source, 'fixture.tsx')].sort();
}

// ---------------------------------------------------------------------------
// 1. Comments are structurally unreachable
// ---------------------------------------------------------------------------

/**
 * The exact historical defect, reproduced. Every one of these bodies is the
 * same PRODUCTION code -- `kind: 'modal'`, a union member -- differing only in
 * comment prose. The predecessor counted the first as 0 and the second as 1.
 */
const PROSE_VARIANTS = {
  'no comment': '',
  'the apostrophe that broke it': "// the element outside render (usePresence's onExitComplete).",
  'apostrophe then a Daisy name': "// usePresence's modal timing, see the toast stack.",
  'unbalanced apostrophes': "// don't, can't, shouldn't -- the modal's own skeleton",
  'Daisy names spelled out in a line comment':
    '// modal modal-open modal-box modal-backdrop modal-action alert skeleton toast',
  'Daisy names in a block comment':
    '/* Historically this rendered `modal modal-open` and a `timeline-start`. */',
  'a full className in a comment': '// was: className="modal modal-box alert skeleton"',
  'a doc comment with quotes and apostrophes':
    '/**\n * The stack\'s "modal" band -- it isn\'t a class, it\'s a kind.\n * @see className="modal-backdrop"\n */',
  'a quote inside a line comment': '// the reviewer said "use modal-box here" and we did not',
  'JSX-looking prose in a comment': '// <div className="modal modal-open">alert</div>',
  'apostrophe inside a block comment':
    "/* usePresence's exit -- the modal's backdrop keeps painting. */",
};

function overlayFixture(prose) {
  return `import { useOverlayLayer } from '../../../../runtime/overlay/layer-stack';

export function ModalModern({ open }: { open: boolean }) {
  ${prose}
  const layer = useOverlayLayer({
    kind: 'modal',
    active: open,
    modal: false,
  });
  return <div data-overlay-kind="modal" style={{ zIndex: layer.zIndex }} />;
}
`;
}

for (const [label, prose] of Object.entries(PROSE_VARIANTS)) {
  test(`prose cannot reach the counter: ${label}`, () => {
    assert.deepEqual(
      classesIn(overlayFixture(prose)),
      [],
      'a comment is trivia, never a rendered class',
    );
  });
}

test('every prose variant yields the byte-identical result', () => {
  const results = Object.values(PROSE_VARIANTS).map((prose) => classesIn(overlayFixture(prose)));
  for (const result of results) {
    assert.deepEqual(result, results[0], 'editing a comment moved the counter');
  }
});

test('prose cannot reach the counter even when the file IS a real consumer', () => {
  const withoutProse = `export const Dialog = () => <div className="modal modal-box" />;`;
  const withProse = `// modal-backdrop modal-action alert skeleton toast timeline don't can't
/* usePresence's "modal" -- see className="modal-open carousel breadcrumbs" */
export const Dialog = () => <div className="modal modal-box" />;`;
  assert.deepEqual(classesIn(withoutProse), ['modal', 'modal-box']);
  assert.deepEqual(
    classesIn(withProse),
    classesIn(withoutProse),
    'prose changed the class set of a real consumer',
  );
});

// ---------------------------------------------------------------------------
// 2. A real Daisy class always counts
// ---------------------------------------------------------------------------

const RENDERED = {
  'a literal className': '<div className="modal" />',
  'one class among many': '<div className="rottay-x modal-box max-w-sm" />',
  'a template literal': '<div className={`rottay-dialog modal-open ${extra}`} />',
  'a template interpolation': '<div className={`a ${cond ? "modal-backdrop" : "b"}`} />',
  'a ternary': '<div className={open ? "modal modal-open" : "hidden"} />',
  'the false branch of a ternary': '<div className={open ? "hidden" : "modal-action"} />',
  'a logical guard': '<div className={open && "modal-box"} />',
  'a nullish fallback': '<div className={custom ?? "modal"} />',
  'string concatenation': '<div className={"rottay " + "modal-open"} />',
  'an array join': '<div className={["rottay", "modal-box"].filter(Boolean).join(" ")} />',
  'the class attribute': '<div class="modal-backdrop" />',
  'a className object property': 'const props = { className: "modal-open" };',
  'a destructuring default': 'const { className = "modal-box" } = props;',
  'classList.add': 'node.classList.add("modal-open");',
  'setAttribute class': 'node.setAttribute("class", "modal-backdrop");',
};

for (const [label, body] of Object.entries(RENDERED)) {
  test(`a rendered Daisy class counts: ${label}`, () => {
    assert.ok(classesIn(body).length > 0, `${label} should have registered a class`);
  });
}

test('adding a real Daisy class increments the file counter', () => {
  const before = 'export const Panel = () => <div className="rottay-panel" />;';
  const after = 'export const Panel = () => <div className="rottay-panel modal-box" />;';
  assert.deepEqual(classesIn(before), []);
  assert.deepEqual(classesIn(after), ['modal-box']);

  const dir = mkdtempSync(join(tmpdir(), 'daisy-consumers-'));
  try {
    const file = join(dir, 'index.tsx');
    writeFileSync(file, before);
    assert.equal(countDaisyClassConsumers([file]), 0);
    writeFileSync(file, after);
    assert.equal(countDaisyClassConsumers([file]), 1, 'a real class must raise the ratchet');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('every painted class in the vocabulary is detectable in a className', () => {
  for (const painted of DAISY_PAINTED_CLASSES) {
    assert.deepEqual(
      classesIn(`<div className="${painted}" />`),
      [painted],
      `${painted} is in the vocabulary but not detected`,
    );
  }
});

// ---------------------------------------------------------------------------
// 3. Position, not spelling -- what the regex could not express
// ---------------------------------------------------------------------------

const NOT_A_CLASS = {
  'a union member (the OverlayLayerKind defect)': "const layer = useOverlayLayer({ kind: 'modal' });",
  'a union TYPE declaration': "type Kind = 'modal' | 'toast' | 'alert' | 'progress';",
  'a data attribute': '<div data-overlay-kind="modal" data-part="skeleton" />',
  'a data-part naming a Daisy word': '<div data-part="timeline" />',
  'an ARIA role': '<p role="alert" />',
  'an ARIA value': "<li aria-current={active ? 'step' : undefined} />",
  'an aria-roledescription': "<div aria-roledescription={'carousel'} />",
  'an input type': '<input type="range" />',
  'a test id': '<div data-testid="modal-box" />',
  'an element id': '<div id="modal" />',
  'a CSS selector string': "document.querySelector('.modal-box');",
  'an import path': "import { Modal } from './modal';",
  'a comparison operand': "if (field.type === 'rating') return true;",
  'an object key that is not className': "const map = { modal: 'rottay-dialog' };",
  'a string prop that is not a class': '<Toast placement="toast-top" />',
  'a translation key': "t('modal.close');",
  'a plain string variable never used as a class': "const label = 'modal';",
};

for (const [label, body] of Object.entries(NOT_A_CLASS)) {
  test(`not a class position: ${label}`, () => {
    assert.deepEqual(classesIn(body), [], `${label} must not count`);
  });
}

test('matching is exact -- a DS class that merely starts with a Daisy word is not Daisy', () => {
  // The predecessor accepted any `<daisyClass>-<suffix>`, which is how the DS's
  // own vocabulary became "Daisy sightings".
  //
  // `timeline-vertical` used to be in this list, asserted as a DS class that
  // merely looked Daisy-ish. It is a real DaisyUI class, and the timeline
  // pattern renders it. Nobody could tell, because the vocabulary was a
  // hand-list and the hand-list had left it out -- so the omission was not just
  // uncaught, it was pinned as CORRECT by a test. That is the whole argument for
  // deriving the taxonomy from the package instead of writing it down.
  for (const ours of [
    'skeleton-action',
    'skeleton-row',
    'skeleton-group',
    'range-separator',
    'link-wrapper',
    'rottay-modal',
    'rottay-modal--modern',
    'ds-tree-view-modern__skeleton',
  ]) {
    assert.deepEqual(classesIn(`<div className="${ours}" />`), [], `${ours} is not a Daisy class`);
  }

  // The counterpart the derived taxonomy now gets right.
  assert.deepEqual(classesIn('<div className="timeline-vertical" />'), ['timeline-vertical']);
});

// ---------------------------------------------------------------------------
// 4. The Codex K2/K3 catch: classes held in a map still count
// ---------------------------------------------------------------------------

test('a placement map resolved into className counts (Message toast regression)', () => {
  const source = `const PLACEMENT = {
  top: 'toast toast-top',
  bottom: 'toast toast-bottom',
} as const;

export const Stack = ({ side }: { side: keyof typeof PLACEMENT }) => (
  <div className={PLACEMENT[side]} />
);`;
  assert.deepEqual(classesIn(source), ['toast', 'toast-bottom', 'toast-top']);
});

test('a const indirection into className counts', () => {
  assert.deepEqual(
    classesIn("const BASE = 'modal modal-open';\nexport const D = () => <div className={BASE} />;"),
    ['modal', 'modal-open'],
  );
});

test('a composition helper in a class position has its arguments followed', () => {
  assert.deepEqual(
    classesIn('<div className={cx("rottay-dialog", open && "modal-open", "modal-box")} />'),
    ['modal-box', 'modal-open'],
  );
});

test('an unreferenced map does not count', () => {
  assert.deepEqual(
    classesIn("const PLACEMENT = { top: 'toast toast-top' } as const;\nexport default PLACEMENT;"),
    [],
    'a map nothing renders through className is not a consumer',
  );
});

test('a cyclic const chain terminates', () => {
  assert.deepEqual(classesIn('const a = b;\nconst b = a;\n<div className={a} />;'), []);
});

// ---------------------------------------------------------------------------
// 5. The real tree agrees with the pinned baseline
// ---------------------------------------------------------------------------

test('the audited tree has exactly the consumers the baseline pins', () => {
  const baseline = JSON.parse(
    readFileSync(join(scriptDir, 'engine-token-audit.baseline.json'), 'utf8'),
  );
  const current = spawnSync(
    process.execPath,
    [join(scriptDir, 'engine-token-audit.mjs'), '--current-json', '--quiet'],
    { cwd: packageDir, encoding: 'utf8' },
  );
  assert.equal(current.status, 0, current.stderr);
  const counters = JSON.parse(current.stdout.slice(current.stdout.indexOf('{')));

  assert.equal(
    counters['daisy.classConsumers'],
    baseline['daisy.classConsumers'],
    'the baseline is no longer pinned to the true consumer count',
  );
  assert.equal(counters['daisy.classConsumers'], 0);
});

/**
 * The drain is complete: no modern engine file renders a painted DaisyUI class.
 *
 * The census this replaces held six files. It is worth recording why it held
 * six and not the three the ratchet reported for years: the vocabulary was a
 * hand-list that omitted `link-hover`, `loading-spinner`, `timeline-box`,
 * `timeline-end` and `timeline-vertical`, so three files rendering a DaisyUI
 * spinner mask -- and two more rendering timeline and link paint -- scored
 * clean the whole time. Generating the taxonomy from the pinned package moved
 * the count 3 -> 6 as an instrument correction, and every one of those six was
 * a genuine consumer. All six are now drained; each paints from its own Modern
 * skin instead.
 *
 * The formerly-named six are asserted individually as well as through the
 * corpus, so a regression names the file that reintroduced the coupling rather
 * than only moving a number.
 */
const FORMER_CONSUMERS = [
  'patterns/data/file-manager/engines/modern/index.tsx',
  'patterns/data/saved-views/engines/modern/index.tsx',
  'patterns/forms/filter-builder/engines/modern/index.tsx',
  'patterns/visualization/kanban-board/engines/modern/index.tsx',
  'patterns/visualization/timeline/engines/modern/index.tsx',
  'primitives/overlay/AlertDialog/engines/modern/index.tsx',
];

test('the six drained files render no painted Daisy class', () => {
  const actual = listDaisyClassConsumers(FORMER_CONSUMERS.map((rel) => join(uiDir, rel)));
  assert.deepEqual(
    actual.map(([file, classes]) => [file.slice(uiDir.length + 1), classes]),
    [],
  );
});

/** The whole corpus agrees: not one consumer anywhere, not a seventh file. */
test('the corpus holds no Daisy class consumer at all', () => {
  const consumers = listDaisyClassConsumers(auditedModernFiles());
  assert.deepEqual(consumers.map(([file]) => file.slice(uiDir.length + 1)).sort(), []);
});

/**
 * The orphaned-modifier diagnostic, and why it still has to work on an empty
 * corpus.
 *
 * The three files it used to name all rendered `loading-spinner` with no
 * `loading`. `.loading-spinner` is a standalone rule in the pinned package --
 * it applies `mask-image` on its own -- so the class did paint, even though
 * without the base's size and colour it painted nothing a user could see. They
 * counted because the ratchet measures COUPLING to DaisyUI's class contract,
 * not pixels: the base can be supplied by a parent or a consuming app, and a
 * file asking DaisyUI for a spinner is residue in a Rottay-native engine
 * either way. What it must never be is invisible.
 *
 * All three now render the Spinner primitive, so the real corpus reports no
 * orphan. The detector is therefore proven against a fixture instead: an empty
 * result must mean "nothing to find", never "stopped looking".
 */
test('the real corpus reports no orphaned Daisy modifier', () => {
  const consumers = collectDaisyClassConsumers(auditedModernFiles());
  const orphaned = consumers
    .filter((consumer) => consumer.modifiersWithoutBase.length > 0)
    .map((consumer) => [
      consumer.file.slice(uiDir.length + 1),
      consumer.modifiersWithoutBase.map(({ token, base }) => `${token}<-${base}`),
    ]);

  assert.deepEqual(orphaned, []);
  assert.equal(countDaisyClassConsumers(auditedModernFiles()), consumers.length);
});

test('a Daisy modifier rendered without its base is still detected and reported', () => {
  withProject(
    {
      'Orphan/engines/modern/index.tsx':
        'export const Orphan = () => <span className="loading-spinner" />;',
      'Based/engines/modern/index.tsx':
        'export const Based = () => <ul className="timeline timeline-vertical" />;',
    },
    (dir) => {
      const orphan = join(dir, 'Orphan/engines/modern/index.tsx');
      const based = join(dir, 'Based/engines/modern/index.tsx');
      const consumers = collectDaisyClassConsumers([orphan, based]);

      const flagged = consumers.find((consumer) => consumer.file === orphan);
      assert.deepEqual(
        flagged.modifiersWithoutBase.map(({ token, base }) => `${token}<-${base}`),
        ['loading-spinner<-loading'],
      );

      // A modifier rendered WITH its base is a consumer without being an
      // orphan: the two conditions are independent, and the flag is
      // diagnostics that never moves the count.
      const complete = consumers.find((consumer) => consumer.file === based);
      assert.deepEqual(complete.modifiersWithoutBase, []);
      assert.equal(countDaisyClassConsumers([orphan, based]), 2);
    },
  );
});

/* -------------------------------------------------------------------------- */
/* The corpus reaches every depth below `engines/modern/`                     */
/* -------------------------------------------------------------------------- */

/**
 * The corpus glob was `engines/modern(/[^/]+)?\.tsx?$` -- exactly one level.
 * `data-table/engines/modern/cell-editor/index.tsx` was therefore outside every
 * modern counter. It scans clean, so nothing was hidden; the defect is that
 * nothing WOULD be, and a ratchet that can be stepped around by adding a
 * subfolder is not a ratchet.
 */
test('a nested engine file is inside the corpus', () => {
  const files = auditedModernFiles().map((file) => file.slice(uiDir.length + 1));
  assert.ok(
    files.includes('patterns/data/data-table/engines/modern/cell-editor/index.tsx'),
    'the known two-level engine file must be audited',
  );
  assert.equal(files.length, 133);
});

/**
 * The falsifying half: a Daisy class two levels below `engines/modern/` must
 * break the ratchet. Under the old one-level glob this fixture scored 0.
 */
test('a Daisy class in a DEEPLY nested engine file is counted', () => {
  withProject(
    {
      'Widget/engines/modern/index.tsx': 'export const Widget = () => <div className="rottay-w" />;',
      'Widget/engines/modern/parts/row/index.tsx':
        'export const Row = () => <li className="timeline-box" />;',
      'Widget/engines/modern/tests/row.test.tsx':
        'export const Fake = () => <li className="modal-box" />;',
    },
    (dir) => {
      const files = modernEngineFiles(dir).map((file) => file.slice(dir.length + 1));
      assert.deepEqual(
        files.sort(),
        ['Widget/engines/modern/index.tsx', 'Widget/engines/modern/parts/row/index.tsx'],
        'the nested source is in and the co-located test is out',
      );
      assert.equal(
        countDaisyClassConsumers(files.map((file) => join(dir, file))),
        1,
        'the nested Daisy class must reach the counter',
      );
    },
  );
});

/**
 * Exclusions are a declared list, not a pattern invented at each call site.
 * Asserting the RULE rather than one filename is what stops the next exclusion
 * from being added as an inline string check somewhere else.
 */
test('test and story files are excluded declaratively, source is not', () => {
  for (const excluded of [
    'ui/x/engines/modern/tests/thing.tsx',
    'ui/x/engines/modern/__tests__/thing.tsx',
    'ui/x/engines/modern/thing.test.tsx',
    'ui/x/engines/modern/thing.spec.ts',
    'ui/x/engines/modern/thing.stories.tsx',
    'ui/x/engines/modern/__fixtures__/thing.tsx',
  ]) {
    assert.equal(isEngineSourceFile(excluded), false, `${excluded} must not be audited`);
  }
  for (const included of [
    'ui/x/engines/modern/index.tsx',
    'ui/x/engines/modern/cell-editor/index.tsx',
    'ui/x/engines/modern/parts/deep/nested/index.tsx',
    // `latest.ts` ends in "test.ts" -- suffix matching must not eat it.
    'ui/x/engines/modern/latest.ts',
  ]) {
    assert.equal(isEngineSourceFile(included), true, `${included} must be audited`);
  }
});

/* -------------------------------------------------------------------------- */
/* Position discrimination, continued                                         */
/* -------------------------------------------------------------------------- */

/**
 * A call ARGUMENT is not a class, and reading a PROPERTY off the call's result
 * proves nothing about the argument.
 *
 * Card's modern engine reads `useRecipeProfileDefaults('card').variant`. When
 * `maxDepth` was raised to a value the tree does not trip, the walk reached
 * that hook call for the first time and read the RECIPE NAME `'card'` as a
 * DaisyUI `card` sighting -- in a file that renders no Daisy class anywhere.
 * The counter already refuses to follow a callee's BODY on the grounds that a
 * call's result is only as provable as the function; a pending property `pick`
 * makes its ARGUMENTS exactly as unprovable, so they are not followed either.
 */
test("a recipe name passed to a hook is not a class (Card's `useRecipeProfileDefaults('card')`)", () => {
  assert.deepEqual(
    classesIn(`const defaults = useRecipeProfileDefaults('card');
      export const Host = () => <div className={defaults.variant} />;`),
    [],
    "a property read off a call result must not harvest the call's arguments",
  );

  // Control 1: the identical helper WITHOUT a property read is a composition
  // helper in a class position, and its arguments are still followed.
  assert.deepEqual(
    classesIn("export const Host = () => <div className={cx('rottay-x', 'modal-box')} />;"),
    ['modal-box'],
  );

  // Control 2: only LITERAL arguments are dropped under a pick. An object
  // argument still carries class values through, which is how every modern
  // primitive builds its class string.
  assert.deepEqual(
    classesIn(`const cls = recipe.resolve({ variant: 'modal-box' }, { root: 'x' }).root;
      export const Host = () => <div className={cls} />;`),
    ['modal-box'],
  );

  // And the real file stays a non-consumer.
  const card = join(uiDir, 'primitives/display/Card/engines/modern/index.tsx');
  assert.match(
    readFileSync(card, 'utf8'),
    /useRecipeProfileDefaults\('card'\)/,
    'the expressive call site must stay expressive',
  );
  assert.deepEqual([...findDaisyClassesInText(readFileSync(card, 'utf8'), card)], []);
});

test("Modal's modern engine is not a consumer -- `kind: 'modal'` is a union member", () => {
  const file = join(packageDir, 'src/ui/primitives/overlay/Modal/engines/modern/index.tsx');
  const source = readFileSync(file, 'utf8');
  assert.match(source, /kind: 'modal'/, 'the expressive call site must stay expressive');
  assert.doesNotMatch(source, /OVERLAY_LAYER_KIND/, 'the counter-dodging constant must stay gone');
  assert.deepEqual([...findDaisyClassesInText(source, file)], []);
});

test("ConfirmDialog's modern engine is not a consumer either", () => {
  const file = join(packageDir, 'src/ui/primitives/overlay/ConfirmDialog/engines/modern/index.tsx');
  assert.deepEqual([...findDaisyClassesInText(readFileSync(file, 'utf8'), file)], []);
});

test('the same map inside the consuming file IS counted', () => {
  assert.deepEqual(
    classesIn(`const PLACEMENT = { topEnd: 'toast toast-top toast-end' };
      export function Host({ side }) {
        return <div className={PLACEMENT[side]} />;
      }`),
    // `toast-end` is a real DaisyUI class the replaced hand-list omitted; the
    // derived taxonomy sees all three.
    ['toast', 'toast-end', 'toast-top'],
  );
});

/* -------------------------------------------------------------------------- */
/* 6. Cross-module reachability                                               */
/* -------------------------------------------------------------------------- */

/**
 * Class reachability used to stop at the file boundary, so a shared class map
 * in a sibling module scored 0 and the whole ratchet could be walked around by
 * moving one `const`. The predecessor "closed" that with a second regex pass
 * over every free-floating string, which is unsound HERE specifically:
 * `<paintedClass>-<suffix>` is this codebase's own `data-part` vocabulary
 * (`skeleton-bar`, `step-connector`, `progress-bar`, `range-separator`,
 * `link-wrapper`), so any shape-based rule selects FOR the false positives.
 * Measured over `src/ui`, that pass reported 18 consumers where 3 exist.
 *
 * The gap is now closed the only sound way: by RESOLUTION. A token counts when
 * there is a path of resolvable declarations from a real class position to the
 * literal -- through imports, aliases, barrels, re-exports and `export *` --
 * and counts for nothing when any link in that path cannot be proven. Every
 * test below names the property it would falsify, and the non-counting half is
 * as load-bearing as the counting half: a gate that over-reports sends the
 * drain chasing classes that do not exist.
 */

/** Write a throwaway module tree and run `body` against its absolute paths. */
function withProject(files, body) {
  const dir = mkdtempSync(join(tmpdir(), 'daisy-cross-'));
  try {
    for (const [name, source] of Object.entries(files)) {
      const file = join(dir, name);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, source);
    }
    return body(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The classes the entry module of a written project renders. */
function classesInProject(files, entry = 'index.tsx') {
  return withProject(files, (dir) => {
    const file = join(dir, entry);
    return [...findDaisyClassesInText(readFileSync(file, 'utf8'), file)].sort();
  });
}

// --- what a proven path looks like -----------------------------------------

test('a class in an imported const counts', () => {
  assert.deepEqual(
    classesInProject({
      'classes.ts': "export const DIALOG = 'rottay-dialog modal-box';",
      'index.tsx': `import { DIALOG } from './classes';
        export const Host = () => <div className={DIALOG} />;`,
    }),
    ['modal-box'],
  );
});

test('a class in an imported MAP counts (the gap that was pinned open here)', () => {
  // The exact fixture that used to assert the blind spot, now asserting the fix.
  const files = {
    'placement.ts': `export const TOAST_PLACEMENT = {
      topEnd: 'toast toast-top toast-end',
      bottomEnd: 'toast toast-bottom toast-end',
    };`,
    'index.tsx': `import { TOAST_PLACEMENT } from './placement';
      export function Host({ side }) {
        return <div className={TOAST_PLACEMENT[side]} />;
      }`,
  };
  assert.deepEqual(classesInProject(files), [
    'toast',
    'toast-bottom',
    'toast-end',
    'toast-top',
  ]);
  // The supplier still renders nothing itself: the class belongs to the file
  // that puts it on an element, which is the unit the ratchet counts.
  assert.deepEqual(classesInProject(files, 'placement.ts'), []);
});

test('an import ALIAS counts', () => {
  assert.deepEqual(
    classesInProject({
      'classes.ts': "export const BOX = 'modal-box';",
      'index.tsx': `import { BOX as DIALOG_BOX } from './classes';
        export const Host = () => <div className={DIALOG_BOX} />;`,
    }),
    ['modal-box'],
  );
});

test('a DEFAULT import counts', () => {
  assert.deepEqual(
    classesInProject({
      'classes.ts': "export default 'modal-backdrop';",
      'index.tsx': `import BACKDROP from './classes';
        export const Host = () => <div className={BACKDROP} />;`,
    }),
    ['modal-backdrop'],
  );
});

test('a NAMESPACE import member counts', () => {
  assert.deepEqual(
    classesInProject({
      'classes.ts': "export const OPEN = 'modal-open';\nexport const SHUT = 'rottay-shut';",
      'index.tsx': `import * as classes from './classes';
        export const Host = () => <div className={classes.OPEN} />;`,
    }),
    ['modal-open'],
  );
});

test('a named RE-EXPORT counts', () => {
  assert.deepEqual(
    classesInProject({
      'classes.ts': "export const BOX = 'modal-box';",
      'barrel.ts': "export { BOX as DIALOG_BOX } from './classes';",
      'index.tsx': `import { DIALOG_BOX } from './barrel';
        export const Host = () => <div className={DIALOG_BOX} />;`,
    }),
    ['modal-box'],
  );
});

test('an `export *` BARREL counts', () => {
  assert.deepEqual(
    classesInProject({
      'tokens/classes.ts': "export const ACTION = 'modal-action';",
      'tokens/index.ts': "export * from './classes';",
      'index.tsx': `import { ACTION } from './tokens';
        export const Host = () => <div className={ACTION} />;`,
    }),
    ['modal-action'],
  );
});

test('an `export { local }` clause counts', () => {
  assert.deepEqual(
    classesInProject({
      'classes.ts': "const BOX = 'modal-box';\nexport { BOX as PUBLIC_BOX };",
      'index.tsx': `import { PUBLIC_BOX } from './classes';
        export const Host = () => <div className={PUBLIC_BOX} />;`,
    }),
    ['modal-box'],
  );
});

test('five transitive module hops count', () => {
  assert.deepEqual(
    classesInProject({
      'e.ts': "export const CLASSES = ['rottay-x', 'toast-bottom'];",
      'd.ts': "export { CLASSES } from './e';",
      'c.ts': "export * from './d';",
      'b.ts': "import { CLASSES } from './c';\nexport const RELAYED = CLASSES;",
      'a.ts': "export { RELAYED as FINAL } from './b';",
      'index.tsx': `import { FINAL } from './a';
        export const Host = () => <div className={FINAL.join(' ')} />;`,
    }),
    ['toast-bottom'],
  );
});

test('a tsconfig `paths` alias counts (159 of the audited imports are `@/...`)', () => {
  assert.deepEqual(
    classesInProject({
      'tsconfig.json': '{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
      'src/tokens/classes.ts': "export const BAR = 'progress';",
      'src/ui/index.tsx': `import { BAR } from '@/tokens/classes';
        export const Host = () => <div className={BAR} />;`,
    }, 'src/ui/index.tsx'),
    ['progress'],
  );
});

test('a static template literal and an array of classes both count across files', () => {
  assert.deepEqual(
    classesInProject({
      'classes.ts':
        'export const HEAD = `rottay-head breadcrumbs`;\nexport const LIST = ["rottay-x", "steps", `step`];',
      'index.tsx': `import { HEAD, LIST } from './classes';
        export const Host = () => (
          <nav className={HEAD}>
            <ol className={LIST.join(' ')} />
          </nav>
        );`,
    }),
    ['breadcrumbs', 'step', 'steps'],
  );
});

test('a cycle TERMINATES, and a real class inside one still counts', () => {
  const started = Date.now();

  // A pure value cycle resolves to no literal at all.
  assert.deepEqual(
    classesInProject({
      'a.ts': "import { B } from './b';\nexport const A = B;",
      'b.ts': "import { A } from './a';\nexport const B = A;",
      'index.tsx': `import { A } from './a';
        export const Host = () => <div className={A} />;`,
    }),
    [],
  );

  // A barrel cycle -- each module re-exports the other -- still finds the class.
  assert.deepEqual(
    classesInProject({
      'a.ts': "export * from './b';\nexport const OWN = 'rottay-own';",
      'b.ts': "export * from './a';\nexport const RING = 'modal-open';",
      'index.tsx': `import { RING } from './a';
        export const Host = () => <div className={RING} />;`,
    }),
    ['modal-open'],
  );

  assert.ok(Date.now() - started < 5000, 'a cycle must terminate, not spin');
});

/** `depth` modules, each relaying the next one's constant. */
const relay = (depth) => {
  const files = { [`m${depth}.ts`]: "export const RELAY = 'rottay-x modal-box';" };
  for (let step = depth - 1; step >= 0; step -= 1) {
    files[`m${step}.ts`] =
      `import { RELAY as NEXT } from './m${step + 1}';\nexport const RELAY = NEXT;`;
  }
  files['index.tsx'] = `import { RELAY } from './m0';
    export const Host = () => <div className={RELAY} />;`;
  return files;
};

/**
 * This test used to assert the opposite, and the assertion it made was the
 * defect: "past the bound the walk stops resolving -- exhausting a budget
 * lowers the count, never raises it", filed under fail-closed.
 *
 * Lowering the count IS the failure. A decrease-only ratchet reads a lower
 * number as progress, so a genuine consumer sitting one module past the bound
 * was silently uncounted and the gate stayed green -- the same shape as the
 * predecessor counter that measured comment prose: plausible number, no
 * meaning. Exhausting a budget now fails the audit and says which budget, in
 * which file, resolving which symbol, through which chain.
 */
test('a value chain past the module-hop bound FAILS the audit rather than counting less', () => {
  assert.deepEqual(classesInProject(relay(8)), ['modal-box'], 'a realistic chain must resolve');
  assert.deepEqual(
    classesInProject(relay(RESOLVER_LIMITS.maxModuleHops - 4)),
    ['modal-box'],
    'a chain inside the bound must still resolve, or the bound is fitted to the fixture',
  );

  const error = budgetErrorFrom(() => classesInProject(relay(RESOLVER_LIMITS.maxModuleHops + 5)));
  assert.equal(error.limit, 'maxModuleHops');
  assert.equal(error.value, RESOLVER_LIMITS.maxModuleHops);
  assert.equal(error.symbol, 'RELAY', 'the error must name the symbol being resolved');
  assert.match(error.file, /m\d+\.ts$/, 'the error must name the file the walk was in');
  assert.ok(error.chain.length > 0, 'the error must carry the provenance walked so far');
  assert.match(error.message, /resolver budget exhausted -- maxModuleHops=48/);
  assert.match(error.message, /provenance:/);
});

/**
 * The same law for the expression budget. `maxDepth` was 8 while the deepest
 * legitimate walk under `src/ui` is 23, so this bound was being hit by ordinary
 * production code every run and silently truncating it.
 */
test('an expression chain past the depth bound FAILS the audit', () => {
  /** One file, `depth` consts, each naming the next. */
  const chain = (depth) => {
    const lines = [`const c${depth} = 'rottay-x modal-box';`];
    for (let step = depth - 1; step >= 0; step -= 1) lines.push(`const c${step} = c${step + 1};`);
    lines.push('export const Host = () => <div className={c0} />;');
    return lines.join('\n');
  };

  assert.deepEqual(
    classesIn(chain(RESOLVER_LIMITS.maxDepth - 4)),
    ['modal-box'],
    'a chain inside the bound must resolve',
  );

  const error = budgetErrorFrom(() => classesIn(chain(RESOLVER_LIMITS.maxDepth + 5)));
  assert.equal(error.limit, 'maxDepth');
  assert.equal(error.value, RESOLVER_LIMITS.maxDepth);
  assert.match(error.message, /resolver budget exhausted -- maxDepth=64/);
  assert.ok(error.symbol.length > 0, 'the error must describe the expression it stopped on');
});

/**
 * The third budget, exercised at its boundary rather than by writing five
 * thousand modules to disk: the graph is the public seam
 * (`createModuleGraph()`), so a run that begins with the parse budget already
 * spent must fail on the first supplier it needs -- not resolve it to `null`
 * and report the consumer as clean.
 */
test('an exhausted module-parse budget FAILS the audit', () => {
  withProject(
    {
      'classes.ts': "export const DIALOG = 'rottay-dialog modal-box';",
      'index.tsx': `import { DIALOG } from './classes';
        export const Host = () => <div className={DIALOG} />;`,
    },
    (dir) => {
      const file = join(dir, 'index.tsx');
      const source = readFileSync(file, 'utf8');

      // Control: with budget, the supplier resolves and the class counts.
      assert.deepEqual([...findDaisyClassesInText(source, file)], ['modal-box']);

      const spent = createModuleGraph();
      spent.parsed = RESOLVER_LIMITS.maxModules;
      const error = budgetErrorFrom(() =>
        findDaisyClassesInText(source, file, undefined, spent),
      );
      assert.equal(error.limit, 'maxModules');
      assert.equal(error.value, RESOLVER_LIMITS.maxModules);
      assert.equal(error.file, join(dir, 'classes.ts'), 'the error names the module it refused');
      assert.equal(error.symbol, 'DIALOG');
    },
  );
});

/**
 * The distinction the previous implementation could not make. A cycle and an
 * exhausted budget are different conditions -- one is normal termination, the
 * other is a failure -- and they must not share an exit. Cycle detection is a
 * PATH SET consulted before any budget, so no cycle, however long, can be
 * reported as a budget.
 */
test('a cycle terminates normally and never raises a budget error', () => {
  // A cycle long enough that a budget-shaped termination would have to fire
  // first if the two shared a code path.
  const ring = (length) => {
    const files = {};
    for (let step = 0; step < length; step += 1) {
      files[`m${step}.ts`] =
        `import { RING as NEXT } from './m${(step + 1) % length}';\nexport const RING = NEXT;`;
    }
    files['index.tsx'] = `import { RING } from './m0';
      export const Host = () => <div className={RING} />;`;
    return files;
  };

  assert.deepEqual(classesInProject(ring(30)), [], 'a pure value cycle resolves to no literal');

  // And the same ring with a real class in it still finds the class.
  assert.deepEqual(
    classesInProject({
      'a.ts': "export * from './b';\nexport const OWN = 'rottay-own';",
      'b.ts': "export * from './a';\nexport const RING = 'modal-open';",
      'index.tsx': `import { RING } from './a';
        export const Host = () => <div className={RING} />;`,
    }),
    ['modal-open'],
  );
});

/**
 * The audited tree must not be anywhere near a bound. A budget that ordinary
 * code reaches is not a backstop, it is a silent truncation waiting to be
 * rediscovered -- which is exactly what `maxDepth = 8` turned out to be.
 */
test('the real corpus resolves without approaching any budget', () => {
  assert.doesNotThrow(() => countDaisyClassConsumers(auditedModernFiles()));
});

// --- what a proven path does NOT look like ----------------------------------

test('a TYPE-ONLY import does not count', () => {
  const supplier = "export const BOX = 'modal-box';";
  assert.deepEqual(
    classesInProject({
      'classes.ts': supplier,
      'index.tsx': `import type { BOX } from './classes';
        export const Host = () => <div className={BOX} />;`,
    }),
    [],
    'a type has no runtime value that could reach a className',
  );
  assert.deepEqual(
    classesInProject({
      'classes.ts': supplier,
      'index.tsx': `import { type BOX } from './classes';
        export const Host = () => <div className={BOX} />;`,
    }),
    [],
    'an inline type specifier is type-only too',
  );
  // Control: the same fixture with a value import DOES count, so the two
  // assertions above are about `type`, not about a broken fixture.
  assert.deepEqual(
    classesInProject({
      'classes.ts': supplier,
      'index.tsx': `import { BOX } from './classes';
        export const Host = () => <div className={BOX} />;`,
    }),
    ['modal-box'],
  );
});

test('an imported-but-unused class does not count', () => {
  assert.deepEqual(
    classesInProject({
      'classes.ts': "export const BOX = 'modal-box';\nexport const KIND = 'modal';",
      'index.tsx': `import { BOX, KIND } from './classes';
        export const Host = () => <div data-part={BOX} data-kind={KIND} className="rottay-host" />;`,
    }),
    [],
    'importing a class is not rendering one -- position still decides',
  );
});

test('a comment in the SUPPLIER cannot reach the counter', () => {
  assert.deepEqual(
    classesInProject({
      'classes.ts': `// modal modal-open modal-box alert skeleton toast timeline don't can't
        /* usePresence's "modal" -- was className="modal-backdrop carousel breadcrumbs" */
        export const HOST = 'rottay-host';`,
      'index.tsx': `import { HOST } from './classes';
        export const Host = () => <div className={HOST} />;`,
    }),
    [],
    'prose in another file is trivia there too',
  );
});

test('a domain literal in the SUPPLIER does not count', () => {
  assert.deepEqual(
    classesInProject({
      'kinds.ts': "export const OVERLAY_KIND = 'modal';\nexport const INPUT_TYPE = 'range';",
      'index.tsx': `import { OVERLAY_KIND, INPUT_TYPE } from './kinds';
        export const Host = () => (
          <div>
            <Layer kind={OVERLAY_KIND} />
            <input type={INPUT_TYPE} className="rottay-input" />
          </div>
        );`,
    }),
    [],
    'crossing a file boundary does not turn a union member into a class',
  );
});

test('an identically-named export in an UNRELATED module does not count', () => {
  assert.deepEqual(
    classesInProject({
      'unrelated.ts': "export const PLACEMENT = 'toast toast-top';",
      'benign.ts': "export const PLACEMENT = 'rottay-placement';",
      'index.tsx': `import { PLACEMENT } from './benign';
        export const Host = () => <div className={PLACEMENT} />;`,
    }),
    [],
    'resolution follows the import edge, never the name',
  );
});

test('a local binding SHADOWING an import blocks the import', () => {
  assert.deepEqual(
    classesInProject({
      'classes.ts': "export const link = 'link';",
      'index.tsx': `import { link } from './classes';
        export function Row({ link }) {
          return <a className={link} />;
        }`,
    }),
    [],
    'the class position reads the parameter; attributing the module constant would be a lie',
  );
});

test('an imported FUNCTION called in a class position does not count', () => {
  // Deliberate non-count. Harvesting every `return` of an arbitrary function
  // would put `className={t('a.b')}` one hop from an i18n catalog, where
  // "Copy link" tokenizes to a `link` sighting. Arguments are still followed,
  // so a composition helper keeps working.
  assert.deepEqual(
    classesInProject({
      'build.ts': "export const build = (n: string) => `${n} modal-box`;",
      'index.tsx': `import { build } from './build';
        export const Host = () => <div className={build('rottay-dialog')} />;`,
    }),
    [],
  );
  assert.deepEqual(
    classesInProject({
      'build.ts': "export const compose = (...parts: string[]) => parts.join(' ');",
      'index.tsx': `import { compose } from './build';
        export const Host = () => <div className={compose('rottay-dialog', 'modal-open')} />;`,
    }),
    ['modal-open'],
    'the helper\'s ARGUMENTS are a class position and still count',
  );
});

test('an unresolvable specifier does not count', () => {
  assert.deepEqual(
    classesInProject({
      'index.tsx': `import { BOX } from 'some-published-package';
        import { GONE } from './deleted-module';
        export const Host = () => <div className={\`\${BOX} \${GONE}\`} />;`,
    }),
    [],
    'an unprovable path is a non-count, never a guess',
  );
});

test('a NAMESPACE member with a dynamic key does not count', () => {
  assert.deepEqual(
    classesInProject({
      'classes.ts': "export const OPEN = 'modal-open';\nexport const SHUT = 'rottay-shut';",
      'index.tsx': `import * as classes from './classes';
        export const Host = ({ key }) => <div className={classes[key]} />;`,
    }),
    [],
    'a namespace is not a container to sweep -- an unknown key resolves to nothing',
  );
});

test('a STATIC key narrows an imported map to the property actually read', () => {
  const files = {
    'classes.ts': `export const SURFACES = {
      panel: 'rottay-panel',
      dialog: 'modal-box',
    };`,
    'index.tsx': `import { SURFACES } from './classes';
      export const Host = () => <div className={SURFACES.panel} />;`,
  };
  assert.deepEqual(classesInProject(files), [], 'the read property carries no Daisy class');

  assert.deepEqual(
    classesInProject({
      ...files,
      'index.tsx': `import { SURFACES } from './classes';
        export const Host = () => <div className={SURFACES.dialog} />;`,
    }),
    ['modal-box'],
  );

  assert.deepEqual(
    classesInProject({
      ...files,
      'index.tsx': `import { SURFACES } from './classes';
        export const Host = ({ kind }) => <div className={SURFACES[kind]} />;`,
    }),
    ['modal-box'],
    'a dynamic key can read any entry, so every entry stays a candidate',
  );
});

// --- the ratchet moves in both directions -----------------------------------

test('adding a Daisy class to an IMPORTED module increments the count, removing it decrements it', () => {
  withProject(
    {
      'classes.ts': "export const SURFACE = 'rottay-surface';",
      'index.tsx': `import { SURFACE } from './classes';
        export const Host = () => <div className={SURFACE} />;`,
    },
    (dir) => {
      const supplier = join(dir, 'classes.ts');
      const consumer = join(dir, 'index.tsx');

      assert.equal(countDaisyClassConsumers([consumer]), 0);

      writeFileSync(supplier, "export const SURFACE = 'rottay-surface modal-box';");
      assert.equal(
        countDaisyClassConsumers([consumer]),
        1,
        'a class added in another file must raise the ratchet',
      );
      // The consumer is the counted unit even though the literal lives elsewhere.
      assert.deepEqual(listDaisyClassConsumers([consumer]), [[consumer, ['modal-box']]]);

      writeFileSync(supplier, "export const SURFACE = 'rottay-surface';");
      assert.equal(
        countDaisyClassConsumers([consumer]),
        0,
        'removing it must lower the ratchet -- no stale module cache',
      );
    },
  );
});

// --- the real corpus --------------------------------------------------------

/**
 * Cross-module resolution is not theoretical here: two audited modern-engine
 * files reach a class value in a sibling module today.
 *
 * `Card`'s modern engine builds `className={cardClassName}` from a `variant`
 * whose `??` chain ends at `CARD_DEFAULTS.variant` in `Card/contracts/index.ts`;
 * `elevated` is that value, and in the engine file it occurs only inside a
 * comment and as an object KEY, neither of which the counter can reach. `Button`
 * does the same through `BUTTON_DEFAULTS.shape`, whose value is `default`.
 * Finding either token therefore PROVES the walk crossed the file boundary;
 * scanning the identical text under a non-absolute path, which disables
 * resolution, is the control and must find nothing. Neither constant carries a
 * Daisy class, which is why the census is still 3.
 */
test('the resolver reaches a real cross-file class value in the audited tree', () => {
  const uiDir = join(packageDir, 'src/ui');
  for (const [rel, token] of [
    ['primitives/display/Card/engines/modern/index.tsx', 'elevated'],
    ['primitives/inputs/Button/engines/modern/index.tsx', 'default'],
  ]) {
    const file = join(uiDir, rel);
    const source = readFileSync(file, 'utf8');
    assert.deepEqual(
      [...findDaisyClassesInText(source, file, [token])],
      [token],
      `${rel} no longer resolves its defaults across the module boundary`,
    );
    assert.deepEqual(
      [...findDaisyClassesInText(source, rel, [token])],
      [],
      'the control found it without resolution, so the test proves nothing',
    );
  }
});

/* -------------------------------------------------------------------------- */
/* DEBUG_DAISY_CONSUMERS inventory                                            */
/* -------------------------------------------------------------------------- */

test('the debug inventory reports a site per class and never moves the count', () => {
  const dir = mkdtempSync(join(tmpdir(), 'daisy-inventory-'));
  try {
    const file = join(dir, 'index.tsx');
    writeFileSync(
      file,
      `const BOX = 'modal-box';
       export function Dialog() {
         return (
           <div className="modal modal-open">
             <div className={BOX} />
             <div data-part="skeleton-bar" />
           </div>
         );
       }`,
    );

    const [entry] = collectDaisyClassConsumers([file]);
    assert.equal(entry.file, file);
    assert.deepEqual(entry.tokens, ['modal', 'modal-box', 'modal-open']);

    // A literal sitting in the attribute is `className`; one reached by
    // resolving a binding is `resolved`. `skeleton-bar` is a data-part and so
    // appears nowhere. Sites are ordered by line, and a `resolved` site reports
    // the DEFINITION (`const BOX` on line 1), which is the line the drain has to
    // edit -- not the `className={BOX}` reference on line 5.
    assert.deepEqual(
      entry.sites.map((site) => [site.line, site.kind, site.token]),
      [
        [1, 'resolved', 'modal-box'],
        [4, 'className', 'modal'],
        [4, 'className', 'modal-open'],
      ],
    );

    // The inventory is derived from the counting scan, not a second one.
    assert.equal(countDaisyClassConsumers([file]), 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

/**
 * When the literal is in another file, the line number alone is useless -- it
 * points into a module the drain was not looking at. The site therefore carries
 * the file it really lives in and the PROVENANCE: every declaration crossed to
 * reach it, in order. That chain is the whole answer to "why is this file
 * counted when the class is not in it", and `DEBUG_DAISY_CONSUMERS` prints it.
 */
test('an imported site reports its origin file and the full provenance chain', () => {
  withProject(
    {
      'tokens/classes.ts': "export const RAIL = 'rottay-rail toast-top';",
      'tokens/index.ts': "export * from './classes';",
      'index.tsx': `import { RAIL } from './tokens';
        export const Host = () => <div className={RAIL} />;`,
    },
    (dir) => {
      const consumer = join(dir, 'index.tsx');
      const [entry] = collectDaisyClassConsumers([consumer]);

      assert.equal(entry.file, consumer, 'the consumer is the counted unit');
      assert.deepEqual(entry.tokens, ['toast-top']);
      assert.equal(entry.sites.length, 1);

      const [site] = entry.sites;
      assert.equal(site.kind, 'imported');
      assert.equal(site.file, join(dir, 'tokens/classes.ts'), 'the site names the file to edit');
      assert.equal(site.line, 1);
      assert.match(site.text, /toast-top/);
      // One frame per module boundary crossed: the barrel, then the module the
      // barrel re-exports from.
      assert.deepEqual(site.chain, [
        { file: join(dir, 'tokens/index.ts'), symbol: 'RAIL' },
        { file: join(dir, 'tokens/classes.ts'), symbol: 'RAIL' },
      ]);
    },
  );

  // The other half of the contract: a site in the file that renders it has no
  // chain at all, so the debug print stays flat for a local consumer. This was
  // asserted against file-manager's `link link-hover` attribute until that file
  // was drained; a fixture of the same shape (two classes, one attribute, one
  // file) keeps the assertion alive with nothing left in the tree to borrow.
  withProject(
    {
      'Local/engines/modern/index.tsx':
        'export const Local = () => <a className="link link-hover" />;',
    },
    (dir) => {
      const local = collectDaisyClassConsumers([join(dir, 'Local/engines/modern/index.tsx')]);
      assert.deepEqual(local[0].tokens, ['link', 'link-hover']);
      assert.deepEqual(
        local[0].sites.map((site) => site.chain),
        [[], []],
      );
    },
  );
});
