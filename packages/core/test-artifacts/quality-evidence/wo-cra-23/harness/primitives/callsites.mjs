#!/usr/bin/env node
/**
 * WO-CRA-23 primitives census — instrument 3: call sites that pass `data-part`
 * to a DS component.
 *
 * A skin at risk with no caller passing a part has zero live impact, so this is
 * the ranking axis. AST, because `data-part` also appears in strings, comments,
 * CSS-in-JS and selector literals, and a text scan cannot tell a JSX attribute
 * from a selector string.
 */
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CORE = new URL('../../../../../', import.meta.url).pathname.replace(/\/$/, '');
const req = createRequire(CORE + '/package.json');
const ts = req('typescript');

// The monorepo root, three levels above packages/core. Sibling app repos are
// checkouts beside it; a missing one is reported ABSENT rather than skipped, so
// a shrunken corpus never reads as a shrunken finding.
// primitives → harness → wo-cra-23 → quality-evidence → test-artifacts → core
// → packages → ui-design-system → Rottay. Eight, not seven: at seven every
// sibling repo reports ABSENT and the census quietly loses app-bithire's 46.
const MONO = new URL('../../../../../../../../', import.meta.url).pathname.replace(/\/$/, '');
const CONTROL = process.argv.includes('--control');

const CORPORA = CONTROL
  ? [['control', new URL('./control/', import.meta.url).pathname.replace(/\/$/, '')]]
  : [
      ['ds-core', join(CORE, 'src')],
      ['ds-showroom', join(MONO, 'ui-design-system/packages/showroom/src')],
      ['app-bithire', join(MONO, 'app-bithire/src')],
      ['app-platform', join(MONO, 'app-platform/src')],
      ['app-evnto', join(MONO, 'app-evnto/src')],
    ];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (e === 'node_modules' || e === '.next' || e === 'dist' || e === '.git') continue;
    const p = join(dir, e);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (/\.tsx$/.test(p)) out.push(p);
  }
  return out;
}

const sites = [];
const corpusStats = {};
for (const [label, dir] of CORPORA) {
  if (!existsSync(dir)) { corpusStats[label] = { files: 0, present: false }; continue; }
  const files = walk(dir);
  corpusStats[label] = { files: files.length, present: true, sites: 0 };
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    if (!text.includes('data-part')) continue;
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (n) => {
      if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
        const tag = n.tagName.getText();
        // A lowercase tag is a host element stamping its own part, not a call
        // into a DS component.
        if (/^[a-z]/.test(tag)) { ts.forEachChild(n, visit); return; }
        for (const a of n.attributes.properties) {
          if (!ts.isJsxAttribute(a)) continue;
          if (a.name.getText().replace(/^['"]|['"]$/g, '') !== 'data-part') continue;
          const init = a.initializer;
          const value = init && ts.isStringLiteral(init) ? init.text
            : init && ts.isJsxExpression(init) && init.expression && ts.isStringLiteral(init.expression) ? init.expression.text
            : init ? init.getText().slice(0, 40) : 'true';
          const dynamic = !(init && (ts.isStringLiteral(init) ||
            (ts.isJsxExpression(init) && init.expression && ts.isStringLiteral(init.expression))));
          sites.push({
            corpus: label, file: file.replace(dir + '/', ''), tag, value, dynamic,
            line: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1,
          });
          corpusStats[label].sites++;
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
}

if (CONTROL) {
  // The fixture plants 3 component call sites (one of them dynamic) and 5 traps:
  // a selector string, prose, a host element, and the name inside another attribute.
  const tags = sites.map((s) => `${s.tag}:${s.value}`).sort();
  // A dynamic value is stored as its source text, not as a resolved value.
  const want = ['Badge:count-badge', 'Badge:wip-badge', 'Badge:{dynamic}'];
  const okCount = JSON.stringify(tags) === JSON.stringify(want);
  const okDynamic = sites.filter((s) => s.dynamic).length === 1;
  const okHost = !sites.some((s) => /^[a-z]/.test(s.tag));
  const checks = [
    [okCount, 'counts exactly the three component data-part attributes, ignoring the selector string, the prose and the aria-describedby value'],
    [okDynamic, 'flags exactly one dynamic value'],
    [okHost, 'never counts a host element (<span data-part>)'],
  ];
  for (const [ok, what] of checks) console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  console.log(`\ncall-site control: ${checks.filter(([o]) => o).length} pass / ${checks.filter(([o]) => !o).length} fail`);
  if (!okCount) console.log('  got:', JSON.stringify(tags));
  process.exit(checks.every(([o]) => o) ? 0 : 1);
}

writeFileSync(new URL('./callsites.json', import.meta.url).pathname, JSON.stringify({ corpusStats, sites }, null, 1));

console.log('corpora scanned:');
for (const [k, v] of Object.entries(corpusStats)) {
  console.log(`  ${k.padEnd(14)} ${v.present ? `${String(v.files).padStart(5)} .tsx files, ${v.sites} data-part call sites` : 'ABSENT'}`);
}
console.log(`\ntotal call sites passing data-part to a component: ${sites.length}`);
console.log(`  dynamic (value not a literal): ${sites.filter((s) => s.dynamic).length}`);

const byTag = {};
for (const s of sites) {
  byTag[s.tag] = byTag[s.tag] || { n: 0, corpora: new Set(), values: new Set(), files: new Set() };
  byTag[s.tag].n++;
  byTag[s.tag].corpora.add(s.corpus);
  byTag[s.tag].values.add(s.value);
  byTag[s.tag].files.add(s.corpus + '/' + s.file);
}
console.log('\nCOMPONENT                sites  files  corpora            distinct parts passed');
for (const [tag, v] of Object.entries(byTag).sort((a, b) => b[1].n - a[1].n)) {
  console.log(`${tag.padEnd(24)} ${String(v.n).padStart(5)}  ${String(v.files.size).padStart(5)}  ${[...v.corpora].join(',').padEnd(18)} ${[...v.values].slice(0, 5).join(' ')}${v.values.size > 5 ? ` +${v.values.size - 5}` : ''}`);
}
