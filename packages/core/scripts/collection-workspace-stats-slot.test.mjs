import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { packageRoot as findPackageRoot } from './lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const coreRoot = findPackageRoot(HERE);
const component = readFileSync(
  join(coreRoot, 'src/ui/surfaces/presentation/pages/workspace/collection-workspace/index.tsx'),
  'utf8'
);
const skin = readFileSync(
  join(coreRoot, 'src/foundation/tokens/css/presentation/components/skin/collection-workspace.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

const STATS_SLOT = '.ds-collection-workspace__stats-slot[data-part="stats-slot"]';
const BASE_SELECTOR = `.ds-surface.ds-collection-workspace ${STATS_SLOT}`;
const EXPANDED_SELECTOR = `${BASE_SELECTOR}[data-collapsed="false"]`;
const COLLAPSED_SELECTOR = `${BASE_SELECTOR}[data-collapsed="true"]`;

const squash = (value) => value.replace(/\s+/g, ' ').trim();

/**
 * Every top-level (nesting depth 0) rule in the sheet, as
 * `{ selector, body }`. Rules nested inside an at-rule such as
 * `@media (prefers-reduced-motion: reduce)` are deliberately NOT returned:
 * the reduced-motion authority zeroes `--ds-motion-slow` on the canonical
 * token owners and must not be re-asserted (or shadowed) here.
 */
function topLevelRules(css) {
  const rules = [];
  let depth = 0;
  let selectorStart = 0;
  let bodyStart = -1;

  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === '{') {
      if (depth === 0) bodyStart = index;
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        rules.push({
          selector: squash(css.slice(selectorStart, bodyStart)),
          body: squash(css.slice(bodyStart + 1, index)),
        });
        selectorStart = index + 1;
      }
    }
  }

  return rules;
}

const sheetRules = topLevelRules(skin);

/** The body of the single top-level rule whose selector is exactly `selector`. */
function ruleBody(selector) {
  const wanted = squash(selector);
  const matches = sheetRules.filter((rule) => rule.selector === wanted);
  assert.equal(
    matches.length,
    1,
    `expected exactly one top-level rule for \`${wanted}\`, found ${matches.length}`
  );
  return matches[0].body;
}

/** Split a `transition` value on its top-level (unparenthesised) commas. */
function transitionArms(body) {
  const declaration = body.match(/(?:^|;)\s*transition:\s*([^;]*);/)?.[1];
  assert.ok(declaration, 'stats-slot base rule declares no transition');

  const arms = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < declaration.length; index += 1) {
    const char = declaration[index];
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (char === ',' && depth === 0) {
      arms.push(squash(declaration.slice(start, index)));
      start = index + 1;
    }
  }
  arms.push(squash(declaration.slice(start)));
  return arms;
}

const TOKENISED_TIMING = 'var(--ds-motion-slow, 320ms) var(--ds-motion-ease-in-out, ease-in-out)';

test('stats-slot layout contract is CSS-owned and has no expanded height ceiling', () => {
  const openingTag = component.match(
    /<Box\s+className="ds-collection-workspace__stats-slot"[\s\S]*?data-collapsed=\{slotsCollapsed \? 'true' : 'false'\}[\s\S]*?>/
  )?.[0];

  assert.ok(openingTag, 'missing stats-slot anatomy');
  assert.doesNotMatch(openingTag, /\bstyle\s*=/);
  assert.doesNotMatch(component, /maxHeight:\s*slotsCollapsed\s*\?\s*0\s*:\s*400/);
  assert.doesNotMatch(skin, /max-height:\s*400px/);

  // The base rule is the sole owner of the slot's motion contract.
  const base = ruleBody(BASE_SELECTOR);
  assert.equal(
    base,
    'transition: max-height var(--ds-motion-slow, 320ms) var(--ds-motion-ease-in-out, ease-in-out),'
      + ' opacity var(--ds-motion-slow, 320ms) var(--ds-motion-ease-in-out, ease-in-out),'
      + ' padding var(--ds-motion-slow, 320ms) var(--ds-motion-ease-in-out, ease-in-out);'
  );

  const arms = transitionArms(base);
  assert.deepEqual(
    arms,
    [
      `max-height ${TOKENISED_TIMING}`,
      `opacity ${TOKENISED_TIMING}`,
      `padding ${TOKENISED_TIMING}`,
    ],
    'transition must animate exactly max-height, opacity and padding, in that order, on tokens'
  );
  assert.doesNotMatch(base, /300ms/);

  const expanded = ruleBody(EXPANDED_SELECTOR);
  assert.equal(
    expanded,
    'padding-block-start: calc(var(--ds-spacing-3, 12px) + calc(var(--ds-spacing-1, 4px) * 0.5));'
      + ' padding-block-end: calc(var(--ds-spacing-2, 8px) + calc(var(--ds-spacing-1, 4px) * 0.5));'
      + ' padding-inline: var(--ds-spacing-4, 16px);'
      + ' max-height: none;'
      + ' overflow: visible;'
      + ' pointer-events: auto;'
      + ' opacity: 1;'
  );

  const collapsed = ruleBody(COLLAPSED_SELECTOR);
  assert.equal(
    collapsed,
    'padding: 0; max-height: 0; overflow: hidden; pointer-events: none; opacity: 0;'
  );

  // Neither state body may restate (or cancel) the base motion contract.
  assert.doesNotMatch(expanded, /transition/);
  assert.doesNotMatch(collapsed, /transition/);
});
