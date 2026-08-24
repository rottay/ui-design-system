import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { REPOSITORY_ROOT, getFamily, getRound, loadProgramContracts } from './contracts.mjs';

/**
 * The two live authorities that name whoever holds the sighted seat.
 *
 * Kept as PATHS rather than as values: what is pinned here is where to look,
 * never who is there. A seat change is then a contract edit, and this file
 * does not move.
 */
const SIGHTED_AUTHORITY_SOURCES = Object.freeze([
  Object.freeze({
    where: 'agent-orchestration.json#doubleAccept.coordinator',
    read: (contracts) => contracts?.orchestration?.doubleAccept?.coordinator,
  }),
  Object.freeze({
    where: 'quality-rubric.json#eligibility.finalSightedAuthority',
    read: (contracts) => contracts?.rubric?.eligibility?.finalSightedAuthority,
  }),
]);

/** Whitespace and case must not be a way past the fence. */
function normaliseActor(value) {
  return String(value).trim().toLowerCase();
}

/**
 * WHO MAY NOT PRODUCE THE EVIDENCE THEY APPROVE — derived per call, never pinned.
 *
 * THE DEFECT THIS REPLACES: this module used to hold
 * `SIGHTED_APPROVER = 'Codex (DT)'`. Two things were wrong with it at once, and
 * the second is why a second literal would not have been a fix. First, the seat
 * moved — the owner's order of 2026-08-23 put Kimi K3 in the DT chair and left
 * Codex a read-only consultant — so the fence compared against a name that no
 * longer approved anything, and a receipt produced by the REAL approver passed.
 * Second, and worse, nothing could have caught that: a literal cannot go stale
 * loudly. So the rule now READS the live authorities instead of remembering
 * them, and the only way to change the forbidden set is to change the seat.
 *
 * FAILS CLOSED. An authority this cannot read is not "no approver"; it is an
 * unprovable segregation, so the resolution throws and every caller must treat
 * that as a refusal rather than as an empty set.
 *
 * @param {object} contracts as returned by `loadProgramContracts`
 * @returns {readonly string[]} the distinct forbidden producer names, verbatim
 */
export function sightedApprovers(contracts) {
  const read = SIGHTED_AUTHORITY_SOURCES.map((source) => ({
    where: source.where,
    value: source.read(contracts),
  }));
  const unresolved = read.filter((entry) => !isNonEmptyString(entry.value));
  if (unresolved.length > 0) {
    throw new Error(
      'the sighted-approver set cannot be derived from the live authorities ' +
        `(${unresolved.map((entry) => entry.where).join(', ')}). A fence that cannot name who ` +
        'holds the seat must refuse, never fall back to a remembered name.',
    );
  }
  return Object.freeze([...new Set(read.map((entry) => entry.value.trim()))]);
}

/** Is this producer one of the live sighted approvers? Case- and space-insensitive. */
export function isSightedApprover(producer, contracts) {
  const forbidden = sightedApprovers(contracts).map(normaliseActor);
  return forbidden.includes(normaliseActor(producer));
}

export function sha256OfFile(absolutePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(absolutePath)).digest('hex');
}

/**
 * A source digest must change whenever any owned source byte changes, and must be
 * reproducible from the repository alone. Sorting by path keeps it order-independent.
 */
export function computeSourceDigest(sourceFiles, { root = REPOSITORY_ROOT } = {}) {
  const entries = [...(sourceFiles ?? [])].sort();
  const hash = crypto.createHash('sha256');
  for (const relative of entries) {
    const absolute = path.join(root, relative);
    hash.update(relative);
    hash.update('\0');
    hash.update(fs.existsSync(absolute) ? sha256OfFile(absolute) : 'MISSING');
    hash.update('\n');
  }
  return hash.digest('hex');
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates one evidence receipt against evidence-contract.json.
 * Returns `{ valid, failures }`; it never throws for a merely invalid receipt so a
 * batch run can report every defect at once.
 */
export function validateReceipt(receipt, options = {}) {
  const contracts = options.contracts ?? loadProgramContracts();
  const root = options.root ?? REPOSITORY_ROOT;
  const now = options.now ?? new Date();
  const failures = [];

  // `negativeDrill` is required to be *declared*; an explicit null is the honest way for a
  // non-drill receipt to say so. Every other required field must carry a value.
  const NULLABLE_REQUIRED_FIELDS = new Set(['negativeDrill']);
  for (const field of contracts.evidence.receiptRequiredFields) {
    if (!Object.hasOwn(receipt ?? {}, field)) {
      failures.push(`missing required receipt field ${field}`);
      continue;
    }
    const value = receipt[field];
    if (value === undefined || value === '') {
      failures.push(`required receipt field ${field} is empty`);
      continue;
    }
    if (value === null && !NULLABLE_REQUIRED_FIELDS.has(field)) {
      failures.push(`required receipt field ${field} is null`);
    }
  }

  const allowedRoot = contracts.evidence.root;
  const artifactPath = receipt?.artifactPath;
  if (isNonEmptyString(artifactPath)) {
    const normalized = artifactPath.replace(/^\.\//, '');
    if (!normalized.startsWith(`${allowedRoot}/`)) {
      failures.push(`artifact ${artifactPath} is outside the allowed evidence root ${allowedRoot}`);
    } else {
      const absolute = path.join(root, normalized);
      if (!fs.existsSync(absolute)) {
        failures.push(`artifact ${artifactPath} does not exist`);
      } else {
        const actual = sha256OfFile(absolute);
        if (actual !== receipt.artifactSha256) {
          failures.push(
            `artifact ${artifactPath} sha256 ${actual} does not match declared ${receipt.artifactSha256}`,
          );
        }
        // no-receipt-path-is-accepted-as-evidence-without-content-validation
        if (fs.statSync(absolute).size === 0) {
          failures.push(`artifact ${artifactPath} is empty and cannot be evidence`);
        }
      }
    }
  }

  if (Array.isArray(receipt?.sourceFiles) && receipt.sourceFiles.length > 0) {
    const expected = computeSourceDigest(receipt.sourceFiles, { root });
    if (expected !== receipt.sourceDigest) {
      failures.push(
        `source digest is stale: owned files currently hash to ${expected}, receipt declares ${receipt.sourceDigest}`,
      );
    }
  } else {
    failures.push('receipt declares no source files, so freshness cannot be proven');
  }

  if (isNonEmptyString(receipt?.roundId) && !getRound(contracts, receipt.roundId)) {
    failures.push(`round ${receipt.roundId} does not exist in rounds.json`);
  }
  if (isNonEmptyString(receipt?.familyId)) {
    const isProgramScope = receipt.familyId.startsWith('program/');
    if (!isProgramScope && !getFamily(contracts, receipt.familyId)) {
      failures.push(`family ${receipt.familyId} does not exist in family-inventory.json`);
    }
  }

  if (isNonEmptyString(receipt?.createdAt)) {
    const createdAt = new Date(receipt.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      failures.push('createdAt is not a valid date');
    } else if (createdAt.getTime() > now.getTime() + 60_000) {
      failures.push('createdAt is in the future');
    }
  }

  /* Segregation of duties, against the LIVE seat. Derived unconditionally so an
   * authority this cannot read reddens every receipt instead of quietly
   * checking nothing — the failure mode the pinned constant had. */
  let sightedSet = null;
  try {
    sightedSet = sightedApprovers(contracts);
  } catch (error) {
    failures.push(`sighted-approver segregation cannot be checked: ${error.message}`);
  }
  if (
    sightedSet !== null &&
    isNonEmptyString(receipt?.producer) &&
    sightedSet.map(normaliseActor).includes(normaliseActor(receipt.producer))
  ) {
    failures.push(
      `producer must not be the sighted approver (live seat: ${sightedSet.join(' | ')})`,
    );
  }

  const drill = receipt?.negativeDrill;
  if (drill !== undefined && drill !== null) {
    if (typeof drill !== 'object') {
      failures.push('negativeDrill must be an object describing the named violation it rejects');
    } else {
      if (!isNonEmptyString(drill.violation)) {
        failures.push('negativeDrill.violation must name the violation the gate rejects');
      }
      if (drill.failsClosed !== true) {
        failures.push('negativeDrill must prove the gate fails closed for its named violation');
      }
      if (!isNonEmptyString(drill.proof)) {
        failures.push('negativeDrill.proof must point at the executable drill');
      }
    }
  }

  if (typeof receipt?.exitCode === 'number' && receipt.exitCode !== 0 && receipt.evidenceKind !== 'negative-drill') {
    failures.push(`receipt exitCode ${receipt.exitCode} is non-zero for a positive evidence kind`);
  }

  return { valid: failures.length === 0, failures, receiptId: receipt?.artifactPath ?? null };
}

export function validateReceipts(receipts, options = {}) {
  const results = (receipts ?? []).map((receipt) => validateReceipt(receipt, options));
  return {
    valid: results.every((result) => result.valid),
    total: results.length,
    failed: results.filter((result) => !result.valid).length,
    results,
  };
}
