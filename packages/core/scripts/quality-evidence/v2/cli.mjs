#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { admitWriterLane, validateConflictGraph } from './admission.mjs';
import { loadProgramContracts } from './contracts.mjs';
import { scoreCraft } from './craft-score.mjs';
import { evaluateFamilyEligibility } from './eligibility.mjs';
import { analyzeOwnershipProposal } from './ownership-overlap.mjs';
import { validateRoundEvidence } from './round-evidence.mjs';
import { validateReceipts } from './receipts.mjs';
import {
  checkInventoryCorrespondence,
  resolveInventory,
  writeResolvedInventory,
} from './inventory-correspondence.mjs';

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function readJson(target) {
  return JSON.parse(readFileSync(resolve(target), 'utf8'));
}

function usage() {
  return {
    usage: [
      'node packages/core/scripts/quality-evidence/v2/cli.mjs inventory',
      'node packages/core/scripts/quality-evidence/v2/cli.mjs craft-score <family-receipt.json>',
      'node packages/core/scripts/quality-evidence/v2/cli.mjs eligibility <family-receipt.json>',
      'node packages/core/scripts/quality-evidence/v2/cli.mjs receipts <receipts.json>',
      'node packages/core/scripts/quality-evidence/v2/cli.mjs admission <lane-packet.json> <ownership-proposal.json>',
      'node packages/core/scripts/quality-evidence/v2/cli.mjs conflict-graph <conflict-graph.json>',
      'node packages/core/scripts/quality-evidence/v2/cli.mjs round-evidence <R0|R1|...>',
      'node packages/core/scripts/quality-evidence/v2/cli.mjs ownership <ownership-proposal.json>',
    ],
    laws: [
      'binary eligibility and 100-point sighted craft are computed by separate modules',
      'a scored dimension without observable evidence scores zero',
      'tests never award craft points and Claude never records sighted approval',
      'the executor maximum claim is IMPLEMENTED_PENDING_CODEX_AUDIT',
    ],
  };
}

const [command, argument, secondArgument] = process.argv.slice(2);

try {
  switch (command) {
    case 'inventory': {
      if (argument === '--write') {
        // Preflight on SOURCE only. Gating the writer on `valid` deadlocked it: `valid`
        // includes drift between the file and source, and drift is precisely what running
        // the writer repairs, so the one command able to fix the file refused to run
        // exactly when the file needed fixing.
        const preflight = checkInventoryCorrespondence();
        if (!preflight.sourceValid) {
          print({
            written: false,
            reason: 'source blockers must be resolved by hand; the writer cannot repair them',
            ...preflight,
          });
          process.exitCode = 1;
          break;
        }

        const written = writeResolvedInventory();

        // Postcheck reads the file back from disk (`fresh: true` defeats the contracts
        // cache, which still holds the pre-write parse). Reporting success from the
        // in-memory value the writer just serialized would certify the write against
        // itself.
        const postcheck = checkInventoryCorrespondence({
          contracts: loadProgramContracts({ fresh: true }),
          // The source graph is mutable in a multi-agent worktree. Reusing the
          // preflight surface here could certify JSON written for a barrel that
          // changed between the two reads.
          cache: false,
        });
        if (!postcheck.valid) {
          print({
            written: false,
            target: written.target,
            note: 'the file WAS rewritten but the postcheck rejects it; re-run after resolving the reported drift',
            ...postcheck,
          });
          process.exitCode = 1;
          break;
        }
        print({ written: true, ...written, ...postcheck });
        break;
      }
      const result = checkInventoryCorrespondence();
      print(result);
      if (!result.valid) process.exitCode = 1;
      break;
    }
    case 'family-matrix': {
      const resolved = resolveInventory();
      const contracts = loadProgramContracts();
      const byProfile = {};
      for (const row of resolved.rows) byProfile[row.layerProfile] = (byProfile[row.layerProfile] ?? 0) + 1;
      print({
        schemaVersion: 2,
        generatedBy: 'packages/core/scripts/quality-evidence/v2/cli.mjs family-matrix',
        denominator: contracts.program.denominators.visibleFamilies,
        thresholdsByLayerProfile: contracts.rubric.layerThresholds,
        divergenceMinimumByProfile: contracts.rubric.tenantDivergenceMinimumByProfile,
        familiesByLayerProfile: byProfile,
        dimensionPolicy: 'all twelve rubric dimensions apply to every family; narrowing requires a per-receipt NOT_APPLICABLE_WITH_REASON',
        assessedThisRound: 0,
        note: 'R0 writes quality tooling and contracts only. No family carries a craft score yet, and no family status may be claimed until a family receipt exists and Codex audits it.',
        families: resolved.rows.map((row) => ({
          id: row.id,
          layer: row.layer,
          layerProfile: row.layerProfile,
          layerProfileSignal: row.layerProfileSignal,
          divergenceProfile: row.divergenceProfile,
          threshold: contracts.rubric.layerThresholds[row.layerProfile] ?? null,
          minimumDivergenceAxes: contracts.rubric.tenantDivergenceMinimumByProfile[row.divergenceProfile] ?? null,
          sourceOwner: row.sourceOwner,
          resolvedBy: row.resolvedBy,
          publicExports: row.publicExports,
          sourceResolution: row.sourceResolution,
        })),
      });
      break;
    }
    case 'craft-score': {
      const receipt = readJson(argument);
      print(scoreCraft(receipt.afterDimensionScores ?? receipt, { contracts: loadProgramContracts() }));
      break;
    }
    case 'eligibility': {
      const result = evaluateFamilyEligibility(readJson(argument));
      print(result);
      if (!result.binaryEligible) process.exitCode = 1;
      break;
    }
    case 'receipts': {
      const result = validateReceipts(readJson(argument));
      print(result);
      if (!result.valid) process.exitCode = 1;
      break;
    }
    case 'admission': {
      // The authorized ownership proposal is passed EXPLICITLY. It is not resolved from the
      // evidence root or inferred from the packet: a lane's right to write a file must be
      // read from a named artifact the caller supplies, never from a hidden default.
      // Omitting it is not a usage error — it produces a normal result whose blocker says
      // ownership could not be resolved, so the failure is machine-readable and exits 1.
      const proposal = secondArgument ? readJson(secondArgument) : null;
      const result = admitWriterLane(readJson(argument), proposal ? { proposal, proposalPath: secondArgument } : {});
      print(result);
      if (!result.admitted) process.exitCode = 1;
      break;
    }
    case 'conflict-graph': {
      const result = validateConflictGraph(readJson(argument));
      print(result);
      if (!result.safe) process.exitCode = 1;
      break;
    }
    case 'ownership': {
      const result = analyzeOwnershipProposal(readJson(argument));
      print(result);
      if (!result.conflictFree) process.exitCode = 1;
      break;
    }
    case 'round-evidence': {
      const result = validateRoundEvidence(argument);
      print(result);
      if (!result.valid) process.exitCode = 1;
      break;
    }
    default:
      print(usage());
      process.exitCode = command ? 1 : 0;
  }
} catch (error) {
  print({ valid: false, error: error instanceof Error ? error.message : String(error) });
  process.exitCode = 1;
}
