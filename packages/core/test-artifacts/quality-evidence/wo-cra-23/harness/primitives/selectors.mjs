#!/usr/bin/env node
/**
 * WO-CRA-23 primitives census — instrument 2: selector structure.
 *
 * postcss splits the rule list; postcss-selector-parser is not installed in this
 * workspace, so the compound split is written here. It is a tokenizer, not a
 * regex: attribute values, quoted strings and functional pseudo-classes all nest,
 * and a `[data-part='a, b']` or `:is(.x, .y)` breaks every naive split.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const ROOT = new URL('../../../../../', import.meta.url).pathname.replace(/\/$/, '');
const req = createRequire(ROOT + '/package.json');
const postcss = req('postcss');

const COMBINATORS = new Set(['>', '+', '~']);

/** Split one selector into compounds, recording the combinator that preceded each. */
export function splitCompounds(sel) {
  const compounds = [];
  let cur = '';
  let depth = 0;      // () nesting
  let bracket = 0;    // [] nesting
  let quote = null;
  let pendingCombinator = null;

  const flush = () => {
    const t = cur.trim();
    if (t) compounds.push({ text: t, combinator: pendingCombinator });
    cur = '';
    pendingCombinator = null;
  };

  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (quote) {
      cur += c;
      if (c === quote && sel[i - 1] !== '\\') quote = null;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; cur += c; continue; }
    if (c === '[') { bracket++; cur += c; continue; }
    if (c === ']') { bracket--; cur += c; continue; }
    if (c === '(') { depth++; cur += c; continue; }
    if (c === ')') { depth--; cur += c; continue; }
    if (depth === 0 && bracket === 0) {
      if (COMBINATORS.has(c)) { flush(); pendingCombinator = c; continue; }
      if (/\s/.test(c)) {
        if (cur.trim()) { flush(); pendingCombinator = pendingCombinator ?? ' '; }
        continue;
      }
    }
    cur += c;
  }
  flush();
  return compounds;
}

/** Classes, ids, tags and attribute selectors inside a single compound. */
export function parseCompound(text) {
  const classes = [];
  const attrs = [];
  let tag = '';
  let i = 0;
  let quote = null;

  const readBalanced = (open, close) => {
    let d = 0, out = '';
    for (; i < text.length; i++) {
      const c = text[i];
      if (quote) { out += c; if (c === quote && text[i - 1] !== '\\') quote = null; continue; }
      if (c === '"' || c === "'") { quote = c; out += c; continue; }
      if (c === open) d++;
      if (c === close) { d--; out += c; if (d === 0) { i++; return out; } continue; }
      out += c;
    }
    return out;
  };

  while (i < text.length) {
    const c = text[i];
    if (c === '.') {
      i++;
      let name = '';
      while (i < text.length && /[-\w\\]/.test(text[i])) { name += text[i]; i++; }
      classes.push(name);
      continue;
    }
    if (c === '[') {
      const raw = readBalanced('[', ']');
      const m = raw.match(/^\[\s*([-\w]+)\s*(?:([~^|$*]?=)\s*(.+?)\s*)?(?:\s+[iIsS])?\s*\]$/s);
      if (m) {
        const value = m[3] ? m[3].replace(/^['"]|['"]$/g, '') : null;
        attrs.push({ name: m[1], op: m[2] ?? null, value, raw });
      } else {
        attrs.push({ name: null, op: null, value: null, raw });
      }
      continue;
    }
    if (c === ':') {
      let j = i + 1;
      if (text[j] === ':') j++;
      let name = '';
      while (j < text.length && /[-\w]/.test(text[j])) { name += text[j]; j++; }
      i = j;
      if (text[i] === '(') {
        const inner = readBalanced('(', ')');
        // Functional pseudo-classes that keep the subject's specificity context
        // (:is/:where/:not/:has) can carry classes that belong to this compound.
        if (['is', 'where', 'not', 'has', 'matches', 'any'].includes(name)) {
          const body = inner.slice(1, -1);
          for (const part of splitTopLevelCommas(body)) {
            const sub = parseCompound(splitCompounds(part)[0]?.text ?? '');
            classes.push(...sub.classes.map((x) => `${name}(${x})`));
            attrs.push(...sub.attrs.map((a) => ({ ...a, inPseudo: name })));
          }
        }
      }
      continue;
    }
    if (c === '#') {
      i++;
      while (i < text.length && /[-\w]/.test(text[i])) i++;
      continue;
    }
    if (c === '*') { i++; continue; }
    let t = '';
    while (i < text.length && /[-\w]/.test(text[i])) { t += text[i]; i++; }
    if (t) tag = t; else i++;
  }
  return { classes, attrs, tag };
}

export function splitTopLevelCommas(s) {
  const out = [];
  let cur = '', depth = 0, bracket = 0, quote = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) { cur += c; if (c === quote && s[i - 1] !== '\\') quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; cur += c; continue; }
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (c === '[') bracket++;
    if (c === ']') bracket--;
    if (c === ',' && depth === 0 && bracket === 0) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

/** Every rule in a file, with its selectors decomposed. */
export function parseCssFile(file) {
  const css = readFileSync(file, 'utf8');
  const root = postcss.parse(css, { from: file });
  const rules = [];
  root.walkRules((rule) => {
    // @keyframes children are frame selectors (`from`, `50%`), not element selectors.
    let p = rule.parent, inKeyframes = false;
    while (p) { if (p.type === 'atrule' && /keyframes$/.test(p.name)) inKeyframes = true; p = p.parent; }
    if (inKeyframes) return;
    const decls = rule.nodes.filter((n) => n.type === 'decl');
    for (const sel of rule.selectors) {
      const compounds = splitCompounds(sel).map((c) => ({ ...c, ...parseCompound(c.text) }));
      rules.push({
        file, line: rule.source?.start?.line ?? 0, selector: sel,
        compounds, declCount: decls.length,
        props: decls.map((d) => d.prop),
      });
    }
  });
  return rules;
}

if (process.argv[2] === '--control') {
  // Nine selector shapes. Four are traps a regex split gets wrong.
  const cases = [
    { sel: `.a.b[data-part='root']`, compounds: 1, classes: ['a', 'b'], parts: ['root'] },
    { sel: `.a [data-part='root']`, compounds: 2, classes: ['a'], parts: ['root'] },
    { sel: `.a>.b[data-part="item"]`, compounds: 2, classes: ['a', 'b'], parts: ['item'] },
    // trap: a comma inside an attribute value must not split the compound
    { sel: `.a[data-x='p, q'][data-part='root']`, compounds: 1, classes: ['a'], parts: ['root'] },
    // trap: a space inside an attribute value must not create a descendant
    { sel: `.a[title='hello world'][data-part='root']`, compounds: 1, classes: ['a'], parts: ['root'] },
    // trap: :not() carrying a class must not be read as a separate compound
    { sel: `.a:not(.c)[data-part='root']`, compounds: 1, classes: ['a', 'not(c)'], parts: ['root'] },
    // trap: :is() with an internal comma
    { sel: `.a:is(.c, .d) .e[data-part='panel']`, compounds: 2, classes: ['a', 'is(c)', 'is(d)', 'e'], parts: ['panel'] },
    // a bare unclassed part in a non-first compound — the known dead-rule shape
    { sel: `.ds-x [data-part='root']`, compounds: 2, classes: ['ds-x'], parts: ['root'] },
    // ~= is a different operator and must not be read as =
    { sel: `.a[data-part~='root']`, compounds: 1, classes: ['a'], parts: ['root'], op: '~=' },
  ];
  let pass = 0, fail = 0;
  for (const c of cases) {
    const comps = splitCompounds(c.sel).map((x) => ({ ...x, ...parseCompound(x.text) }));
    const classes = comps.flatMap((x) => x.classes);
    const parts = comps.flatMap((x) => x.attrs.filter((a) => a.name === 'data-part').map((a) => a.value));
    const ops = comps.flatMap((x) => x.attrs.filter((a) => a.name === 'data-part').map((a) => a.op));
    const ok = comps.length === c.compounds &&
      JSON.stringify(classes) === JSON.stringify(c.classes) &&
      JSON.stringify(parts) === JSON.stringify(c.parts) &&
      (c.op ? ops[0] === c.op : true);
    if (ok) pass++; else fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${c.sel}`);
    if (!ok) console.log(`      compounds ${comps.length}/${c.compounds} classes ${JSON.stringify(classes)} parts ${JSON.stringify(parts)} ops ${JSON.stringify(ops)}`);
  }
  console.log(`\nselector control: ${pass} pass / ${fail} fail`);
  process.exit(fail === 0 ? 0 : 1);
}
