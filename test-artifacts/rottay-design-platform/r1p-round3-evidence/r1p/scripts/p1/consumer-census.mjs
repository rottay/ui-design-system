/**
 * P1 step 1b: repo-wide `var(--x)` consumer census.
 *
 * A channel is only a real channel if something reads it. Reader sources:
 * DS core source (ts/tsx/css, excluding the generated artifacts themselves and
 * the extensions that declare them), plus the three consuming apps.
 * Declarations inside the artifacts/_source do not count as reads.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const OUT = '/Users/daniel/Developer/Rottay/ui-design-system/test-artifacts/rottay-design-platform/r1p-round3-evidence/r1p/closure/remediation';
const ROOT = '/Users/daniel/Developer/Rottay';
const DS = `${ROOT}/ui-design-system/packages/core/src`;

const ROOTS = [
  { name: 'ds-core', path: DS },
  { name: 'ds-showroom', path: `${ROOT}/ui-design-system/packages/showroom/src` },
  { name: 'app-bithire', path: `${ROOT}/app-bithire/src` },
  { name: 'app-evnto', path: `${ROOT}/app-evnto/src` },
  { name: 'app-platform', path: `${ROOT}/app-platform/src` },
];

// Files that DECLARE the channels; a `var()` inside them is a fallback chain,
// which we count separately (self-reference is not proof of a consumer).
const DECLARERS = /facade\/artifacts\/(bithire|evnto|rottay)\//;

function listFiles(root) {
  try {
    return execFileSync('find', [root, '-type', 'f', '(',
      '-name', '*.ts', '-o', '-name', '*.tsx', '-o', '-name', '*.css',
      '-o', '-name', '*.js', '-o', '-name', '*.jsx', '-o', '-name', '*.scss', ')',
      '-not', '-path', '*/node_modules/*'], { encoding: 'utf-8', maxBuffer: 1 << 28 })
      .split('\n').filter(Boolean);
  } catch { return []; }
}

const VAR_READ = /var\(\s*(--[A-Za-z0-9_-]+)/g;
const census = {};   // var -> { total, byRoot:{}, selfOnly:boolean, files:[] }

for (const { name, path } of ROOTS) {
  for (const file of listFiles(path)) {
    let text;
    try { text = readFileSync(file, 'utf-8'); } catch { continue; }
    if (!text.includes('var(--')) continue;
    const isDeclarer = DECLARERS.test(file);
    const isTest = /\/tests?\/|\.test\.|__tests__/.test(file);
    VAR_READ.lastIndex = 0;
    let mch;
    const seen = new Set();
    while ((mch = VAR_READ.exec(text))) {
      const v = mch[1];
      const rec = (census[v] ??= { total: 0, real: 0, byRoot: {}, declarerHits: 0, testHits: 0, files: [] });
      rec.total += 1;
      if (isDeclarer) { rec.declarerHits += 1; continue; }
      if (isTest) { rec.testHits += 1; continue; }
      rec.real += 1;
      rec.byRoot[name] = (rec.byRoot[name] ?? 0) + 1;
      if (!seen.has(v) && rec.files.length < 8) { rec.files.push(file.replace(ROOT + '/', '')); seen.add(v); }
    }
  }
}

writeFileSync(`${OUT}/p1-consumer-census.json`, JSON.stringify(census, null, 1));
const withReal = Object.values(census).filter((c) => c.real > 0).length;
console.log(`census: ${Object.keys(census).length} distinct vars referenced; ${withReal} with a non-declarer non-test reader`);
