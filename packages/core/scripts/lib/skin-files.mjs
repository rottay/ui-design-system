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
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function collectSkinFiles() {
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
