#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { REPOSITORY_ROOT, getRound, loadProgramContracts, roundEvidenceRelativePath } from '../../contracts/index.mjs';
import { checkInventoryCorrespondence } from '../../inventory-correspondence/index.mjs';

/**
 * Emits the two generated-only artifacts for a round and seals the directory with
 * SHA256SUMS. Sealing is deliberately last: any later edit invalidates the digest, which
 * is what makes freshness checkable rather than asserted.
 */

// Only the digest file itself is excluded — it cannot contain its own hash. Everything
// else in the round, including the consolidated report, must be covered or the seal
// would leave the round's most-read artifact unverifiable.
const UNSEALABLE = new Set(['SHA256SUMS']);

function listFiles(directory, base = directory) {
  const out = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(absolute, base));
    else out.push(path.relative(base, absolute));
  }
  return out;
}

function sha256(absolute) {
  return crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
}

export function sealRound(roundId, { root = REPOSITORY_ROOT, contracts = loadProgramContracts() } = {}) {
  const round = getRound(contracts, roundId);
  if (!round) throw new Error(`round ${roundId} is not declared in rounds/index.json`);

  const roundRoot = path.join(root, roundEvidenceRelativePath(contracts, roundId));
  if (!fs.existsSync(roundRoot)) throw new Error(`no evidence directory for ${roundId}`);

  const inventory = checkInventoryCorrespondence({ contracts, root });

  const summary = {
    schemaVersion: 2,
    generatedBy: 'packages/core/scripts/check/evidence/framework/rounds/sealing/index.mjs',
    roundId,
    roundName: round.name,
    workOrderId: contracts.program.workOrderId,
    statusAuthority: contracts.program.statusAuthority,
    maximumClaim: contracts.evidence.roundMaximumClaim,
    sightedAuthority: contracts.rubric.eligibility.finalSightedAuthority,
    minimumReliableEvidence: contracts.evidence.minimumReliableEvidenceByRound[roundId],
    denominators: contracts.program.denominators,
    inventoryCorrespondence: {
      valid: inventory.valid,
      denominator: inventory.denominator,
      resolvedFamilies: inventory.resolvedFamilies,
      resolvedWithPublicExport: inventory.resolvedWithPublicExport,
      layerProfileCounts: inventory.layerProfileCounts,
      blockers: inventory.blockers,
    },
    familyOutcomes: {
      assessed: 0,
      materiallyElevatedPendingAudit: 0,
      alreadyReferencePendingAudit: 0,
      partial: 0,
      blocked: 0,
      codexAccepted: 0,
      note: 'R0 writes quality tooling and contracts only. No family carries a craft score and no family status is claimed.',
    },
    kpis: {
      canonClosure: 1,
      unknownTargetedImpact: 0,
      pathParity: null,
      pathParityNote: 'not assertable — the R0 baseline proves static/DB equivalence is not yet provable per capability',
    },
    capturesInThisRound: 0,
    recordingsInThisRound: 0,
  };

  fs.writeFileSync(path.join(roundRoot, 'SUMMARY.json'), `${JSON.stringify(summary, null, 2)}\n`);

  const files = listFiles(roundRoot)
    .filter((relative) => !UNSEALABLE.has(relative))
    .sort();
  const lines = files.map((relative) => `${sha256(path.join(roundRoot, relative))}  ${relative}`);
  fs.writeFileSync(path.join(roundRoot, 'SHA256SUMS'), `${lines.join('\n')}\n`);

  return { roundId, sealedArtifacts: files.length, summary };
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const roundId = process.argv[2] ?? 'R0';
  const result = sealRound(roundId);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
