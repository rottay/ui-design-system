/**
 * Emits a fresh, atomic, source-bound receipt for the i18n key-parity gate.
 *
 * WHY A SEPARATE TOOL. `capture-lab.mjs` is a browser-driving instrument;
 * this is a pure filesystem/catalog check with no dev-server or Playwright
 * dependency. Keeping it separate means a reader never has to wonder whether
 * a translation-catalog claim secretly depends on the dev server being up.
 *
 * This NEVER passes `--seed` and NEVER writes to the gate's own baseline
 * file — it only INVOKES the gate's exported evaluation function (a read
 * call) and writes its own receipt into `R1/receipts/`. The baseline at
 * `scripts/i18n-baseline/index.json` is not this lane's to move: a
 * receipt reporting that a floor COULD tighten is a finding to hand back to
 * the gate owner, not authority for this tool to re-anchor it.
 *
 * Usage: node emit-i18n-gate-receipt.mjs
 */

import path from 'node:path';
import os from 'node:os';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  atomicWriteJSON,
  deriveRepoRoot,
  getSelfProcessIdentity,
  hashSelf,
  redactAbsolutePaths,
  sha256File,
} from './receipt-io.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RECEIPTS_DIR = path.join(HERE, '..', 'receipts');
const SELF_FILES = [path.join(HERE, 'emit-i18n-gate-receipt.mjs'), path.join(HERE, 'receipt-io.mjs')];
const NAMESPACES = ['common', 'components', 'errors', 'validation'];

async function main() {
  const startedAt = new Date().toISOString();
  const acc = { startedAt, crashed: false, crashMessage: null };

  try {
    const repoRoot = deriveRepoRoot(HERE);
    acc.repoRoot = repoRoot;
    acc.selfHash = hashSelf(SELF_FILES.filter((f) => existsSync(f)));

    const gateScriptPath = path.join(repoRoot, 'packages', 'core', 'scripts', 'i18n-key-parity-gate.mjs');
    if (!existsSync(gateScriptPath)) {
      throw new Error(`i18n gate script not found at ${gateScriptPath}`);
    }
    const baselinePath = path.join(repoRoot, 'packages', 'core', 'scripts', 'i18n-baseline/index.json');
    if (!existsSync(baselinePath)) {
      throw new Error(
        `i18n gate baseline not found at ${baselinePath}. This tool refuses to --seed one — authoring a baseline ` +
        'is the gate owner decision, not something a receipt emitter does on its own authority.'
      );
    }
    const localesRoot = path.join(
      repoRoot, 'packages', 'core', 'src', 'foundation', 'i18n', 'runtime', 'catalog', 'translations', 'locales'
    );
    const contractsPath = path.join(
      repoRoot, 'packages', 'core', 'src', 'foundation', 'i18n', 'kernel', 'contracts', 'index.ts'
    );
    if (!existsSync(localesRoot)) throw new Error(`locales root not found at ${localesRoot}`);
    if (!existsSync(contractsPath)) throw new Error(`contracts file not found at ${contractsPath}`);

    const gateModule = await import(pathToFileURL(gateScriptPath).href);
    acc.gateModuleExports = Object.keys(gateModule).sort();
    for (const required of ['runI18nKeyParityGate', 'readSupportedLocales']) {
      if (typeof gateModule[required] !== 'function') {
        throw new Error(`i18n gate module at ${gateScriptPath} does not export "${required}" as a function — cannot invoke it read-only as designed`);
      }
    }

    // Read-only invocation of the gate's OWN exported entry point: this is
    // exactly what `node i18n-key-parity-gate.mjs --check` runs, called as a
    // function so the receipt gets the structured result directly instead of
    // re-parsing stdout text. No flag, env var or argument here can trigger
    // the gate's --seed path — that branch is only reachable from its own
    // main(), which this tool never calls.
    const result = gateModule.runI18nKeyParityGate({ contractsPath, localesRoot, baselinePath });
    acc.result = result;

    const supportedLocales = gateModule.readSupportedLocales(contractsPath);
    acc.supportedLocales = supportedLocales;

    // Source-bound: hash the baseline, the gate script, the contracts file
    // the mandatory/supported locale lists come from, and every locale
    // namespace file that actually exists — "everything the claim depends on."
    const localeFiles = [];
    for (const locale of supportedLocales) {
      for (const namespace of NAMESPACES) {
        const file = path.join(localesRoot, locale, `${namespace}.json`);
        if (existsSync(file)) localeFiles.push(file);
      }
    }
    const sourceFiles = [gateScriptPath, baselinePath, contractsPath, ...localeFiles];
    acc.sourceHashes = sourceFiles.map((file) => ({ path: path.relative(repoRoot, file), sha256: sha256File(file) }));
    acc.selfProcess = getSelfProcessIdentity();
  } catch (crashError) {
    acc.crashed = true;
    acc.crashMessage = crashError?.stack || String(crashError);
  }

  acc.finishedAt = new Date().toISOString();
  const pass = !acc.crashed && (acc.result?.pass ?? false);

  const receiptPath = path.join(RECEIPTS_DIR, 'cohort-1-i18n-gate.json');
  const receipt = {
    schemaVersion: 1,
    receiptId: 'wo-cra-23-R1-C1-i18n-gate',
    law:
      'MANDATORY locales (en/es/ar) must be at 100% of the reference key union; DECLARED-PARTIAL locales (fr/pt) ' +
      'may only shrink their missing-key ceiling, never grow it. This receipt is a FRESH, read-only invocation of ' +
      'the gate script own exported evaluator (runI18nKeyParityGate) against the real catalog on disk right now ' +
      '— never --seed, never a baseline mutation, never a citation of a prior run number.',
    startedAt: acc.startedAt,
    finishedAt: acc.finishedAt,
    repoRoot: acc.repoRoot ?? null,
    harnessSelfHash: acc.selfHash ?? null,
    selfProcess: acc.selfProcess ?? null,
    gateModuleExports: acc.gateModuleExports ?? null,
    sourceHashes: acc.sourceHashes ?? null,
    supportedLocales: acc.supportedLocales ?? null,
    gateResult: acc.result ?? null,
    crashed: acc.crashed,
    crashMessage: acc.crashMessage,
    pass,
  };

  // Absolute-path redaction, applied last, in one centralized pass: repoRoot,
  // harnessSelfHash paths, selfProcess.cwd and anything else that surfaced a
  // machine-specific filesystem path all get scrubbed here rather than
  // trusting every field above to have relativized itself correctly.
  const redactedReceipt = redactAbsolutePaths(receipt, [
    [acc.repoRoot ?? '', '<repo-root>'],
    [os.homedir(), '<home>'],
  ]);

  try {
    atomicWriteJSON(receiptPath, redactedReceipt);
  } catch (writeError) {
    process.stderr.write(`[emit-i18n-gate-receipt] FAILED TO WRITE RECEIPT to ${receiptPath}: ${writeError.message}\n`);
    process.stderr.write(`${JSON.stringify(redactedReceipt, null, 2)}\n`);
  }

  process.stdout.write(`receipt: ${receiptPath}\n`);
  if (acc.result) {
    process.stdout.write(`reference keys: ${acc.result.referenceKeyCount}\n`);
    for (const row of acc.result.census) {
      process.stdout.write(
        `  ${row.locale.padEnd(3)} ${row.classification.padEnd(17)} ${String(row.present).padStart(4)} present  ` +
        `${String(row.missing.length).padStart(4)} missing  ${row.coverage.toFixed(1)}%\n`
      );
    }
  }
  if (acc.crashed) process.stdout.write(`CRASH: ${acc.crashMessage}\n`);
  process.stdout.write(`pass=${pass}\n`);

  process.exitCode = pass ? 0 : 1;
}

await main();
