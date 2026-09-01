/**
 * The ONE skin-file walker (extracted from engine-token-audit.mjs so gates can
 * import it WITHOUT executing the audit's top-level census — the audit module
 * computes its counters at import time by design, which made it unimportable).
 * Both the audit and literal-ownership-gate consume this module: one walker,
 * one corpus definition, never a second measurement.
 *
 * Every unlayered skin stylesheet: the per-engine homes plus the agnostic one.
 */
import { readdirSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot } from '../../../repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(HERE);

/**
 * `root` defaults to the real package root, so every existing caller
 * (engine-token-audit, literal-ownership-gate, cascade-wiring-ratchet) is
 * unaffected. A drill that needs the walker to discover a planted file
 * without writing into the real tree passes a sandbox root instead.
 */
export function collectSkinFiles(root = DEFAULT_ROOT) {
  const skins = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.css') && full.includes(`${sep}skin${sep}`)) skins.push(full);
    }
  };
  walk(join(root, 'src/foundation/tokens/css/runtime/engines'));
  walk(join(root, 'src/foundation/tokens/css/presentation/components/skin'));
  return skins;
}
