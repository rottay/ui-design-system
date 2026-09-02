import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { REPOSITORY_ROOT, getRound, loadProgramContracts, roundEvidenceRelativePath } from '../../contracts/index.mjs';

/**
 * evidence-contract/index.json#statusLaw: an evidence artifact may describe results but must
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

const SUMS_FILENAME = 'SHA256SUMS';

/**
 * `<64 hex digits><whitespace>[*]<path>`. The path is captured as "everything
 * that is left" rather than as a whitespace-delimited field: an evidence path
 * may legally contain a space, and the previous `split(/\s+/)` silently
 * truncated such a line to its first segment, then verified a digest against
 * the wrong (usually missing) file.
 */
const SUMS_LINE = /^([0-9a-fA-F]{64})[ \t]+\*?(.+)$/;

/**
 * A SHA256SUMS entry is trusted to name a file INSIDE the round it seals, so
 * the path is validated before it is ever joined onto the round root.
 * `..` is rejected on the RAW segments, before normalisation: `a/../b`
 * normalises to the innocent `b`, so a post-normalisation check cannot tell a
 * traversal attempt from a plain path and would launder it.
 */
function normalizeDeclaredPath(raw) {
  if (raw.length === 0) return { ok: false, reason: 'is empty' };
  if (raw.includes('\0')) return { ok: false, reason: 'contains a NUL byte' };
  if (path.posix.isAbsolute(raw) || path.win32.isAbsolute(raw)) {
    return { ok: false, reason: 'is absolute; entries must be relative to the round root' };
  }
  if (raw.split('/').includes('..')) {
    return { ok: false, reason: 'traverses outside the round root with a ".." segment' };
  }
  // Normalisation is limited to what cannot change meaning: `./` prefixes,
  // duplicate slashes, trailing slashes.
  const normalized = path.posix.normalize(raw).replace(/^\.\//, '');
  if (normalized === '.' || normalized === '' || normalized.endsWith('/')) {
    return { ok: false, reason: 'does not name a file' };
  }
  return { ok: true, value: normalized };
}

/**
 * Recursive inventory of the round root, classified by entry type.
 *
 * Symlinks are kept OUT of `files` and tracked separately: a symlink is not a
 * regular file, and sealing one would record the digest of whatever it happens
 * to point at -- which is exactly the substitution the containment check below
 * exists to refuse.
 */
function inventoryRound(roundRoot) {
  const files = [];
  const symlinks = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(roundRoot, absolute).split(path.sep).join('/');
      if (entry.isSymbolicLink()) symlinks.push(relative);
      else if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) files.push(relative);
    }
  };
  walk(roundRoot);
  return { files: files.sort(), symlinks: symlinks.sort() };
}

/** True when `absolute` really resolves inside `realRoot`, symlinks followed. */
function resolvesInsideRoot(absolute, realRoot) {
  let real;
  try {
    real = fs.realpathSync(absolute);
  } catch {
    return false;
  }
  return real === realRoot || real.startsWith(realRoot + path.sep);
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

  const roundRelative = roundEvidenceRelativePath(contracts, roundId);
  const roundRoot = path.join(root, roundRelative);
  if (!fs.existsSync(roundRoot)) {
    blockers.push(`round evidence directory ${roundRelative} does not exist`);
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

  // SHA256SUMS must be an EXACT, complete, recursive seal of the round: every
  // present regular file except SHA256SUMS itself, listed exactly once, with a
  // matching digest. Digest-only verification -- what this did before -- proves
  // that the files someone chose to list are unmodified, and says nothing at
  // all about the files they did not list. An unsealed artifact added beside a
  // sealed one was therefore invisible, which is the failure a seal exists to
  // make impossible.
  const sumsPath = path.join(roundRoot, SUMS_FILENAME);
  if (fs.existsSync(sumsPath)) {
    const { files, symlinks } = inventoryRound(roundRoot);
    const present = new Set(files.filter((relative) => relative !== SUMS_FILENAME));

    let realRoot;
    try {
      realRoot = fs.realpathSync(roundRoot);
    } catch {
      realRoot = roundRoot;
    }

    // A symlink cannot be sealed honestly: its digest is the digest of its
    // target, which may sit outside the round and change without the round
    // changing.
    for (const relative of symlinks) {
      blockers.push(
        resolvesInsideRoot(path.join(roundRoot, relative), realRoot)
          ? `SHA256SUMS coverage is undecidable: ${relative} is a symlink, not a regular file`
          : `SHA256SUMS coverage is undecidable: symlink ${relative} escapes the round root`,
      );
    }

    const declared = new Map();
    const rawLines = fs.readFileSync(sumsPath, 'utf8').split('\n');
    rawLines.forEach((rawLine, index) => {
      const line = rawLine.replace(/\r$/, '');
      if (line.trim().length === 0) return;
      const lineNumber = index + 1;

      const match = SUMS_LINE.exec(line);
      if (!match) {
        blockers.push(`SHA256SUMS line ${lineNumber} is malformed: ${JSON.stringify(line)}`);
        return;
      }
      const [, digest, rawPath] = match;

      const normalized = normalizeDeclaredPath(rawPath);
      if (!normalized.ok) {
        blockers.push(`SHA256SUMS line ${lineNumber} names a path that ${normalized.reason}: ${JSON.stringify(rawPath)}`);
        return;
      }
      const relative = normalized.value;

      if (declared.has(relative)) {
        blockers.push(
          `SHA256SUMS declares ${relative} more than once (lines ${declared.get(relative).lineNumber} and ${lineNumber})`,
        );
        return;
      }
      declared.set(relative, { digest: digest.toLowerCase(), lineNumber });

      if (relative === SUMS_FILENAME) {
        blockers.push('SHA256SUMS must not declare itself; a seal cannot certify its own bytes');
        return;
      }
      if (!present.has(relative)) {
        blockers.push(`SHA256SUMS declares ${relative}, which is not a regular file under the round root`);
        return;
      }

      const absolute = path.join(roundRoot, relative);
      if (!resolvesInsideRoot(absolute, realRoot)) {
        blockers.push(`SHA256SUMS entry ${relative} resolves outside the round root`);
        return;
      }

      const actual = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
      if (actual !== digest.toLowerCase()) blockers.push(`SHA256SUMS digest for ${relative} is stale`);
    });

    // The other direction: a file on disk that nobody sealed.
    for (const relative of [...present].sort()) {
      if (!declared.has(relative)) blockers.push(`SHA256SUMS does not cover present file ${relative}`);
    }

    notes.push(`SHA256SUMS covers ${declared.size} of ${present.size} present artifacts`);
  } else {
    blockers.push(`${roundId} evidence is missing ${SUMS_FILENAME}`);
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
