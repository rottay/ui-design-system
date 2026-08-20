/**
 * controls-catalog drills, grouped for CI (Codex blocker 5, 2026-08-02;
 * anti-vacuity hardening 2026-08-13).
 *
 * The protected property: "every published control exists, has a real
 * consumer, and the generated documentation matches the living tree."
 * The three drills self-inject their violation in memory (hermetic — the
 * tree is never mutated); this runner asserts each one BITES.
 *
 * The 2026-08-13 hardening closes two vacuity holes the original runner had:
 *
 *   1. ANY argv reached the drill path, so `--drill=bogus`, a bare `--drill`
 *      and no args at all all exited 0 — the first by inheriting the tree's
 *      pre-existing STALE failure, the last two by silently doing nothing.
 *      The grammar is now closed and parsed FIRST: invalid usage exits 2
 *      before a single contract, dist module or report row is loaded.
 *   2. A drill was credited by ANY failure, so a genuinely stale tree made
 *      all three drills green without proving anything. Each case now owns an
 *      expected cause, and only a failure matching THAT cause counts; baseline
 *      failures are reported separately and never credit the drill.
 *
 * This file must never spawn `--write`: the drills are read-only by contract.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DRILL_CASES, DRILL_NAMES, USAGE, check, parseCommand } from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'index.mjs');

function run(...argv) {
  assert.ok(!argv.includes('--write'), 'the drill runner must never spawn --write');
  return spawnSync('node', [SCRIPT, ...argv], { encoding: 'utf8' });
}

/* ------------------------------------------------------------------ *
 * 1. The grammar is closed — parsed purely, before any side effect.
 * ------------------------------------------------------------------ */

test('parseCommand accepts exactly the five valid commands', () => {
  assert.deepEqual(parseCommand(['--check']), { ok: true, command: 'check' });
  assert.deepEqual(parseCommand(['--write']), { ok: true, command: 'write' });
  for (const name of ['stale', 'missing-control', 'zero-consumer']) {
    assert.deepEqual(parseCommand([`--drill=${name}`]), { ok: true, command: 'drill', drill: name });
  }
  assert.deepEqual(DRILL_NAMES, ['stale', 'missing-control', 'zero-consumer']);
});

test('parseCommand rejects everything outside the grammar', () => {
  const invalid = [
    [[], 'argv vacío'],
    [['--check', '--write'], 'dos comandos'],
    [['--drill=stale', '--check'], 'drill combinado con check'],
    [['--drill=stale', '--drill=stale'], 'drill repetido'],
    [['--drill'], 'drill desnudo'],
    [['--drill='], 'drill vacío'],
    [['--drill=bogus'], 'drill desconocido'],
    [['--drill=STALE'], 'drill con caja distinta'],
    [['--check=1'], '--check con valor'],
    [['--write=1'], '--write con valor'],
    [['--verify'], 'flag desconocida'],
    [['-c'], 'flag corta desconocida'],
    [['check'], 'positional sin guiones'],
    [['tokens/controls/README.md'], 'ruta posicional'],
    [[''], 'token vacío'],
  ];
  for (const [argv, label] of invalid) {
    const parsed = parseCommand(argv);
    assert.equal(parsed.ok, false, `${label} debió rechazarse: ${JSON.stringify(argv)}`);
    assert.equal(typeof parsed.error, 'string');
    assert.ok(parsed.error.length > 0, `${label} debe explicar el motivo`);
    assert.equal(parsed.command, undefined, `${label} no debe resolver a un comando`);
  }
});

test('parseCommand rejects every combination that includes --write (parse-only, never spawned)', () => {
  for (const argv of [['--write', '--check'], ['--write', '--drill=stale'], ['--drill=stale', '--write'], ['--write', '--write']]) {
    assert.equal(parseCommand(argv).ok, false, `combinación con --write debió rechazarse: ${JSON.stringify(argv)}`);
  }
});

/* ------------------------------------------------------------------ *
 * 2. Each known drill produces ITS OWN cause — and only its own.
 * ------------------------------------------------------------------ */

for (const name of DRILL_NAMES) {
  test(`drill "${name}" produces its own violation`, () => {
    const r = run(`--drill=${name}`);
    assert.equal(r.status, 0, `drill exited ${r.status}: ${r.stderr}`);
    assert.match(r.stdout, /drill "[a-z-]+" OK — \d+ violaci/);
    assert.ok(
      r.stdout.includes(DRILL_CASES[name].expectedCause),
      `drill "${name}" no reportó su causa propia (${DRILL_CASES[name].expectedCause}):\n${r.stdout}`,
    );
    for (const other of DRILL_NAMES.filter((n) => n !== name)) {
      assert.ok(
        !r.stdout.includes(DRILL_CASES[other].expectedCause),
        `drill "${name}" acreditó la causa de "${other}" — las causas deben ser únicas`,
      );
    }
  });
}

test('every drill case declares a distinct expected cause', () => {
  const causes = DRILL_NAMES.map((n) => DRILL_CASES[n].expectedCause);
  assert.equal(new Set(causes).size, causes.length, 'dos drills comparten causa: el veredicto sería ambiguo');
});

/* ------------------------------------------------------------------ *
 * 3. Invalid usage fails BEFORE the gate runs (exit 2, never a gate verdict).
 * ------------------------------------------------------------------ */

const INVALID_INVOCATIONS = [
  { label: 'unknown drill', argv: ['--drill=bogus'] },
  { label: 'bare --drill', argv: ['--drill'] },
  { label: 'empty --drill', argv: ['--drill='] },
  { label: 'no args', argv: [] },
  { label: 'unknown flag', argv: ['--verify'] },
  { label: '--check with a value', argv: ['--check=1'] },
  { label: 'two commands', argv: ['--check', '--drill=stale'] },
  { label: 'positional', argv: ['check'] },
];

for (const { label, argv } of INVALID_INVOCATIONS) {
  test(`invalid usage (${label}) exits 2 with USAGE and never reaches the gate`, () => {
    const r = run(...argv);
    assert.equal(r.status, 2, `esperaba exit 2, obtuve ${r.status}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /^controls-catalog USAGE — /);
    assert.ok(r.stderr.includes(USAGE), 'stderr debe emitir la USAGE exportada');
    assert.doesNotMatch(r.stdout, /OK/, 'un uso inválido nunca puede imprimir un OK');
    // fail-before-check: no contract, dist module or report row was consulted,
    // so no gate vocabulary may leak into the usage error.
    assert.doesNotMatch(r.stderr, /STALE|regenerar|violaci|DRILL FAIL/);
  });
}

test('META: the historic no-op drill name is now a usage error, not a vacuous pass', () => {
  const r = run('--drill=bogus-case-that-injects-nothing');
  assert.equal(r.status, 2, 'un caso fuera de la gramática ya no llega al gate');
  assert.match(r.stderr, /drill desconocido/);
  assert.doesNotMatch(r.stdout, /OK/);
});

/* ------------------------------------------------------------------ *
 * 4. The anti-vacuity core, in-process: a baseline failure credits NOTHING.
 * ------------------------------------------------------------------ */

test('no baseline failure can credit any drill', async () => {
  const baseline = await check();
  for (const name of DRILL_NAMES) {
    const credited = baseline.filter((f) => DRILL_CASES[name].matches(f));
    assert.deepEqual(
      credited,
      [],
      `el estado basal del árbol acredita el drill "${name}" — el drill probaría nada:\n${credited.join('\n')}`,
    );
  }
});

for (const name of DRILL_NAMES) {
  test(`check({drill:"${name}"}) injects its own cause and no other`, async () => {
    const failures = await check({ drill: name });
    assert.ok(
      failures.some((f) => DRILL_CASES[name].matches(f)),
      `"${name}" no inyectó su violación:\n${failures.join('\n')}`,
    );
    for (const other of DRILL_NAMES.filter((n) => n !== name)) {
      assert.ok(
        !failures.some((f) => DRILL_CASES[other].matches(f)),
        `"${name}" produjo también la causa de "${other}"`,
      );
    }
  });
}

test('check() rejects a drill outside the closed grammar at the API level too', async () => {
  await assert.rejects(() => check({ drill: 'bogus' }), /drill desconocido/);
  await assert.rejects(() => check({ drill: '' }), /drill desconocido/);
});

test('check() with no options runs the real gate without injecting anything', async () => {
  const failures = await check();
  assert.ok(Array.isArray(failures));
  assert.ok(!failures.some((f) => f.includes('(drill)')), 'el modo basal no debe emitir hallazgos marcados como drill');
  assert.ok(!failures.some((f) => f.includes('drill.ghost')), 'el modo basal no debe inyectar capabilities sintéticas');
});
