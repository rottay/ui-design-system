#!/usr/bin/env node

// Committed, discoverable generator for packages/core/supplier-contract.json.
//
// WHAT THE CONTRACT IS
// --------------------
// supplier-contract.json is the precomputed supplier-reachability map of the
// design system's public API. Consuming apps ship a byte-identical snapshot and
// the app-side gate (consumer/ds-supplier-honesty.mjs) reads it to decide which
// external supplier packages an app must declare when it imports a DS symbol.
// The DS-side gate (scripts/dependency-honesty.mjs -> auditCoreDependencyGraph)
// re-derives the contract and fails when the committed file drifts from source.
//
// SCHEMA (schemaVersion 1)
// ------------------------
//   {
//     "schemaVersion": 1,
//     "supplierPackages": string[],        // sorted governed supplier catalog
//     "nonRuntimeEntrypoints": string[],   // sorted css/json export subpaths
//     "entrypoints": {
//       "<subpath>": {
//         "exports": string[],             // sorted union of all value exports
//         "symbols": {                     // only exports coupled to >=1 supplier
//           "<name>": string[]             // sorted supplier packages
//         },
//         "wildcard"?: string[],           // governed star-reexport suppliers
//         "supplierFreeExports": string[]  // sorted exports with zero suppliers
//       }
//     }
//   }
//
// INVARIANTS (asserted by validateSupplierContractShape in the DS-side gate)
//   - exports === sort(unique(keys(symbols) ∪ supplierFreeExports)); the two
//     partitions are disjoint and together cover every export.
//   - every array is stably sorted; symbols object key order follows its owning
//     derivation, so the serialized bytes are reproducible.
//   - symbols only lists exports that reach a supplier; supplier-free exports
//     are enumerated separately so consumers can fast-path them.
//   - wildcard is a governed constant present only on ./icons
//     (['@phosphor-icons/react','lucide-react']) and ./marks (['@thesvg/react']).
//     lucide on ./icons is the intentional compatibility supplier, not drift.
//
// DERIVATION RULES
// ----------------
// This generator does NOT re-implement the export/supplier graph analysis. It
// delegates to deriveSupplierContract() in scripts/dependency-honesty.mjs, the
// single source of truth that the DS-side dependency-honesty gate already
// enforces. Re-deriving here would create a second, drift-prone authority.
// deriveSupplierContract():
//   - reads the core package.json exports map to enumerate entrypoints,
//     classifying css/json-only and wildcard (*) subpaths as non-runtime;
//   - traces the TypeScript SOURCE module graph (packages/core/src, the
//     releaseSync.sourceEntrypoints map, tsconfig.json) from each runtime
//     entrypoint and propagates a supplier closure over the reverse graph to a
//     fixed point, so cyclic modules still surface every reachable supplier;
//   - maps bare import specifiers to the governed supplier catalog
//     (TRACKED_SUPPLIERS) via supplierFamilyForSpecifier;
//   - emits supplierPackages from the governed catalog and wildcard from the
//     governed WILDCARD_ENTRYPOINT_SUPPLIERS constant.
// Because the graph is traced from SOURCE, the contract is immune to a stale or
// partially-built dist/ tree: a fresh build cannot change the derived contract,
// only a source change can. The Build agent regenerates (--write) as part of
// the release build so the committed file tracks source.
//
// SERIALIZATION
//   JSON.stringify(contract, null, 2) + "\n", written utf8. This is byte-for-
//   byte identical to the historical writer in scripts/dependency-honesty.mjs
//   (the `contract` subcommand), so --write and --check agree with it exactly.
//
// MODES
//   --check   (default) re-derive, byte-diff against the committed file, exit
//             nonzero on any drift or a missing/invalid committed file.
//   --write   re-derive and overwrite the committed file.
//   --print   re-derive and write the serialized contract to stdout only.
//   --path P  operate on P instead of the default supplier-contract.json.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { deriveSupplierContract } from '../../../scripts/dependency-honesty.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
export const DEFAULT_CONTRACT_PATH = resolve(dirname(SCRIPT_PATH), '..', 'supplier-contract.json');

// Byte-canonical serialization. Kept in lockstep with the historical writer so
// the committed artifact never depends on which entrypoint produced it.
export function serializeContract(contract) {
  return `${JSON.stringify(contract, null, 2)}\n`;
}

// Re-derive the contract and return its canonical serialized form. The derive
// function is injectable so tests can exercise the diff/check/write plumbing
// without paying the cost of a full TypeScript program build.
export function deriveSerializedContract(derive = deriveSupplierContract) {
  return serializeContract(derive());
}

// Pure byte comparison with a first-divergence locator for legible gate output.
export function diffSerialized(committed, derived) {
  if (committed === derived) return { drifted: false, firstDivergence: null };
  const committedLines = committed.split('\n');
  const derivedLines = derived.split('\n');
  const max = Math.max(committedLines.length, derivedLines.length);
  for (let index = 0; index < max; index += 1) {
    if (committedLines[index] !== derivedLines[index]) {
      return {
        drifted: true,
        firstDivergence: {
          line: index + 1,
          committed: committedLines[index] ?? null,
          derived: derivedLines[index] ?? null,
        },
      };
    }
  }
  // Equal line-by-line but not equal as strings can only mean a trailing-newline
  // difference; report it against the final line so the gate still fails loudly.
  return {
    drifted: true,
    firstDivergence: { line: max, committed: null, derived: null },
  };
}

function readCommitted(contractPath) {
  try {
    return { source: readFileSync(contractPath, 'utf8'), missing: false };
  } catch (error) {
    if (error && error.code === 'ENOENT') return { source: null, missing: true };
    throw error;
  }
}

// Read-only staleness check. Returns a structured result; never mutates disk.
export function runCheck({
  contractPath = DEFAULT_CONTRACT_PATH,
  derive = deriveSupplierContract,
  serialized,
} = {}) {
  const derivedText = serialized ?? deriveSerializedContract(derive);
  const { source, missing } = readCommitted(contractPath);
  if (missing) {
    return { ok: false, missing: true, drifted: true, contractPath, firstDivergence: null };
  }
  const { drifted, firstDivergence } = diffSerialized(source, derivedText);
  return { ok: !drifted, missing: false, drifted, contractPath, firstDivergence };
}

// Regenerate the committed artifact. Returns the bytes written.
export function runWrite({
  contractPath = DEFAULT_CONTRACT_PATH,
  derive = deriveSupplierContract,
  serialized,
} = {}) {
  const derivedText = serialized ?? deriveSerializedContract(derive);
  writeFileSync(contractPath, derivedText, 'utf8');
  return { contractPath, bytes: Buffer.byteLength(derivedText) };
}

export function parseArgs(argv) {
  const args = { mode: 'check', contractPath: DEFAULT_CONTRACT_PATH };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--check') args.mode = 'check';
    else if (token === '--write') args.mode = 'write';
    else if (token === '--print') args.mode = 'print';
    else if (token === '--path') {
      const value = argv[index + 1];
      if (!value) throw new Error('--path requires a file argument');
      args.contractPath = resolve(value);
      index += 1;
    } else if (token.startsWith('--path=')) {
      args.contractPath = resolve(token.slice('--path='.length));
    } else {
      throw new Error(`unknown argument ${token}; expected --check, --write, --print, or --path <file>`);
    }
  }
  return args;
}

export function main(argv = process.argv.slice(2)) {
  const { mode, contractPath } = parseArgs(argv);

  if (mode === 'print') {
    process.stdout.write(deriveSerializedContract());
    return 0;
  }

  if (mode === 'write') {
    const { bytes } = runWrite({ contractPath });
    process.stderr.write(`supplier-contract: wrote ${String(bytes)} bytes to ${contractPath}\n`);
    return 0;
  }

  const result = runCheck({ contractPath });
  if (result.ok) {
    process.stderr.write(`supplier-contract: up to date (${contractPath})\n`);
    return 0;
  }
  if (result.missing) {
    process.stderr.write(
      `supplier-contract: committed file is missing at ${contractPath}; run --write\n`,
    );
    return 1;
  }
  const at = result.firstDivergence;
  process.stderr.write(
    'supplier-contract: STALE — the committed contract differs from the source-derived contract.\n' +
    `  first divergence at line ${String(at?.line)}:\n` +
    `    committed: ${JSON.stringify(at?.committed)}\n` +
    `    derived  : ${JSON.stringify(at?.derived)}\n` +
    '  regenerate with: pnpm --filter @rottay/design-system contract:generate\n',
  );
  return 1;
}

const invokedAsScript = process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH;
if (invokedAsScript) {
  try {
    process.exitCode = main();
  } catch (error) {
    process.stderr.write(`supplier-contract generator: FAIL\n${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  }
}
