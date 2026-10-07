import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss, { type Rule } from 'postcss';
import { describe, expect, it } from 'vitest';

// Every chrome declaration on the Button paint owner carries a zero-specificity guard; the focus ring,
// the forced-colours state arms, the touch floor and disabled dimming stay unguarded. No neutraliser.
const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/button/index.css'),
  'utf8',
);
const GUARD = ":not(:where([data-chrome='none']))";
const CHROME = [/^min-(block-size|height)$/, /^(block-size|height)$/, /^padding/, /^background/, /^border(?!.*radius)/, /^box-shadow$/, /^color$/, /^opacity$/, /^filter$/, /^content$/];
const OWNER = '.ds-button.ds-button--modern';
const flat = (selector: string) => selector.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')');

const rules: { rule: Rule; media: string }[] = [];
postcss.parse(SKIN).walkRules((rule) => {
  if (rule.parent?.type === 'atrule' && /keyframes/.test((rule.parent as postcss.AtRule).name)) return;
  const media: string[] = [];
  for (let parent = rule.parent; parent && parent.type !== 'root'; parent = parent.parent) {
    if (parent.type === 'atrule') media.unshift(`${(parent as postcss.AtRule).name} ${(parent as postcss.AtRule).params}`);
  }
  rules.push({ rule, media: media.join(' && ') });
});
const lastCompound = (selector: string) => {
  let depth = 0;
  let start = 0;
  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index]!;
    if ('[('.includes(character)) depth += 1;
    else if ('])'.includes(character)) depth -= 1;
    else if (depth === 0 && /[\s>+~]/.test(character)) start = index + 1;
  }
  return selector.slice(start);
};
const ownsPaint = (selector: string) => lastCompound(flat(selector)).includes('.ds-button--modern');
function kept(prop: string, selector: string, media: string): boolean {
  if (/pointer: ?coarse|hover: ?none/.test(media)) return true;
  if (/forced-colors/.test(media)) return /disabled|aria-pressed|aria-current|data-tone/.test(selector) || /^outline/.test(prop);
  if (/focus-visible/.test(selector) && !/hovered|:hover/.test(selector) && prop === 'box-shadow') return true;
  return prop === 'opacity' && /disabled/.test(selector);
}

describe('Modern Button skin: the chrome-none cascade contract', () => {
  it('guards every chrome declaration on the paint owner outside the kept arms', () => {
    const unguarded: string[] = [];
    for (const { rule, media } of rules) {
      for (const selector of rule.selectors.filter(ownsPaint)) {
        if (selector.includes(GUARD)) continue;
        rule.each((node) => {
          if (node.type !== 'decl' || !CHROME.some((re) => re.test(node.prop))) return;
          if (!kept(node.prop, selector, media)) unguarded.push(`${media} ${flat(selector)} { ${node.prop} }`);
        });
        rule.each((node) => {
          if (node.type !== 'decl') return;
          if (/^outline/.test(node.prop) && /aria-pressed|aria-current/.test(selector) && !/forced-colors/.test(media)) unguarded.push(`${flat(selector)} { ${node.prop} }`);
          if (/^text-decoration/.test(node.prop) && /data-variant='link'/.test(selector)) unguarded.push(`${flat(selector)} { ${node.prop} }`);
        });
      }
    }
    expect(unguarded).toEqual([]);
  });

  it('keys chrome-less paint only through the exact zero-specificity guard', () => {
    for (const selector of rules.flatMap(({ rule }) => rule.selectors).filter((candidate) => candidate.includes("data-chrome='none'"))) {
      expect(selector.replaceAll(GUARD, '')).not.toContain("data-chrome='none'");
    }
  });

  const FORCED = 'media (forced-colors: active)';
  const FOCUS = `${OWNER}[data-variant]:is([data-state~='focus-visible'], :focus-visible)`;
  it.each([
    ['base', FOCUS, 'box-shadow'],
    ['base', `${OWNER}[data-disabled='true']`, 'opacity'],
    ['base', `${OWNER}[data-disabled='true']::before`, 'opacity'],
    ['media (hover: none), (pointer: coarse)', `${OWNER}[data-variant]`, 'min-block-size'],
    [FORCED, FOCUS, 'outline'],
    [FORCED, `${OWNER}[data-disabled='true']`, 'color'],
    [FORCED, `${OWNER}[data-disabled='true']`, 'border-color'],
    [FORCED, `${OWNER}:is([aria-pressed='true'], [aria-current='true'])`, 'background'],
    [FORCED, `${OWNER}:is([aria-pressed='true'], [aria-current='true'])`, 'color'],
    [FORCED, `${OWNER}:is([aria-pressed='true'], [aria-current='true'])`, 'border-color'],
    [FORCED, `${OWNER}[data-tone='danger']`, 'border-width'],
  ])('keeps the %s arm %s { %s } unguarded', (media, selector, prop) => {
    const owners = rules.filter((entry) => entry.media === (media === 'base' ? '' : media) && entry.rule.selectors.map(flat).includes(selector));
    expect(owners.some(({ rule }) => rule.some((node) => node.type === 'decl' && node.prop === prop))).toBe(true);
  });
});
