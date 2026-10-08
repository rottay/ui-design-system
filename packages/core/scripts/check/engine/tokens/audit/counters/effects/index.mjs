import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { countPremiumEffectConsumers } from '../../../../../../libraries/engine/consumers/effects/index.mjs';
import { collectSkinFiles } from '../../../../../../libraries/engine/skins/files/index.mjs';
import { componentsDir, root } from '../../context/paths/index.mjs';

/**
 * Count render-owned files that CONSUME each sanctioned premium effect family
 * (spec section 5): gradient (surface-tint + accent), glass (overlay backdrops),
 * signal-glow. Stage 1 moved component paint from TSX into unlayered skin CSS,
 * so the consumer set is now src/components + src/graphics/motion + source skin files.
 * Only the source skins are scanned (never their two entrypoint imports or
 * generated bundles), and the helper de-duplicates paths. In CSS, only values
 * of painted declarations count; custom-property definitions/aliases do not.
 * The compiler, useTokens() catalog, tenant artifacts, and token-definition
 * sheets remain outside the consumer set. The premium layer measured 1/0/0
 * (gradient/glass/glow) dead at the 2026-07-06 baseline; WO-ENG-05 wires each
 * family to > 0 sanctioned consumers (enforced as a floor via MIN below).
 */
function countEffectConsumers() {
  const roots = [componentsDir, join(root, 'src/graphics/motion')];
  const sourceFiles = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = full.replace(/\\/g, '/');
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(full)) continue;
      if (/__tests__|\.(test|spec|stories)\./.test(rel)) continue;
      sourceFiles.push(full);
    }
  }
  for (const r of roots) walk(r);
  return countPremiumEffectConsumers({
    sourceFiles,
    skinFiles: collectSkinFiles(),
  });
}

export {
  countEffectConsumers,
};
