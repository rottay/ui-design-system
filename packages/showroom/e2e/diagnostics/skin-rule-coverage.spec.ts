import { test } from '@playwright/test';
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

// ---------------------------------------------------------------------------
// Dead-selector audit (P-79).
//
// Three ways a skin can silently paint nothing, and we only guard two:
//   - it does not PARSE            -> skins.parseErrors
//   - it is never IMPORTED         -> skins.unwired
//   - its selectors MATCH NOTHING  -> nothing catches this
//
// The third silence is the one P-79 exposed: `data-part` is declared on every
// component but Grid/Card drop it (and Button drops it in modern), so a rule
// anchored on a part that never lands simply never fires. tsc is happy, the
// paint counter does not read attributes, and the pixels are wrong.
//
// This is not a static check -- whether a selector matches is a fact about the
// DOM, so we ask a real browser.
//
// THE FALSE-POSITIVE PROBLEM, and how it is resolved: a selector legitimately
// matches nothing when its component is simply not rendered on the page we are
// looking at. So a zero-match rule proves nothing on its own. What we report
// instead is a rule that matches nothing **while other rules from the SAME
// skin file DO match** -- that means the component IS on the page and this one
// rule still reaches nobody. That is the signal; everything else is noise.
//
// Interaction pseudo-classes are stripped before querying (`:hover` matches
// nothing at rest, which says nothing about the rule) and so are pseudo-
// elements (`::after` always exists if its base matches).
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_CSS = join(HERE, '../../../core/src/tokens/css');
const SKIN_DIRS = [
  ['modern', join(CORE_CSS, 'engines/modern/skin')],
  ['rustic', join(CORE_CSS, 'engines/rustic/skin')],
  ['agnostic', join(CORE_CSS, 'components/skin')],
] as const;

// EVERY section flag the torture page understands, read off the page source --
// not a hand-written list. An under-visited page reports live rules as dead:
// the first run of this audit omitted `pickers`, `overlay` and `tablestates`
// and duly "found" select, date-picker, toast and the table's sort indicators
// to be dead. They were simply never rendered.
const TORTURE_SECTIONS = [
  'datatable', 'detailpanel', 'display1', 'display2', 'dropdowns', 'fieldfilters',
  'fields', 'filterpanel', 'forms', 'interactive', 'layout', 'nav', 'overlay',
  'overlayfb', 'pickers', 'rail', 'record', 'rtl', 'statusfb', 'tablestates',
];

type Rule = { engine: string; file: string; selector: string; probe: string; skeleton: string };

/** Strip what cannot match at rest: interaction pseudo-classes and pseudo-elements. */
function toProbe(selector: string): string | null {
  let s = selector
    .replace(/::[a-z-]+(\([^)]*\))?/g, '')
    .replace(/:(hover|focus|focus-visible|focus-within|active|target|checked|disabled|enabled|placeholder-shown|autofill|visited|link|empty)\b/g, '');
  s = s.trim();
  if (!s || s.startsWith('@') || s.includes('%')) return null;
  // A selector reduced to nothing but a combinator is not probeable.
  if (/^[>+~,\s]*$/.test(s)) return null;
  return s;
}

/**
 * The STRUCTURAL skeleton: classes and `data-part` only. Every other attribute
 * is dropped.
 *
 * This is the discriminator that makes the audit mean something. A rule can fail
 * to match for two completely different reasons, and only one of them is a bug:
 *
 *   - `[data-variant='outline']` matches nothing because the page renders no
 *     outline button. The rule is FINE; the FIXTURE is thin. (Still worth
 *     knowing -- an unrendered state is an unphotographed state, so no baseline
 *     can catch a regression in it -- but it is not a dead rule.)
 *   - `[data-part='sort-indicator']` matches nothing even with every state
 *     attribute stripped. Then the PART ITSELF is not in the DOM, and no value
 *     of any state attribute would ever bring it back. The rule reaches nobody.
 *     That is the P-79 shape, and it is a bug.
 *
 * So: probe the full selector to measure fixture coverage, and probe the
 * skeleton to find genuinely dead anchors.
 */
function toSkeleton(probe: string): string | null {
  const s = probe
    .replace(/\[(?!data-part)[^\]]*\]/g, '')
    .replace(/:not\([^)]*\)/g, '')
    .trim();
  if (!s || /^[>+~,\s]*$/.test(s)) return null;
  return s;
}

function collectRules(): Rule[] {
  const out: Rule[] = [];
  for (const [engine, dir] of SKIN_DIRS) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.css'))) {
      const css = readFileSync(join(dir, f), 'utf8');
      let root;
      try {
        root = postcss.parse(css);
      } catch {
        continue; // parseErrors already guards this
      }
      root.walkRules((rule) => {
        // Rules inside @keyframes are step selectors (`from`, `50%`), not DOM selectors.
        if (rule.parent?.type === 'atrule' && /keyframes/.test((rule.parent as postcss.AtRule).name)) return;
        for (const sel of rule.selectors) {
          const probe = toProbe(sel);
          if (!probe) continue;
          const skeleton = toSkeleton(probe);
          if (skeleton) out.push({ engine, file: f, selector: sel, probe, skeleton });
        }
      });
    }
  }
  return out;
}

test('dead-selector audit: a skin rule that reaches nobody', async ({ page }) => {
  test.setTimeout(600_000);
  const rules = collectRules();
  console.log(`### ${rules.length} probeable selectors across ${new Set(rules.map((r) => `${r.engine}/${r.file}`)).size} skin files`);

  const matched = new Set<number>();
  const skeletonMatched = new Set<number>();

  for (const engine of ['modern', 'rustic'] as const) {
    for (const section of TORTURE_SECTIONS) {
      const url = `/probe/whitelabel-torture?${section}=1&engine=${engine}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      } catch {
        continue;
      }
      const payload = rules.map((r) => [r.probe, r.skeleton] as const);
      const hits: Array<[boolean, boolean]> = await page.evaluate((sels) => {
        const ask = (s: string) => {
          try { return document.querySelector(s) !== null; } catch { return true; }
        };
        return sels.map(([p, k]) => [ask(p), ask(k)] as [boolean, boolean]);
      }, payload);
      hits.forEach(([full, skel], i) => {
        if (full) matched.add(i);
        if (skel) skeletonMatched.add(i);
      });
    }
  }

  // Group by skin file. A file with ZERO matches anywhere just was not rendered
  // on any page we visited -- that is a coverage gap in the torture page, not a
  // dead rule, and we must not report it as one.
  const byFile = new Map<string, { total: number; unexercised: Rule[]; deadAnchor: Rule[] }>();
  rules.forEach((r, i) => {
    const key = `${r.engine}/${r.file}`;
    if (!byFile.has(key)) byFile.set(key, { total: 0, unexercised: [], deadAnchor: [] });
    const e = byFile.get(key)!;
    e.total += 1;
    if (!matched.has(i)) e.unexercised.push(r);
    // The anchor itself is absent: no state attribute could ever revive it.
    if (!skeletonMatched.has(i)) e.deadAnchor.push(r);
  });

  const deadAnchors: Array<{ file: string; selectors: string[]; liveInFile: number }> = [];
  const thinFixtures: Array<{ file: string; unexercised: number; total: number }> = [];
  const uncovered: string[] = [];
  for (const [file, e] of byFile) {
    const anyAnchorLive = e.total - e.deadAnchor.length;
    if (anyAnchorLive === 0) { uncovered.push(file); continue; }   // component never rendered: says nothing
    if (e.deadAnchor.length > 0) {
      deadAnchors.push({ file, selectors: e.deadAnchor.map((d) => d.selector), liveInFile: anyAnchorLive });
    }
    if (e.unexercised.length > 0) {
      thinFixtures.push({ file, unexercised: e.unexercised.length, total: e.total });
    }
  }

  const report = {
    probeableSelectors: rules.length,
    skinFiles: byFile.size,
    // The component never rendered anywhere we looked. A torture-page coverage
    // gap; says nothing about the rules themselves.
    uncoveredFiles: uncovered.sort(),
    // THE BUG CLASS (P-79): the component IS rendered, and these rules' anchors
    // are absent from the DOM with every state attribute stripped. No value of
    // any attribute brings them back. They reach nobody.
    deadAnchors: deadAnchors.sort((a, b) => b.selectors.length - a.selectors.length),
    // NOT a bug, but a hole in the gate: the rule is fine, the fixture never
    // renders the state it keys on, so no baseline can catch a regression in it.
    thinFixtures: thinFixtures.sort((a, b) => b.unexercised - a.unexercised),
  };
  writeFileSync(join(HERE, '../../dead-selector-report.json'), JSON.stringify(report, null, 2));

  const totalUnexercised = thinFixtures.reduce((n, f) => n + f.unexercised, 0);
  console.log(`### uncovered skin files (component never rendered — torture-page gap): ${uncovered.length}`);
  console.log(`### DEAD ANCHORS — rules whose part is absent no matter the state: ${deadAnchors.length} files`);
  for (const d of deadAnchors.slice(0, 20)) {
    console.log(`###   ${d.file} — ${d.selectors.length} dead`);
    for (const sel of d.selectors.slice(0, 3)) console.log(`###       ${sel}`);
  }
  console.log(`### thin fixtures — rules NO baseline exercises at rest: ${totalUnexercised} of ${rules.length}`);
});
