/**
 * The browser leg of the scheme-scope causality probe: a BarChart and a
 * PieChart, five schemes, one reading mode per navigation.
 *
 * WHY IT EXISTS. The happy-dom probe next door can only read the attributes a
 * mark CARRIES. It applies no stylesheet, so a family whose mark colour lives
 * entirely in CSS -- `pie-chart` reaches its slot through
 * `[data-series-index] { --ds-chart-mark-color: var(--ds-chart-paint-N) }` --
 * measures as `paint=none` there whether the chain is right or broken. The
 * debrief (§6.4) therefore owes a real-browser capture of the COMPUTED fill.
 *
 * WHAT IT MEASURES, per family x scheme x mode:
 *   - the scope the renderer root stamped (`data-chart-color-scheme`);
 *   - the computed `fill` of the first mark (`[data-part='bar']`,
 *     `[data-part='pie-slice']`);
 *   - the same page's resolution of EVERY scheme's slot 1, taken inside that
 *     chart's own root, so the census can name which table the fill came from
 *     rather than only that it was wrong.
 *
 * It MEASURES; it does not adjudicate. A red run here means the scene broke,
 * never that the tree diverged -- the same split the happy-dom probe keeps.
 */
import { createRoot } from 'react-dom/client';

import {
  BarChart,
  PieChart,
} from '@/components/patterns/visualization/charts';
import { resolveChartPaint } from '@/components/patterns/visualization/charts/runtime/theming/composition/foundation/paint';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import type { TenantConfig } from '@/foundation/contracts';

export type Scheme =
  | 'default'
  | 'pastel'
  | 'vibrant'
  | 'monochrome'
  | 'accessible';

export const SCHEMES: readonly Scheme[] = [
  'default',
  'pastel',
  'vibrant',
  'monochrome',
  'accessible',
];

/** The family's own mark, the one a reader sees carrying the series colour. */
const MARK_SELECTOR = {
  'bar-chart': '[data-part="bar"]',
  'pie-chart': '[data-part="pie-slice"]',
} as const;

export type Family = keyof typeof MARK_SELECTOR;

export const FAMILIES: readonly Family[] = ['bar-chart', 'pie-chart'];

export interface BrowserCensusRow {
  family: Family;
  requested: Scheme;
  mode: 'light' | 'dark';
  /** What the single resolver decided the scheme is. */
  expectedScheme: Scheme;
  /** What the renderer root actually stamped. */
  stampedScheme: string | null;
  rendered: boolean;
  /** getComputedStyle(mark).fill -- the fact this leg exists to capture. */
  computedFill: string | null;
  /** The requested scheme's slot 1, resolved inside this chart's own root. */
  expectedFill: string | null;
  /** The negative control: a DIFFERENT scheme's slot 1, same root, same page. */
  wrongScheme: Scheme;
  wrongFill: string | null;
  /** Which scheme's slot 1 the fill actually equals; null when none does. */
  fillTable: Scheme | null;
  /** The substituted `--ds-chart-mark-color` text the mark carries. */
  markColorChannel: string | null;
}

export interface BrowserCensus {
  generatedBy: string;
  mode: 'light' | 'dark';
  /** Ground witnesses: the attributes the provider actually stamped. */
  root: {
    dataTheme: string | null;
    dataTenant: string | null;
    dataVertical: string | null;
    dataEngine: string | null;
    classList: string;
  };
  /**
   * Each scheme's slot 1 resolved at the document root in THIS mode. Light and
   * dark must differ, or the leg measured one mode twice.
   */
  modeWitness: Record<string, string | null>;
  rows: BrowserCensusRow[];
}

const SIZE = { width: 320, height: 220, responsive: false, animate: false } as const;

const POINTS = [
  { label: 'A', value: 10 },
  { label: 'B', value: 20 },
];

/**
 * No branding payload. A tenant carrying raw colours with no compiled artifact
 * is refused by the visual-authority barrier and the provider never mounts its
 * children, so the scene would measure an empty page.
 */
function tenantFor(mode: 'light' | 'dark'): TenantConfig {
  return {
    slug: 'chart-causality-probe',
    name: 'Chart Causality Probe',
    theme: mode,
    plan: 'enterprise',
    features: ['all'],
    branding: { companyName: 'Chart Causality Probe' },
  };
}

function Scene({ mode }: { mode: 'light' | 'dark' }) {
  return (
    <DesignSystemProvider
      tenantConfig={tenantFor(mode)}
      productProfile="generic.default"
      forceEngine="modern"
      skipCssLoading
    >
      {SCHEMES.map((scheme) => (
        <div key={scheme}>
          <div data-probe-cell={`bar-chart::${scheme}`}>
            <BarChart {...SIZE} data={POINTS} colorScheme={scheme} />
          </div>
          <div data-probe-cell={`pie-chart::${scheme}`}>
            <PieChart {...SIZE} data={POINTS} colorScheme={scheme} />
          </div>
        </div>
      ))}
    </DesignSystemProvider>
  );
}

/** A colour no chain produces, so an unresolvable expression is visible. */
const SENTINEL = 'rgb(1, 2, 3)';

/**
 * Resolve one paint expression through the LIVE cascade, inside `owner`, by
 * making the browser do the substitution it would do for a mark. An expression
 * that cannot resolve leaves the sentinel standing and comes back as null
 * rather than as a manufactured colour.
 */
function resolveInPage(owner: Element, expression: string): string | null {
  const probe = document.createElement('span');
  probe.style.color = SENTINEL;
  probe.style.display = 'none';
  owner.appendChild(probe);
  probe.style.color = expression;
  const resolved = window.getComputedStyle(probe).color;
  probe.remove();
  return resolved === SENTINEL ? null : resolved;
}

/** The scheme the negative control compares against: the next one round. */
export function wrongSchemeFor(scheme: Scheme): Scheme {
  const index = SCHEMES.indexOf(scheme);
  return SCHEMES[(index + 1) % SCHEMES.length] as Scheme;
}

function slotOneExpression(family: Family, scheme: Scheme): string {
  const decision = resolveChartPaint({ family, scheme });
  return decision.categorical?.paintFor(0) ?? '';
}

function measureCell(
  family: Family,
  requested: Scheme,
  mode: 'light' | 'dark',
): BrowserCensusRow {
  const decision = resolveChartPaint({ family, scheme: requested });
  const wrongScheme = wrongSchemeFor(requested);
  const cell = document.querySelector(`[data-probe-cell="${family}::${requested}"]`);
  const root = cell?.querySelector('[data-part="chart-renderer"]') ?? null;
  const mark = root?.querySelector(MARK_SELECTOR[family]) ?? null;

  const base: BrowserCensusRow = {
    family,
    requested,
    mode,
    expectedScheme: decision.scheme,
    stampedScheme: root?.getAttribute('data-chart-color-scheme') ?? null,
    rendered: Boolean(root && mark),
    computedFill: null,
    expectedFill: null,
    wrongScheme,
    wrongFill: null,
    fillTable: null,
    markColorChannel: null,
  };
  if (!root || !mark) return base;

  const markStyle = window.getComputedStyle(mark);
  const computedFill = markStyle.fill;
  const bySchemeEntries = SCHEMES.map(
    (scheme) => [scheme, resolveInPage(root, slotOneExpression(family, scheme))] as const,
  );
  const bySchemeMap = new Map(bySchemeEntries);
  const match = bySchemeEntries.find(([, value]) => value !== null && value === computedFill);

  return {
    ...base,
    computedFill,
    expectedFill: bySchemeMap.get(requested) ?? null,
    wrongFill: bySchemeMap.get(wrongScheme) ?? null,
    fillTable: match ? match[0] : null,
    markColorChannel: markStyle.getPropertyValue('--ds-chart-mark-color').trim() || null,
  };
}

function probe(mode: 'light' | 'dark'): void {
  const documentRoot = document.documentElement;
  const census: BrowserCensus = {
    generatedBy: 'chart-scheme-scope-causality/browser/scene',
    mode,
    root: {
      dataTheme: documentRoot.getAttribute('data-theme'),
      dataTenant: documentRoot.getAttribute('data-tenant'),
      dataVertical: documentRoot.getAttribute('data-vertical'),
      dataEngine: documentRoot.getAttribute('data-engine'),
      classList: documentRoot.className,
    },
    modeWitness: Object.fromEntries(
      SCHEMES.map((scheme) => [
        scheme,
        resolveInPage(document.body, slotOneExpression('bar-chart', scheme)),
      ]),
    ),
    rows: FAMILIES.flatMap((family) =>
      SCHEMES.map((scheme) => measureCell(family, scheme, mode)),
    ),
  };
  documentRoot.setAttribute('data-probe-result', JSON.stringify(census));
}

const host = document.getElementById('root');
if (host) {
  const mode = window.location.hash === '#dark' ? 'dark' : 'light';
  createRoot(host).render(<Scene mode={mode} />);
  // The provider stamps the mode in a layout effect and the chart measures its
  // own container before the marks exist; a settle tick covers both.
  window.setTimeout(() => probe(mode), 600);
}
