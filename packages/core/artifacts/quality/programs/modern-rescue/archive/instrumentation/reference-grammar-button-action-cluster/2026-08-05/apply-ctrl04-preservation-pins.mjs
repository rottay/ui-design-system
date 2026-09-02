/**
 * CTRL-04 preservation pins — structural applier.
 *
 * WHY THIS FILE EXISTS RATHER THAN A REGEX. The first attempt used a regex over
 * the theme source and destroyed brace structure in both out-of-round themes
 * (9 unbalanced braces in platform, 3 in evnto): a non-greedy block matcher
 * consumed across boundaries because inserted blocks carried different
 * indentation from pre-existing ones. The files had to be restored from HEAD
 * under explicit owner authorization.
 *
 * So this applier does three things the regex could not:
 *   1. locates the `controls` block by BRACE MATCHING, not by pattern
 *   2. checks per-FIELD existence before inserting, so it can never duplicate
 *   3. verifies brace balance after each file and refuses to write if it moved
 *
 * WHAT IT PINS. Every engine-tier --ds-button-{variant}-shadow{,-hover,-active}
 * declaration, read from the engine stylesheet, written BY REFERENCE into the
 * vertical's own chrome.controls. These are not new product decisions: each is
 * the value that vertical already resolves today, moved from an implicit engine
 * default onto explicit ownership so the engine defaults can be deleted without
 * changing what the vertical paints.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, '..', '..', '..', '..', '..');

/** Engine variant name -> BrandButtonVariantChrome key. */
const VARIANT_KEY = {
  primary: 'buttonPrimary', secondary: 'buttonSecondary', default: 'buttonDefault',
  ghost: 'buttonGhost', text: 'buttonText', dashed: 'buttonDashed', link: 'buttonLink',
  success: 'buttonSuccess', warning: 'buttonWarning', error: 'buttonError',
  info: 'buttonInfo', ai: 'buttonAI',
};
/** Engine state suffix -> chrome field. All three exist on BrandButtonVariantChrome. */
const STATE_FIELD = { rest: 'shadow', hover: 'shadowHover', active: 'shadowActive' };

/** Read the engine-tier declarations that the deletion will remove. */
export function engineShadowDeclarations() {
  const css = readFileSync(
    path.join(CORE, 'src/foundation/tokens/css/presentation/components/button.css'), 'utf8');
  const out = {};
  for (const m of css.matchAll(/--ds-button-([a-z]+)-shadow(-hover|-active)?\s*:\s*([^;]+);/g)) {
    const variant = m[1];
    if (!VARIANT_KEY[variant]) continue;
    (out[variant] ??= {})[m[2] ? m[2].slice(1) : 'rest'] = m[3].trim();
  }
  return out;
}

/** Index of the matching close brace for the open brace at `open`. */
function matchBrace(source, open) {
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') { depth -= 1; if (depth === 0) return i; }
  }
  throw new Error('unbalanced braces while matching');
}

/**
 * Locate the LIGHT-mode `controls` block. `modes.dark` also contains one, so the
 * search starts after the modes block closes — pinning into dark would be wrong
 * (dark authors its own values) and is the subtler half of this hazard.
 */
function lightControlsRange(source) {
  const modesAt = source.indexOf('\n  modes: {');
  const searchFrom = modesAt < 0 ? 0 : matchBrace(source, source.indexOf('{', modesAt));
  const at = source.indexOf('\n    controls: {', searchFrom);
  if (at < 0) throw new Error('no light-mode controls block');
  const open = source.indexOf('{', at);
  return { open, close: matchBrace(source, open) };
}

/** Direct children of a block: name -> {open, close} , by brace matching. */
function childBlocks(source, open, close) {
  const out = {};
  let i = open + 1;
  while (i < close) {
    const ch = source[i];
    if (ch === '{') { i = matchBrace(source, i) + 1; continue; }
    const m = /^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*\{/.exec(source.slice(i, i + 80));
    if (m) {
      const childOpen = source.indexOf('{', i);
      if (childOpen < close) {
        out[m[1]] = { open: childOpen, close: matchBrace(source, childOpen) };
        i = out[m[1]].close + 1;
        continue;
      }
    }
    i += 1;
  }
  return out;
}

const HEADER = [
  '      // ---- CTRL-04 PRESERVATION PINS (R1 Cohort 1) ----',
  '      // NOT new product decisions. Each value is what this vertical ALREADY',
  '      // resolves today, moved from an implicit engine-tier default onto',
  '      // explicit ownership so the engine defaults can be deleted without',
  '      // changing what this vertical paints. Pinned BY REFERENCE because',
  '      // --ds-shadow-* are dark-aware and a literal would regress dark mode.',
  '      // Generated from receipts/cohort-1-button-shadow-state-census.json.',
].join('\n');

export function applyPins(vertical, { dryRun = false } = {}) {
  const file = path.join(CORE, `src/foundation/tokens/ts/presentation/brand-themes/${vertical}/index.ts`);
  const before = readFileSync(file, 'utf8');
  const balanceBefore = (before.match(/{/g) ?? []).length - (before.match(/}/g) ?? []).length;

  const engine = engineShadowDeclarations();
  const { open, close } = lightControlsRange(before);
  const children = childBlocks(before, open, close);

  // Build edits as absolute-offset insertions, then apply RIGHT-TO-LEFT so
  // earlier offsets stay valid.
  const edits = [];
  const report = { merged: [], created: [], skippedAlreadyAuthored: [] };

  for (const [variant, states] of Object.entries(engine)) {
    const key = VARIANT_KEY[variant];
    const child = children[key];
    const fields = Object.entries(states).map(([s, v]) => [STATE_FIELD[s], v]);

    if (child) {
      const body = before.slice(child.open, child.close);
      const missing = fields.filter(([f]) => !new RegExp(`(^|\\n)\\s*${f}\\s*:`).test(body));
      const already = fields.filter(([f]) => !missing.some(([mf]) => mf === f)).map(([f]) => `${key}.${f}`);
      report.skippedAlreadyAuthored.push(...already);
      if (missing.length === 0) continue;
      const text = missing.map(([f, v]) => `\n        ${f}: "${v}",`).join('');
      edits.push({ at: child.open + 1, text });
      report.merged.push(`${key}(+${missing.length})`);
    } else {
      const text = `\n      ${key}: {${fields.map(([f, v]) => `\n        ${f}: "${v}",`).join('')}\n      },`;
      edits.push({ at: open + 1, text });
      report.created.push(key);
    }
  }

  edits.push({ at: open + 1, text: `\n${HEADER}` });
  edits.sort((a, b) => b.at - a.at);

  let after = before;
  for (const e of edits) after = after.slice(0, e.at) + e.text + after.slice(e.at);

  const balanceAfter = (after.match(/{/g) ?? []).length - (after.match(/}/g) ?? []).length;
  if (balanceAfter !== balanceBefore) {
    throw new Error(`${vertical}: brace balance moved ${balanceBefore} -> ${balanceAfter}; refusing to write`);
  }

  if (!dryRun) writeFileSync(file, after);
  return { vertical, balanceBefore, balanceAfter, ...report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const dryRun = process.argv.includes('--dry-run');
  for (const vertical of ['platform', 'evnto']) {
    const r = applyPins(vertical, { dryRun });
    process.stdout.write(
      `${r.vertical}: merged ${r.merged.length}, created ${r.created.length}, already-authored ${r.skippedAlreadyAuthored.length}, brace balance ${r.balanceBefore}->${r.balanceAfter}${dryRun ? ' (DRY RUN)' : ''}\n`,
    );
  }
}
