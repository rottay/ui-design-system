import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const DS_REFERENCE = path.join(SHOWROOM_ROOT, 'src/app/probe/ds-reference');
/** Every probe tree whose fixtures back a capture batch. */
const PROBE_SECTIONS = ['surfaces', 'compositions', 'monochrome'];

/** One clock or entropy read in this tree makes every shot of that family
 *  irreproducible; the rejected round proved it. */

/** Comments legitimately name the forbidden constructs; only executable text is scanned. */
function stripCommentsAndStrings(source) {
  let out = '';
  let i = 0;
  let state = 'code';
  let quote = '';
  while (i < source.length) {
    const two = source.slice(i, i + 2);
    if (state === 'code') {
      if (two === '//') { state = 'line'; i += 2; continue; }
      if (two === '/*') { state = 'block'; i += 2; continue; }
      if (source[i] === '"' || source[i] === "'" || source[i] === '`') {
        quote = source[i];
        state = 'string';
        // A placeholder, not whitespace: blanking `new Date('...')` would leave
        // `new Date()` behind and the bare-clock rule would fire on a fixed instant.
        out += '0';
        i += 1;
        continue;
      }
      out += source[i];
      i += 1;
      continue;
    }
    if (state === 'line') {
      if (source[i] === '\n') { state = 'code'; out += '\n'; }
      i += 1;
      continue;
    }
    if (state === 'block') {
      if (two === '*/') { state = 'code'; i += 2; continue; }
      if (source[i] === '\n') out += '\n';
      i += 1;
      continue;
    }
    // string: preserve nothing but honor escapes, so a quote inside a literal cannot end it
    if (source[i] === '\\') { i += 2; continue; }
    if (source[i] === quote) { state = 'code'; quote = ''; }
    i += 1;
  }
  return out;
}

const FORBIDDEN = [
  {
    id: 'bare-date',
    // `new Date()` and `new Date( )` — a construction with no argument reads the wall clock.
    pattern: /\bnew\s+Date\s*\(\s*\)/,
    why: 'zero-argument date construction reads the wall clock; pass an explicit fixed instant',
  },
  {
    id: 'date-now',
    pattern: /\bDate\s*\.\s*now\s*\(/,
    why: 'Date.now() reads the wall clock',
  },
  {
    id: 'math-random',
    pattern: /\bMath\s*\.\s*random\s*\(/,
    why: 'Math.random() makes the rendered content vary between runs',
  },
  {
    id: 'performance-now',
    pattern: /\bperformance\s*\.\s*now\s*\(/,
    why: 'performance.now() is a clock read',
  },
  {
    id: 'implicit-locale-date-format',
    // An Intl formatter with no options object resolves to the machine timezone.
    pattern: /\bnew\s+Intl\s*\.\s*DateTimeFormat\s*\(\s*\)/,
    why: 'an argument-free DateTimeFormat resolves to the machine timezone',
  },
];

/** Every date the probe constructs must be a literal instant, not a computed one. */
const DATE_ARGUMENT = /\bnew\s+Date\s*\(\s*([^)]*)\)/g;

function probeSourceFiles() {
  const files = [];
  for (const tenant of readdirSync(DS_REFERENCE, { withFileTypes: true })) {
    if (!tenant.isDirectory()) continue;
    for (const section of PROBE_SECTIONS) {
      const root = path.join(DS_REFERENCE, tenant.name, section);
      let entries;
      try {
        entries = readdirSync(root, { withFileTypes: true, recursive: true });
      } catch {
        continue;
      }
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!/\.(ts|tsx)$/.test(entry.name)) continue;
        files.push(path.join(entry.parentPath ?? root, entry.name));
      }
    }
  }
  return files.sort();
}

function scan(source) {
  const code = stripCommentsAndStrings(source);
  const hits = [];
  for (const rule of FORBIDDEN) {
    if (rule.pattern.test(code)) hits.push(`${rule.id}: ${rule.why}`);
  }
  return hits;
}

// Without this, moving the fixtures out of the discovered path would silently
// empty the scan and every assertion below would pass on nothing.
test('the surface fixture modules are inside the scanned tree', () => {
  const files = probeSourceFiles().map((file) =>
    path.relative(SHOWROOM_ROOT, file),
  );
  assert.ok(files.length > 0, 'no surface probe sources found');
  const sections = 'src/app/probe/ds-reference/sections/surfaces';
  for (const required of ['index.tsx', 'cases.ts']) {
    assert.ok(
      files.includes(`${sections}/${required}`),
      `${required} is not in the scanned set — the drill would run on a partial tree`,
    );
  }
  const fixtureModules = files.filter((file) =>
    /\/config[a-z-]*\.tsx$/.test(file),
  );
  assert.ok(
    fixtureModules.length >= 2,
    `expected the fixture config modules in scope, saw ${fixtureModules.length}`,
  );
});

test('no surface probe fixture reads the clock or entropy', () => {
  const offenders = [];
  for (const file of probeSourceFiles()) {
    const hits = scan(readFileSync(file, 'utf8'));
    for (const hit of hits) {
      offenders.push(`${path.relative(SHOWROOM_ROOT, file)} -> ${hit}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `non-deterministic fixture input:\n${offenders.join('\n')}`,
  );
});

test('every date the surface probe constructs is an explicit literal instant', () => {
  const offenders = [];
  for (const file of probeSourceFiles()) {
    const source = readFileSync(file, 'utf8');
    // Arguments are needed here, so strip comments only and keep string literals intact.
    const code = stripComments(source);
    for (const match of code.matchAll(DATE_ARGUMENT)) {
      const argument = match[1].trim();
      const isQuotedLiteral = /^(['"`])[^'"`]+\1$/.test(argument);
      const isNumericLiteral = /^\d+$/.test(argument);
      if (!isQuotedLiteral && !isNumericLiteral) {
        offenders.push(
          `${path.relative(SHOWROOM_ROOT, file)} -> new Date(${argument || ''})`,
        );
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `date construction is not a fixed literal:\n${offenders.join('\n')}`,
  );
});

/** A fixed literal is not enough: surfaces format RELATIVE to the clock, so a
 *  fixture newer than this cutoff would render differently the next day. */
const STALE_BEFORE = '2026-08-01';
const DATE_LITERAL = /(?<![0-9])(20[0-9]{2}-[0-9]{2}-[0-9]{2})(?![0-9])/g;

test('every fixture date is old enough to leave relative-time formatters stable', () => {
  const offenders = [];
  for (const file of probeSourceFiles()) {
    const source = stripComments(readFileSync(file, 'utf8'));
    for (const match of source.matchAll(DATE_LITERAL)) {
      if (match[1] >= STALE_BEFORE) {
        offenders.push(`${path.relative(SHOWROOM_ROOT, file)} -> ${match[1]}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `fixture dates on/after ${STALE_BEFORE} can render as relative time:\n${offenders.join('\n')}`,
  );
});

test('the staleness rule rejects a recent date', () => {
  // ISO dates compare correctly as strings, which is what the rule relies on.
  assert.equal('2026-08-06' >= STALE_BEFORE, true, 'a recent date must be caught');
  assert.equal('2026-07-31' >= STALE_BEFORE, false, 'a stale date must pass');
  assert.equal('2025-12-31' >= STALE_BEFORE, false, 'an older year must pass');
});

/** Strips comments but preserves string literals, so date arguments stay readable. */
function stripComments(source) {
  let out = '';
  let i = 0;
  let state = 'code';
  let quote = '';
  while (i < source.length) {
    const two = source.slice(i, i + 2);
    if (state === 'code') {
      if (two === '//') { state = 'line'; i += 2; continue; }
      if (two === '/*') { state = 'block'; i += 2; continue; }
      if (source[i] === '"' || source[i] === "'" || source[i] === '`') {
        quote = source[i];
        state = 'string';
      }
      out += source[i];
      i += 1;
      continue;
    }
    if (state === 'line') {
      if (source[i] === '\n') { state = 'code'; out += '\n'; }
      i += 1;
      continue;
    }
    if (state === 'block') {
      if (two === '*/') { state = 'code'; i += 2; continue; }
      if (source[i] === '\n') out += '\n';
      i += 1;
      continue;
    }
    out += source[i];
    if (source[i] === '\\') {
      out += source[i + 1] ?? '';
      i += 2;
      continue;
    }
    if (source[i] === quote) { state = 'code'; quote = ''; }
    i += 1;
  }
  return out;
}

// ── Negative drills: the scanner must reject what it exists to catch ──

test('a reintroduced clock read fails the scan', () => {
  assert.deepEqual(
    scan("const e = { start: new Date(), end: new Date() };"),
    ['bare-date: zero-argument date construction reads the wall clock; pass an explicit fixed instant'],
  );
  assert.deepEqual(
    scan('const stamp = Date.now();').length,
    1,
    'Date.now() must be caught',
  );
  assert.deepEqual(
    scan('const id = Math.random().toString(36);').length,
    1,
    'Math.random() must be caught',
  );
  assert.deepEqual(
    scan('const t = performance.now();').length,
    1,
    'performance.now() must be caught',
  );
  assert.deepEqual(
    scan('const f = new Intl.DateTimeFormat();').length,
    1,
    'an argument-free DateTimeFormat must be caught',
  );
});

test('the scan reads executable text, not prose', () => {
  assert.deepEqual(
    scan('/* Fixed instants, never `new Date()`, so captures reproduce. */'),
    [],
    'a comment naming the construct must not fail the scan',
  );
  assert.deepEqual(
    scan("const label = 'call Date.now() to get the time';"),
    [],
    'a string literal naming the construct must not fail the scan',
  );
  assert.deepEqual(
    scan("const e = { start: new Date('2026-08-12T12:00:00Z') };"),
    [],
    'an explicit fixed instant must pass',
  );
});

test('a computed date argument fails the literal check', () => {
  const computed = "const e = new Date(base + offset);";
  const matches = [...stripComments(computed).matchAll(DATE_ARGUMENT)];
  assert.equal(matches.length, 1);
  assert.equal(
    /^(['"`])[^'"`]+\1$/.test(matches[0][1].trim()),
    false,
    'a computed argument must not read as a literal instant',
  );
});
