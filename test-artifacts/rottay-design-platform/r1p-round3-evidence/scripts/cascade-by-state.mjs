/**
 * Augments the three *-overlap.json files with a per-rendering-state cascade
 * analysis: for each shared custom-property name, does the hand-authored
 * extension actually win over the compiled BrandTheme block in that state?
 *
 * A shared name is "overridden" in a state when at least one extension
 * declaration of it sits in a rule that (a) can match that state, and (b) has
 * specificity >= the compiled block's specificity in that state. Source order
 * is always in the extension's favour: the extension section is emitted after
 * the compiled block in the same file.
 *
 * Root-scoped and descendant-scoped extension rules are reported separately,
 * because a descendant-scoped rule only overrides inside its own subtree.
 *
 * READ-ONLY with respect to the repo; writes only inside the audit directory.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_ROOT = resolve(__dirname, '..');

/** Split a selector list on top-level commas only. */
function splitList(sel) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const c of sel) {
    if (c === '(') depth += 1;
    if (c === ')') depth -= 1;
    if (c === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

/** Specificity [id, class-ish, element]. :where() is 0; :is() takes its first arm. */
function specificity(sel) {
  let s = sel.replace(/:where\((?:[^()]|\([^()]*\))*\)/g, '');
  s = s.replace(/:is\(((?:[^()]|\([^()]*\))*)\)/g, (m, inner) => splitList(inner)[0] ?? '');
  const ids = (s.match(/#[\w-]+/g) ?? []).length;
  const flattened = s.replace(/:not\(((?:[^()]|\([^()]*\))*)\)/g, (m, inner) => ` ${inner} `);
  const cls =
    (flattened.match(/\.[\w-]+/g) ?? []).length +
    (flattened.match(/\[[^\]]*\]/g) ?? []).length +
    (flattened.match(/:[a-z-]+(\([^)]*\))?/g) ?? []).length;
  const el = (flattened.replace(/\[[^\]]*\]/g, '').match(/(^|[\s>+~])[a-z][a-z0-9]*/gi) ?? []).length;
  return [ids, cls, el];
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/** Can this compound selector match the document root in the given theme state? */
function matchesState(sel, state) {
  const s = sel.replace(/"/g, "'");
  const positive = s.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, '');
  const hasLight = /\[data-theme='light'\]|\.light\b/.test(positive);
  const hasDark = /\[data-theme='dark'\]|\.dark\b/.test(positive);
  const notLight = /:not\(\[data-theme='light'\]\)|:not\(\.light\)/.test(s);
  const notDark = /:not\(\[data-theme='dark'\]\)|:not\(\.dark\)/.test(s);
  if (state === 'light') return !hasDark && !notLight;
  if (state === 'dark') return !hasLight && !notDark;
  return !hasLight && !hasDark; // default: no theme attribute/class on the root
}

/** A rule is root-scoped when it targets the tenant root itself, not a descendant. */
const isRootScoped = (sel) => !/[\s>+~]/.test(sel.replace(/\((?:[^()]|\([^()]*\))*\)/g, ''));

const STATES = ['default', 'light', 'dark'];
const summary = [];

for (const slug of ['bithire', 'evnto', 'rottay']) {
  const path = resolve(AUDIT_ROOT, `${slug}-overlap.json`);
  const doc = JSON.parse(readFileSync(path, 'utf-8'));
  const compiledSelector = doc.overlapRecords[0].compiledDeclarations[0].selector;
  const compiledArms = splitList(compiledSelector);

  const byState = {};
  for (const state of STATES) {
    const applicableArms = compiledArms.filter((s) => matchesState(s, state));
    if (applicableArms.length === 0) {
      byState[state] = {
        compiledBlockApplies: false,
        note: 'The compiled BrandTheme block cannot match the root in this state; every one of its variables is inert here and the extension is the only source.',
        compiledVariablesInert: doc.counts.compiledUniqueNames,
      };
      continue;
    }
    const compiledSpec = applicableArms.map(specificity).sort(cmp).pop();
    const rootOverridden = [];
    const descendantOnly = [];
    const notOverridden = [];
    for (const rec of doc.overlapRecords) {
      let root = false;
      let desc = false;
      for (const d of rec.extensionDeclarations) {
        for (const arm of splitList(d.selector)) {
          if (!matchesState(arm, state)) continue;
          if (cmp(specificity(arm), compiledSpec) < 0) continue;
          if (isRootScoped(arm)) root = true; else desc = true;
        }
      }
      if (root) rootOverridden.push(rec.name);
      else if (desc) descendantOnly.push(rec.name);
      else notOverridden.push(rec.name);
    }
    byState[state] = {
      compiledBlockApplies: true,
      compiledSelectorArmsMatchingState: applicableArms,
      compiledSpecificity: compiledSpec,
      sharedNamesTotal: doc.counts.intersection,
      overriddenAtRoot: rootOverridden.length,
      overriddenOnlyInsideADescendantSubtree: descendantOnly.length,
      compiledValueSurvives: notOverridden.length,
      overriddenAtRootNames: rootOverridden,
      overriddenOnlyInsideADescendantSubtreeNames: descendantOnly,
      compiledValueSurvivesNames: notOverridden,
    };
  }

  doc.cascadeByState = {
    method:
      'For each of the three root rendering states (default = no data-theme/class on <html>, light = [data-theme=light]/.light, dark = [data-theme=dark]/.dark) the compiled block\'s applicable selector arms are specificity-scored and compared against every extension declaration of each shared name. The extension section always follows the compiled block in the same stylesheet, so equal specificity already means the extension wins. :where() scores 0 and :is() takes its first arm, matching the projection contract.',
    compiledSelector,
    states: byState,
  };
  writeFileSync(path, JSON.stringify(doc, null, 2));

  summary.push({
    slug,
    states: Object.fromEntries(
      Object.entries(byState).map(([k, v]) => [
        k,
        v.compiledBlockApplies
          ? `overriddenAtRoot ${v.overriddenAtRoot}/${v.sharedNamesTotal}, descendantOnly ${v.overriddenOnlyInsideADescendantSubtree}, compiledSurvives ${v.compiledValueSurvives}`
          : `COMPILED BLOCK INERT (${v.compiledVariablesInert} variables never apply)`,
      ]),
    ),
  });
}

console.log(JSON.stringify(summary, null, 2));
