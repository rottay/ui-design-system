/**
 * The pass-through census selector-list tokenizer (census v7.1.11).
 *
 * Three layers. (1) A table of selector lists with their exact split, each row a grouping the raw
 * `prelude.split(',')` got wrong or a negative that must still split. (2) The real skin corpus of this
 * tree, split against postcss `list.comma` as an independent oracle. (3) The NAMED MUTANT: a
 * scratch workspace whose owner skin relates a caller part and a caller state only through a fold,
 * `.owner:is([data-part="p"], .owner__p)[data-state="open"]`, measured end to end by the sweep.
 * Restoring the raw split at the sweep's call site turns that relation test red (0 state rules).
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, cpSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { repoRoot as findRepoRoot } from '../../../../../../repo-root/index.mjs';
import { sweepPassThrough } from '../../index.mjs';
import { splitSelectorList } from '../index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = findRepoRoot(HERE);
const CORE = join(REPO, 'packages/core');

describe('splitSelectorList -- the table', () => {
  const rows = [
    // [name, prelude, expected]
    ['the reproduction: a part and a state related through a fold', '.owner:is([data-part="p"], .owner__p)[data-state="open"]', ['.owner:is([data-part="p"], .owner__p)[data-state="open"]']],
    [':where() argument list', ':where(a, a:visited) .x, .y', [':where(a, a:visited) .x', '.y']],
    [':not() argument list', '.a:not([data-state~="focused"], :focus-visible), .b', ['.a:not([data-state~="focused"], :focus-visible)', '.b']],
    ['nested :is(:not(a, b), c)', '.a:is(:not(.b, .c), .d) .e, .f', ['.a:is(:not(.b, .c), .d) .e', '.f']],
    [':not(:where(a, b, c))', '.p:not(:where([data-state~="focused"], [data-state~="focus-visible"], :focus-visible))', ['.p:not(:where([data-state~="focused"], [data-state~="focus-visible"], :focus-visible))']],
    [':has() relative list', '.a:has(> .b, + .c), .d', ['.a:has(> .b, + .c)', '.d']],
    [':nth-child(An+B of S)', 'li:nth-child(2n + 1 of .a, .b), .c', ['li:nth-child(2n + 1 of .a, .b)', '.c']],
    ['comma inside a double-quoted attribute value', '[data-x="a,b"], .c', ['[data-x="a,b"]', '.c']],
    ['comma inside a single-quoted attribute value', "[data-x='a,b'] .d, .c", ["[data-x='a,b'] .d", '.c']],
    ['a closing paren inside a string does not close the group', ':is([title="a)b"], .x), .c', [':is([title="a)b"], .x)', '.c']],
    ['a closing bracket inside a string does not close the attribute', '[title="]"], .c', ['[title="]"]', '.c']],
    ['an opening paren inside a string does not open a group', '[title="("], .c', ['[title="("]', '.c']],
    ['the other quote inside a string is text', `[title="it's, ok"], .c`, [`[title="it's, ok"]`, '.c']],
    ['an escaped quote does not close the string', '[data-x="a\\",b"], .c', ['[data-x="a\\",b"]', '.c']],
    ['an escaped comma outside a string is one class', '.a\\,b, .c', ['.a\\,b', '.c']],
    ['an escaped paren outside a string opens no group', '.a\\(, .c', ['.a\\(', '.c']],
    ['a backslash at the very end is kept', '.a\\', ['.a\\']],
    ['a stray closer is text and never drives the depth negative', '.a), .b, .c]', ['.a)', '.b', '.c]']],
    ['a closer of the wrong kind closes nothing', ':is([a)], .b), .c', [':is([a)], .b)', '.c']],
    ['empty parts are not selectors', ',.a,, .b,', ['.a', '.b']],
    ['multi-line lists are trimmed', '.a,\n  .b:is(\n    .c,\n    .d\n  )', ['.a', '.b:is(\n    .c,\n    .d\n  )']],
    ['no comma, one selector', '.a .b > .c', ['.a .b > .c']],
    ['real: the M-P1 form-sections fold (form-sections/index.css:112)', ".ds-structure.ds-form-sections:is([data-part='root'], .ds-form-sections__root) > :is([data-part='section'], .ds-form-sections__section)", [".ds-structure.ds-form-sections:is([data-part='root'], .ds-form-sections__root) > :is([data-part='section'], .ds-form-sections__section)"]],
    ['real: a state :is() fold with a pseudo-element twin (bottom-tab-bar)', ".rottay-bottom-tab-bar__tab[data-part='tab-button']:is([data-state~='focus-visible'], :focus-visible),\n.rottay-bottom-tab-bar__tab[data-part='tab-button']:is([data-state~='focus-visible'], :focus-visible)::after", [".rottay-bottom-tab-bar__tab[data-part='tab-button']:is([data-state~='focus-visible'], :focus-visible)", ".rottay-bottom-tab-bar__tab[data-part='tab-button']:is([data-state~='focus-visible'], :focus-visible)::after"]],
    ['real: a comma inside a quoted attribute value (rustic activity-log)', ".ds-pattern-activity-log.ds-engine-rustic [data-part='dot'][data-action-category=\"var(--ds-color-text-secondary, var(--ds-color-text-muted))\"]", [".ds-pattern-activity-log.ds-engine-rustic [data-part='dot'][data-action-category=\"var(--ds-color-text-secondary, var(--ds-color-text-muted))\"]"]],
    ['real: a part list behind a state :is() (modern data-table)', '.ds-pattern-data-table.ds-engine-modern [data-part="body-row"]:is([data-state~="focus-visible"], :focus-visible) :is([data-part="data-cell"][data-pinned="true"], [data-part="actions-cell"])', ['.ds-pattern-data-table.ds-engine-modern [data-part="body-row"]:is([data-state~="focus-visible"], :focus-visible) :is([data-part="data-cell"][data-pinned="true"], [data-part="actions-cell"])']],
  ];
  for (const [name, prelude, expected] of rows) it(name, () => assert.deepEqual(splitSelectorList(prelude), expected));

  it('the raw split is wrong on the reproduction (the defect this module replaces)', () => {
    const prelude = '.owner:is([data-part="p"], .owner__p)[data-state="open"]';
    const raw = prelude.split(',').map((x) => x.trim());
    assert.equal(raw.length, 2);
    assert.ok(!raw.some((sel) => /\[data-part="p"\]/.test(sel) && /\[data-state/.test(sel)), 'no raw fragment carries both the part and the state');
    assert.equal(splitSelectorList(prelude).filter((sel) => /\[data-part="p"\]/.test(sel) && /\[data-state/.test(sel)).length, 1);
  });
});

describe('splitSelectorList -- the real skin corpus', () => {
  // The sweep's own prelude reading (sweep/index.mjs, the skins selector index), over the three skin dirs.
  const SKIN_DIRS = ['foundation/tokens/css/runtime/engines/modern/skin', 'foundation/tokens/css/runtime/engines/rustic/skin', 'foundation/tokens/css/presentation/components/skin'];
  const preludes = [];
  for (const d of SKIN_DIRS) {
    const stack = [join(CORE, 'src', d)];
    while (stack.length) {
      const cur = stack.pop();
      for (const e of readdirSync(cur, { withFileTypes: true })) {
        const p = join(cur, e.name);
        if (e.isDirectory()) { stack.push(p); continue; }
        if (!e.name.endsWith('.css')) continue;
        const css = readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
        for (const m of css.matchAll(/([^{};]+)\{/g)) {
          const prelude = m[1].trim();
          if (!prelude || prelude.startsWith('@') || /^(from|to|\d+%)/.test(prelude)) continue;
          preludes.push(prelude);
        }
      }
    }
  }

  it('agrees with postcss list.comma (independent oracle) on every rule prelude', () => {
    const postcss = createRequire(join(CORE, 'package.json'))('postcss');
    const disagree = preludes.filter((p) => JSON.stringify(splitSelectorList(p)) !== JSON.stringify(postcss.list.comma(p).filter(Boolean)));
    assert.ok(preludes.length > 1000, `the corpus is read (${preludes.length} preludes)`);
    assert.deepEqual(disagree, []);
  });

  it('exercises the defect: some preludes carry commas inside functional pseudo-classes or quoted values', () => {
    const grouped = preludes.filter((p) => p.split(',').length !== splitSelectorList(p).length);
    const functional = (p) => /:(is|where|not|has|nth-child|nth-last-child)\(/.test(p);
    const quotedComma = (p) => /"[^"]*,[^"]*"|'[^']*,[^']*'/.test(p);
    assert.ok(grouped.some(functional), 'the corpus holds folded selector lists');
    assert.deepEqual(grouped.filter((p) => !functional(p) && !quotedComma(p)), [], 'every such prelude groups through a functional pseudo-class or a string');
  });
});

describe('the sweep end to end -- NAMED MUTANT: the raw split at the sweep call site', () => {
  let ws;
  let raw;
  let compound;
  before(() => {
    ws = mkdtempSync(join(tmpdir(), 'pass-through-selector-list-'));
    const core = join(ws, 'packages/core');
    mkdirSync(core, { recursive: true });
    cpSync(join(CORE, 'package.json'), join(core, 'package.json'));
    symlinkSync(join(CORE, 'node_modules'), join(core, 'node_modules'));
    const put = (rel, text) => { mkdirSync(dirname(join(core, rel)), { recursive: true }); writeFileSync(join(core, rel), text); };
    // A skinned child family whose classic engine forwards its rest (so it has an engine site).
    put('src/components/primitives/widget/engines/classic/index.tsx', 'export function Widget({ ...rest }) {\n  return <div className="ds-widget" {...rest} />;\n}\n');
    // The caller: it hands part `p` and state `open` to the child, inside the `owner` directory.
    put('src/components/patterns/owner/index.tsx', "import { Widget } from '../../primitives/widget/engines/classic';\nexport function Owner() {\n  return <Widget data-part=\"p\" data-state=\"open\" />;\n}\n");
    // The owner skin: ONE rule relating part p and state open through a fold, and two controls.
    put('src/foundation/tokens/css/presentation/components/skin/owner/index.css', [
      '.owner:is([data-part="p"], .owner__p)[data-state="open"] { color: red; }',
      '.owner:is([data-part="p"], .owner__p) { color: blue; }', // control: the part, no state
      '.owner [data-part="q"]:is([data-state="open"], :hover) { color: green; }', // control: the state, another part
      '',
    ].join('\n'));
    // The child's own skin: a list whose first selector carries a `)` inside a quoted value. Two
    // anatomy selectors on the element's own class; a split blind to strings sees one.
    put('src/foundation/tokens/css/presentation/components/skin/widget/index.css', '.ds-widget[data-part="x"][title="a)b"], .ds-widget[data-part="y"] { color: red; }\n');
    raw = sweepPassThrough({ repoRoot: ws });
    compound = raw.compoundSites.find((c) => c.file === 'packages/core/src/components/patterns/owner/index.tsx');
  });
  after(() => { if (ws) rmSync(ws, { recursive: true, force: true }); });

  it('the caller resolves to the child family and the owner skin (fixture precondition)', () => {
    assert.ok(compound, 'the caller row exists');
    assert.equal(compound.childFamily, 'widget');
    assert.deepEqual(compound.ownerSkins, ['owner']);
    assert.equal(compound.callerPart, 'p');
  });

  it('the part+state relation behind a fold is credited exactly once, as the whole selector', () => {
    assert.equal(compound.skinRulesSelectingCallerState, 1);
    assert.deepEqual(compound.stateSelectorsHit, ['packages/core/src/foundation/tokens/css/presentation/components/skin/owner/index.css :: .owner:is([data-part="p"], .owner__p)[data-state="open"]']);
  });

  it('the part is credited once per rule naming it, never once per fragment', () => {
    assert.equal(compound.skinRulesSelectingCallerPart, 2);
  });

  it('the own-anatomy index (v7.1.9) reads the same list: a `)` inside a string closes nothing', () => {
    const site = raw.engineSites.find((s) => s.family === 'widget');
    assert.deepEqual(site.dsClasses, ['ds-widget'], 'fixture precondition: the element carries its own class');
    assert.equal(site.ownAnatomyRules, 2);
  });
});
