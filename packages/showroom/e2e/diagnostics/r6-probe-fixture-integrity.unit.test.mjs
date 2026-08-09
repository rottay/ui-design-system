import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const R6 = path.join(SHOWROOM_ROOT, 'src/app/probe/ds-reference/sections/r6-surfaces');

/** A fixture can be type-correct and content-invalid: relative prose in a
 *  timestamp field painted 'Invalid Date' while every shot recorded as passing. */

// ── 1. Malformed sentinel matcher (the spec the capture harness mirrors) ──

/** Deliberately narrow rules: this text is real product copy, so a loose match
 *  would fail honest words like 'Annulled' or 'null-safe'. */
export const SENTINEL_RULES = [
  { id: 'invalid-date', pattern: /Invalid Date/, why: 'a date failed to parse and rendered its failure string' },
  { id: 'object-object', pattern: /\[object Object\]/, why: 'an object was coerced to text' },
  { id: 'nan', pattern: /(?<![A-Za-z0-9_.-])NaN(?![A-Za-z0-9_.-])/, why: 'a numeric computation produced NaN' },
  { id: 'undefined', pattern: /(?<![A-Za-z0-9_.-])undefined(?![A-Za-z0-9_.-])/, why: 'an undefined value leaked into visible text' },
  { id: 'null', pattern: /(?<![A-Za-z0-9_.-])null(?![A-Za-z0-9_.-])/, why: 'a null value leaked into visible text' },
];

export function findMalformedSentinels(text) {
  const value = typeof text === 'string' ? text : '';
  return SENTINEL_RULES.filter((rule) => rule.pattern.test(value)).map((rule) => rule.id);
}

test('the sentinel matcher catches every documented failure string', () => {
  assert.deepEqual(findMalformedSentinels('Priya Nair Updated the Q3 roadmap Invalid Date'), ['invalid-date']);
  assert.deepEqual(findMalformedSentinels('Total: [object Object]'), ['object-object']);
  assert.deepEqual(findMalformedSentinels('Usage NaN GB'), ['nan']);
  assert.deepEqual(findMalformedSentinels('Owner undefined'), ['undefined']);
  assert.deepEqual(findMalformedSentinels('Status null'), ['null']);
});

test('the sentinel matcher does not fire on honest product copy', () => {
  for (const clean of [
    'Last updated 7/10/2026, 2:32:00 PM',
    'Nanotechnology roadmap',
    'Configure null-safe defaults',
    'The undefined_value column is hidden',
    'Annulled invoices',
    'Object storage is enabled',
    'Cancelled: 3 records',
  ]) {
    assert.deepEqual(
      findMalformedSentinels(clean),
      [],
      `false positive on: ${clean}`,
    );
  }
});

// ── 2. Date-literal rule (the focused regression for the rejected fixture) ──

const DATE_FIELDS = [
  'timestamp', 'date', 'createdAt', 'updatedAt', 'deadline', 'dueDate',
  'lastRun', 'expiresAt', 'generatedAt', 'lastUpdated', 'sentAt', 'completedAt',
  'start', 'end',
];
const DATE_LITERAL = new RegExp(
  String.raw`\b(${DATE_FIELDS.join('|')})\s*:\s*(['"])([^'"]*)\2`,
  'g',
);

/** Fields a renderer shows VERBATIM. Each entry is a narrow shape plus its reason;
 *  anything outside these shapes must parse. */
const VERBATIM_ALLOWLIST = [
  {
    file: 'config-a.tsx',
    shape: /^\d{2}:\d{2}$/,
    why: 'ChatSurface message bubbles render a clock time verbatim; a full datetime would be wrong for a chat transcript',
  },
  {
    file: 'config-b.tsx',
    shape: /^\d+ (?:minute|minutes|hour|hours|day|days) ago$/,
    why: 'NotificationSurface renders its timestamp verbatim. Its TSDoc claims ISO, which is tracked as open defect notification-1; the fixture matches the RENDERER, not the stale doc',
  },
];

function dateLiteralsIn(file) {
  const lines = readFileSync(path.join(R6, file), 'utf8').split('\n');
  const found = [];
  lines.forEach((line, i) => {
    for (const m of line.matchAll(DATE_LITERAL)) {
      found.push({ file, line: i + 1, field: m[1], value: m[3] });
    }
  });
  return found;
}

function fixtureModules() {
  return readdirSync(R6)
    .filter((f) => /^config[a-z-]*\.tsx$/.test(f))
    .sort();
}

function isAllowedVerbatim(entry) {
  return VERBATIM_ALLOWLIST.some(
    (rule) => rule.file === entry.file && rule.shape.test(entry.value),
  );
}

/** Pure offender detection, so it can be drilled against the rejected content. */
function offendersIn(entries) {
  return entries
    .filter((e) => Number.isNaN(new Date(e.value).getTime()) && !isAllowedVerbatim(e))
    .map((e) => `${e.file}:${e.line} ${e.field} = ${JSON.stringify(e.value)}`);
}

test('the detector fires on the rejected command-center fixture and clears the corrected one', () => {
  const REJECTED = [
    { file: 'config-inherited-b.tsx', line: 762, field: 'timestamp', value: '12 minutes ago' },
    { file: 'config-inherited-b.tsx', line: 763, field: 'timestamp', value: '1 hour ago' },
    { file: 'config-inherited-b.tsx', line: 764, field: 'timestamp', value: '3 hours ago' },
    { file: 'config-inherited-b.tsx', line: 765, field: 'timestamp', value: 'Yesterday' },
  ];
  assert.equal(
    offendersIn(REJECTED).length,
    4,
    'the exact fixture that shipped four "Invalid Date" cells must be rejected',
  );

  const CORRECTED = [
    { file: 'config-inherited-b.tsx', line: 765, field: 'timestamp', value: '2026-07-10T14:32:00Z' },
    { file: 'config-inherited-b.tsx', line: 766, field: 'timestamp', value: '2026-07-10T11:05:00Z' },
    { file: 'config-inherited-b.tsx', line: 767, field: 'timestamp', value: '2026-07-09T16:48:00Z' },
    { file: 'config-inherited-b.tsx', line: 768, field: 'timestamp', value: '2026-07-09T09:12:00Z' },
  ];
  assert.deepEqual(offendersIn(CORRECTED), []);
});

test('the date scan sees the real fixture corpus', () => {
  const modules = fixtureModules();
  assert.ok(modules.length >= 4, `expected the four fixture modules, saw ${modules.join(', ')}`);
  const all = modules.flatMap(dateLiteralsIn);
  assert.ok(all.length >= 20, `expected a substantial date corpus, saw ${all.length}`);
});

test('every date-ish fixture literal parses, or is an allowlisted verbatim shape', () => {
  const offenders = [];
  for (const file of fixtureModules()) {
    for (const entry of dateLiteralsIn(file)) {
      if (Number.isNaN(new Date(entry.value).getTime()) && !isAllowedVerbatim(entry)) {
        offenders.push(`${entry.file}:${entry.line} ${entry.field} = ${JSON.stringify(entry.value)}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `unparseable date fixture (renders "Invalid Date"):\n${offenders.join('\n')}`,
  );
});

test('the date rule rejects the exact values that were rejected', () => {
  // The four command-center timestamps as shipped in the rejected checkpoint.
  for (const value of ['12 minutes ago', '1 hour ago', '3 hours ago', 'Yesterday']) {
    const entry = { file: 'config-inherited-b.tsx', line: 0, field: 'timestamp', value };
    assert.equal(Number.isNaN(new Date(value).getTime()), true, `${value} must not parse`);
    assert.equal(
      isAllowedVerbatim(entry),
      false,
      `${value} must not be excused by the allowlist in config-inherited-b.tsx`,
    );
  }
  // And the corrected values must pass.
  for (const value of ['2026-07-10T14:32:00Z', '2026-07-09T09:12:00Z']) {
    assert.equal(Number.isNaN(new Date(value).getTime()), false, `${value} must parse`);
  }
});

// ── 3. Silent numeric corruption (no sentinel is printed, so only source catches it) ──

/** Statistic.formatNumber parseFloats a string and only falls back when the parse
 *  fails ENTIRELY, so '2.9%' renders as '3'. Use value + StatDef.suffix instead. */
export function corruptsWhenFormatted(value) {
  if (typeof value !== 'string') return false;
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) return false;
  return String(parsed) !== value.trim();
}

const VALUE_LITERAL = /\bvalue\s*:\s*(['"])([^'"]*)\1/g;

/** Scoped to blocks that reach Statistic: profile FIELDS and select OPTIONS
 *  also carry `value`, and a phone number must never be read as a number. */
function statRegions(source) {
  const regions = [];
  for (const opener of [/\bstats\s*:\s*\[/g, /\bsummary\s*:\s*\{/g]) {
    for (const m of source.matchAll(opener)) {
      const open = source[m.index + m[0].length - 1];
      const close = open === '[' ? ']' : '}';
      let depth = 0;
      let i = m.index + m[0].length - 1;
      for (; i < source.length; i += 1) {
        if (source[i] === open) depth += 1;
        else if (source[i] === close) {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      regions.push([m.index, i]);
    }
  }
  return regions;
}

test('no fixture stat value is silently reformatted into a different number', () => {
  const offenders = [];
  for (const file of fixtureModules()) {
    const source = readFileSync(path.join(R6, file), 'utf8');
    const regions = statRegions(source);
    for (const m of source.matchAll(VALUE_LITERAL)) {
      const inStatRegion = regions.some(([a, b]) => m.index > a && m.index < b);
      if (inStatRegion && corruptsWhenFormatted(m[2])) {
        const line = source.slice(0, m.index).split('\n').length;
        offenders.push(`${file}:${line} value = ${JSON.stringify(m[2])} renders as "${parseFloat(m[2]).toFixed(0)}"`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `partially-numeric value is silently rounded and stripped:\n${offenders.join('\n')}`,
  );
});

test('the corruption rule fires on the rejected values and spares the safe ones', () => {
  for (const bad of ['2.9%', '2.1%', '98.2%', '21 days', '86%', '38m']) {
    assert.equal(corruptsWhenFormatted(bad), true, `${bad} must be caught`);
  }
  for (const safe of ['$482,900', 'Custom', 'Unlimited seats', '29', 'N/A']) {
    assert.equal(corruptsWhenFormatted(safe), false, `${safe} must be spared`);
  }
});

test('the allowlist is narrow: it excuses only its own file and shape', () => {
  // "1 hour ago" is legitimate in config-b (verbatim renderer) but NOT in the
  // timeline-backed module, which is exactly the distinction that was missed.
  assert.equal(
    isAllowedVerbatim({ file: 'config-b.tsx', value: '2 hours ago' }),
    true,
  );
  assert.equal(
    isAllowedVerbatim({ file: 'config-inherited-b.tsx', value: '2 hours ago' }),
    false,
  );
  assert.equal(
    isAllowedVerbatim({ file: 'config-a.tsx', value: 'Yesterday' }),
    false,
    'the clock-time shape must not excuse arbitrary prose',
  );
});
