import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import test, { describe } from 'node:test';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import { collectSkinFiles } from '../../../../../../libraries/engine/skins/files/index.mjs';
import { GRAMMAR, LAYOUT_ALIASES, scan, sitesInValue } from '../../../../../motion-budget/audits/property-law/index.mjs';
import { SKIN_LITERAL_EXCLUSIONS } from '../../hardcodes/exclusions/index.mjs';
import {
  SKIN_LITERAL_CLASSES,
  countInlineGeometryInFile,
  countSkinLiteralsInCss,
  duplicateRootDeclarations,
  legacyTransitionReadsInCss,
} from '../../hardcodes/index.mjs';

const AUDIT = join(dirname(fileURLToPath(import.meta.url)), '../../index.mjs');
const BASELINE = join(dirname(AUDIT), 'baseline/index.json');
const PACKAGE_ROOT = join(dirname(AUDIT), '../../../../..');
const SKIN_ANCHOR = 'runtime/engines/modern/skin/button/index.css';
const SOURCE_ANCHOR = 'patterns/customization/token-inspector/index.tsx';

/* One planted violation per class (HARD-1's mutants), each counting ONLY its own class. */
const MUTANTS = {
  fontWeight: '.a { font-weight: 600; }',
  lineHeight: '.a { line-height: 1.4; }',
  letterSpacing: '.a { letter-spacing: 0.04em; }',
  fontFamily: '.a { font-family: Inter, sans-serif; }',
  spacing: '.a { padding: 12px; }',
  size: '.a { inline-size: 240px; }',
  radius: '.a { border-radius: 9999px; }',
  opacity: '.a { opacity: 0.5; }',
  shadow: '.a { box-shadow: 0 2px 8px var(--ds-x); }',
  color: '.a { background: color-mix(in srgb, currentColor 7%, transparent); }',
  duration: '.a { transition: opacity 150ms var(--ds-motion-ease-out); }',
  easing: '.a { transition: opacity var(--ds-motion-feedback) cubic-bezier(0.2, 0, 0, 1); }',
  zIndex: '.a { z-index: 10; }',
  containerQuery: '@container ds-a (max-width: 640px) { .a { color: var(--ds-x); } }',
  important: '.a { color: var(--ds-x) !important; }',
  dataTenant: '[data-tenant="acme"] .a { color: var(--ds-x); }',
  channelLiteral: '.a { --_ds-a-gap: 12px; }',
  legacyTransitionRead: '.a { transition: opacity var(--ds-transition-fast); }',
};

/* TEC, FLOOR and DEF shapes: none of them is a hardcode. */
const CONTROL = `
.a {
  padding: var(--ds-spacing-2, 12px);
  border-radius: var(--ds-radius-full, 9999px);
  color: var(--ds-a-tone, #123456);
  padding-inline: 0px;
  opacity: 0;
  line-height: 1;
  z-index: 0;
  margin-block-start: -1px;
  min-block-size: 44px;
  font-family: var(--ds-font-family-mono), monospace;
  transition: opacity var(--ds-motion-feedback) linear;
  -webkit-mask-image: linear-gradient(#000, transparent);
  padding-inline-end: env(safe-area-inset-right, 16px);
}
@media (prefers-reduced-motion: reduce) {
  .a { transition-duration: 0.01ms !important; }
}
@media (forced-colors: active) {
  .a { border-color: CanvasText !important; }
}
@keyframes ds-a-rise {
  from { opacity: 0.4; transform: translateY(4px); inline-size: 12px; }
}
`;

function only(klass) {
  return Object.fromEntries(SKIN_LITERAL_CLASSES.map((k) => [k, k === klass ? 1 : 0]));
}

describe('skin literal classifier', () => {
  test('every class has a planted mutant', () => {
    assert.deepEqual(Object.keys(MUTANTS).sort(), [...SKIN_LITERAL_CLASSES].sort());
  });

  for (const [klass, css] of Object.entries(MUTANTS)) {
    test(`${klass}: the planted literal counts once, in its own class only`, () => {
      assert.deepEqual(countSkinLiteralsInCss(css).counts, only(klass));
    });
  }

  test('a hex and an rgba colour count; contrast-color() does not', () => {
    assert.equal(countSkinLiteralsInCss('.a { color: #123456; }').counts.color, 1);
    assert.equal(countSkinLiteralsInCss('.a { border: 1px solid rgba(0, 0, 0, 0.5); }').counts.color, 1);
    assert.equal(countSkinLiteralsInCss('.a { color: contrast-color(var(--ds-x)); }').counts.color, 0);
  });

  test('TEC, FLOOR and DEF shapes count nothing', () => {
    assert.deepEqual(countSkinLiteralsInCss(CONTROL).counts, only(null));
  });

  test('a keyframe colour still counts (TEC context excepts colour)', () => {
    const css = '@keyframes k { to { background: #fff; opacity: 0.4; } }';
    assert.deepEqual(countSkinLiteralsInCss(css).counts, only('color'));
  });

  test('a parse failure is reported, not counted as zero silently', () => {
    assert.equal(countSkinLiteralsInCss('.a { color: red; ').parseFailure, true);
  });
});

const FROZEN_SKIN_RE = /[\\/]engines[\\/](?:classic|rustic)[\\/]/;
const legacyCount = (css) => countSkinLiteralsInCss(css).counts.legacyTransitionRead;

/* One line per shape, every declaration inline after `{` so property-law's match line is the declaration's. */
const PARTITION_FIXTURE = [
  '.t { transition: var(--ds-transition-rearrange); }',
  '.p { transition-property: var(--ds-transition-all); }',
  '.w { -webkit-transition: var(--ds-transition-resize); }',
  '.r { --ds-x-relay: var(--ds-transition-rearrange); }',
  '.n { animation: k var(--ds-transition-resize); }',
  '.m { transition: var(',
  '  --ds-transition-rearrange,',
  '  opacity 1s',
  '); }',
  '.x { transition: var(--ds-transition-rearrange), opacity var(--ds-transition-fast); }',
  '.u { TRANSITION: var(--ds-transition-rearrange); }',
  '@keyframes k { from { transition: opacity/*var(--ds-transition-resize)*/var(--ds-motion-fast); } }',
].join('\n');

/** property-law's layout-alias lines, computed with its exported grammar as `scan()` applies it. */
function propertyLawLayoutAliasLines(css) {
  const text = GRAMMAR.stripComments ? css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')) : css;
  const lines = new Set();
  for (const match of text.matchAll(new RegExp(GRAMMAR.declarationPattern, 'g'))) {
    if (sitesInValue(match[2] ?? '').some((site) => site.kind === 'layoutAlias')) {
      lines.add(text.slice(0, match.index).split('\n').length);
    }
  }
  return [...lines].sort((a, b) => a - b);
}

const lineSet = (reads) => [...new Set(reads.map((read) => read.line))].sort((a, b) => a - b);

describe('legacy transition reads', () => {
  test('a nested, relayed, animation or vendor-prefixed alias read counts once', () => {
    for (const css of [
      '.a { transition: var(--ds-x-transition, var(--ds-transition-slow)); }',
      '.a { --ds-x-relay: var(--ds-transition-rearrange); }',
      '.a { animation: fade var(--ds-transition-resize); }',
      '.a { -webkit-transition: var(--ds-transition-rearrange); }',
    ]) {
      assert.deepEqual(countSkinLiteralsInCss(css).counts, only('legacyTransitionRead'), css);
    }
  });

  test('a multi-line var( read is extracted: a relay counts, a transition declaration is property-law\'s', () => {
    assert.equal(legacyCount('.a { --ds-x: var(\n  --ds-transition-rearrange,\n  opacity 1s\n); }'), 1);
    assert.equal(legacyCount('.b { transition: var(\n  --ds-transition-rearrange\n); }'), 0);
  });

  test('a mixed declaration counts once, from its non-layout read', () => {
    const css = '.a { transition: var(--ds-transition-rearrange), opacity var(--ds-transition-fast); }';
    assert.equal(legacyCount(css), 1);
    assert.deepEqual(legacyTransitionReadsInCss(css), [
      { line: 1, name: '--ds-transition-rearrange', excluded: true },
      { line: 1, name: '--ds-transition-fast', excluded: false },
    ]);
  });

  test('the class is context-independent: reduced-motion and keyframes reads still count', () => {
    assert.equal(legacyCount('@media (prefers-reduced-motion: reduce) { .a { transition: var(--ds-transition-normal); } }'), 1);
    assert.equal(legacyCount('@keyframes k { from { --x: var(--ds-transition-fast); } }'), 1);
  });

  test('a layout alias in a transition or transition-property declaration is never counted twice', () => {
    const css = '.a { transition: var(--ds-transition-rearrange); }\n.b { transition-property: var(--ds-transition-all); }';
    assert.deepEqual(countSkinLiteralsInCss(css).counts, only(null));
  });

  test('motion tokens, comments and alias declarations are not reads', () => {
    const glued = '.d { transition: opacity/*var(--ds-transition-fast)*/var(--ds-motion-fast); }';
    assert.match(postcss.parse(glued).first.first.value, /\/\*/, 'postcss keeps a glued comment in the value');
    for (const css of [
      '.a { transition: opacity var(--ds-motion-feedback) var(--ds-motion-ease-out); }',
      '/* var(--ds-transition-fast) */',
      '.a { --ds-transition-fast: var(--ds-motion-fast); }',
      '.d { transition: opacity /* var(--ds-transition-fast) */ var(--ds-motion-fast); }',
      glued,
    ]) {
      assert.deepEqual(countSkinLiteralsInCss(css).counts, only(null), css);
    }
    assert.deepEqual(legacyTransitionReadsInCss(glued), []);
  });

  test('synthetic parity: the excluded lines are property-law\'s grammar sites, the counted lines their complement', () => {
    assert.equal(GRAMMAR.version, 1);
    const reads = legacyTransitionReadsInCss(PARTITION_FIXTURE);
    assert.deepEqual(propertyLawLayoutAliasLines(PARTITION_FIXTURE), [1, 2, 6, 10]);
    assert.deepEqual(lineSet(reads.filter((read) => read.excluded)), [1, 2, 6, 10]);
    assert.deepEqual(lineSet(reads.filter((read) => !read.excluded)), [3, 4, 5, 10, 11]);
    const { counts, sites } = countSkinLiteralsInCss(PARTITION_FIXTURE);
    assert.equal(counts.legacyTransitionRead, 5);
    assert.deepEqual(sites.filter((site) => site.klass === 'legacyTransitionRead').map((site) => site.line), [3, 4, 5, 10, 11]);
  });

  test('live parity: the excluded reads are exactly property-law\'s layout-alias sites in productive skins', () => {
    const productive = collectSkinFiles().filter((file) => !FROZEN_SKIN_RE.test(file));
    const live = scan();
    assert.ok(productive.length > 0 && live.files > 0, 'both corpora are walked');
    const relOf = (file) => relative(PACKAGE_ROOT, file).replaceAll('\\', '/');
    const productiveFiles = new Set(productive.map(relOf));
    const excluded = productive.flatMap((file) => legacyTransitionReadsInCss(readFileSync(file, 'utf8'), file)
      .filter((read) => read.excluded)
      .map((read) => `${relOf(file)}:${read.line}`));
    const ratcheted = live.sites
      .filter((site) => site.kind === 'layoutAlias' && productiveFiles.has(site.file))
      .map((site) => `${site.file}:${site.line}`);
    assert.deepEqual([...new Set(excluded)].sort(), [...new Set(ratcheted)].sort());
    assert.deepEqual(SKIN_LITERAL_EXCLUSIONS.legacyTransitionRead.partition.map((rule) => rule.token), [...LAYOUT_ALIASES]);
  });
});

describe('inline geometry', () => {
  test('static geometry literals in style={{}} count; runtime values and paint do not', () => {
    const source = `
      export const A = ({ w }) => (
        <div style={{ padding: 12, width: w, marginTop: '8px', color: 'red', top: 0, ...{ gap: '4px' } }}>
          <span style={{ height: open ? 24 : w, minWidth: w ?? 120, inset: 'var(--ds-x)' }} />
        </div>
      );`;
    assert.equal(countInlineGeometryInFile(source, 'a.tsx'), 5);
  });
});

describe('root duplicate declarations', () => {
  test('a name declared by two files is a duplicate; one file twice is not', () => {
    const duplicates = duplicateRootDeclarations([
      ['a.css', ['--ds-x', '--ds-y', '--ds-y']],
      ['b.css', ['--ds-x']],
    ]);
    assert.deepEqual([...duplicates], [['--ds-x', ['a.css', 'b.css']]]);
  });
});

const HEADROOM_KEYS = [
  /^skinLiterals\.[^.]+\.total$/,
  /^inlineGeometry\.total$/,
  /^color\.component[A-Za-z]*Literals$/,
  /^scale\.fallbackParity[A-Za-z]*Violations$/,
  /^scale\.duplicateRoot[A-Za-z]*$/,
];

describe('ratchet headroom', () => {
  test('META: every aggregate hardcode ratchet sits exactly on its baseline', () => {
    const result = spawnSync(process.execPath, [AUDIT, '--current-json', '--quiet'], {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
    assert.equal(result.status, 0, result.stderr);
    const current = JSON.parse(result.stdout);
    const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
    const keys = [...new Set([...Object.keys(baseline), ...Object.keys(current)])]
      .filter((key) => HEADROOM_KEYS.some((pattern) => pattern.test(key)));
    for (const pattern of HEADROOM_KEYS) {
      assert.ok(keys.some((key) => pattern.test(key)), `no counter matches ${pattern}`);
    }
    const findings = keys
      .filter((key) => current[key] !== baseline[key])
      .map((key) => (current[key] < baseline[key]
        ? `${key} drained to ${current[key]}, baseline ${baseline[key]}: tighten`
        : `${key} measures ${current[key]}, baseline ${baseline[key]}`));
    assert.deepEqual(findings, []);
  });
});

/* End-to-end: the real gate over the real tree, a planted fixture on a real anchor key. */
function runGate(flags) {
  const dir = mkdtempSync(join(tmpdir(), 'eta-hardcodes-'));
  try {
    const args = [];
    for (const [flag, text] of Object.entries(flags)) {
      const file = join(dir, `${flag.replace(/\W/g, '')}.${flag.endsWith('source') ? 'tsx' : 'css'}`);
      writeFileSync(file, text);
      args.push(`${flag}=${file}`);
    }
    const result = spawnSync(process.execPath, [AUDIT, '--check', '--quiet', ...args], { encoding: 'utf8' });
    return { status: result.status, output: `${result.stdout}\n${result.stderr}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('engine-token-audit drills', { concurrency: true }, () => {
  test('control: a TEC/FLOOR/DEF-only skin and a clean source keep the gate green', () => {
    const { status, output } = runGate({
      '--hardcode-fixture-skin': CONTROL,
      '--hardcode-fixture-source': 'export const A = ({ w }) => <div style={{ width: w }} />;\n',
    });
    assert.equal(status, 0, output);
  });

  test('every skin class reds on the rostered button key, and both DEF extensions red', () => {
    const fixture = [
      ...Object.values(MUTANTS),
      '.b { color: var(--ds-color-primary-500, #123458); }',
      '.c { font-weight: var(--ds-button-font-weight, 500); }',
    ].join('\n');
    const { status, output } = runGate({ '--hardcode-fixture-skin': fixture });
    assert.equal(status, 1, output);
    for (const klass of SKIN_LITERAL_CLASSES) {
      assert.match(output, new RegExp(`skinLiterals\\.${klass}\\.${SKIN_ANCHOR.replace(/[./]/g, '\\$&')}=`), klass);
      assert.match(output, new RegExp(`skinLiterals\\.${klass}\\.total=`), `${klass} total`);
    }
    assert.match(output, /scale\.fallbackParityColorViolations=/);
    assert.match(output, /scale\.fallbackParityChannelViolations=/);
    assert.match(output, /fallbackParity\.color\.foundation\/tokens\/css\/runtime\/engines\/modern\/skin\/button\/index\.css=/);
    assert.match(output, /fallbackParity\.channel\.foundation\/tokens\/css\/runtime\/engines\/modern\/skin\/button\/index\.css=/);
  });

  test('a colour literal and inline geometry red on a non-rostered component key', () => {
    const { status, output } = runGate({
      '--hardcode-fixture-source':
        "export const A = () => <div style={{ padding: 12 }} data-tone=\"#123456\" />;\n",
    });
    assert.equal(status, 1, output);
    assert.match(output, new RegExp(`color\\.componentLiterals\\.${SOURCE_ANCHOR.replace(/[./]/g, '\\$&')}=`));
    assert.match(output, /color\.componentHexLiterals=/);
    assert.match(output, new RegExp(`inlineGeometry\\.${SOURCE_ANCHOR.replace(/[./]/g, '\\$&')}=`));
    assert.match(output, /inlineGeometry\.total=/);
  });

  test('a cubic-bezier and a millisecond duration in engine TSX red both motion literal counters', () => {
    const { status, output } = runGate({
      '--hardcode-fixture-source':
        "export const A = () => <div style={{ transition: 'opacity 150ms cubic-bezier(0.2, 0, 0, 1)' }} />;\n",
    });
    assert.equal(status, 1, output);
    assert.match(output, /motion\.cubicBezierLiterals=[1-9]\d*; baseline=0/);
    assert.match(output, /motion\.rawDurationLiterals=[1-9]\d*; baseline=0/);
  });

  test('a sub-second seconds duration in engine TSX reds the raw duration counter alone', () => {
    const { status, output } = runGate({
      '--hardcode-fixture-source': "export const A = () => <div style={{ transition: 'opacity .2s' }} />;\n",
    });
    assert.equal(status, 1, output);
    assert.match(output, /motion\.rawDurationLiterals=[1-9]\d*; baseline=0/);
    assert.doesNotMatch(output, /motion\.cubicBezierLiterals=/);
  });

  test('motion tokens, a loop tempo of 1s and a commented literal keep the motion counters green', () => {
    const { status, output } = runGate({
      '--hardcode-fixture-source': [
        '// 150ms cubic-bezier(0,0,0,1)',
        "export const A = () => <div style={{ transition: 'opacity var(--ds-motion-fast) var(--ds-motion-ease-out)',",
        "  animation: 'spin 1s linear infinite' }} />;",
        '',
      ].join('\n'),
    });
    assert.equal(status, 0, output);
  });

  test('a second root declarer reds the DUP count and names the drift', () => {
    const { status, output } = runGate({
      '--hardcode-fixture-foundation': ':root {\n  --ds-spacing-4: 99px;\n}\n',
    });
    assert.equal(status, 1, output);
    assert.match(output, /scale\.duplicateRootDeclarations=4; baseline=3/);
    assert.match(output, /scale\.duplicateRootRosterDrift=1; baseline=0/);
    assert.match(output, /not a known duplicate: --ds-spacing-4/);
  });
});
