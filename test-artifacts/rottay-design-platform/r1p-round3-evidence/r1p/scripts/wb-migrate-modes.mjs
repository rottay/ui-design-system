/**
 * W-B step 4: migrate the three authored mode blocks into typed
 * `BrandTheme.modes` overlays and strip what moved out of the extension.
 *
 * Every declaration is classified against the contract:
 *   DROP    - the mode restates the base value; the base block already ships it
 *   MIGRATE - a contract field reaches this channel VERBATIM -> overlay field
 *   KEEP    - no typed field; stays in the extension as a declared capability gap
 *
 * Nothing is inferred loosely: a channel migrates only when a field is known to
 * emit it verbatim, so the value that ships cannot change on the way in.
 *
 *   node wb-migrate-modes.mjs          # plan only
 *   node wb-migrate-modes.mjs --write  # plan + rewrite TS and extensions
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { loadSource, CORE_ROOT } from './source-loader.mjs';
import { effectiveMap } from './effective-map.mjs';

const R1P = '/private/tmp/rottay-design-platform-independent-audit-round-3/r1p';
const require_ = createRequire(`${CORE_ROOT}/package.json`);
const postcss = require_('postcss');
const write = process.argv.includes('--write');

const RAMP_ROLES = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info', 'neutral'];
const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

/** Channels the contract additions of this wave reach, field-for-channel. */
const NEW_FIELD_CHANNELS = {
  '--ds-color-primary-hover': 'palette.primaryHoverColor',
  '--ds-color-secondary-hover': 'palette.secondaryHoverColor',
  '--ds-color-accent-hover': 'palette.accentHoverColor',
  '--ds-color-text-on-primary': 'palette.onPrimaryColor',
  '--ds-color-primary-foreground': 'palette.primaryForegroundColor',
  '--ds-color-text-tertiary': 'palette.textTertiaryColor',
  '--ds-color-border': 'palette.borderColor',
  '--ds-color-border-tertiary': 'palette.borderTertiaryColor',
  '--ds-color-border-subtle': 'palette.borderSubtleColor',
  '--ds-color-border-focus': 'palette.borderFocusColor',
  '--ds-color-bg-secondary': 'palette.backgroundSecondaryColor',
  '--ds-color-bg-tertiary': 'palette.backgroundTertiaryColor',
  '--ds-color-bg-elevated': 'palette.backgroundElevatedColor',
  '--ds-color-bg-surface': 'palette.backgroundSurfaceColor',
  '--ds-color-bg-overlay': 'palette.backgroundOverlayColor',
  '--ds-color-success-bg': 'palette.successBgColor',
  '--ds-color-success-border': 'palette.successBorderColor',
  '--ds-color-warning-bg': 'palette.warningBgColor',
  '--ds-color-warning-border': 'palette.warningBorderColor',
  '--ds-color-error-bg': 'palette.errorBgColor',
  '--ds-color-error-border': 'palette.errorBorderColor',
  '--ds-color-info-bg': 'palette.infoBgColor',
  '--ds-color-info-border': 'palette.infoBorderColor',
  '--ds-color-link': 'palette.linkColor',
  '--ds-color-link-hover': 'palette.linkHoverColor',
  '--ds-color-link-visited': 'palette.linkVisitedColor',
  '--ds-color-interactive-border': 'palette.interactiveBorderColor',
  '--ds-color-interactive-bg-hover': 'palette.interactiveBgHoverColor',
  '--ds-color-interactive-bg-active': 'palette.interactiveBgActiveColor',
  '--ds-color-interactive-bg-muted': 'palette.interactiveBgMutedColor',
  '--ds-radius-full': 'surfaces.borderRadius.full',
  '--ds-sidebar-group-margin-top': 'chrome.sidebar.groupMarginTop',
  '--ds-sidebar-group-margin-bottom': 'chrome.sidebar.groupMarginBottom',
  '--ds-sidebar-group-padding-top': 'chrome.sidebar.groupPaddingTop',
  '--ds-sidebar-group-border': 'chrome.sidebar.groupBorder',
  '--ds-sidebar-item-indent': 'chrome.sidebar.itemIndent',
};
for (const role of RAMP_ROLES) {
  for (const step of RAMP_STEPS) {
    NEW_FIELD_CHANNELS[`--ds-color-${role}-${step}`] = `palette.ramps.${role}.${step}`;
  }
}

const contractMap = JSON.parse(readFileSync(`${R1P}/closure/wb-contract-map.json`, 'utf-8'));

const m = await loadSource({
  compiler: '/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
  bithire: '/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts',
  evnto: '/src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts',
  platform: '/src/foundation/tokens/ts/presentation/brand-themes/platform/index.ts',
});
const { compileBrandTheme } = m.compiler;
const firstExport = (mod) => Object.values(mod).find((v) => v && typeof v === 'object' && 'id' in v);
const THEMES = {
  bithire: firstExport(m.bithire),
  evnto: firstExport(m.evnto),
  rottay: firstExport(m.platform),
};

const norm = (v) => v.replace(/\s+/g, ' ').trim();

/** Nest a flat list of {path, value} into the overlay object shape. */
function buildOverlay(entries) {
  const tree = {};
  for (const { path, value } of entries) {
    const parts = path.split('.');
    let cur = tree;
    for (const part of parts.slice(0, -1)) cur = (cur[part] ??= {});
    cur[parts.at(-1)] = value;
  }
  return tree;
}

/** Same deep merge the compiler performs, for planning purposes. */
function applyOverlay(theme, overlay) {
  const merge = (base, over) => {
    if (over === undefined) return base;
    if (!over || typeof over !== 'object' || Array.isArray(over) || !base || typeof base !== 'object' || Array.isArray(base)) return over;
    const out = { ...base };
    for (const [k, v] of Object.entries(over)) if (v !== undefined) out[k] = merge(base[k], v);
    return out;
  };
  return {
    ...theme,
    palette: merge(theme.palette, overlay.palette),
    typography: merge(theme.typography, overlay.typography),
    surfaces: merge(theme.surfaces, overlay.surfaces),
    chrome: merge(theme.chrome, overlay.chrome),
  };
}

/** The mode-block region of an extension, with byte offsets so we can rewrite it. */
function modeRegion(css, file) {
  const root = postcss.parse(css, { from: file });
  let found = null;
  root.walkComments((comment) => {
    if (found || !/@ds-exception\s+kind=mode-block/.test(comment.text)) return;
    let node = comment.next();
    while (node && node.type !== 'rule') node = node.next();
    if (!node) return;
    found = {
      comment,
      rule: node,
      selector: node.selector,
      decls: (node.nodes ?? []).filter((d) => d.type === 'decl').map((d) => ({ prop: d.prop, value: d.value })),
    };
  });
  return { root, found };
}

const plan = {};
for (const [slug, mode] of [['bithire', 'dark'], ['evnto', 'dark'], ['rottay', 'light']]) {
  const theme = THEMES[slug];
  const baseVars = compileBrandTheme({ brandTheme: theme, tenantSlug: slug }).cssVariables;
  const extPath = `${CORE_ROOT}/src/foundation/tokens/css/facade/artifacts/${slug}/_source/extension.css`;
  const css = readFileSync(extPath, 'utf-8');
  const { root, found } = modeRegion(css, slug);
  if (!found) throw new Error(`${slug}: no mode-block region found`);

  const verbatimMap = contractMap[slug].byVar;
  const drop = [];
  const migrate = [];
  const keep = [];

  for (const decl of found.decls) {
    if (decl.prop === 'color-scheme') { drop.push({ ...decl, why: 'compiler emits color-scheme per mode' }); continue; }
    const base = baseVars[decl.prop];
    if (base !== undefined && norm(base).toLowerCase() === norm(decl.value).toLowerCase()) {
      drop.push({ ...decl, why: 'restates the base value' });
      continue;
    }
    // A mode block restating `--ds-font-family-*` is the evnto regression class
    // W1 adjudicated under AD-1, surviving in the other two verticals: the hand
    // stack drops the mandatory "Noto Sans Arabic" fallback (rottay's is
    // otherwise byte-identical to the compiled one; bithire's also discards the
    // authored font-pack identity). Type is mode-invariant for all three, so
    // the compiled base value is canonical and the restatement is deleted. A
    // vertical that genuinely needs per-mode type authors modes.<m>.typography,
    // where the AD-6 guard now holds it to the fallback.
    if (/^--ds-font-family-/.test(decl.prop)) {
      drop.push({ ...decl, why: 'mode block restated type without the mandatory Arabic fallback (AD-6); compiled base is canonical', wasVisualChange: true, base });
      continue;
    }
    const newField = NEW_FIELD_CHANNELS[decl.prop];
    const existing = (verbatimMap[decl.prop] ?? []).find((c) => c.kind === 'verbatim');
    const path = newField ?? existing?.path;
    if (path) migrate.push({ ...decl, path });
    else keep.push(decl);
  }

  // ── ramp pins ──
  // A mode overlay that moves the ground re-derives every ramp whose role the
  // hand block did not pin, which would silently repaint channels this wave is
  // not allowed to touch. AD-1: the value that SHIPS today is canonical, so any
  // ramp step the overlay would move is pinned to the shipped value. Pins are
  // authored data, not derivation defeat -- deleting one hands the role back to
  // the OKLCH derivation, which is the R2/R3 sighted decision, not this wave's.
  const pins = [];
  {
    const shipped = Object.fromEntries(
      [...effectiveMap(readFileSync(`${R1P}/closure/wb-snapshot/${slug}.index.css`, 'utf-8'), mode, slug)]
        .map(([k, v]) => [k, v.value]),
    );
    const overlay = buildOverlay(migrate);
    const merged = applyOverlay(theme, overlay);
    const modeVars = compileBrandTheme({ brandTheme: merged, tenantSlug: slug }).cssVariables;
    const rampChannel = /^--ds-color-(primary|secondary|accent|success|warning|error|info|neutral)-(\d+)$/;
    for (const [prop, value] of Object.entries(modeVars)) {
      const match = rampChannel.exec(prop);
      if (!match) continue;
      const ships = shipped[prop];
      if (ships === undefined || norm(ships).toLowerCase() === norm(value).toLowerCase()) continue;
      pins.push({ prop, value: ships, path: `palette.ramps.${match[1]}.${match[2]}`, wouldHaveBecome: value });
    }
  }

  plan[slug] = { mode, selector: found.selector, total: found.decls.length, drop, migrate, keep, pins };
  console.log(`${slug} (${mode}): ${found.decls.length} decls -> drop ${drop.length}, migrate ${migrate.length}, keep ${keep.length}, ramp pins ${pins.length}`);

  if (!write) continue;

  // ── rewrite the extension: keep only the un-migratable declarations ──
  if (keep.length === 0) {
    found.comment.remove();
    found.rule.remove();
  } else {
    for (const node of [...found.rule.nodes]) {
      if (node.type !== 'decl') continue;
      if (!keep.some((k) => k.prop === node.prop && k.value === node.value)) node.remove();
    }
    found.comment.text = [
      `@ds-exception kind=capability-gap`,
      `   owner=claude`,
      `   purpose="${mode}-mode channels with no typed BrandTheme field; the compiler owns every channel it can express"`,
      `   reachability=mode:${mode}`,
      `   retire="each channel either gains a semantic contract field or moves to its owning app/component layer"`,
    ].join('\n');
  }
  writeFileSync(extPath, root.toString());
}

writeFileSync(`${R1P}/closure/wb-migration-plan.json`, JSON.stringify(plan, null, 1));

if (write) {
  // ── build the typed overlay literal and splice it into each BrandTheme ──
  for (const [slug, themeFile] of [['bithire', 'bithire'], ['evnto', 'evnto'], ['rottay', 'platform']]) {
    const { mode, migrate, pins } = plan[slug];
    const tree = buildOverlay([...migrate, ...pins]);
    const render = (node, indent) => {
      const pad = '  '.repeat(indent);
      const lines = [];
      for (const [key, value] of Object.entries(node)) {
        const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `${key}`;
        if (typeof value === 'string') lines.push(`${pad}${safeKey}: ${JSON.stringify(value)},`);
        else lines.push(`${pad}${safeKey}: {\n${render(value, indent + 1)}\n${pad}},`);
      }
      return lines.join('\n');
    };
    const literal = [
      '',
      `  /**`,
      `   * ${mode.toUpperCase()} mode. Authored as a typed overlay of the semantic`,
      `   * families: the compiler merges it over the body above, runs the same`,
      `   * family compilers, and emits only what moves. These values shipped as a`,
      `   * hand-written block in this vertical's artifact extension until R1-P.`,
      `   *`,
      `   * The \`ramps\` entries are the steps this mode ships today. Most were`,
      `   * pinned by hand in that block; the rest are pinned here because moving`,
      `   * the ground would otherwise re-derive them, and re-deriving is a sighted`,
      `   * decision rather than an architectural one. Deleting a pin returns that`,
      `   * step to the OKLCH derivation.`,
      `   */`,
      '  modes: {',
      `    ${mode}: {`,
      render(tree, 3),
      '    },',
      '  },',
    ].join('\n');

    const tsPath = `${CORE_ROOT}/src/foundation/tokens/ts/presentation/brand-themes/${themeFile}/index.ts`;
    const ts = readFileSync(tsPath, 'utf-8');
    const anchor = /^(\s*appearance: \{ defaultMode: ['"](?:light|dark)['"] \},)$/m;
    if (!anchor.test(ts)) throw new Error(`${slug}: appearance anchor not found`);
    writeFileSync(tsPath, ts.replace(anchor, `$1\n${literal}`));
    console.log(`${slug}: wrote modes.${mode} overlay (${migrate.length} fields) into ${themeFile}/index.ts`);
  }
}
