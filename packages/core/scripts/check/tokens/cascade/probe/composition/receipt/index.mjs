/**
 * @fileoverview Source-bound receipts for a causal run.
 *
 * A receipt is not a filename and not a claim. It is the pair
 * (artifact bytes, the source tree those bytes describe), bound by two hashes
 * that a validator recomputes. `evidence-contract/index.json` already states the law
 * — `sha256-matches-file`, `source-digest-matches-current-owned-files`,
 * `no-receipt-path-is-accepted-as-evidence-without-content-validation` — and
 * `scripts/check/evidence/framework/receipts/index.mjs` already implements the validator.
 *
 * SO THIS FILE DOES NOT VALIDATE. It emits, and it delegates validation to that
 * one validator. A second validator would be a second authority, and two
 * authorities that agree teach nothing while two that disagree have to be
 * adjudicated by a third. What this file adds is the probe-side half nobody
 * else can compute: which files the INSTRUMENT owns, so that changing the
 * instrument invalidates every receipt it has produced.
 *
 * THE INSTRUMENT IS PART OF THE SOURCE. A receipt that binds only the measured
 * CSS is satisfied by a broken harness measuring a healthy tree. The owned file
 * set is therefore walked from disk rather than listed, so a new unit is
 * covered the moment it exists and a deleted one stops being claimed.
 *
 * IT DOES NOT WRITE INTO THE EVIDENCE ROOT. `writeEvidence` requires an
 * explicit root and has no default. During instrument work the root is a temp
 * directory; the evidence root is where a calibration RUN writes, under the
 * programme's own round layout, and putting a default here is how a mechanics
 * checkpoint accidentally becomes evidence.
 *
 * @module Tooling/ResolutionProbe/Composition/Receipt
 */

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

import {
  computeSourceDigest,
  validateReceipt,
} from '../../../../../evidence/framework/receipts/index.mjs';
import {
  loadProgramContracts,
  REPOSITORY_ROOT,
} from '../../../../../evidence/framework/contracts/index.mjs';
import { CORE_ROOT } from '../../foundation/paths/index.mjs';
import { sha256 } from '../../runtime/bundle/index.mjs';

/** Mirrors `evidence-contract/index.json#schemaVersion`; a receipt states which law it was written under. */
export const RECEIPT_SCHEMA_VERSION = 2;

/** This instrument's own tree, repo-relative. */
export const INSTRUMENT_ROOT = 'packages/core/scripts/check/tokens/cascade/probe';

const PRODUCTION_EXTENSIONS = new Set(['.mjs', '.json']);
const EXCLUDED_DIRECTORIES = new Set(['tests', '__tests__', '__test__']);

function extensionOf(name) {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot);
}

/**
 * Every production file of the instrument, sorted, repo-relative.
 *
 * Tests are excluded on purpose: a test edit must not invalidate a receipt
 * about a measurement, and including them would make the digest churn for
 * changes that cannot alter a number.
 */
export function ownedSourceFiles({ instrumentRoot = INSTRUMENT_ROOT } = {}) {
  const absolute = resolve(REPOSITORY_ROOT, instrumentRoot);
  const found = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (EXCLUDED_DIRECTORIES.has(entry.name)) continue;
        walk(resolve(directory, entry.name));
        continue;
      }
      if (!entry.isFile()) continue;
      if (!PRODUCTION_EXTENSIONS.has(extensionOf(entry.name))) continue;
      if (entry.name.includes('.test.')) continue;
      found.push(resolve(directory, entry.name));
    }
  };
  walk(absolute);
  return found
    .map((path) => relative(REPOSITORY_ROOT, path).split('\\').join('/'))
    .sort();
}

/**
 * A tool version that changes when the tool changes.
 *
 * A hand-written semver on an instrument nobody publishes says nothing; a
 * digest of the instrument's own production bytes says exactly the thing a
 * reader of a receipt needs — whether two receipts were produced by the same
 * instrument.
 */
export function instrumentVersion({ instrumentRoot = INSTRUMENT_ROOT } = {}) {
  const files = ownedSourceFiles({ instrumentRoot });
  const digest = computeSourceDigest(files, { root: REPOSITORY_ROOT });
  return { toolVersion: `resolution-probe@${digest.slice(0, 12)}`, digest, files };
}

/**
 * Builds a receipt that satisfies `evidence-contract/index.json#receiptRequiredFields`
 * exactly: fifteen fields, none invented, none omitted.
 *
 * `sourceFiles` is the union of the instrument's own production files and the
 * files the run measured, so a receipt goes stale when EITHER side moves.
 */
export function buildReceipt({
  roundId,
  familyId,
  scenarioId,
  evidenceKind,
  commandOrTool,
  exitCode,
  measuredSourceFiles = [],
  artifactPath,
  artifactBytes,
  createdAt = new Date().toISOString(),
  negativeDrill,
  producer,
  instrumentRoot = INSTRUMENT_ROOT,
  repositoryRoot = REPOSITORY_ROOT,
}) {
  if (typeof artifactBytes !== 'string') {
    throw new Error(
      'resolution-probe: buildReceipt needs the exact artifact bytes it is certifying. Hashing ' +
        'a path instead of a payload is how a receipt starts describing a file nobody read.',
    );
  }
  const { toolVersion } = instrumentVersion({ instrumentRoot });
  const owned = ownedSourceFiles({ instrumentRoot });
  const sourceFiles = [...new Set([...owned, ...measuredSourceFiles])].sort();
  return {
    schemaVersion: RECEIPT_SCHEMA_VERSION,
    roundId,
    familyId,
    scenarioId,
    evidenceKind,
    commandOrTool,
    toolVersion,
    exitCode,
    sourceFiles,
    sourceDigest: computeSourceDigest(sourceFiles, { root: repositoryRoot }),
    artifactPath,
    artifactSha256: sha256(artifactBytes),
    createdAt,
    negativeDrill,
    producer,
  };
}

/**
 * Writes the artifact and its receipt under an EXPLICIT root, then validates
 * the pair by content with the programme's own validator.
 *
 * There is no default root. The evidence root is a destination a calibration
 * run chooses; an instrument checkpoint passes a temp directory and proves the
 * mechanics without producing evidence nobody asked for.
 *
 * @param {object} input
 * @param {string} input.root              absolute directory that stands in for the repo root
 * @param {string} input.artifactPath      path RELATIVE to `root`, and inside `allowedRoot`
 * @param {string} input.artifactBytes
 * @param {string} input.receiptPath       path relative to `root`
 * @param {object} input.receiptFields     everything `buildReceipt` needs except artifact facts
 * @param {object} [input.contracts]       programme contracts; override `evidence.root` for a temp run
 */
export function writeEvidence({
  root,
  artifactPath,
  artifactBytes,
  receiptPath,
  receiptFields,
  contracts = loadProgramContracts(),
}) {
  if (!root) {
    throw new Error(
      'resolution-probe: writeEvidence needs an explicit root. It has no default on purpose — ' +
        'the evidence root belongs to a calibration run, not to instrument work.',
    );
  }
  const artifactAbsolute = resolve(root, artifactPath);
  mkdirSync(dirname(artifactAbsolute), { recursive: true });
  writeFileSync(artifactAbsolute, artifactBytes);

  const receipt = buildReceipt({ ...receiptFields, artifactPath, artifactBytes });
  const receiptAbsolute = resolve(root, receiptPath);
  mkdirSync(dirname(receiptAbsolute), { recursive: true });
  const receiptBytes = `${JSON.stringify(receipt, null, 2)}\n`;
  writeFileSync(receiptAbsolute, receiptBytes);

  const validation = verifyReceipt(receipt, { root, contracts, artifactBytes });
  return { receipt, receiptBytes, artifactAbsolute, receiptAbsolute, validation };
}

/**
 * Delegates to the programme validator, then adds the two checks only the
 * instrument can make.
 *
 * `failures` from both halves are merged into one list so a caller cannot pass
 * by reading whichever half it prefers.
 */
export function verifyReceipt(receipt, { root = REPOSITORY_ROOT, contracts, artifactBytes = null }) {
  const base = validateReceipt(receipt, { root, contracts });
  const failures = [...base.failures];

  if (artifactBytes !== null && receipt?.artifactSha256 !== sha256(artifactBytes)) {
    failures.push(
      'artifactSha256 does not match the bytes handed to the writer, so the receipt describes a ' +
        'payload other than the one it was built from',
    );
  }

  const owned = ownedSourceFiles();
  const declared = new Set(receipt?.sourceFiles ?? []);
  const missing = owned.filter((file) => !declared.has(file));
  if (missing.length > 0) {
    failures.push(
      `receipt omits ${missing.length} instrument source file(s) (first: ${missing[0]}), so a ` +
        'change to the harness itself would not invalidate it',
    );
  }

  return { valid: failures.length === 0, failures, receiptId: receipt?.artifactPath ?? null };
}

/** Re-reads a written artifact and confirms it still hashes to the receipt. */
export function artifactStillMatches(receipt, { root = REPOSITORY_ROOT } = {}) {
  const absolute = resolve(root, receipt.artifactPath);
  const bytes = readFileSync(absolute, 'utf-8');
  return {
    matches: sha256(bytes) === receipt.artifactSha256,
    bytes: statSync(absolute).size,
    observedSha256: sha256(bytes),
  };
}

export { CORE_ROOT, REPOSITORY_ROOT, computeSourceDigest, loadProgramContracts };
