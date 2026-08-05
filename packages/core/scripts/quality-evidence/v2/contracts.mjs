import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const PROGRAM_ROOT = path.resolve(HERE, '../programs/modern-rescue');
export const REPOSITORY_ROOT = path.resolve(HERE, '../../../../..');

const CONTRACT_FILES = Object.freeze({
  program: 'program.json',
  inventory: 'family-inventory.json',
  rubric: 'quality-rubric.json',
  customization: 'customization-model.json',
  artDirection: 'tenant-art-direction.json',
  visualCraft: 'visual-craft-contract.json',
  rounds: 'rounds.json',
  orchestration: 'agent-orchestration.json',
  evidence: 'evidence-contract.json',
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
