#!/usr/bin/env node
/**
 * anatomy-variant-gate — the white-label anatomy-variant gate (W4-A).
 *
 * Anatomy variants are DATA: a closed enum per participating chrome family
 * (`TENANT_THEME_ANATOMY_VARIANTS_V1`, the CONTRACT single source) that selects
 * among code-owned skin variants. The tenant compiler projects a non-`default`
 * value onto a `data-anatomy-<attr>` attribute on the DS root; the engine skins
 * carry the matching `[data-anatomy-<attr>='<variant>']` selector blocks. A
 * schema-legal value with NO rendering is the P-79 "declared, not honoured"
 * class; a skin selector for an UNregistered value is a dead selector. This gate
 * keeps both sides in lockstep and, for the classic engine (which wraps Ant and
 * owns no first-party skin CSS), asserts an explicit support manifest instead.
 *
 * Algorithm (design 1.5):
 *   1. Read TENANT_THEME_ANATOMY_VARIANTS_V1 from the CONTRACT (single source).
 *   2. Forward: for every (family, variant != 'default') x (modern, rustic),
 *      assert at least one `[data-anatomy-<attr>='<variant>']` selector exists
 *      in that engine's skin dir. Missing = FAIL.
 *   3. Reverse: every `data-anatomy-*` selector in either skin dir must resolve
 *      to a registered (family, non-'default' variant). Otherwise = FAIL (dead
 *      selector).
 *   4. Classic: assert classic-anatomy-support.json declares one valid row
 *      (support level + non-empty reason) for every (family, non-'default'
 *      variant), and no rows for unregistered/`default` variants.
 *
 * COORDINATION: `FAMILY_ATTRIBUTE` maps each CONTRACT family key to its
 * `data-anatomy-<attr>` suffix. It MUST stay in lockstep with the compiler's
 * `tenantThemeAnatomyAttributes` projection (design 1.3); the gate fails closed
 * if a registered family has no mapping here.
 *
 * Usage:
 *   node scripts/anatomy-variant-gate.mjs            # print the report
 *   node scripts/anatomy-variant-gate.mjs --check    # exit 1 on any violation
 *   node scripts/anatomy-variant-gate.mjs --check --quiet
 *   (fixture overrides, for the self-test:)
 *   node scripts/anatomy-variant-gate.mjs --check \
 *     --contract <file.ts> --modern-skin <dir> --rustic-skin <dir> \
 *     --manifest <file.json>
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');

const ENGINES_ROOT = join(
  packageRoot,
  'src/foundation/tokens/css/runtime/engines',
);
const DEFAULT_PATHS = {
  contract: join(
    packageRoot,
    'src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts',
  ),
  modernSkin: join(ENGINES_ROOT, 'modern/skin'),
  rusticSkin: join(ENGINES_ROOT, 'rustic/skin'),
  manifest: join(ENGINES_ROOT, 'classic/classic-anatomy-support.json'),
};

const VOCABULARY_EXPORT = 'TENANT_THEME_ANATOMY_VARIANTS_V1';
const DEFAULT_VARIANT = 'default';
const SUPPORT_LEVELS = ['supported', 'approximated', 'unsupported'];

/**
 * CONTRACT family key -> the `data-anatomy-<attr>` suffix the compiler stamps.
 * Only `cardComponent` is non-identity. Must match `tenantThemeAnatomyAttributes`
 * (design 1.3); a registered family absent here fails the gate.
 */
export const FAMILY_ATTRIBUTE = Object.freeze({
  cardComponent: 'card',
  table: 'table',
  sidebar: 'sidebar',
  layout: 'layout',
});

/** attribute suffix -> family key, derived from FAMILY_ATTRIBUTE. */
export function attributeToFamily() {
  const out = {};
  for (const [family, attr] of Object.entries(FAMILY_ATTRIBUTE)) out[attr] = family;
  return out;
}

/**
 * Parse the `TENANT_THEME_ANATOMY_VARIANTS_V1 = { ... } as const` object literal
 * out of the CONTRACT source. Returns { familyKey: [variant, ...] } or null when
 * the export is absent (a partial/missing landlord landing).
 */
export function parseAnatomyVocabulary(source) {
  const block = new RegExp(
    `${VOCABULARY_EXPORT}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*as const`,
  ).exec(source);
  if (!block) return null;
  const body = block[1];
  const vocab = {};
  const entryRe = /([A-Za-z_$][\w$]*)\s*:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = entryRe.exec(body)) !== null) {
    const family = m[1];
    const variants = [...m[2].matchAll(/['"]([^'"]+)['"]/g)].map((v) => v[1]);
    vocab[family] = variants;
  }
  return Object.keys(vocab).length ? vocab : null;
}

/**
 * Find every `[data-anatomy-<attr>='<variant>']` occurrence in a CSS string.
 * Accepts single or double quotes and surrounding whitespace.
 */
export function findAnatomySelectors(cssText) {
  const re = /\[\s*data-anatomy-([a-z][a-z-]*)\s*=\s*['"]([^'"]+)['"]\s*\]/g;
  const out = [];
  let m;
  while ((m = re.exec(cssText)) !== null) out.push({ attr: m[1], variant: m[2] });
  return out;
}

/** List `.css` files under a skin dir (recursive; skin dirs are flat today). */
function collectCssFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectCssFiles(full));
    else if (full.endsWith('.css')) out.push(full);
  }
  return out;
}

/** Collect { file, attr, variant } for every anatomy selector in a skin dir. */
export function collectEngineSelectors(dir) {
  const out = [];
  for (const file of collectCssFiles(dir)) {
    const css = readFileSync(file, 'utf8');
    for (const hit of findAnatomySelectors(css)) out.push({ file, ...hit });
  }
  return out;
}

/** Every registered family must have a FAMILY_ATTRIBUTE entry, and vice versa. */
export function checkFamilyMapping(vocab) {
  const issues = [];
  for (const family of Object.keys(vocab)) {
    if (!(family in FAMILY_ATTRIBUTE)) {
      issues.push(
        `family '${family}' is registered in ${VOCABULARY_EXPORT} but has no FAMILY_ATTRIBUTE mapping (update the gate and the compiler projection together)`,
      );
    }
  }
  for (const family of Object.keys(FAMILY_ATTRIBUTE)) {
    if (!(family in vocab)) {
      issues.push(
        `family '${family}' is mapped in FAMILY_ATTRIBUTE but absent from ${VOCABULARY_EXPORT} (stale gate map)`,
      );
    }
  }
  return issues;
}

/**
 * Forward coverage: every (family, non-default variant) must have a selector in
 * each engine's skin dir. `engineSelectors` = { engineName: [{attr,variant}] }.
 */
export function checkForwardCoverage(vocab, engineSelectors) {
  const issues = [];
  const present = {};
  for (const [engine, selectors] of Object.entries(engineSelectors)) {
    present[engine] = new Set(selectors.map((s) => `${s.attr}=${s.variant}`));
  }
  for (const [family, variants] of Object.entries(vocab)) {
    const attr = FAMILY_ATTRIBUTE[family];
    if (!attr) continue; // reported by checkFamilyMapping
    for (const variant of variants) {
      if (variant === DEFAULT_VARIANT) continue;
      for (const engine of Object.keys(engineSelectors)) {
        if (!present[engine].has(`${attr}=${variant}`)) {
          issues.push(
            `${engine}: no [data-anatomy-${attr}='${variant}'] selector for ${family}.${variant} (schema-legal value with no rendering — P-79)`,
          );
        }
      }
    }
  }
  return issues;
}

/**
 * Reverse scan: every anatomy selector in the skins must resolve to a registered
 * (family, non-default variant). `entries` = [{ file, attr, variant }].
 */
export function checkReverseDeadSelectors(vocab, entries) {
  const issues = [];
  const attrFamily = attributeToFamily();
  for (const { file, attr, variant } of entries) {
    const family = attrFamily[attr];
    if (!family) {
      issues.push(
        `${short(file)}: [data-anatomy-${attr}='${variant}'] targets unknown anatomy family '${attr}' (dead selector)`,
      );
      continue;
    }
    if (variant === DEFAULT_VARIANT) {
      issues.push(
        `${short(file)}: [data-anatomy-${attr}='${DEFAULT_VARIANT}'] — '${DEFAULT_VARIANT}' is the base rendering and must not carry a variant selector (dead selector)`,
      );
      continue;
    }
    if (!vocab[family] || !vocab[family].includes(variant)) {
      issues.push(
        `${short(file)}: [data-anatomy-${attr}='${variant}'] — '${variant}' is not registered for family '${family}' (dead selector)`,
      );
    }
  }
  return issues;
}

/**
 * Classic manifest: one valid row per (family, non-default variant); no rows for
 * unregistered or `default` variants.
 */
export function checkClassicManifest(vocab, manifest) {
  const issues = [];
  const variantsByFamily = (manifest && manifest.variants) || {};
  for (const [family, variants] of Object.entries(vocab)) {
    const rows = variantsByFamily[family] || {};
    for (const variant of variants) {
      if (variant === DEFAULT_VARIANT) continue;
      const row = rows[variant];
      if (!row) {
        issues.push(
          `classic manifest: missing row for ${family}.${variant}`,
        );
        continue;
      }
      if (!SUPPORT_LEVELS.includes(row.support)) {
        issues.push(
          `classic manifest: ${family}.${variant} has invalid support '${row.support}' (expected ${SUPPORT_LEVELS.join('|')})`,
        );
      }
      if (typeof row.reason !== 'string' || row.reason.trim() === '') {
        issues.push(`classic manifest: ${family}.${variant} has an empty reason`);
      }
    }
  }
  // Reverse: manifest rows for unregistered / default variants are dead entries.
  for (const [family, rows] of Object.entries(variantsByFamily)) {
    const registered = vocab[family] || [];
    for (const variant of Object.keys(rows)) {
      if (variant === DEFAULT_VARIANT || !registered.includes(variant)) {
        issues.push(
          `classic manifest: row ${family}.${variant} is not a registered non-default variant (dead entry)`,
        );
      }
    }
  }
  return issues;
}

function short(file) {
  const idx = file.indexOf('/src/');
  return idx >= 0 ? file.slice(idx + 1) : file;
}

/** Run the full gate against a set of paths. Returns { ok, sections }. */
export function runAnatomyGate(paths = DEFAULT_PATHS) {
  const sections = {
    vocabulary: [],
    familyMapping: [],
    forward: [],
    reverse: [],
    classic: [],
  };

  if (!existsSync(paths.contract)) {
    sections.vocabulary.push(`CONTRACT not found at ${short(paths.contract)}`);
    return { ok: false, sections, vocab: null };
  }
  const vocab = parseAnatomyVocabulary(readFileSync(paths.contract, 'utf8'));
  if (!vocab) {
    sections.vocabulary.push(
      `export ${VOCABULARY_EXPORT} not found in ${short(paths.contract)} (landlord vocabulary not landed)`,
    );
    return { ok: false, sections, vocab: null };
  }

  sections.familyMapping = checkFamilyMapping(vocab);

  const modern = collectEngineSelectors(paths.modernSkin);
  const rustic = collectEngineSelectors(paths.rusticSkin);
  sections.forward = checkForwardCoverage(vocab, { modern, rustic });
  sections.reverse = checkReverseDeadSelectors(vocab, [...modern, ...rustic]);

  if (!existsSync(paths.manifest)) {
    sections.classic.push(`classic manifest not found at ${short(paths.manifest)}`);
  } else {
    let manifest = null;
    try {
      manifest = JSON.parse(readFileSync(paths.manifest, 'utf8'));
    } catch (err) {
      sections.classic.push(`classic manifest is not valid JSON: ${err.message}`);
    }
    if (manifest) sections.classic = checkClassicManifest(vocab, manifest);
  }

  const ok = Object.values(sections).every((list) => list.length === 0);
  return { ok, sections, vocab };
}

function parseArgs(argv) {
  const opts = { check: false, quiet: false, paths: { ...DEFAULT_PATHS } };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--check') opts.check = true;
    else if (a === '--quiet') opts.quiet = true;
    else if (a === '--contract') opts.paths.contract = resolve(argv[++i]);
    else if (a === '--modern-skin') opts.paths.modernSkin = resolve(argv[++i]);
    else if (a === '--rustic-skin') opts.paths.rusticSkin = resolve(argv[++i]);
    else if (a === '--manifest') opts.paths.manifest = resolve(argv[++i]);
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { ok, sections, vocab } = runAnatomyGate(opts.paths);
  const issues = Object.values(sections).flat();

  if (!opts.quiet) {
    if (vocab) {
      const pairs = Object.entries(vocab).reduce(
        (n, [, v]) => n + v.filter((x) => x !== DEFAULT_VARIANT).length,
        0,
      );
      process.stdout.write(
        `anatomy-variant-gate: ${Object.keys(vocab).length} families, ${pairs} non-default variants x {modern, rustic} + classic manifest\n`,
      );
    }
    if (ok) {
      process.stdout.write('anatomy-variant-gate: PASS\n');
    } else {
      process.stderr.write(`anatomy-variant-gate: ${issues.length} violation(s)\n`);
      for (const issue of issues) process.stderr.write(`  - ${issue}\n`);
    }
  }

  if (opts.check && !ok) process.exit(1);
  process.exit(0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
