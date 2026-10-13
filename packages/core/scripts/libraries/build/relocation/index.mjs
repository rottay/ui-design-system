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

/** Parse `--split` values: `<old path>=<new path>,<new path>,...`, each path
 * relative to the governed root, exactly as the counter keys spell it. */
export function parseSplitArguments(values) {
  return values.map((value) => {
    const separator = value.indexOf('=');
    const from = separator < 0 ? '' : value.slice(0, separator).trim();
    const to = separator < 0 ? [] : value.slice(separator + 1).split(',').map((path) => path.trim());
    if (!from || to.length === 0 || to.some((path) => !path)) {
      throw new Error(`--split expects <old path>=<new path>,<new path>,...; received ${JSON.stringify(value)}`);
    }
    return { from, to };
  });
}

/**
 * Distribute one path's ceilings over named new paths. A split is not a
 * rename, so Git cannot witness it: the witness is the measured audit. Under
 * every prefix that keys the old path, each named part receives exactly its
 * measured count and the parts must sum to the old ceiling; the old path keeps
 * a zero key while it still exists and loses its key when it is gone. Nothing
 * is distributed that was not measured, and no ceiling is created or widened.
 */
export function splitPathKeyedCounters(baseline, current, splits, {
  prefixes = ENGINE_PATH_COUNTER_PREFIXES,
} = {}) {
  const has = (record, key) => Object.prototype.hasOwnProperty.call(record, key);
  const replacements = new Map();
  const claimed = new Set();
  const distributed = [];
  const sources = new Set();
  for (const { from } of splits) {
    if (sources.has(from)) throw new Error(`baseline split names ${from} twice`);
    sources.add(from);
  }
  for (const { from, to } of splits) {
    if (!prefixes.some((prefix) => has(baseline, `${prefix}${from}`))) {
      throw new Error(`baseline split has no ceiling to distribute: ${from}`);
    }
    for (const path of to) {
      if (path === from || sources.has(path)) throw new Error(`baseline split part is a split source: ${path}`);
      if (claimed.has(path)) throw new Error(`baseline split names ${path} twice`);
      claimed.add(path);
    }
    for (const prefix of prefixes) {
      const key = `${prefix}${from}`;
      if (!has(baseline, key)) continue;
      const ceiling = baseline[key];
      const parts = to.map((path) => {
        const partKey = `${prefix}${path}`;
        if (has(baseline, partKey)) throw new Error(`baseline split collision: ${key} -> ${partKey}`);
        if (!has(current, partKey) || !Number.isInteger(current[partKey]) || current[partKey] < 0) {
          throw new Error(`baseline split part has no measured count: ${partKey}`);
        }
        return { key: partKey, value: current[partKey] };
      });
      const residue = has(current, key) ? current[key] : null;
      if (residue !== null && residue !== 0) {
        throw new Error(`baseline split source still measures ${residue}: ${key}`);
      }
      const sum = parts.reduce((total, part) => total + part.value, 0);
      if (sum !== ceiling) {
        throw new Error(`baseline split is not sum-preserving: ${key}=${ceiling}; measured parts sum to ${sum}`);
      }
      replacements.set(key, { retained: residue === 0, parts });
      distributed.push({ from: key, ceiling, retained: residue === 0, parts });
    }
  }

  const result = {};
  for (const [key, value] of Object.entries(baseline)) {
    const replacement = replacements.get(key);
    if (!replacement) {
      result[key] = value;
      continue;
    }
    if (replacement.retained) result[key] = 0;
    for (const part of replacement.parts) result[part.key] = part.value;
  }
  return { baseline: result, distributed };
}
