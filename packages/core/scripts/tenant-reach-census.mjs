/**
 * How far does a tenant's decision actually travel?
 *
 * A white-label system is only as expressive as the distance between the knob and the pixel. This
 * census measures that distance from the TENANT's side rather than the token's: for every custom
 * property a tenant sets, how many files in the Modern-reachable corpus read it?
 *
 * A token set by a tenant and read by nobody is a decision that cannot land. A token read by one
 * file is a decision that moves one place, which is not a product axis. Both are invisible to the
 * existing gates, because nothing there is wrong: the property is declared, the chain resolves, no
 * rule is dead. It simply never reaches enough of the screen to change what the product looks like.
 *
 * Usage:
 *   node scripts/tenant-reach-census.mjs                 # every tenant, summary
 *   node scripts/tenant-reach-census.mjs --tenant=bithire --detail
 *   node scripts/tenant-reach-census.mjs --json
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE = join(HERE, '..');
const SRC = join(CORE, 'src');

/**
 * The corpus a Modern-engine tenant can actually be seen through: the engine skin, the shared
 * engine-agnostic presentation skin, and component source. Deliberately NOT the tenant artifacts
 * themselves -- an artifact declaring a token is the tenant SETTING it, never a reader.
 */
const READER_ROOTS = [
  join(SRC, 'foundation/tokens/css/runtime/engines/modern'),
  join(SRC, 'foundation/tokens/css/presentation/components'),
  join(SRC, 'ui'),
];

function walk(dir, exts, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(full, exts, acc);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) acc.push(full);
  }
  return acc;
}

const blankComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

/** name -> number of distinct files that read it through var(). */
function readerIndex() {
  const index = new Map();
  const files = READER_ROOTS.flatMap((root) => walk(root, ['.css', '.ts', '.tsx']));
  for (const file of files) {
    const source = blankComments(readFileSync(file, 'utf8'));
    const seen = new Set();
    for (const match of source.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)) seen.add(match[1]);
    for (const name of seen) index.set(name, (index.get(name) ?? 0) + 1);
  }
  return index;
}

/** Every `--ds-*` a tenant SETS: declared in its compiled artifact, or authored in its DB document. */
function tenantDeclarations() {
  const tenants = new Map();

  const artifactRoot = join(SRC, 'foundation/tokens/css/facade/artifacts');
  if (existsSync(artifactRoot)) {
    for (const entry of readdirSync(artifactRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = join(artifactRoot, entry.name, 'index.css');
      if (!existsSync(file)) continue;
      const css = blankComments(readFileSync(file, 'utf8'));
      const names = new Set();
      for (const match of css.matchAll(/(^|[\s;{])(--ds-[a-z0-9-]+)\s*:/g)) names.add(match[2]);
      /* Names the artifact reads back itself -- a compiler chain, not a component reader. */
      const selfRead = new Set();
      for (const match of css.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)) selfRead.add(match[1]);
      tenants.set(entry.name, { source: 'static artifact', names, selfRead });
    }
  }

  const fixtureRoot = join(SRC, 'foundation/contracts/composition/tenants/themes/tenant-theme/fixtures');
  if (existsSync(fixtureRoot)) {
    for (const entry of readdirSync(fixtureRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = join(fixtureRoot, entry.name, 'index.ts');
      if (!existsSync(file)) continue;
      const source = blankComments(readFileSync(file, 'utf8'));
      const names = new Set();
      for (const match of source.matchAll(/['"](--ds-[a-z0-9-]+)['"]\s*:/g)) names.add(match[1]);
      const selfRead = new Set();
      for (const match of source.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)) selfRead.add(match[1]);
      if (names.size > 0) tenants.set(entry.name, { source: 'DB document', names, selfRead });
    }
  }

  return tenants;
}

export function census() {
  const readers = readerIndex();
  const rows = [];
  for (const [tenant, { source, names, selfRead }] of tenantDeclarations()) {
    /*
     * A compiler chain is not a dead knob. `--ds-input-shadow-rest: var(--ds-material-inset-shadow)`
     * lives entirely inside the artifact: no component names it, yet it carries a tenant decision
     * onward to one that IS read. Counting those as unreachable inflated the figure by 27 for
     * bithire, so they are reported as their own column rather than folded into either side.
     */
    const reach = [...names].map((name) => ({
      name,
      readers: readers.get(name) ?? 0,
      compilerChain: (readers.get(name) ?? 0) === 0 && selfRead.has(name),
    }));
    reach.sort((a, b) => a.readers - b.readers || a.name.localeCompare(b.name));
    rows.push({
      tenant,
      source,
      declared: reach.length,
      unreachable: reach.filter((entry) => entry.readers === 0 && !entry.compilerChain).length,
      compilerChain: reach.filter((entry) => entry.compilerChain).length,
      thin: reach.filter((entry) => entry.readers > 0 && entry.readers <= 2).length,
      reach,
    });
  }
  rows.sort((a, b) => a.tenant.localeCompare(b.tenant));
  return rows;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const rows = census();
  const wanted = process.argv.find((arg) => arg.startsWith('--tenant='))?.split('=')[1];
  const selected = wanted ? rows.filter((row) => row.tenant === wanted) : rows;

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(selected, null, 2));
  } else {
    for (const row of selected) {
      console.log(
        `${row.tenant} (${row.source}): ${row.declared} declared | ${row.unreachable} reach NOTHING`
          + ` | ${row.compilerChain} compiler-chain | ${row.thin} reach 1-2 files`,
      );
      if (process.argv.includes('--detail')) {
        for (const entry of row.reach.filter((item) => item.readers <= 2)) {
          console.log(`    ${String(entry.readers).padStart(3)}  ${entry.name}`);
        }
      }
    }
    console.log('\nA token a tenant sets and nobody reads is a decision that cannot land.');
  }
}
