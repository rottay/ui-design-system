import { relative, resolve, sep } from 'node:path';

export const ENGINE_PATH_COUNTER_PREFIXES = Object.freeze([
  'arc09.inlinePaint.',
  'fleet.inlinePaint.',
  'runtimeSvgPaint.',
  'embeddedCssPaint.',
]);

function posix(path) {
  return path.split(sep).join('/');
}

function relativeInside(root, path) {
  const value = posix(relative(resolve(root), resolve(path)));
  if (value === '..' || value.startsWith('../')) return null;
  return value;
}

export function parseGitRenameStatus(output, {
  repositoryRoot,
  oldRoot,
  newRoot = oldRoot,
} = {}) {
  if (!repositoryRoot || !oldRoot) throw new Error('repositoryRoot and oldRoot are required');
  const absoluteOldRoot = resolve(repositoryRoot, oldRoot);
  const absoluteNewRoot = resolve(repositoryRoot, newRoot);
  const renames = [];
  for (const line of output.split(/\r?\n/u)) {
    if (!line) continue;
    const [status, from, to] = line.split('\t');
    if (!/^R\d+$/u.test(status ?? '') || !from || !to) continue;
    const oldPath = relativeInside(absoluteOldRoot, resolve(repositoryRoot, from));
    const newPath = relativeInside(absoluteNewRoot, resolve(repositoryRoot, to));
    if (oldPath === null || newPath === null || oldPath === newPath) continue;
    renames.push({ from: oldPath, to: newPath });
  }
  return renames.sort((left, right) => left.from.localeCompare(right.from));
}

export function relocatePathKeyedCounters(baseline, renames, {
  prefixes = ENGINE_PATH_COUNTER_PREFIXES,
} = {}) {
  const destinationByKey = new Map();
  for (const { from, to } of renames) {
    for (const prefix of prefixes) destinationByKey.set(`${prefix}${from}`, `${prefix}${to}`);
  }

  const relocated = [];
  const result = {};
  for (const [key, value] of Object.entries(baseline)) {
    const destination = destinationByKey.get(key) ?? key;
    if (Object.prototype.hasOwnProperty.call(result, destination)) {
      throw new Error(`baseline relocation collision: ${key} -> ${destination}`);
    }
    result[destination] = value;
    if (destination !== key) relocated.push({ from: key, to: destination, value });
  }
  return { baseline: result, relocated };
}

export function adoptNewZeroPathCounters(baseline, current, {
  prefixes = ENGINE_PATH_COUNTER_PREFIXES,
} = {}) {
  const result = { ...baseline };
  const adopted = [];
  const refused = [];
  for (const [key, value] of Object.entries(current)) {
    if (!prefixes.some((prefix) => key.startsWith(prefix))) continue;
    if (Object.prototype.hasOwnProperty.call(result, key)) continue;
    if (value !== 0) {
      refused.push({ key, value });
      continue;
    }
    result[key] = 0;
    adopted.push(key);
  }
  return { baseline: result, adopted, refused };
}
