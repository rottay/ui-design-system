/**
 * root-catalog-freshness-gate — the 63-root cascade catalog must describe the
 * tree as it exists today.
 *
 * `manifest/cascade/root-catalog.json` names every internal cascade root, its
 * head channel and a channelStatus:
 *   - `existe`         — the channel has at least one `--ds-<channel>:`
 *                        declaration in authored CSS under `src/`.
 *   - `por-crear`      — no declaration exists yet (F2 materializes these).
 *   - `solo-artefacto` — the channel is born at compile time; zero
 *                        declarations in authored CSS by design.
 * Until now nothing read the catalog — not even a freshness check — so the
 * constitution of the cascade could rot in silence. This gate re-derives the
 * declaration set from authored CSS under `src/` and fails on any disagreement:
 * `existe` root with no declaration, or a `por-crear`/`solo-artefacto` root
 * that gained one without the catalog being updated.
 *
 * Usage: node scripts/root-catalog-freshness-gate.mjs
 * Exit 0 = catalog and tree agree. Exit 1 = disagreements, each reported.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = join(HERE, '..');
const CATALOG_PATH = join(
  CORE_ROOT,
  'scripts/quality-evidence/programs/modern-rescue/manifest/cascade/root-catalog.json',
);

function* walkCss(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (entry === 'node_modules') continue;
      yield* walkCss(path);
    } else if (entry.endsWith('.css')) {
      yield path;
    }
  }
}

const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
const roots = catalog.roots ?? [];

// The declared-channel set: every `--ds-<name>:` definition in authored CSS.
const DECLARATION = /(--ds-[a-zA-Z0-9-]+)\s*:/g;
const declared = new Set();
for (const file of walkCss(join(CORE_ROOT, 'src'))) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(DECLARATION)) declared.add(match[1]);
}

const failures = [];
const counts = { existe: 0, 'por-crear': 0, 'solo-artefacto': 0, sinCanal: 0 };

for (const root of roots) {
  const status = root.channelStatus;
  const channel = root.channel;
  if (!channel) {
    counts.sinCanal += 1;
    continue;
  }
  counts[status] = (counts[status] ?? 0) + 1;
  const isDeclared = declared.has(channel);
  if (status === 'existe' && !isDeclared) {
    failures.push(`${root.rootId}: catalog says 'existe' but ${channel} has no declaration in src/`);
  }
  if ((status === 'por-crear' || status === 'solo-artefacto') && isDeclared) {
    failures.push(
      `${root.rootId}: catalog says '${status}' but ${channel} is now declared in src/ — update the catalog`,
    );
  }
}

if (failures.length > 0) {
  console.error('root-catalog-freshness-gate: FAIL — the cascade catalog disagrees with the tree:');
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(
  `root-catalog-freshness-gate: OK — ${roots.length} roots agree with src/ ` +
    `(${counts.existe} existe, ${counts['por-crear']} por-crear, ${counts['solo-artefacto']} solo-artefacto).`,
);
