import fs from 'node:fs';
import path from 'node:path';
import { createWorkspace } from '../index.mjs';

/**
 * What this checkout publishes: the `package.json` subpaths and the names each JavaScript door exports.
 * A re-point consults it, so a rewrite only lands on a name the target door really publishes.
 */
export function createPackageSurface(coreRoot) {
  const manifest = JSON.parse(fs.readFileSync(path.join(coreRoot, 'package.json'), 'utf8'));
  const published = Object.keys(manifest.exports ?? {});
  const sources = { '.': 'index.ts', ...(manifest.releaseSync?.sourceEntrypoints ?? {}) };
  const workspace = createWorkspace({ packageName: '\0none' });
  const cache = new Map();

  function isPublished(subpath) {
    return published.some((key) => {
      if (!key.includes('*')) return key === subpath;
      const [head, tail] = key.split('*');
      return subpath.length > head.length + tail.length && subpath.startsWith(head) && subpath.endsWith(tail);
    });
  }

  /** Names the door exports, or null when the door has no source entrypoint or its star chain leaves the tree. */
  function exportsOf(subpath) {
    if (cache.has(subpath)) return cache.get(subpath);
    let names = null;
    const relative = sources[subpath];
    const file = relative ? path.join(coreRoot, 'src', relative) : null;
    if (file && /\.tsx?$/.test(file) && fs.existsSync(file) && isPublished(subpath)) {
      const result = workspace.exportNames(file);
      if (result.complete) names = result.names;
    }
    cache.set(subpath, names);
    return names;
  }

  return { packageName: manifest.name, published, isPublished, exportsOf };
}
