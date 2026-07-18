import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { validateSupplierContractShape } from '../../../scripts/dependency-honesty.mjs';
import {
  DEFAULT_CONTRACT_PATH,
  deriveSerializedContract,
  diffSerialized,
  parseArgs,
  runCheck,
  runWrite,
  serializeContract,
} from './generate-supplier-contract.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GENERATOR = resolve(HERE, 'generate-supplier-contract.mjs');
const CORE_ROOT = resolve(HERE, '..');
const DERIVE_TIMEOUT_MS = 180000;

function runGenerator(args) {
  return spawnSync(process.execPath, [GENERATOR, ...args], {
    cwd: CORE_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

// A trivially injectable derive: a fixed, shape-valid contract lets the diff,
// check, and write plumbing run without building a TypeScript program.
function fakeContract(overrides = {}) {
  return {
    schemaVersion: 1,
    supplierPackages: ['antd', 'd3'],
    nonRuntimeEntrypoints: ['./styles', './styles.css'],
    entrypoints: {
      '.': {
        exports: ['Alpha', 'Beta', 'Gamma'],
        symbols: { Beta: ['antd'] },
        supplierFreeExports: ['Alpha', 'Gamma'],
      },
    },
    ...overrides,
  };
}

describe('serializeContract', () => {
  test('is canonical two-space JSON with a trailing newline', () => {
    const contract = fakeContract();
    const serialized = serializeContract(contract);
    assert.equal(serialized, `${JSON.stringify(contract, null, 2)}\n`);
    assert.ok(serialized.endsWith('\n'));
  });

  test('is stable across repeated calls on the same object', () => {
    const contract = fakeContract();
    assert.equal(serializeContract(contract), serializeContract(contract));
  });
});

describe('diffSerialized', () => {
  test('reports no drift for identical bytes', () => {
    const text = serializeContract(fakeContract());
    assert.deepEqual(diffSerialized(text, text), { drifted: false, firstDivergence: null });
  });

  test('locates the first divergent line', () => {
    const committed = serializeContract(fakeContract());
    const derived = serializeContract(fakeContract({ supplierPackages: ['antd', 'motion'] }));
    const { drifted, firstDivergence } = diffSerialized(committed, derived);
    assert.equal(drifted, true);
    assert.ok(firstDivergence.line > 0);
    assert.notEqual(firstDivergence.committed, firstDivergence.derived);
  });

  test('flags a trailing-newline-only difference', () => {
    const base = serializeContract(fakeContract());
    assert.equal(diffSerialized(base, base.slice(0, -1)).drifted, true);
  });
});

describe('parseArgs', () => {
  test('defaults to check mode against the committed contract', () => {
    assert.deepEqual(parseArgs([]), { mode: 'check', contractPath: DEFAULT_CONTRACT_PATH });
  });

  test('recognizes each mode flag', () => {
    assert.equal(parseArgs(['--write']).mode, 'write');
    assert.equal(parseArgs(['--print']).mode, 'print');
    assert.equal(parseArgs(['--check']).mode, 'check');
  });

  test('accepts --path in both spellings and resolves it', () => {
    assert.equal(parseArgs(['--path', '/tmp/a.json']).contractPath, resolve('/tmp/a.json'));
    assert.equal(parseArgs(['--path=/tmp/b.json']).contractPath, resolve('/tmp/b.json'));
  });

  test('rejects unknown arguments', () => {
    assert.throws(() => parseArgs(['--nope']), /unknown argument/);
    assert.throws(() => parseArgs(['--path']), /--path requires a file argument/);
  });
});

describe('runCheck / runWrite plumbing (injected derive)', () => {
  let workdir;
  before(() => {
    workdir = mkdtempSync(join(tmpdir(), 'supplier-contract-plumbing-'));
  });
  after(() => {
    rmSync(workdir, { recursive: true, force: true });
  });

  const derive = () => fakeContract();
  const derivedText = serializeContract(fakeContract());

  test('a matching committed file reports no drift', () => {
    const target = join(workdir, 'clean.json');
    writeFileSync(target, derivedText, 'utf8');
    const result = runCheck({ contractPath: target, derive });
    assert.equal(result.ok, true);
    assert.equal(result.drifted, false);
  });

  // Negative drill: a synthetic drifted contract must fail --check.
  test('a drifted committed file fails the check and locates the drift', () => {
    const target = join(workdir, 'drifted.json');
    const drifted = serializeContract(fakeContract({ supplierPackages: ['antd', 'three'] }));
    writeFileSync(target, drifted, 'utf8');
    const result = runCheck({ contractPath: target, derive });
    assert.equal(result.ok, false);
    assert.equal(result.drifted, true);
    assert.ok(result.firstDivergence && result.firstDivergence.line > 0);
  });

  test('a missing committed file fails the check', () => {
    const result = runCheck({ contractPath: join(workdir, 'absent.json'), derive });
    assert.equal(result.ok, false);
    assert.equal(result.missing, true);
  });

  test('write emits the canonical bytes and a follow-up check is clean', () => {
    const target = join(workdir, 'written.json');
    const { bytes } = runWrite({ contractPath: target, derive });
    assert.equal(bytes, Buffer.byteLength(derivedText));
    assert.equal(readFileSync(target, 'utf8'), derivedText);
    assert.equal(runCheck({ contractPath: target, derive }).ok, true);
  });

  test('a precomputed serialization short-circuits the derive step', () => {
    let derives = 0;
    const counted = () => {
      derives += 1;
      return fakeContract();
    };
    const target = join(workdir, 'precomputed.json');
    writeFileSync(target, derivedText, 'utf8');
    runCheck({ contractPath: target, derive: counted, serialized: derivedText });
    assert.equal(derives, 0);
  });
});

describe('real source-derived contract', () => {
  let printA;
  before(() => {
    const result = runGenerator(['--print']);
    assert.equal(result.status, 0, `--print failed: ${result.stderr}`);
    printA = result.stdout;
  });

  // Determinism: two independent process runs must be byte-identical.
  test('two independent --print runs are byte-identical', { timeout: DERIVE_TIMEOUT_MS }, () => {
    const result = runGenerator(['--print']);
    assert.equal(result.status, 0, `--print failed: ${result.stderr}`);
    assert.equal(result.stdout, printA);
  });

  test('the derived contract satisfies the consumer shape contract', () => {
    const contract = JSON.parse(printA);
    assert.equal(contract.schemaVersion, 1);
    assert.deepEqual(validateSupplierContractShape(contract), []);
  });

  test('every entrypoint partitions exports into symbols and supplier-free sets', () => {
    const contract = JSON.parse(printA);
    for (const [name, definition] of Object.entries(contract.entrypoints)) {
      const coupled = Object.keys(definition.symbols);
      const free = definition.supplierFreeExports;
      const union = [...new Set([...coupled, ...free])].sort();
      assert.deepEqual(definition.exports, [...definition.exports].sort(), `${name} exports must be sorted`);
      assert.deepEqual(definition.exports, union, `${name} exports must equal symbols ∪ supplierFree`);
      assert.equal(
        coupled.filter((symbol) => free.includes(symbol)).length,
        0,
        `${name} must not classify a symbol as both coupled and supplier-free`,
      );
      for (const suppliers of Object.values(definition.symbols)) {
        assert.deepEqual(suppliers, [...suppliers].sort(), `${name} supplier lists must be sorted`);
      }
    }
  });

  test('serializeContract reproduces the CLI --print bytes exactly', () => {
    assert.equal(serializeContract(JSON.parse(printA)), printA);
    assert.equal(deriveSerializedContract(() => JSON.parse(printA)), printA);
  });

  // Negative drill through the real CLI: a drifted committed file exits nonzero.
  test('--check exits nonzero against a drifted file', { timeout: DERIVE_TIMEOUT_MS }, () => {
    const workdir = mkdtempSync(join(tmpdir(), 'supplier-contract-cli-'));
    try {
      const target = join(workdir, 'drifted.json');
      writeFileSync(target, '{"schemaVersion":1}\n', 'utf8');
      const result = runGenerator(['--check', '--path', target]);
      assert.equal(result.status, 1, `expected nonzero exit; stderr: ${result.stderr}`);
      assert.match(result.stderr, /STALE/);
    } finally {
      rmSync(workdir, { recursive: true, force: true });
    }
  });

  // A regenerated file passes --check end-to-end through the real CLI.
  test('--check exits zero against a file that matches the derivation', { timeout: DERIVE_TIMEOUT_MS }, () => {
    const workdir = mkdtempSync(join(tmpdir(), 'supplier-contract-clean-'));
    try {
      const target = join(workdir, 'clean.json');
      writeFileSync(target, printA, 'utf8');
      const result = runGenerator(['--check', '--path', target]);
      assert.equal(result.status, 0, `expected zero exit; stderr: ${result.stderr}`);
    } finally {
      rmSync(workdir, { recursive: true, force: true });
    }
  });
});
