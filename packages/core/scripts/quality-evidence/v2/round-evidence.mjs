import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { REPOSITORY_ROOT, getRound, loadProgramContracts } from './contracts.mjs';

/**
 * evidence-contract.json#statusLaw: an evidence artifact may describe results but must
 * never carry work-order status. These keys are the ones roadmap/registry.json owns.
 */
const SHADOW_STATE_KEYS = new Set([
  'status',
  'progress',
  'percentage',
  'percentComplete',
  'accepted',
  'completed',
  'done',
]);

const CAPTURE_DIRECTORIES = Object.freeze(['captures', 'recordings']);

function collectShadowStateKeys(value, label, findings) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectShadowStateKeys(entry, `${label}[${index}]`, findings));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, entry] of Object.entries(value)) {
    if (SHADOW_STATE_KEYS.has(key)) findings.push(`${label} declares work-order status key ${key}`);
    collectShadowStateKeys(entry, `${label}.${key}`, findings);
  }
}

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const out = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(absolute));
    else out.push(absolute);
  }
  return out;
}

export function validateRoundEvidence(roundId, options = {}) {
  const contracts = options.contracts ?? loadProgramContracts();
  const root = options.root ?? REPOSITORY_ROOT;
  const blockers = [];
  const notes = [];

  const round = getRound(contracts, roundId);
  if (!round) {
    return { schemaVersion: 2, roundId, valid: false, blockers: [`round ${roundId} is not declared`], notes };
  }

  const policy = contracts.evidence.minimumReliableEvidenceByRound[roundId];
  if (!policy) blockers.push(`round ${roundId} has no minimum reliable evidence policy`);

  const roundRoot = path.join(root, contracts.evidence.root, roundId);
  if (!fs.existsSync(roundRoot)) {
    blockers.push(`round evidence directory ${contracts.evidence.root}/${roundId} does not exist`);
    return { schemaVersion: 2, roundId, valid: false, blockers, notes };
  }

  const allowed = new Set(contracts.evidence.roundLayout.map((entry) => entry.replace(/\/$/, '')));
  const present = fs.readdirSync(roundRoot, { withFileTypes: true });
  for (const entry of present) {
    const name = entry.name;
    if (!allowed.has(name)) {
      blockers.push(`evidence artifact ${roundId}/${name} is outside the declared roundLayout allowlist`);
    }
  }

  // R0 is explicitly capture-free; a capture here would misrepresent a round that has no
  // sighted authority yet.
  if (typeof policy === 'string' && policy.includes('no captures')) {
    for (const directory of CAPTURE_DIRECTORIES) {
      const files = listFiles(path.join(roundRoot, directory));
      if (files.length > 0) {
        blockers.push(`${roundId} declares no captures but ${directory}/ holds ${files.length} files`);
      }
    }
  }

  for (const file of listFiles(roundRoot)) {
    if (!file.endsWith('.json')) continue;
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      blockers.push(`evidence artifact ${path.relative(root, file)} is not valid JSON: ${error.message}`);
      continue;
    }
    const findings = [];
    collectShadowStateKeys(parsed, path.relative(root, file), findings);
    blockers.push(...findings);
    if (fs.statSync(file).size === 0) blockers.push(`evidence artifact ${path.relative(root, file)} is empty`);
  }

  const manifestPath = path.join(roundRoot, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    blockers.push(`${roundId} evidence is missing manifest.json`);
  }

  const sumsPath = path.join(roundRoot, 'SHA256SUMS');
  if (fs.existsSync(sumsPath)) {
    const lines = fs.readFileSync(sumsPath, 'utf8').split('\n').filter((line) => line.trim().length > 0);
    for (const line of lines) {
      const [digest, relative] = line.trim().split(/\s+/);
      const absolute = path.join(roundRoot, relative);
      if (!fs.existsSync(absolute)) {
        blockers.push(`SHA256SUMS references missing file ${relative}`);
        continue;
      }
      const actual = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
      if (actual !== digest) blockers.push(`SHA256SUMS digest for ${relative} is stale`);
    }
    notes.push(`SHA256SUMS covers ${lines.length} artifacts`);
  } else {
    blockers.push(`${roundId} evidence is missing SHA256SUMS`);
  }

  return {
    schemaVersion: 2,
    roundId,
    policy: policy ?? null,
    valid: blockers.length === 0,
    blockers,
    notes,
  };
}
