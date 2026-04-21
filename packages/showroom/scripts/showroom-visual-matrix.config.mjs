import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

export const SHOWROOM_PACKAGE_ROOT = path.resolve(SCRIPT_DIR, '..');
export const DEFAULT_BASE_URL = 'http://127.0.0.1:7001';
export const DEFAULT_OUTPUT_ROOT = '/tmp/showroom-visual-matrix';
export const DEFAULT_WAIT_MS = 3500;
export const DEFAULT_VIEWPORT = {
  width: 1440,
  height: 2200,
};

export const CANONICAL_VARIANTS = [
  {
    id: 'rottay-modern',
    tenant: 'rottay',
    engine: 'modern',
    label: 'Rottay / Modern',
    rationale: 'Flagship baseline for hierarchy, contrast rhythm, and polished docs framing.',
  },
  {
    id: 'rottay-classic',
    tenant: 'rottay',
    engine: 'classic',
    label: 'Rottay / Classic',
    rationale: 'Denser baseline that exposes wrapping, scanning pressure, and metadata overflow.',
  },
  {
    id: 'bithire-modern',
    tenant: 'bithire',
    engine: 'modern',
    label: 'BitHire / Modern',
    rationale: 'High-signal recruiting skin that pressures card balance, chips, and chart framing.',
  },
  {
    id: 'evnto-modern',
    tenant: 'evnto',
    engine: 'modern',
    label: 'Evnto / Modern',
    rationale: 'Roomier event presentation that reveals weak section framing and dead space.',
  },
  {
    id: 'evnto-rustic',
    tenant: 'evnto',
    engine: 'rustic',
    label: 'Evnto / Rustic',
    rationale: 'Warm rustic styling that exposes border contrast and premium-hierarchy regressions.',
  },
];

export const ROUTE_GROUPS = [
  {
    id: 'landing-home',
    label: 'Landing',
    route: '/',
    focus: 'Global hierarchy, hero wrapping, and first-impression shell balance.',
    variants: ['rottay-modern', 'evnto-rustic'],
  },
  {
    id: 'foundations-home',
    label: 'Foundations Overview',
    route: '/foundations',
    focus: 'Top-level segmentation, card cadence, and docs hierarchy.',
    variants: ['rottay-modern', 'rottay-classic'],
  },
  {
    id: 'patterns-overview',
    label: 'Patterns Overview',
    route: '/patterns',
    focus: 'Dense overview cards, line length, and category segmentation.',
    variants: ['rottay-modern', 'bithire-modern'],
  },
  {
    id: 'structures-headers',
    label: 'Structures Headers',
    route: '/structures/headers',
    focus: 'Structural spacing, metadata wrapping, and audit framing.',
    variants: ['rottay-modern', 'rottay-classic'],
  },
  {
    id: 'verticals-home',
    label: 'Verticals Overview',
    route: '/verticals',
    focus: 'Proof framing, card balance, and cross-tenant contrast rhythm.',
    variants: ['rottay-modern', 'bithire-modern', 'evnto-modern'],
  },
  {
    id: 'verticals-platform',
    label: 'Platform Vertical',
    route: '/verticals/platform',
    focus: 'Governance hierarchy, dense cards, and live demo framing.',
    variants: ['rottay-modern', 'rottay-classic'],
  },
  {
    id: 'verticals-bithire',
    label: 'BitHire Vertical',
    route: '/verticals/bithire',
    focus: 'Recruiting category cards, action-forward hierarchy, and chart surfaces.',
    variants: ['bithire-modern', 'rottay-modern'],
  },
  {
    id: 'verticals-evnto',
    label: 'Evnto Vertical',
    route: '/verticals/evnto',
    focus: 'Premium spacing, event hierarchy, and commercial framing.',
    variants: ['evnto-modern', 'evnto-rustic'],
  },
  {
    id: 'verticals-platform-identity',
    label: 'Platform Identity Appendix',
    route: '/verticals/platform/identity',
    focus: 'Scenario-row density, supporting-part chips, and appendix hierarchy.',
    variants: ['rottay-modern', 'rottay-classic'],
  },
  {
    id: 'verticals-evnto-ticketing',
    label: 'Evnto Ticketing Appendix',
    route: '/verticals/evnto/ticketing',
    focus: 'Long-form proof rows, spacing consistency, and card segmentation.',
    variants: ['evnto-modern', 'evnto-rustic'],
  },
  {
    id: 'playground',
    label: 'Playground',
    route: '/playground',
    focus: 'Runtime control parity and component chrome consistency.',
    variants: ['rottay-modern', 'rottay-classic', 'bithire-modern', 'evnto-rustic'],
  },
];

const VARIANT_LOOKUP = new Map(
  CANONICAL_VARIANTS.map((variant) => [variant.id, variant]),
);

function normalizeFilterValue(value) {
  return value.trim().toLowerCase();
}

function parseList(value) {
  if (!value) {
    return [];
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed)
        ? parsed.map((item) => String(item).trim()).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  }

  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readNumber(value, fallback) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatTimestamp(date = new Date()) {
  return date.toISOString().replaceAll(':', '-').replaceAll('.', '-');
}

function matchesRouteFilters(group, filters) {
  if (!filters.length) {
    return true;
  }

  const haystack = `${group.id} ${group.label} ${group.route}`.toLowerCase();
  return filters.some((filter) => haystack.includes(filter));
}

function matchesVariantFilters(variant, filters) {
  if (!filters.length) {
    return true;
  }

  const haystack =
    `${variant.id} ${variant.label} ${variant.tenant} ${variant.engine}`.toLowerCase();

  return filters.some((filter) => haystack.includes(filter));
}

export function createRunId(date = new Date()) {
  return formatTimestamp(date);
}

export function resolveOutputDir({
  outputDir,
  outputRoot = DEFAULT_OUTPUT_ROOT,
  runId = createRunId(),
} = {}) {
  if (outputDir) {
    return path.resolve(outputDir);
  }

  return path.resolve(outputRoot, runId);
}

export function expandCaptureMatrix({
  routeFilters = [],
  variantFilters = [],
} = {}) {
  const normalizedRouteFilters = routeFilters.map(normalizeFilterValue).filter(Boolean);
  const normalizedVariantFilters = variantFilters
    .map(normalizeFilterValue)
    .filter(Boolean);

  const captures = [];

  for (const group of ROUTE_GROUPS) {
    if (!matchesRouteFilters(group, normalizedRouteFilters)) {
      continue;
    }

    for (const variantId of group.variants) {
      const variant = VARIANT_LOOKUP.get(variantId);

      if (!variant) {
        throw new Error(`Unknown variant "${variantId}" in route group "${group.id}".`);
      }

      if (!matchesVariantFilters(variant, normalizedVariantFilters)) {
        continue;
      }

      captures.push({
        id: `${group.id}__${variant.id}`,
        groupId: group.id,
        groupLabel: group.label,
        route: group.route,
        focus: group.focus,
        variant,
      });
    }
  }

  return captures;
}

export function buildProbeUrl(baseUrl, capture) {
  const probeUrl = new URL('/probe/runtime', baseUrl);
  probeUrl.searchParams.set('tenant', capture.variant.tenant);
  probeUrl.searchParams.set('engine', capture.variant.engine);
  probeUrl.searchParams.set('path', capture.route);
  return probeUrl.toString();
}

export function buildTargetUrl(baseUrl, capture) {
  const targetUrl = new URL(capture.route, baseUrl);
  targetUrl.searchParams.set('tenant', capture.variant.tenant);
  targetUrl.searchParams.set('engine', capture.variant.engine);
  return targetUrl.toString();
}

export function fileNameForCapture(capture) {
  return `${capture.id}.png`;
}

export function resolveAuditEnv(env = process.env) {
  const routeFilters = parseList(env.SHOWROOM_AUDIT_ROUTE_FILTERS);
  const variantFilters = parseList(env.SHOWROOM_AUDIT_VARIANT_FILTERS);
  const runId = env.SHOWROOM_AUDIT_RUN_ID || createRunId();

  return {
    baseUrl: env.SHOWROOM_AUDIT_BASE_URL || DEFAULT_BASE_URL,
    outputDir: resolveOutputDir({
      outputDir: env.SHOWROOM_AUDIT_OUTPUT_DIR,
      outputRoot: env.SHOWROOM_AUDIT_OUTPUT_ROOT || DEFAULT_OUTPUT_ROOT,
      runId,
    }),
    outputRoot: env.SHOWROOM_AUDIT_OUTPUT_ROOT || DEFAULT_OUTPUT_ROOT,
    routeFilters,
    variantFilters,
    waitMs: readNumber(env.SHOWROOM_AUDIT_WAIT_MS, DEFAULT_WAIT_MS),
    runId,
  };
}

export function parseCliArgs(argv) {
  const options = {
    baseUrl: DEFAULT_BASE_URL,
    outputDir: '',
    outputRoot: DEFAULT_OUTPUT_ROOT,
    routeFilters: [],
    variantFilters: [],
    waitMs: DEFAULT_WAIT_MS,
    runId: createRunId(),
    listOnly: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = argv[index + 1];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--list') {
      options.listOnly = true;
      continue;
    }

    if (arg === '--base-url' && nextValue) {
      options.baseUrl = nextValue;
      index += 1;
      continue;
    }

    if (arg === '--output-dir' && nextValue) {
      options.outputDir = nextValue;
      index += 1;
      continue;
    }

    if (arg === '--output-root' && nextValue) {
      options.outputRoot = nextValue;
      index += 1;
      continue;
    }

    if (arg === '--run-id' && nextValue) {
      options.runId = nextValue;
      index += 1;
      continue;
    }

    if (arg === '--wait-ms' && nextValue) {
      options.waitMs = readNumber(nextValue, DEFAULT_WAIT_MS);
      index += 1;
      continue;
    }

    if (arg === '--route' && nextValue) {
      options.routeFilters.push(nextValue);
      index += 1;
      continue;
    }

    if (arg === '--variant' && nextValue) {
      options.variantFilters.push(nextValue);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    ...options,
    outputDir: resolveOutputDir({
      outputDir: options.outputDir,
      outputRoot: options.outputRoot,
      runId: options.runId,
    }),
  };
}

export function buildManifest({
  baseUrl,
  outputDir,
  waitMs,
  routeFilters,
  variantFilters,
  startedAt,
  finishedAt,
  captures,
}) {
  const totalCaptured = captures.filter((capture) => capture.status === 'captured').length;
  const totalFailed = captures.length - totalCaptured;

  return {
    generatedAt: finishedAt,
    startedAt,
    finishedAt,
    baseUrl,
    outputDir,
    waitMs,
    routeFilters,
    variantFilters,
    totalPlanned: captures.length,
    totalCaptured,
    totalFailed,
    captures,
  };
}

export function renderHtmlReport(manifest) {
  const captureGroups = [];
  const groupLookup = new Map();

  for (const capture of manifest.captures) {
    if (!groupLookup.has(capture.groupId)) {
      const group = {
        id: capture.groupId,
        label: capture.groupLabel,
        route: capture.route,
        focus: capture.focus,
        captures: [],
      };
      groupLookup.set(capture.groupId, group);
      captureGroups.push(group);
    }

    groupLookup.get(capture.groupId).captures.push(capture);
  }

  const groupMarkup = captureGroups
    .map((group) => {
      const cards = group.captures
        .map((capture) => {
          const statusClass =
            capture.status === 'captured' ? 'capture-card' : 'capture-card capture-card-failed';
          const imageMarkup =
            capture.status === 'captured'
              ? `<img src="${escapeHtml(capture.fileName)}" alt="${escapeHtml(
                  `${capture.groupLabel} — ${capture.variantLabel}`,
                )}" loading="lazy" />`
              : `<div class="capture-error">${escapeHtml(
                  capture.error || 'Capture failed',
                )}</div>`;

          return `
            <article class="${statusClass}">
              <header class="capture-head">
                <div>
                  <p class="capture-kicker">${escapeHtml(capture.variantLabel)}</p>
                  <h3>${escapeHtml(capture.route)}</h3>
                </div>
                <span class="capture-pill">${escapeHtml(capture.variantId)}</span>
              </header>
              <p class="capture-copy">${escapeHtml(capture.variantRationale)}</p>
              ${imageMarkup}
            </article>
          `;
        })
        .join('\n');

      return `
        <section class="group">
          <div class="group-head">
            <div>
              <p class="group-kicker">${escapeHtml(group.route)}</p>
              <h2>${escapeHtml(group.label)}</h2>
            </div>
            <p class="group-focus">${escapeHtml(group.focus)}</p>
          </div>
          <div class="capture-grid">
            ${cards}
          </div>
        </section>
      `;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Showroom Visual Matrix</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0b1020;
        --surface: #121a2b;
        --surface-strong: #172138;
        --border: rgba(148, 163, 184, 0.22);
        --text: #f8fafc;
        --muted: #94a3b8;
        --accent: #60a5fa;
        --danger: #fca5a5;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: Inter, system-ui, sans-serif;
        background: radial-gradient(circle at top, rgba(96, 165, 250, 0.12), transparent 24%), var(--bg);
        color: var(--text);
      }

      main {
        width: min(1680px, calc(100vw - 48px));
        margin: 0 auto;
        padding: 40px 0 64px;
      }

      .hero {
        display: grid;
        gap: 12px;
        padding: 24px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 55%), var(--surface);
      }

      .hero h1,
      .group h2,
      .capture-head h3 {
        margin: 0;
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .meta span,
      .capture-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.04);
        color: var(--muted);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .summary {
        color: var(--muted);
        line-height: 1.6;
        max-width: 960px;
      }

      .group {
        margin-top: 32px;
        padding: 20px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: var(--surface);
      }

      .group-head {
        display: grid;
        gap: 8px;
        margin-bottom: 20px;
      }

      .group-kicker,
      .capture-kicker {
        margin: 0 0 6px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .group-focus,
      .capture-copy {
        margin: 0;
        color: var(--muted);
        line-height: 1.55;
      }

      .capture-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
        gap: 16px;
      }

      .capture-card {
        display: grid;
        gap: 14px;
        padding: 16px;
        border-radius: 20px;
        border: 1px solid var(--border);
        background: var(--surface-strong);
      }

      .capture-card-failed {
        border-color: rgba(252, 165, 165, 0.42);
      }

      .capture-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      img {
        width: 100%;
        height: auto;
        display: block;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: #090f1d;
      }

      .capture-error {
        padding: 16px;
        border-radius: 16px;
        border: 1px solid rgba(252, 165, 165, 0.42);
        background: rgba(127, 29, 29, 0.18);
        color: var(--danger);
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="meta">
          <span>${escapeHtml(String(manifest.totalCaptured))} captured</span>
          <span>${escapeHtml(String(manifest.totalFailed))} failed</span>
          <span>${escapeHtml(manifest.baseUrl)}</span>
          <span>wait ${escapeHtml(String(manifest.waitMs))}ms</span>
        </div>
        <h1>Showroom visual QA matrix</h1>
        <p class="summary">
          Canonical captures for spacing, wrapping, and hierarchy regressions across selected showroom routes and tenant/engine combinations.
        </p>
        <p class="summary">
          Generated at ${escapeHtml(manifest.generatedAt)}.
        </p>
      </section>
      ${groupMarkup}
    </main>
  </body>
</html>`;
}
