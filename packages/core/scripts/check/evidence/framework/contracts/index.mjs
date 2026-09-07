import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repoRoot as findRepoRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const PROGRAM_ROOT = path.resolve(HERE, '../../../modern-rescue');
export const REPOSITORY_ROOT = findRepoRoot(HERE);

/**
 * `customization-model/index.json` is deliberately absent: WO-CAT-02 deleted it
 * and the typed catalog (`src/contracts/theme/runtime/catalog`) is the only list
 * of controls. A loader entry for a file that no longer exists would make every
 * evidence gate throw on a fact none of them read.
 */
const CONTRACT_FILES = Object.freeze({
  program: 'program/index.json',
  inventory: 'family-inventory/index.json',
  rubric: 'quality-rubric/index.json',
  artDirection: 'art-direction/index.json',
  visualCraft: 'visual-craft/index.json',
  rounds: 'rounds/index.json',
  orchestration: 'orchestration/index.json',
  evidence: 'evidence-contract/index.json',
});

let cached = null;

export function loadProgramContracts({ root = PROGRAM_ROOT, fresh = false } = {}) {
  if (cached && !fresh && root === PROGRAM_ROOT) return cached;
  const contracts = Object.fromEntries(
    Object.entries(CONTRACT_FILES).map(([key, filename]) => [
      key,
      JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8')),
    ]),
  );
  if (root === PROGRAM_ROOT) cached = contracts;
  return contracts;
}

export function getRound(contracts, roundId) {
  return contracts.rounds.rounds.find((round) => round.id === roundId) ?? null;
}

export function roundEvidenceRelativePath(contracts, roundId) {
  const location = contracts.evidence.roundLocations?.[roundId];
  if (typeof location !== 'string' || location.length === 0 || path.isAbsolute(location) || location.includes('..')) {
    throw new Error(`round ${roundId} has no safe semantic evidence location`);
  }
  return path.join(contracts.evidence.root, location);
}

export function getFamily(contracts, familyId) {
  return contracts.inventory.rows.find((row) => row.id === familyId) ?? null;
}

export function criticalDimensionIds(contracts) {
  return contracts.rubric.dimensions
    .filter((dimension) => dimension.critical)
    .map((dimension) => dimension.id);
}

export function dimensionIds(contracts) {
  return contracts.rubric.dimensions.map((dimension) => dimension.id);
}

/**
 * The rubric declares thresholds per layer profile, while the inventory rows carry a
 * physical layer. A resolved row states its profile explicitly; unresolved rows have
 * no threshold and must fail closed rather than borrow a neighbouring layer's floor.
 */
export function layerThresholdFor(contracts, layerProfile) {
  const threshold = contracts.rubric.layerThresholds[layerProfile];
  return typeof threshold === 'number' ? threshold : null;
}

export function divergenceMinimumFor(contracts, divergenceProfile) {
  const minimum = contracts.rubric.tenantDivergenceMinimumByProfile[divergenceProfile];
  return typeof minimum === 'number' ? minimum : null;
}

export function stressMatrixFloor(contracts) {
  return contracts.rubric.stressMatrix;
}
