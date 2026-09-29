// Static skin-rule collection for the dead-selector audit (P-79).
//
// Extracted from skin-rule-coverage.spec.ts so it can be exercised two ways:
//   - the Playwright spec probes each collected selector against the real DOM
//   - a node unit test asserts the collection is non-empty (the spec is not
//     vacuous) WITHOUT a browser
//
// No Playwright import lives here on purpose: importing this module must have no
// test-runner side effects.

import postcss from 'postcss';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_CSS = join(HERE, '../../../core/src/foundation/tokens/css');

// The three real skin roots on disk. The engine skins live under
// runtime/engines/<engine>/skin; the engine-agnostic component skins under
// presentation/components/skin. An earlier revision of this audit pointed at
// engines/<engine>/skin and components/skin — paths that no longer exist — so
// collectRules() returned an empty set and the audit silently asserted nothing.
// collectRules() now throws if any of these roots is missing so that a future
// relocation fails loudly instead of going vacuous again.
export const SKIN_DIRS = [
  ['modern', join(CORE_CSS, 'runtime/engines/modern/skin')],
  ['rustic', join(CORE_CSS, 'runtime/engines/rustic/skin')],
  ['agnostic', join(CORE_CSS, 'presentation/components/skin')],
];

const REST_FALSE_PSEUDOS = new Set([
  'hover', 'focus', 'focus-visible', 'focus-within', 'active', 'target', 'checked', 'disabled',
  'enabled', 'placeholder-shown', 'autofill', '-webkit-autofill', 'visited', 'link', 'empty',
]);
const ANCHORING_PSEUDOS = new Set(['root', 'scope']);
const LEGACY_PSEUDO_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter']);
const ALTERNATIONS = new Set(['is', 'where', 'matches', '-webkit-any', 'has']);

function skipBalanced(s, i, open, close) {
  let depth = 0;
  for (; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\') { i++; continue; }
    if (ch === '"' || ch === "'") {
      for (i++; i < s.length && s[i] !== ch; i++) if (s[i] === '\\') i++;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close && --depth === 0) return i + 1;
  }
  throw new Error(`unbalanced ${open}${close} in selector: ${s}`);
}

function splitList(s) {
  const arms = [];
  let from = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\') i++;
    else if (ch === '[') i = skipBalanced(s, i, '[', ']') - 1;
    else if (ch === '(') i = skipBalanced(s, i, '(', ')') - 1;
    else if (ch === '"' || ch === "'") i = skipBalanced(`(${s.slice(i)}`, 0, '(', ')') + i;
    else if (ch === ',') { arms.push(s.slice(from, i)); from = i + 1; }
  }
  arms.push(s.slice(from));
  return arms.map((a) => a.trim());
}

function readIdent(s, i) {
  while (i < s.length && (/[\w-]/.test(s[i]) || s.charCodeAt(i) > 127 || s[i] === '\\')) i += s[i] === '\\' ? 2 : 1;
  return i;
}

/** One complex selector -> [combinator | compound] where a compound is a token list. */
function parseComplex(s) {
  const seq = [];
  let compound = [];
  let i = 0;
  const flush = () => { if (compound.length || seq.length === 0 || typeof seq[seq.length - 1] === 'string') seq.push(compound); compound = []; };
  while (i < s.length) {
    const ch = s[i];
    if (/\s|[>+~]/.test(ch)) {
      let j = i;
      while (j < s.length && /\s|[>+~]/.test(s[j])) j++;
      const comb = s.slice(i, j).trim() || ' ';
      if (compound.length) flush();
      else if (seq.length === 0) seq.push([]);
      seq.push(comb);
      i = j;
      continue;
    }
    if (ch === '[') {
      const j = skipBalanced(s, i, '[', ']');
      compound.push({ kind: 'attr', text: s.slice(i, j) });
      i = j;
    } else if (ch === ':') {
      const element = s[i + 1] === ':';
      const nameStart = i + (element ? 2 : 1);
      const nameEnd = readIdent(s, nameStart);
      const name = s.slice(nameStart, nameEnd).toLowerCase();
      let j = nameEnd;
      let args = null;
      if (s[j] === '(') { const k = skipBalanced(s, j, '(', ')'); args = s.slice(j + 1, k - 1); j = k; }
      const kind = element || LEGACY_PSEUDO_ELEMENTS.has(name) ? 'element' : args === null ? 'pseudo' : 'fn';
      compound.push({ kind, name, args, text: s.slice(i, j) });
      i = j;
    } else {
      const j = ch === '.' || ch === '#' ? readIdent(s, i + 1) : ch === '*' || ch === '&' || ch === '|' ? i + 1 : readIdent(s, i);
      if (j === i) throw new Error(`unparseable selector at ${i}: ${s}`);
      compound.push({ kind: 'simple', text: s.slice(i, j) });
      i = j;
    }
  }
  if (compound.length) flush();
  while (typeof seq[seq.length - 1] === 'string') seq.pop();
  return seq;
}

// An alternation arm left empty is satisfiable by state alone, so the whole
// :is()/:where()/:has() is dropped rather than emptied into invalid CSS.
function relaxComplex(selector, mode) {
  const seq = parseComplex(selector);
  let changed = false;
  let content = false;
  const out = [];
  for (const item of seq) {
    if (typeof item === 'string') { out.push(item === ' ' ? ' ' : ` ${item} `); continue; }
    const kept = [];
    for (const tok of item) {
      if (tok.kind === 'element' || (tok.kind === 'pseudo' && REST_FALSE_PSEUDOS.has(tok.name))) { changed = true; continue; }
      if (tok.kind === 'attr' && mode === 'skeleton' && !/^\[\s*data-part\b/.test(tok.text)) { changed = true; continue; }
      if (mode === 'skeleton' && tok.kind === 'pseudo' && !ANCHORING_PSEUDOS.has(tok.name)) { changed = true; continue; }
      if (mode === 'skeleton' && tok.kind === 'fn' && tok.name !== 'not' && !ALTERNATIONS.has(tok.name)) { changed = true; continue; }
      if (tok.kind === 'fn' && tok.name === 'not') {
        if (mode === 'skeleton') { changed = true; continue; }
        const arms = splitList(tok.args).map((a) => relaxComplex(a, mode));
        if (arms.some((a) => a.text === null || a.changed)) { changed = true; continue; }
        kept.push(tok.text);
        continue;
      }
      if (tok.kind === 'fn' && ALTERNATIONS.has(tok.name)) {
        const arms = splitList(tok.args).map((a) => relaxComplex(a, mode));
        if (arms.some((a) => a.text === null)) { changed = true; continue; }
        if (arms.some((a) => a.changed)) changed = true;
        kept.push(`:${tok.name}(${arms.map((a) => a.text).join(', ')})`);
        continue;
      }
      kept.push(tok.text);
    }
    if (kept.length) content = true;
    out.push(kept.length ? kept.join('') : '*');
  }
  if (!content) return { text: null, changed: true };
  let text = out.join('');
  // A leading combinator is only legal as a relative :has() argument.
  if (typeof seq[0] === 'string' || (Array.isArray(seq[0]) && seq[0].length === 0)) text = text.replace(/^\*(?=\s)/, '').trim();
  // `* .x` asks nothing `.x` does not (bar the root element).
  return { text: text.trim().replace(/^\* (?![>+~])/, ''), changed };
}

function relaxList(selector, mode) {
  const arms = splitList(selector).map((a) => relaxComplex(a, mode).text).filter((a) => a !== null);
  return arms.length ? arms.join(', ') : null;
}

/** Strip what cannot match at rest: interaction pseudo-classes and pseudo-elements. */
export function toProbe(selector) {
  const s = selector.trim();
  if (!s || s.startsWith('@') || s.includes('%')) return null;
  return relaxList(s, 'probe');
}

/**
 * The STRUCTURAL skeleton: classes and `data-part` only. Every other attribute
 * is dropped. Discriminates a thin fixture (state not rendered — rule is fine)
 * from a dead anchor (the part itself is absent — the rule reaches nobody).
 */
export function toSkeleton(probe) {
  return relaxList(probe, 'skeleton');
}

// Mirrors deviceAliasForWidth in core's kernel/responsive/breakpoints (lg 1024, sm 640).
export function viewportPostureForWidth(width) {
  if (width >= 1024) return 'desktop';
  if (width >= 640) return 'tablet';
  return 'phone';
}

// Providers keep the server (phone) posture through hydration and correct it in a
// transition; the DOM is readable once every data-posture carries the real viewport.
export function postureSettled(postures, width) {
  const expected = viewportPostureForWidth(width);
  return postures.every((value) => value.trim().split(/\s+/)[0] === expected);
}

/** A pseudo only another browser engine parses: Chromium rejects it by design. */
export function isForeignVendorSelector(selector) {
  return /::?-(moz|ms|o)-/i.test(selector);
}

// Serialized into the page by source, so it closes over nothing. A selector the
// browser rejects answers 'invalid', never a match.
export function probeSelectors(tuples) {
  const ask = (s) => {
    try {
      return document.querySelector(s) !== null ? 'hit' : 'miss';
    } catch {
      return 'invalid';
    }
  };
  return tuples.map((tuple) => tuple.map(ask));
}

/**
 * Parse every skin file under the three real roots into probeable selectors.
 * Throws if a root is missing — a missing root is a relocation bug, never an
 * empty result to swallow.
 *
 * `group` is the rule's whole selector list: one invalid member drops them all.
 *
 * @returns {Array<{engine: string, file: string, selector: string, group: string, probe: string, skeleton: string}>}
 */
export function collectRules() {
  const out = [];
  for (const [engine, dir] of SKIN_DIRS) {
    if (!existsSync(dir)) {
      throw new Error(`skin-rule-coverage: skin root missing: ${dir} (engine ${engine}). Fix SKIN_DIRS after a relocation instead of scanning nothing.`);
    }
    const files = [];
    const visit = (current) => {
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const target = join(current, entry.name);
        if (entry.isDirectory()) visit(target);
        else if (entry.isFile() && entry.name === 'index.css') files.push(target);
      }
    };
    visit(dir);
    if (files.length === 0) {
      throw new Error(`skin-rule-coverage: skin root has no folder/index stylesheets: ${dir} (engine ${engine})`);
    }
    for (const file of files) {
      const css = readFileSync(file, 'utf8');
      let root;
      try {
        root = postcss.parse(css);
      } catch {
        continue; // parseErrors already guards this
      }
      root.walkRules((rule) => {
        // Rules inside @keyframes are step selectors (`from`, `50%`), not DOM selectors.
        if (rule.parent?.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
        const group = rule.selectors.join(', ');
        for (const sel of rule.selectors) {
          const probe = toProbe(sel);
          if (!probe) continue;
          const skeleton = toSkeleton(probe);
          if (skeleton) out.push({ engine, file: file.slice(dir.length + 1), selector: sel, group, probe, skeleton });
        }
      });
    }
  }
  return out;
}
