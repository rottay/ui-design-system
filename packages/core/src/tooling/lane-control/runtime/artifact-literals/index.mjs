/**
 * @fileoverview The IS side of the converse ratchet: what the three committed
 * vertical artifacts actually DECLARE, and whether each declaration is a
 * formula or a resolved literal.
 *
 * WHY THE ARTIFACTS AND NOT THE SOURCE. A name declared as `var(--something)`
 * is plumbed: whatever feeds it reaches it. A name declared as `#1f2937` is
 * PAINT — a value frozen into the shipped bundle, and if no tenant route can
 * write it, no customer can ever change it. That distinction only exists in
 * the compiled artifact; in source both look like declarations.
 *
 * THE RULE, verbatim from the specification: a name is a FORMULA if any of its
 * declarations contains `var(`; otherwise it is a RESOLVED LITERAL. "Any"
 * matters and is not a simplification — a name declared literally in `:root`
 * and by formula in a dark block is reachable through the formula, so counting
 * it as literal would invent a defect.
 *
 * THESE FILES ARE READ FROM THE WORKING TREE, never from `dist`. Two existing
 * gates import build output, and that is exactly how a stranded compiler
 * correction shipped unnoticed: the artifact builder reads `dist`, so an
 * artifact check that also reads `dist` compares a stale build against a stale
 * artifact and agrees with itself. This module reads committed CSS only.
 */
import { readFileSync } from 'node:fs';

export const ARTIFACT_ROOT = 'packages/core/src/foundation/tokens/css/facade/artifacts';
export const VERTICALS = Object.freeze(['bithire', 'evnto', 'rottay']);

export function artifactPath(vertical) {
  return `${ARTIFACT_ROOT}/${vertical}/index.css`;
}

/** Remove `/* … *​/` comments without disturbing anything else. */
export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Every custom-property declaration in a stylesheet, in source order.
 *
 * Values are read to the terminating `;` at paren-depth zero so that
 * `color-mix(in oklab, …, …)` and nested `var(a, var(b, c))` survive intact;
 * splitting on `;` alone would truncate them and turn a formula into a
 * literal, which is a false defect in the direction that matters.
 */
export function parseDeclarations(css) {
  const text = stripComments(css);
  const declarations = [];
  const pattern = /(--[A-Za-z0-9_-]+)\s*:/g;
  let match = pattern.exec(text);
  while (match !== null) {
    const start = match.index + match[0].length;
    let depth = 0;
    let quote = null;
    let end = start;
    while (end < text.length) {
      const ch = text[end];
      if (quote) {
        if (ch === quote && text[end - 1] !== '\\') quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === '(') {
        depth += 1;
      } else if (ch === ')') {
        depth -= 1;
      } else if ((ch === ';' || ch === '}') && depth <= 0) {
        break;
      }
      end += 1;
    }
    declarations.push({ name: match[1], value: text.slice(start, end).trim() });
    pattern.lastIndex = end;
    match = pattern.exec(text);
  }
  return declarations;
}

/**
 * Fold one vertical's artifact into a name → classification map.
 * `formula` wins over `literal` the moment any declaration carries `var(`.
 */
export function classifyArtifact(css) {
  const names = new Map();
  for (const { name, value } of parseDeclarations(css)) {
    const isFormula = value.includes('var(');
    const existing = names.get(name);
    if (!existing) {
      names.set(name, { name, declarations: 1, formula: isFormula, samples: [value] });
      continue;
    }
    existing.declarations += 1;
    existing.formula = existing.formula || isFormula;
    if (existing.samples.length < 3) existing.samples.push(value);
  }
  return names;
}

/**
 * Load all three verticals. Returns the union keyed by name, each entry
 * recording which verticals declare it and which of those declare it as a
 * resolved literal.
 *
 * A name is counted as literal-declared for the ratchet when AT LEAST ONE
 * vertical resolves it to paint. A tenant who cannot reach it is stuck with a
 * frozen value in that product even if another vertical happens to plumb it.
 */
export function loadArtifacts({ root, verticals = VERTICALS }) {
  const perVertical = new Map();
  const union = new Map();

  for (const vertical of verticals) {
    const css = readFileSync(`${root}/${artifactPath(vertical)}`, 'utf8');
    const classified = classifyArtifact(css);
    perVertical.set(vertical, classified);
    for (const entry of classified.values()) {
      if (!union.has(entry.name)) {
        union.set(entry.name, {
          name: entry.name,
          declaredIn: [],
          literalIn: [],
          formulaIn: [],
          samples: [],
        });
      }
      const merged = union.get(entry.name);
      merged.declaredIn.push(vertical);
      if (entry.formula) merged.formulaIn.push(vertical);
      else {
        merged.literalIn.push(vertical);
        if (merged.samples.length < 2) merged.samples.push(`${vertical}: ${entry.samples[0]}`);
      }
    }
  }

  return { perVertical, union };
}

/** Names at least one vertical freezes into paint. */
export function literalNames(union) {
  return [...union.values()].filter((entry) => entry.literalIn.length > 0);
}
