import assert from 'node:assert/strict';
import test from 'node:test';

import {
  analyzeOwnershipSource,
  applyAllowlist,
  buildBaseline,
  evaluateBaseline,
  isPresentationUtility,
  validateAllowlist,
  validateBaseline,
} from './pattern-surface-ownership-gate.mjs';

const path = 'src/ui/patterns/example/engines/modern/index.tsx';

test('detects native interactive HTML, local SVG, utility classes, and primitive reconstruction', () => {
  const source = `
    export function Example() {
      return <section>
        <button className="flex items-center gap-2 rottay-action">Run</button>
        <Box as="button">Move</Box>
        <div role="tab">Overview</div>
        <span onClick={run}>Clickable text</span>
        <svg viewBox="0 0 20 20"><path d="M0 0" /></svg>
      </section>;
    }
  `;
  const result = analyzeOwnershipSource(source, path);
  assert.deepEqual(
    result.findings.map(({ category, rule }) => ({ category, rule })),
    [
      { category: 'native-interactive', rule: 'native-button' },
      { category: 'utility-class', rule: 'presentation-utility' },
      { category: 'primitive-reconstruction', rule: 'polymorphic-interactive' },
      { category: 'primitive-reconstruction', rule: 'aria-role-reconstruction' },
      { category: 'primitive-reconstruction', rule: 'clickable-noninteractive' },
      { category: 'local-svg', rule: 'local-svg-root' },
    ],
  );
  assert.match(result.findings[1].evidence, /items-center/);
  assert.match(result.findings[1].evidence, /gap-2/);
  assert.doesNotMatch(result.findings[1].evidence, /rottay-action/);
});

test('exempts plumbing-only onClick but keeps flagging handlers with real click work', () => {
  const source = `
    export function Example({ onResize }) {
      return <section>
        <span
          role="separator"
          tabIndex={0}
          onKeyDown={(e) => onResize(e.key)}
          onClick={(e) => e.stopPropagation()}
        >
          <span data-part="resize-handle-bar" />
        </span>
        <span onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>Shielded</span>
        <span onClick={(e) => { e.stopPropagation(); onResize(e); }}>Does work</span>
        <span onClick={(event) => (event.preventDefault(), onResize(event))}>Comma work</span>
      </section>;
    }
  `;
  const result = analyzeOwnershipSource(source, path);
  assert.deepEqual(
    result.findings.map(({ rule, evidence }) => ({ rule, evidence })),
    [
      { rule: 'clickable-noninteractive', evidence: '<span onClick={…}>' },
      { rule: 'clickable-noninteractive', evidence: '<span onClick={…}>' },
    ],
  );
});

test('flags stable shared chrome but exempts token-owned chrome and dynamic geometry', () => {
  const source = `
    const opacity = 0.8;
    const fixed = { padding: 12, color: '#fff', width: '380px', opacity };
    export function Example({ measuredWidth, drag }) {
      return <>
        <div style={fixed} />
        <div style={{ width: measuredWidth, left: drag.x, color: 'var(--ds-text-primary)' }} />
      </>;
    }
  `;
  const result = analyzeOwnershipSource(source, path);
  assert.deepEqual(
    result.findings.map(({ rule, evidence }) => ({ rule, evidence })),
    [
      { rule: 'stable-spacing', evidence: 'padding: 12' },
      { rule: 'stable-paint', evidence: 'color: "#fff"' },
      { rule: 'stable-geometry', evidence: 'width: "380px"' },
      { rule: 'stable-paint', evidence: 'opacity: 0.8' },
    ],
  );
  assert.equal(result.dynamicGeometryExemptions, 2);
  assert.equal(result.tokenOwnedChrome, 1);
});

test('collects static utility branches without treating arbitrary component classes as utilities', () => {
  assert.equal(isPresentationUtility('md:hover:px-4'), true);
  assert.equal(isPresentationUtility('text-sm'), true);
  assert.equal(isPresentationUtility('rottay-list-toolbar'), false);
  assert.equal(isPresentationUtility('candidate-card'), false);

  const result = analyzeOwnershipSource(
    `<div className={cn('grid gap-3', active && 'bg-blue-500', 'candidate-card')} />`,
    path,
  );
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].category, 'utility-class');
  assert.equal(result.findings[0].evidence, 'bg-blue-500 gap-3 grid');
});

test('chart rendering is an explicit SVG owner but ordinary patterns are not', () => {
  const chart = analyzeOwnershipSource(
    '<svg><path /></svg>',
    'src/ui/patterns/visualization/charts/families/sparkline/index.tsx',
  );
  const pattern = analyzeOwnershipSource('<svg />', path);
  assert.equal(chart.findings.length, 0);
  assert.equal(pattern.findings[0].category, 'local-svg');
});

test('baseline is a path-stable multiset and only additional copies regress', () => {
  const finding = analyzeOwnershipSource('<button />', path).findings[0];
  const baseline = buildBaseline([finding]);
  assert.equal(evaluateBaseline([{ ...finding, line: 999 }], baseline).ok, true);

  const growth = evaluateBaseline([finding, { ...finding, line: 12 }], baseline);
  assert.equal(growth.ok, false);
  assert.equal(growth.regressions.length, 1);
  assert.equal(growth.regressions[0].occurrence, 2);
  assert.deepEqual(validateBaseline(baseline), []);
});

test('allowlist needs justification and can target path/category/rule', () => {
  const invalid = { schemaVersion: 1, entries: [{ path: '**/*.tsx', reason: 'short' }] };
  assert.equal(validateAllowlist(invalid).length, 2);

  const finding = analyzeOwnershipSource('<svg />', path).findings[0];
  const allowlist = {
    schemaVersion: 1,
    entries: [{
      path: 'src/ui/patterns/example/**',
      category: 'local-svg',
      rule: 'local-svg-root',
      reason: 'This fixture intentionally owns its generated data visualization.',
    }],
  };
  assert.deepEqual(validateAllowlist(allowlist), []);
  const result = applyAllowlist([finding], allowlist);
  assert.equal(result.active.length, 0);
  assert.equal(result.allowed.length, 1);
});
