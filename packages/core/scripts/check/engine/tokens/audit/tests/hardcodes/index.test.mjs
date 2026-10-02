import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test, { describe } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  SKIN_LITERAL_CLASSES,
  countInlineGeometryInFile,
  countSkinLiteralsInCss,
  duplicateRootDeclarations,
} from '../../hardcodes/index.mjs';

const AUDIT = join(dirname(fileURLToPath(import.meta.url)), '../../index.mjs');
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
