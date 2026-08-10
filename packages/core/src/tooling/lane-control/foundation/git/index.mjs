/**
 * @fileoverview The git surface lane control is allowed to touch — all of it
 * READ-ONLY, all of it build-free.
 *
 * Two rules encoded here rather than left to callers:
 *
 * 1. EXIT CODES ARE CAPTURED DIRECTLY. `execFileSync` throws on a non-zero
 *    status and the throw is what we read. Nothing here pipes git into
 *    another process, because a pipe reports the PIPE's status and that
 *    defect has already reported red gates as green in this programme.
 *
 * 2. THE FILE UNIVERSE INCLUDES UNTRACKED FILES. `git ls-files --cached`
 *    alone would miss every file a lane is about to create, and a lane's
 *    collisions with files that do not exist yet are exactly what the
 *    territory algebra is for. `--others --exclude-standard` adds the
 *    untracked-but-not-ignored ones, which is what a diff would show.
 */
import { execFileSync } from 'node:child_process';

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

export function repoRoot(from = process.cwd()) {
  return git(['rev-parse', '--show-toplevel'], from).trim();
}

export function headSha(root, { short = true } = {}) {
  return git(['rev-parse', ...(short ? ['--short'] : []), 'HEAD'], root).trim();
}

export function headMeta(root) {
  const line = git(['log', '-1', '--format=%h%x1f%H%x1f%cI%x1f%s'], root).trim();
  const [short, full, committedAt, subject] = line.split('\u001f');
  return { short, full, committedAt, subject };
}

function splitNul(output) {
  return output.split('\u0000').filter((entry) => entry.length > 0);
}

/** Every file git can see: tracked plus untracked-and-not-ignored. */
export function listFiles(root) {
  return splitNul(git(['ls-files', '-z', '--cached', '--others', '--exclude-standard'], root));
}

/**
 * Changed paths for the post-hoc containment check.
 *
 * A RENAME CONTRIBUTES BOTH PATHS. Moving a file out of a lane's territory is
 * a write to the destination and a deletion at the source; a containment
 * check that only saw the destination would wave through a lane that deleted
 * somebody else's file.
 *
 * modes:
 *   worktree (default) — uncommitted work, including untracked files
 *   staged             — the index against HEAD
 *   range              — `git diff A..B`, for auditing a finished lane
 */
export function changedPaths(root, { mode = 'worktree', range = null } = {}) {
  const entries = [];

  const pushRename = (status, oldPath, newPath) => {
    entries.push({ status, path: oldPath, role: 'rename-source' });
    entries.push({ status, path: newPath, role: 'rename-target' });
  };

  if (mode === 'range') {
    if (!range) throw new Error('lane-control: --range requires a revision range, e.g. abc123..HEAD');
    const fields = splitNul(git(['diff', '--name-status', '-M', '-z', range], root));
    for (let i = 0; i < fields.length; ) {
      const status = fields[i];
      if (status.startsWith('R') || status.startsWith('C')) {
        pushRename(status, fields[i + 1], fields[i + 2]);
        i += 3;
      } else {
        entries.push({ status, path: fields[i + 1], role: 'change' });
        i += 2;
      }
    }
    return entries;
  }

  if (mode === 'staged') {
    const fields = splitNul(git(['diff', '--cached', '--name-status', '-M', '-z'], root));
    for (let i = 0; i < fields.length; ) {
      const status = fields[i];
      if (status.startsWith('R') || status.startsWith('C')) {
        pushRename(status, fields[i + 1], fields[i + 2]);
        i += 3;
      } else {
        entries.push({ status, path: fields[i + 1], role: 'change' });
        i += 2;
      }
    }
    return entries;
  }

  if (mode !== 'worktree') throw new Error(`lane-control: unknown diff mode "${mode}"`);

  // `status --porcelain=v1 -z` is the only form that reports staged, unstaged
  // and untracked in one pass without a second invocation to reconcile.
  const fields = splitNul(git(['status', '--porcelain=v1', '-z', '--untracked-files=all'], root));
  for (let i = 0; i < fields.length; i += 1) {
    const entry = fields[i];
    const status = entry.slice(0, 2);
    const path = entry.slice(3);
    if (status.includes('R') || status.includes('C')) {
      // porcelain -z emits the rename source as the NEXT record.
      const source = fields[i + 1];
      i += 1;
      pushRename(status.trim(), source, path);
      continue;
    }
    entries.push({ status: status.trim(), path, role: 'change' });
  }
  return entries;
}

export function isDirty(root) {
  return git(['status', '--porcelain=v1'], root).trim().length > 0;
}
