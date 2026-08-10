import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-CRA-23 — responsive overflow gate for the DS reference lab.
//
// Closes the hard veto recorded at
// `packages/core/test-artifacts/quality-evidence/wo-cra-23/R1/receipts/
//  cohort-1-canary-scores.json#currentOpenDefects`:
//
//   "RESPONSIVE OVERFLOW (hard veto): scrollWidth 332 vs 320 and 280 viewports,
//    both tenants. Long/unbroken/RTL content must wrap or take
//    min-inline-size:0 / max-inline-size:100%; Segmented must adapt without
//    clipping. Needs a fail-closed per-scene/tenant/width gate asserting
//    documentElement.scrollWidth <= innerWidth and no visible element outside
//    the viewport."
//
// FAIL-CLOSED, BY CONSTRUCTION. There is no baseline file, no tolerance list,
// no allowlist and no skip. A violation is a failure; that is the point. The
// sibling `responsive.spec.ts` measures a DIFFERENT surface (the
// `/probe/engine-modern` capture route, one 360px viewport, a fixed 15-slug
// list) against a decrease-only `overflow-baseline.json`, and nothing there
// covers the canonical reference lab. This spec does not read, write or extend
// that baseline.
//
// WHAT COUNTS AS "VISIBLE" is deliberately the same predicate `responsive.spec.ts`
// already uses (zero/hairline rects, `display:none`, `visibility:hidden` and
// `aria-hidden` subtrees are skipped), so the two specs never disagree about
// which elements a spill claim is about.
//
// THE MATRIX IS READ FROM DISK, never hardcoded. A hardcoded roster goes stale
// silently, and a gate that measures zero cells reports green — which is
// indistinguishable from a gate that passed. Hence the floor assertions in the
// first test: the enumeration must find at least the orders of magnitude the
// lab is known to carry before the sweep is allowed to mean anything.
//
//   tenant roots  = directories under `src/app/probe/ds-reference/` carrying a
//                   `layout.tsx` (that layout mounts `LabGround`, which is what
//                   makes the segment a ground). `chrome/`, `ground/`, `judge/`
//                   and `sections/` carry none and are therefore not roots.
//   scenes        = subdirectories of a root carrying a `page.tsx`.
//   cases         = five scene families FAIL CLOSED on a missing `?only=`
//                   (`notFound()`), so visiting them bare serves Next's 404 —
//                   a page that cannot overflow and would score as a silent
//                   pass. Their case lists are read from the
//                   `sections/<family>/cases.ts` the route itself imports and
//                   every case is measured. The remaining parameterized
//                   families render a declared default instead of 404, so a
//                   bare visit is a real measurement of a real page; they are
//                   covered at their default case only (see COVERAGE GAP).
//
// COVERAGE GAP, reported as a number every run rather than hidden in prose:
// `overlay-edge` (5), `r2-behavior` (90), `r2-closure` (17), `r2-closure-b` (4),
// `r2-elevated` (19), `r2-product` (7) and `r3-evidence` (15) declare their case
// lists inline and render one of them by default. A bare visit to those is a
// real page, so this sweep measures that default and nothing else. The first
// test prints a `PARTIAL <root>/<scene>: n of m cases measured` line for every
// such pair plus a corpus total, so the shortfall shows up in the run output
// and cannot quietly read as full coverage later. Widening it to all cases is a
// run-budget decision, not a correctness one.
//
// VIEWPORT WIDTH IS `documentElement.clientWidth`, NOT `window.innerWidth`.
// When a vertical scrollbar is present `clientWidth` is the narrower of the
// two, so every assertion here is at least as strict as the veto's wording and
// never looser: `scrollWidth <= clientWidth + 1` implies
// `scrollWidth <= innerWidth + 1`. Both numbers are reported so a failure can
// be read either way.
// ---------------------------------------------------------------------------

/** Sub-pixel rounding only. Never widen this to green a run. */
const EDGE_TOLERANCE_PX = 1;

const VIEWPORT_HEIGHT = 900;

/**
 * The full width sweep, for the two grounds that carry every scene.
 *
 * 280 is here because it is one of the two widths the veto was actually raised
 * at ("scrollWidth 332 vs 320 and 280 viewports"). A gate that closes a defect
 * at every width except the one it was reported at has not closed it. The
 * locale roots stay on the narrow pair below: 280 is a width-stress axis and
 * `bithire-es`/`bithire-ar` already carry the string-length and RTL stress at
 * 320, so a third narrow width there costs a navigation per cell for signal the
 * `en` roots already produce.
 */
const FULL_WIDTHS = [280, 320, 390, 768, 1440] as const;

/**
 * The locale roots run the narrow half only. RTL mirroring and longer strings
 * are where overflow bites; the wide widths cost a navigation each and add no
 * signal the `en` roots do not already carry at the same width.
 */
const NARROW_WIDTHS = [320, 390] as const;

/**
 * The lab's declared locale axis (`LabLocale` in `ground/index.tsx`) is closed,
 * and so is this. An unrecognised locale segment throws rather than defaulting
 * to `ltr`: a new RTL root that silently expected `ltr` would wait forever on
 * the wrong root attribute, and a new LTR root deserves an explicit line here.
 */
const LOCALE_DIRECTION: Record<string, 'ltr' | 'rtl'> = {
  en: 'ltr',
  es: 'ltr',
  ar: 'rtl',
};

// Floors. All sit below what the lab carries today (4 roots, 2 distinct tenant
// slugs, 25 distinct scene slugs, 64 root/scene pairs, 363 scene-cases, 1422
// cells) and far above zero. They exist to make a path change, a renamed
// segment or a moved lab fail LOUDLY instead of scanning nothing.
const MIN_TENANT_ROOTS = 4;
const MIN_DISTINCT_TENANT_SLUGS = 2;
const MIN_DISTINCT_SCENES = 20;
const MIN_ROOT_SCENE_PAIRS = 55;
const MIN_CELLS = 400;

interface TenantRoot {
  /** Route segment, e.g. `bithire-ar`. */
  readonly segment: string;
  /** The `data-tenant` the ground stamps, e.g. `themanagement`. */
  readonly tenantSlug: string;
  readonly locale: string;
  readonly dir: 'ltr' | 'rtl';
  readonly widths: readonly number[];
}

interface Cell {
  readonly root: TenantRoot;
  readonly scene: string;
  /** `?only=` value for the fail-closed families; `null` for a bare visit. */
  readonly onlyCase: string | null;
}

/** `test.info().project.testDir` is `<showroom>/e2e`; the lab sits beside it. */
function labRoot(): string {
  return join(test.info().project.testDir, '..', 'src', 'app', 'probe', 'ds-reference');
}

/**
 * The ground is declared in the segment's own `layout.tsx` (`<LabGround
 * tenant="..." locale="..." />`), which is the only place the lab states it.
 * Reading it here keeps the expected root attributes derived from the same
 * source the page renders from, instead of a second copy that can drift.
 */
function readTenantRoot(lab: string, segment: string): TenantRoot {
  const source = readFileSync(join(lab, segment, 'layout.tsx'), 'utf8');

  const tenantSlug = source.match(/tenant=["']([a-z0-9-]+)["']/)?.[1];
  if (!tenantSlug) {
    throw new Error(`${segment}/layout.tsx declares no LabGround tenant — the ground cannot be verified`);
  }

  const locale = source.match(/locale=["']([a-z-]+)["']/)?.[1] ?? 'en';
  const dir = LOCALE_DIRECTION[locale];
  if (!dir) {
    throw new Error(
      `${segment}/layout.tsx declares locale "${locale}", which has no declared text direction in this spec. ` +
        'Add it to LOCALE_DIRECTION — do not let it default.',
    );
  }

  return {
    segment,
    tenantSlug,
    locale,
    dir,
    widths: locale === 'en' ? FULL_WIDTHS : NARROW_WIDTHS,
  };
}

interface SceneCoverage {
  readonly scene: string;
  /** `?only=` values this sweep visits; a lone `null` means one bare visit. */
  readonly measured: (string | null)[];
  /** How many cases the ROUTE declares, measured or not. */
  readonly declared: number;
}

/**
 * What this sweep covers for one scene, against what the scene declares.
 *
 * Two route shapes, and the difference decides whether a bare visit is a
 * measurement or a lie:
 *
 *   FAIL-CLOSED (`notFound()` on a missing `?only=`) — a bare visit serves a
 *   404, which cannot overflow and would score as clean. Every case is swept,
 *   read from the `sections/<family>/cases.ts` the route itself imports. A
 *   route of this shape with no readable list throws rather than being swept
 *   bare.
 *
 *   DEFAULTING (renders one of an inline `const CASES` list) — a bare visit is
 *   a real page, so it is a real measurement, just a narrow one. The declared
 *   count is parsed anyway so the shortfall is reported as a number every run
 *   instead of living in a comment.
 */
function resolveSceneCoverage(lab: string, scene: string, pagePath: string): SceneCoverage {
  const source = readFileSync(pagePath, 'utf8');

  if (/\bnotFound\(\)/.test(source)) {
    const family = source.match(/from\s+'(?:\.\.\/)+sections\/([a-z0-9-]+)\/cases'/)?.[1];
    if (!family) {
      throw new Error(`${pagePath} 404s on a missing case but imports no readable case list — it cannot be measured`);
    }

    const casesPath = join(lab, 'sections', family, 'cases.ts');
    if (!existsSync(casesPath)) {
      throw new Error(`${pagePath} imports sections/${family}/cases, which does not exist at ${casesPath}`);
    }

    const literal = readFileSync(casesPath, 'utf8').match(/_CASES\s*:[^=]*=\s*\[([\s\S]*?)\]/);
    const cases = literal ? [...literal[1].matchAll(/'([^']+)'/g)].map((match) => match[1]) : [];
    if (cases.length === 0) {
      throw new Error(`sections/${family}/cases.ts yielded no cases — the sweep would measure nothing for this family`);
    }
    return { scene, measured: cases, declared: cases.length };
  }

  const inline = source.match(/const CASES\s*:[^=]*=\s*\[([\s\S]*?)\]/);
  const declared = inline ? [...inline[1].matchAll(/'([^']+)'/g)].length : 0;
  return { scene, measured: [null], declared: Math.max(declared, 1) };
}

function directoriesIn(path: string): string[] {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/** Per `<root>/<scene>`, what this sweep measures against what the route declares. */
interface CoverageRow {
  readonly key: string;
  readonly measured: number;
  readonly declared: number;
}

interface Matrix {
  readonly roots: TenantRoot[];
  readonly cells: Cell[];
  readonly distinctScenes: Set<string>;
  readonly rootScenePairs: number;
  readonly coverage: CoverageRow[];
}

function enumerateMatrix(): Matrix {
  const lab = labRoot();
  if (!existsSync(lab)) {
    throw new Error(`the DS reference lab is not at ${lab} — the gate would sweep nothing`);
  }

  const roots = directoriesIn(lab)
    .filter((segment) => existsSync(join(lab, segment, 'layout.tsx')))
    .map((segment) => readTenantRoot(lab, segment));

  const cells: Cell[] = [];
  const distinctScenes = new Set<string>();
  const coverage: CoverageRow[] = [];
  let rootScenePairs = 0;

  for (const root of roots) {
    const scenes = directoriesIn(join(lab, root.segment)).filter((scene) =>
      existsSync(join(lab, root.segment, scene, 'page.tsx')),
    );

    for (const scene of scenes) {
      rootScenePairs += 1;
      distinctScenes.add(scene);
      const sceneCoverage = resolveSceneCoverage(lab, scene, join(lab, root.segment, scene, 'page.tsx'));
      coverage.push({
        key: `${root.segment}/${scene}`,
        measured: sceneCoverage.measured.length,
        declared: sceneCoverage.declared,
      });
      for (const onlyCase of sceneCoverage.measured) {
        cells.push({ root, scene, onlyCase });
      }
    }
  }

  return { roots, cells, distinctScenes, rootScenePairs, coverage };
}

function cellUrl(cell: Cell): string {
  const base = `/probe/ds-reference/${cell.root.segment}/${cell.scene}`;
  return cell.onlyCase ? `${base}?only=${encodeURIComponent(cell.onlyCase)}` : base;
}

function cellLabel(cell: Cell, width: number): string {
  return `${cell.root.segment}/${cell.scene}${cell.onlyCase ? `?only=${cell.onlyCase}` : ''} @${width}`;
}

/**
 * READINESS. An overflow measurement is a measurement of TEXT METRICS and
 * settled layout, so every one of these steps is load-bearing:
 *
 *  1. `networkidle` — the RSC payload and the client chunks have arrived.
 *  2. HTTP status — a `notFound()` route serves 404. A 404 page cannot
 *     overflow, so a silently-swept 404 is a false pass; this raises instead.
 *  3. The ground stamp reached the document. This is the browser-side analog of
 *     what `scripts/assert-first-paint-authority.mjs` proves over the raw HTML
 *     string: the tenant authority arrives as bytes, first-in-body, before any
 *     paint. `LabGround` writes it as `script[data-testid="lab-ground-stamp"]`.
 *  4. The root actually carries that authority — tenant, engine, lang and dir.
 *     The lab's known R0 failure mode is a first frame painted on the default
 *     ground before the tenant resolves, and a mis-themed frame has different
 *     box sizes, so waiting on paint alone would measure the wrong document.
 *     `dir` matters most on `bithire-ar`: the whole document mirrors.
 *  5. The scene landmark. Every one of the lab's 23 section families renders
 *     `data-testid="lab-scene"`, so this is the one universal proof that the
 *     scene — not an error boundary — is on screen.
 *  6. Fonts. `document.fonts.ready` resolves for faces that have STARTED
 *     loading; a face first referenced by late content can still be pending and
 *     fallback metrics are exactly what makes a line overflow or not. Forcing
 *     every registered face is the lesson already learned in
 *     `e2e/visual/flagships.spec.ts`.
 *  7. Geometry stability. The quantity being measured is polled on rAF until
 *     three consecutive samples agree, which settles chart/ResizeObserver
 *     measurement passes without guessing a fixed delay. Best-effort: a scene
 *     with a permanently-animating box (an autoplaying carousel) falls through
 *     to a fixed settle and is reported as `unsettled` rather than crashing the
 *     sweep — a flaky gate is worse than a gate that says which cell it could
 *     not settle.
 */
async function gotoCell(page: Page, cell: Cell): Promise<{ settled: boolean }> {
  const url = cellUrl(cell);
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  if (!response) throw new Error(`no response for ${url}`);
  if (!response.ok()) throw new Error(`${url} responded ${response.status()}`);

  await page.locator('script[data-testid="lab-ground-stamp"]').waitFor({ state: 'attached', timeout: 20_000 });

  await page.waitForFunction(
    (expected) => {
      const root = document.documentElement;
      return (
        root.getAttribute('data-tenant') === expected.tenant &&
        root.getAttribute('data-engine') === 'modern' &&
        root.getAttribute('lang') === expected.lang &&
        root.getAttribute('dir') === expected.dir
      );
    },
    { tenant: cell.root.tenantSlug, lang: cell.root.locale, dir: cell.root.dir },
    { timeout: 20_000 },
  );

  await page.locator('[data-testid="lab-scene"]').first().waitFor({ state: 'visible', timeout: 30_000 });

  await page.evaluate(() =>
    Promise.all([...document.fonts].map((face) => face.load())).then(() => document.fonts.ready),
  );

  let settled = true;
  try {
    await page.waitForFunction(
      () => {
        const store = window as unknown as { __dsRefSample?: string; __dsRefStable?: number };
        const root = document.documentElement;
        const scene = document.querySelector('[data-testid="lab-scene"]');
        const sample = [
          root.scrollWidth,
          root.clientWidth,
          scene ? Math.round(scene.getBoundingClientRect().width) : -1,
          scene ? Math.round(scene.getBoundingClientRect().height) : -1,
          scene ? getComputedStyle(scene).backgroundColor : '',
        ].join('|');

        if (store.__dsRefSample !== sample) {
          store.__dsRefSample = sample;
          store.__dsRefStable = 0;
          return false;
        }
        store.__dsRefStable = (store.__dsRefStable ?? 0) + 1;
        return store.__dsRefStable >= 3;
      },
      undefined,
      { polling: 'raf', timeout: 6_000 },
    );
  } catch {
    settled = false;
  }

  await page.waitForTimeout(150);
  return { settled };
}

interface Measurement {
  readonly clientWidth: number;
  readonly innerWidth: number;
  readonly scrollWidth: number;
  readonly documentOverflow: number;
  readonly spilled: string[];
  readonly spilledTotal: number;
}

/**
 * The two properties the veto names, measured together so one navigation
 * answers both. `clientWidth` is the layout viewport (see the header note on
 * why it, and not `innerWidth`, is the comparison basis).
 */
async function measureCell(page: Page, tolerance: number): Promise<Measurement> {
  return page.evaluate((edgeTolerance) => {
    const root = document.documentElement;
    const clientWidth = root.clientWidth;
    const spilled = new Map<string, number>();

    document.querySelectorAll('*').forEach((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      // Identical predicate to responsive.spec.ts, so both specs mean the same
      // thing by "visible".
      if (
        rect.width <= 1 ||
        rect.height <= 1 ||
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        element.closest('[aria-hidden="true"]')
      ) {
        return;
      }

      const overshootRight = rect.right - clientWidth;
      const overshootLeft = -rect.left;
      const overshoot = Math.max(overshootRight, overshootLeft);
      if (overshoot <= edgeTolerance) return;

      const part = element.getAttribute('data-part');
      const cls = (element.getAttribute('class') ?? '').split(' ').filter(Boolean).slice(0, 2).join('.');
      const descriptor = `${element.tagName.toLowerCase()}${part ? `[data-part=${part}]` : cls ? `.${cls}` : ''}`;
      const previous = spilled.get(descriptor) ?? 0;
      if (overshoot > previous) spilled.set(descriptor, overshoot);
    });

    const ranked = [...spilled.entries()].sort((a, b) => b[1] - a[1]);
    return {
      clientWidth,
      innerWidth: window.innerWidth,
      scrollWidth: root.scrollWidth,
      documentOverflow: root.scrollWidth - clientWidth,
      spilled: ranked.slice(0, 8).map(([descriptor, overshoot]) => `${descriptor} +${Math.round(overshoot)}px`),
      spilledTotal: ranked.length,
    };
  }, tolerance);
}

test.describe.configure({ mode: 'serial' });

test.describe('ds-reference responsive overflow', () => {
  test('the enumerated matrix is real', async () => {
    test.setTimeout(60_000);

    const matrix = enumerateMatrix();
    const tenantSlugs = new Set(matrix.roots.map((root) => root.tenantSlug));
    const cellsByWidth = matrix.cells.reduce((total, cell) => total + cell.root.widths.length, 0);

    console.log(
      `[ds-reference overflow] ${matrix.roots.length} tenant roots ` +
        `(${[...tenantSlugs].sort().join(', ')}), ${matrix.distinctScenes.size} distinct scenes, ` +
        `${matrix.rootScenePairs} root/scene pairs, ${matrix.cells.length} scene-cases, ` +
        `${cellsByWidth} cells`,
    );
    for (const root of matrix.roots) {
      console.log(
        `[ds-reference overflow]   ${root.segment} -> tenant=${root.tenantSlug} lang=${root.locale} ` +
          `dir=${root.dir} widths=${root.widths.join('/')}`,
      );
    }

    // COVERAGE SHORTFALL, printed every run rather than described in a comment.
    // The defaulting families render one of an inline case list, so a sweep of
    // them is real but partial — and six weeks from now a partial sweep that
    // says nothing is indistinguishable from a full one.
    const shortfall = matrix.coverage.filter((row) => row.measured < row.declared);
    const declaredTotal = matrix.coverage.reduce((sum, row) => sum + row.declared, 0);
    const measuredTotal = matrix.coverage.reduce((sum, row) => sum + row.measured, 0);
    console.log(
      `[ds-reference overflow] case coverage: ${measuredTotal} of ${declaredTotal} declared cases measured ` +
        `(${shortfall.length} of ${matrix.coverage.length} root/scene pairs partially covered)`,
    );
    for (const row of shortfall) {
      console.log(
        `[ds-reference overflow]   PARTIAL ${row.key}: ${row.measured} of ${row.declared} cases measured ` +
          `(${row.declared - row.measured} unmeasured)`,
      );
    }

    // A gate that silently measures nothing reads exactly like a gate that
    // passed. These floors are the difference.
    expect(matrix.roots.length, 'tenant roots found on disk').toBeGreaterThanOrEqual(MIN_TENANT_ROOTS);
    expect(tenantSlugs.size, 'distinct tenant grounds').toBeGreaterThanOrEqual(MIN_DISTINCT_TENANT_SLUGS);
    expect(matrix.distinctScenes.size, 'distinct scene slugs').toBeGreaterThanOrEqual(MIN_DISTINCT_SCENES);
    expect(matrix.rootScenePairs, 'root/scene pairs').toBeGreaterThanOrEqual(MIN_ROOT_SCENE_PAIRS);
    expect(cellsByWidth, 'tenant/scene/case/width cells').toBeGreaterThanOrEqual(MIN_CELLS);
    expect(
      matrix.roots.some((root) => root.dir === 'rtl'),
      'no RTL root enumerated — the axis the veto names would go unmeasured',
    ).toBe(true);
  });

  test('no scene spills past either viewport edge at any width', async ({ page }) => {
    // One fresh navigation per cell — not resize-in-place, because a component
    // that reads its width once on mount would report a stale box after a
    // resize and a fail-closed gate must not invent violations.
    //
    // WALL-CLOCK IS UNMEASURED. This spec has never been executed end to end
    // (it needs a production showroom build), so no runtime figure here would
    // be anything but a guess — do not plan against one. The timeout below is
    // deliberately far larger than any plausible run so a slow machine fails on
    // evidence rather than on the clock; time the first real run and record
    // that number.
    test.setTimeout(3_600_000);

    const matrix = enumerateMatrix();
    const findings: string[] = [];
    const widths = [...new Set(matrix.roots.flatMap((root) => [...root.widths]))].sort((a, b) => a - b);

    let done = 0;
    const total = matrix.cells.reduce((sum, cell) => sum + cell.root.widths.length, 0);

    for (const width of widths) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });

      for (const cell of matrix.cells) {
        if (!cell.root.widths.includes(width)) continue;
        const label = cellLabel(cell, width);
        done += 1;
        if (done % 50 === 0) console.log(`[ds-reference overflow] ${done}/${total} — ${label}`);

        let settled = true;
        let measurement: Measurement;
        try {
          ({ settled } = await gotoCell(page, cell));
          measurement = await measureCell(page, EDGE_TOLERANCE_PX);
        } catch (error) {
          // An unmeasurable cell is a gate failure, never a skip: it is exactly
          // the state in which a broken route reads as green.
          const detail = error instanceof Error ? error.message : String(error);
          const finding = `UNMEASURABLE ${label} — ${detail}`;
          findings.push(finding);
          console.log(`[ds-reference overflow] ${finding}`);
          continue;
        }

        const scrolls = measurement.documentOverflow > EDGE_TOLERANCE_PX;
        const spills = measurement.spilled.length > 0;
        if (!scrolls && !spills) {
          // A clean cell that never settled is still a clean cell, but the
          // confidence behind it is lower — say so rather than let it pass
          // silently indistinguishable from a settled one.
          if (!settled) console.log(`[ds-reference overflow] clean-but-unsettled ${label}`);
          continue;
        }

        const parts: string[] = [];
        if (scrolls) {
          parts.push(
            `document scrollWidth ${measurement.scrollWidth} > clientWidth ${measurement.clientWidth} ` +
              `(innerWidth ${measurement.innerWidth})`,
          );
        }
        if (spills) {
          const more = measurement.spilledTotal > measurement.spilled.length
            ? ` (+${measurement.spilledTotal - measurement.spilled.length} more)`
            : '';
          parts.push(`outside viewport: ${measurement.spilled.join(', ')}${more}`);
        }
        if (!settled) parts.push('unsettled: geometry never stabilised within 6s');

        const finding = `OVERFLOW ${label} — ${parts.join('; ')}`;
        findings.push(finding);
        // Streamed as found so the full list survives even if the assertion
        // message is truncated by a reporter.
        console.log(`[ds-reference overflow] ${finding}`);
      }
    }

    console.log(`[ds-reference overflow] swept ${done}/${total} cells, ${findings.length} findings`);

    expect(
      findings,
      'DS reference lab scenes scroll the document or place content outside the viewport. ' +
        'Fix the source: let long/unbroken/RTL content wrap, give the flex/grid child ' +
        'min-inline-size:0, cap the box with max-inline-size:100%, and make Segmented adapt ' +
        'rather than clip. There is no baseline to widen and no tolerance to loosen.',
    ).toEqual([]);
  });
});
