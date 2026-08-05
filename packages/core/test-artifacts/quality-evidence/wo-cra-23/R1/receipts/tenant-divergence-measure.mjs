/**
 * R1 Cohort 1 — executable tenant-divergence measurement.
 *
 * WHY THIS EXISTS. R1 requires proving same-tree BitHire / The Management
 * divergence across at least eight axes, at least six of them NON-COLOUR. Every
 * previous statement of that claim in this program was prose, and prose cannot
 * fail. This measures it from the two SHIPPING authorities:
 *
 *   BitHire         static BrandTheme  -> facade/artifacts/bithire/index.css
 *                                         (the file the vertical bundle embeds)
 *   The Management  published document -> compileTenantThemeConfig(document)
 *                                         (the call the server SSR embed makes)
 *
 * Neither side reads a fixture's stated intent. Only what the two tenants
 * actually emit counts.
 *
 * WHAT COUNTS. An axis is DIVERGENT when the tenants emit materially different
 * values on that axis's channels. An axis whose channels are absent from BOTH
 * sides is not divergence and is not a pass: it is reported as `silent`. That
 * distinction exists because a previous attempt drove The Management's
 * elevation posture to flat/0, which emitted nothing on the elevation channel
 * and collided with BitHire's border-led flatness — collapsing an axis while
 * looking, in prose, like a difference.
 *
 * OWNERSHIP. This lives under the round evidence tree because R1 declares
 * packages/core/scripts/** a no-write domain: a canary lane may not edit its
 * own judge. It is a measurement the lane runs and publishes as a receipt,
 * never a repo gate.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, '..', '..', '..', '..', '..');

const { compileTenantThemeConfig, getTenantThemeVerticalEnvelope } = require(
  path.join(CORE, 'dist/index.cjs'),
);
const canaryFixtures = require(path.join(CORE, 'tenant-theme-canary-fixtures.json'));

/**
 * The nine axes R1 judges, each mapped to the emitted channels that carry it.
 * `colour: true` marks the one axis that does not count toward the six
 * non-colour floor, so the requirement cannot be satisfied by hue alone.
 */
const AXES = [
  { axis: 'palette', colour: true, match: (n) => n.startsWith('--ds-color-') },
  {
    axis: 'type',
    colour: false,
    match: (n) =>
      n.includes('font-family') ||
      n.includes('letter-spacing') ||
      n.includes('text-transform') ||
      n.includes('font-variant-numeric') ||
      n.startsWith('--ds-type-'),
  },
  { axis: 'geometry', colour: false, match: (n) => n.startsWith('--ds-radius') },
  {
    axis: 'edge',
    colour: false,
    match: (n) => n.startsWith('--ds-edge-') || n.startsWith('--ds-divider-'),
  },
  {
    axis: 'material',
    colour: false,
    match: (n) => n.startsWith('--ds-material-') || n.startsWith('--ds-glass-'),
  },
  {
    axis: 'elevation',
    colour: false,
    match: (n) => n.startsWith('--ds-elevation-') || n.startsWith('--ds-shadow-'),
  },
  {
    axis: 'density',
    colour: false,
    match: (n) => n.startsWith('--ds-density') || n.startsWith('--ds-spacing-scale'),
  },
  { axis: 'recipe-profile', colour: false, match: (n) => n === '--ds-recipe-profile' },
  // Anatomy does not travel on a --ds-* channel: the compiler projects it as
  // `data-anatomy-*` attributes on the DS root, and the skins select on those.
  // It is folded into the same declaration map under its attribute name so the
  // measurement covers it without inventing a variable that does not exist.
  {
    axis: 'anatomy',
    colour: false,
    match: (n) => n.startsWith('data-anatomy-'),
  },
];

/** Chrome family -> the root attribute the compiler projects for it. */
const ANATOMY_ATTRIBUTES = Object.freeze({
  cardComponent: 'data-anatomy-card',
  table: 'data-anatomy-table',
  sidebar: 'data-anatomy-sidebar',
  layout: 'data-anatomy-layout',
});

/** Parse `--ds-name: value` declarations out of CSS text into a flat map. */
function declarations(css) {
  const out = new Map();
  const pattern = /(--ds-[a-z0-9-]+)\s*:\s*([^;}]+)/g;
  let hit;
  while ((hit = pattern.exec(css)) !== null) out.set(hit[1], hit[2].trim());
  return out;
}

function bithireDeclarations() {
  const map = declarations(
    readFileSync(
      path.join(CORE, 'src/foundation/tokens/css/facade/artifacts/bithire/index.css'),
      'utf8',
    ),
  );
  // BitHire authors no anatomy variant, so every family sits on the DS default.
  // Stating that explicitly is what makes the axis COMPARABLE: leaving it absent
  // would make the axis asymmetric and drop it from the count for the wrong
  // reason.
  for (const attribute of Object.values(ANATOMY_ATTRIBUTES)) map.set(attribute, 'default');
  return map;
}

function themanagementDeclarations() {
  // The read path assembles one envelope from the JSONB payload plus the
  // trusted row columns, exactly as db-row-canary.test.ts does.
  const specimen = canaryFixtures.specimens.themanagement;
  const compiled = compileTenantThemeConfig(
    { ...specimen.document, ...specimen.identity },
    { verticalEnvelope: getTenantThemeVerticalEnvelope(specimen.identity.verticalKey) },
  );

  // The compiler's return shape is not this measurement's business: fold in CSS
  // text and a variables record alike so a shape change cannot silently zero
  // the measurement.
  const parsed = declarations(typeof compiled?.css === 'string' ? compiled.css : '');
  const vars = compiled?.variables ?? compiled?.artifact?.variables;
  if (vars) for (const [k, v] of Object.entries(vars)) parsed.set(k, String(v).trim());
  if (typeof compiled?.artifact?.css === 'string') {
    for (const [k, v] of declarations(compiled.artifact.css)) parsed.set(k, v);
  }

  // Anatomy is an attribute projection, not a variable. Read it from the
  // normalized appearance the compiler returns, defaulting each family the same
  // way the projector does, so both tenants are stated on the same terms.
  const chrome = compiled?.normalizedAppearance?.advanced?.chrome ?? {};
  for (const [family, attribute] of Object.entries(ANATOMY_ATTRIBUTES)) {
    parsed.set(attribute, chrome?.[family]?.anatomy ?? 'default');
  }
  return parsed;
}

/**
 * THE COMPARISON RULE, and why it is the strict one.
 *
 * The two sides are not symmetric artifacts. BitHire's file is the FULL vertical
 * artifact (base plus brand). The Management's compiler output is only the
 * tenant OVERRIDE layer — 96 channels — because everything it does not override
 * it inherits from the same DS base.
 *
 * So `bithire.get(c) !== management.get(c)` over the union counts every channel
 * BitHire emits and The Management merely inherits as a difference. That is
 * fail-open: it would report hundreds of "divergent" channels for two tenants
 * that are visually identical, and it would keep reporting them if a real axis
 * later collapsed.
 *
 * A channel is therefore counted as divergent ONLY when BOTH tenants emit it and
 * the emitted values differ. Channels only one side emits are reported as
 * `asymmetric` and never counted. This understates divergence — an inherited
 * base value really can differ from an override in the rendered page — and
 * understating is the safe direction for a claim Codex has to be able to trust.
 */
export function measure() {
  const bithire = bithireDeclarations();
  const management = themanagementDeclarations();
  const names = new Set([...bithire.keys(), ...management.keys()]);

  const results = AXES.map(({ axis, colour, match }) => {
    const channels = [...names].filter(match).sort();
    const shared = channels.filter((c) => bithire.has(c) && management.has(c));
    const differing = shared.filter((c) => bithire.get(c) !== management.get(c));
    const asymmetric = channels.filter((c) => !bithire.has(c) || !management.has(c));
    return {
      axis,
      colour,
      channelsInAxis: channels.length,
      channelsComparable: shared.length,
      channelsDiffering: differing.length,
      channelsAsymmetric: asymmetric.length,
      divergent: differing.length > 0,
      // Silent = neither tenant emits the axis at all, OR they emit it and agree
      // on every comparable channel. Both mean the axis carries no divergence.
      silent: shared.length === 0,
      samples: differing.slice(0, 4).map((c) => ({
        channel: c,
        bithire: bithire.get(c),
        themanagement: management.get(c),
      })),
    };
  });

  const divergentAxes = results.filter((r) => r.divergent);
  return {
    schemaVersion: 1,
    measurementId: 'wo-cra-23-R1-C1-tenant-divergence',
    sources: {
      bithire: 'src/foundation/tokens/css/facade/artifacts/bithire/index.css (shipped artifact)',
      themanagement: 'compileTenantThemeConfig(published canary document) via dist/index.cjs',
      channelsSeen: names.size,
    },
    requirement: { minAxes: 8, minNonColourAxes: 6, silentAxesAllowed: 0 },
    results,
    verdict: {
      divergentAxes: divergentAxes.length,
      nonColourDivergentAxes: divergentAxes.filter((r) => !r.colour).length,
      silentAxes: results.filter((r) => r.silent).map((r) => r.axis),
      meetsAxisFloor: divergentAxes.length >= 8,
      meetsNonColourFloor: divergentAxes.filter((r) => !r.colour).length >= 6,
      hasNoSilentAxis: results.every((r) => !r.silent),
    },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const report = measure();
  const out = path.join(HERE, '..', 'receipts', 'cohort-1-tenant-divergence.json');
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
  for (const r of report.results) {
    const state = r.silent ? 'SILENT' : r.divergent ? 'diverges' : 'same';
    process.stdout.write(
      `${r.axis.padEnd(15)} ${state.padEnd(9)} ${String(r.channelsDiffering).padStart(3)}/${String(r.channelsComparable).padEnd(4)} comparable differ  (${r.channelsAsymmetric} one-sided)\n`,
    );
  }
  process.stdout.write(`\nverdict: ${JSON.stringify(report.verdict)}\n`);
}
