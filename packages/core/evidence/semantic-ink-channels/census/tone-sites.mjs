/**
 * Census: every consumer that can reach the three modern typography tone
 * rules (`.rottay-typography--modern[data-color='success'|'warning'|'error']`).
 *
 * The rules bind to Typography-rendered nodes only, so the population is
 * "a Typography-family element with a tone-capable `color` value". Comments
 * are blanked before scanning, because the docblock examples in the engines,
 * Checkbox and Toggle are not call sites.
 *
 *   node evidence/semantic-ink-channels/census/tone-sites.mjs > tone-sites.json
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const CORE = resolve(import.meta.dirname, '../../..');
const MONOREPO = resolve(CORE, '../../..');

const ROOTS = [
  { id: 'ds-core', dir: resolve(CORE, 'src') },
  { id: 'ds-showroom', dir: resolve(CORE, '../showroom/src') },
  { id: 'app-bithire', dir: resolve(MONOREPO, 'app-bithire/src') },
  { id: 'app-platform', dir: resolve(MONOREPO, 'app-platform/src') },
  { id: 'app-evnto', dir: resolve(MONOREPO, 'app-evnto/src') },
];

const TYPO = /^(Text|Typography(\.[A-Za-z]+)?|TypographyText|ModernText|ClassicText|RusticText|Title|Paragraph|Caption)$/;
const TONE = /\bsuccess\b|\bwarning\b|\berror\b/;
const NON_TONE = /undefined|inherit|muted|secondary|subtle|default|primary|tertiary/;

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));
}

const rows = [];
for (const root of ROOTS) {
  let files = [];
  try {
    files = execSync(`find ${root.dir} -name '*.tsx'`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch {
    continue;
  }
  for (const file of files) {
    const src = stripComments(readFileSync(file, 'utf8'));
    const re = /<([A-Z][A-Za-z0-9_.]*)\b([^>]*?)\/?>/gs;
    let m;
    while ((m = re.exec(src)) !== null) {
      const [, tag, attrs] = m;
      if (!TYPO.test(tag)) continue;
      const cm = attrs.match(/\bcolor\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\}|"[^"]*"|'[^']*')/s);
      if (!cm) continue;
      const value = cm[1].replace(/\s+/g, ' ');
      const literal = /^["']/.test(value);
      if (!(TONE.test(value) || (!literal && !NON_TONE.test(value)))) continue;
      rows.push({
        root: root.id,
        file: file.slice(MONOREPO.length + 1),
        line: src.slice(0, m.index).split('\n').length,
        tag,
        value,
        kind: /\.(test|stories)\.tsx$/.test(file) ? 'test-or-story' : 'production',
      });
    }
  }
}

const production = rows.filter((r) => r.kind === 'production');
console.log(
  JSON.stringify(
    {
      generated: new Date().toISOString().slice(0, 10),
      totals: {
        rows: rows.length,
        production: production.length,
        productionFiles: new Set(production.map((r) => r.file)).size,
        byRoot: Object.fromEntries(
          ROOTS.map((r) => [r.id, production.filter((p) => p.root === r.id).length]),
        ),
      },
      rows,
    },
    null,
    2,
  ),
);
