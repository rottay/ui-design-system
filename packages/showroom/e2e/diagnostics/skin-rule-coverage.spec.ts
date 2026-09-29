import { test, expect, type Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectRules, isForeignVendorSelector, postureSettled, probeSelectors, SKIN_DIRS } from './skin-rule-coverage.lib.mjs';
import { classifyReport, type DeadSelectorReport } from './dead-anchor-classification.lib.mjs';
import { expectHydrated } from '../support/hydration';

// ---------------------------------------------------------------------------
// Dead-selector audit (P-79).
//
// Three ways a skin can silently paint nothing, and we only guard two
// statically:
//   - it does not PARSE            -> skins.parseErrors
//   - it is never IMPORTED         -> skins.unwired
//   - its selectors MATCH NOTHING  -> nothing static catches this
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
// elements (`::after` always exists if its base matches). Rule collection lives
// in ./skin-rule-coverage.lib.mjs so a node unit test can prove this spec is not
// vacuous without a browser.
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));

// EVERY section flag the torture page understands, read off the page source --
// not a hand-written list. An under-visited page reports live rules as dead:
// the first run of this audit omitted `pickers`, `overlay` and `tablestates`
// and duly "found" select, date-picker, toast and the table's sort indicators
// to be dead. They were simply never rendered.
const TORTURE_SECTIONS = [
  'datatable', 'detailpanel', 'mediaStates', 'dataDisplayStates', 'dropdowns', 'fieldfilters',
  'fields', 'filterpanel', 'forms', 'interactive', 'layout', 'nav', 'overlay',
  'overlayfb', 'pickers', 'rail', 'record', 'rtl', 'statusfb', 'tablestates',
];

type Rule = { engine: string; file: string; selector: string; group: string; probe: string; skeleton: string };
type Answer = 'hit' | 'miss' | 'invalid';

const QUIET_MS = 300;
const SETTLE_BUDGET_MS = 10_000;

// Hydration is not the settled page: read only once every data-posture carries the
// real viewport (post-hydration transition) and the DOM has stopped mutating.
async function expectSettled(page: Page): Promise<boolean> {
  await expect
    .poll(
      async () => {
        const { width, postures } = await page.evaluate(() => ({
          width: window.innerWidth,
          postures: Array.from(document.querySelectorAll('[data-posture]'), (el) => el.getAttribute('data-posture') ?? ''),
        }));
        return postureSettled(postures, width);
      },
      { message: `posture never settled on ${page.url()}`, timeout: SETTLE_BUDGET_MS, intervals: [50] },
    )
    .toBe(true);
  return page.evaluate(
    ([quietMs, budgetMs]) =>
      new Promise<boolean>((resolve) => {
        let timer = setTimeout(done, quietMs, true);
        const cap = setTimeout(done, budgetMs, false);
        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(done, quietMs, true);
        });
        function done(quiet: boolean) {
          observer.disconnect();
          clearTimeout(timer);
          clearTimeout(cap);
          resolve(quiet);
        }
        observer.observe(document, { subtree: true, childList: true, attributes: true });
      }),
    [QUIET_MS, SETTLE_BUDGET_MS] as const,
  );
}
type DeadAnchor = { file: string; selectors: string[]; liveInFile: number };

/** Reviewed allow-list. deadAnchors MUST stay empty; any entry needs a reason. */
function loadReviewedDeadAnchors(): Array<{ file: string; selectors: string[] }> {
  const raw = JSON.parse(readFileSync(join(HERE, 'dead-selector-baseline.json'), 'utf8'));
  return Array.isArray(raw.deadAnchors) ? raw.deadAnchors : [];
}

test('dead-selector audit: a skin rule that reaches nobody', async ({ page }) => {
  test.setTimeout(600_000);
  const rules: Rule[] = collectRules();
  // A relocation that left SKIN_DIRS stale used to yield 0 rules and assert
  // nothing. Fail loudly instead of running a vacuous audit.
  expect(rules.length, `no skin rules collected from ${SKIN_DIRS.map((d) => d[0]).join(', ')} — SKIN_DIRS is stale`).toBeGreaterThan(1000);
  console.log(`### ${rules.length} probeable selectors across ${new Set(rules.map((r) => `${r.engine}/${r.file}`)).size} skin files`);

  const matched = new Set<number>();
  const skeletonMatched = new Set<number>();
  const invalid = new Set<number>();
  const unappliable = new Set<number>();
  const foreignVendor = new Set<number>();
  const droppedByGroup = new Set<number>();
  const unvisited: string[] = [];
  const unquiet: string[] = [];

  for (const engine of ['modern', 'rustic'] as const) {
    for (const section of TORTURE_SECTIONS) {
      const url = `/probe/whitelabel-torture?${section}=1&engine=${engine}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      } catch {
        unvisited.push(url);
        continue;
      }
      await expectHydrated(page);
      if (!(await expectSettled(page))) unquiet.push(url);
      const payload = rules.map((r) => [r.group, r.selector, r.probe, r.skeleton]);
      const hits = (await page.evaluate(probeSelectors, payload)) as Array<[Answer, Answer, Answer, Answer]>;
      hits.forEach(([group, source, full, skel], i) => {
        if (source === 'invalid') {
          (isForeignVendorSelector(rules[i].selector) ? foreignVendor : unappliable).add(i);
          return;
        }
        // A valid selector listed beside an invalid one: the browser drops the whole rule.
        if (group === 'invalid') { droppedByGroup.add(i); return; }
        if (full === 'invalid' || skel === 'invalid') { invalid.add(i); return; }
        if (full === 'hit') matched.add(i);
        if (skel === 'hit') skeletonMatched.add(i);
      });
    }
  }

  // Group by skin file. A file with ZERO matches anywhere just was not rendered
  // on any page we visited -- that is a coverage gap in the torture page, not a
  // dead rule, and we must not report it as one.
  const byFile = new Map<string, { total: number; unexercised: Rule[]; deadAnchor: Rule[] }>();
  const invalidSelectors: Array<{ file: string; selector: string; probe: string; skeleton: string }> = [];
  const unappliableRules: Array<{ file: string; selector: string; reason: string }> = [];
  rules.forEach((r, i) => {
    // The browser rejects it: it matches nothing and must never count as live.
    if (foreignVendor.has(i)) return;
    if (unappliable.has(i) || droppedByGroup.has(i)) {
      unappliableRules.push({
        file: `${r.engine}/${r.file}`,
        selector: r.selector,
        reason: unappliable.has(i) ? 'selector rejected' : 'grouped with a selector this browser rejects',
      });
      return;
    }
    if (invalid.has(i)) {
      invalidSelectors.push({ file: `${r.engine}/${r.file}`, selector: r.selector, probe: r.probe, skeleton: r.skeleton });
      return;
    }
    const key = `${r.engine}/${r.file}`;
    if (!byFile.has(key)) byFile.set(key, { total: 0, unexercised: [], deadAnchor: [] });
    const e = byFile.get(key)!;
    e.total += 1;
    if (!matched.has(i)) e.unexercised.push(r);
    // The anchor itself is absent: no state attribute could ever revive it.
    if (!skeletonMatched.has(i)) e.deadAnchor.push(r);
  });

  const deadAnchors: DeadAnchor[] = [];
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

  const report: DeadSelectorReport & Record<string, unknown> = {
    probeableSelectors: rules.length,
    skinFiles: byFile.size,
    // Navigations that failed, and pages still mutating when read (both void coverage).
    unvisitedPages: unvisited,
    unquietPages: unquiet,
    // Rejected by this browser (the selector, or a list member beside it): paints nothing here.
    unappliableRules,
    // Another engine's vendor pseudo (::-moz-*): unmeasurable in Chromium, not a finding.
    foreignVendorSelectors: foreignVendor.size,
    // A probe or skeleton rejected over a valid source: an instrument defect, never a match.
    invalidSelectors,
    // The component never rendered anywhere we looked. A torture-page coverage
    // gap; says nothing about the rules themselves.
    uncoveredFiles: uncovered.sort(),
    // THE RAW BUG-CLASS CANDIDATES (P-79): the component IS rendered, and these
    // rules' anchors are absent from the DOM with every state attribute
    // stripped. Adjudicated per row below into trueDeadAnchors (failing) and
    // conditionalParts (named fixture-coverage holes).
    deadAnchors: deadAnchors.sort((a, b) => b.selectors.length - a.selectors.length),
    // NOT a bug, but a hole in the gate: the rule is fine, the fixture never
    // renders the state it keys on, so no baseline can catch a regression in it.
    thinFixtures: thinFixtures.sort((a, b) => b.unexercised - a.unexercised),
  };
  // THE BUG CLASS (P-79), adjudicated per row before it is reported: a skeleton
  // miss is a render-drop ONLY when no source evidence explains it. The
  // conditional-coverage classifier (dead-anchor-classification.lib.mjs) proves
  // per row whether the owning component stamps the anchor part on a DOM host
  // behind a condition the fixture never satisfies (editing off, showTime unset,
  // a modal never opened); those rows are fixture-coverage holes and join
  // conditionalParts, each naming what the torture page would have to render.
  // Everything the census cannot prove stays TRUE_DEAD and keeps failing.
  const classification = classifyReport(report, { rules });
  const trueDeadByFile = new Map<string, typeof classification.trueDead>();
  for (const row of classification.trueDead) {
    if (!trueDeadByFile.has(row.file)) trueDeadByFile.set(row.file, []);
    trueDeadByFile.get(row.file)!.push(row);
  }
  report.conditionalParts = classification.conditionalParts.map((e) => ({
    owner: e.owner,
    part: e.part,
    rows: e.rows,
    skinFiles: e.skinFiles,
    required: e.stamps.flatMap((s) => s.required.map((c) => c.text)),
    stamp: e.stamps.map((s) => `${s.file}:${s.line}`),
  }));
  report.trueDeadAnchors = classification.trueDead.map((r) => ({ file: r.file, selector: r.selector, reason: r.reason }));
  writeFileSync(join(HERE, '../../dead-selector-report.json'), JSON.stringify(report, null, 2));

  const totalUnexercised = thinFixtures.reduce((n, f) => n + f.unexercised, 0);
  console.log(`### unappliable skin rules: ${unappliableRules.length}; foreign-vendor selectors: ${foreignVendor.size}; instrument-invalid selectors: ${invalidSelectors.length}; unvisited pages: ${unvisited.length}; unquiet pages: ${unquiet.length}`);
  console.log(`### uncovered skin files (component never rendered — torture-page gap): ${uncovered.length}`);
  console.log(`### DEAD ANCHORS — skeleton misses: ${deadAnchors.length} files, ${classification.rows.length} rows`);
  console.log(`###   classified CONDITIONAL (fixture-coverage holes, positive source evidence): ${classification.conditional.length} rows / ${classification.conditionalParts.length} distinct parts`);
  console.log(`###   classified TRUE_DEAD (the failing class): ${classification.trueDead.length} rows in ${trueDeadByFile.size} files`);
  for (const [file, rows] of [...trueDeadByFile].slice(0, 20)) {
    console.log(`###   ${file} — ${rows.length} true-dead`);
    for (const row of rows.slice(0, 3)) console.log(`###       ${row.selector} :: ${row.reason}`);
  }
  console.log(`### thin fixtures — rules NO baseline exercises at rest: ${totalUnexercised} of ${rules.length}`);

  // HARD ASSERTION (the whole point of the resurrection): the P-79 bug class
  // must be empty. A TRUE_DEAD anchor is a skin rule whose part is absent from
  // the rendered DOM under every state AND whose absence no source evidence
  // explains -- a genuine render-drop. Conditional rows (the source stamps the
  // part behind a configuration the fixture never sets) are measured above and
  // published in the report as conditionalParts; they are coverage holes with
  // named owners, not dead rules. Reviewed, explained exceptions may be
  // allow-listed in dead-selector-baseline.json (each with a reason); the
  // residual after removing them must be zero. thinFixtures and uncovered are
  // measured above and written to the report, but do not fail the gate: an
  // unphotographed state is a coverage hole, not a dead rule.
  expect(unvisited, 'torture sections that never loaded: their components read as uncovered').toEqual([]);
  expect(invalidSelectors, 'probe/skeleton rejected over a valid source selector: the instrument relaxed it into invalid CSS').toEqual([]);
  expect(unappliableRules, 'skin selectors the browser rejects: the rule paints nothing in any page').toEqual([]);
  const reviewed = loadReviewedDeadAnchors();
  const reviewedByFile = new Map(reviewed.map((r) => [r.file, new Set(r.selectors)]));
  const unreviewed = [...trueDeadByFile]
    .map(([file, rows]) => ({ file, rows: rows.filter((r) => !reviewedByFile.get(file)?.has(r.selector)) }))
    .filter((d) => d.rows.length > 0)
    .map((d) => ({ file: d.file, selectors: d.rows.map((r) => `${r.selector} :: ${r.reason}`) }));
  expect(unreviewed, 'true-dead skin anchors: absent from the rendered DOM and unexplained by any source stamp (P-79 render-drop). Fix the component to stamp the part, or add a reviewed exception with a reason to dead-selector-baseline.json.').toEqual([]);
});
