import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss, { type Rule } from 'postcss';
import { describe, expect, it } from 'vitest';

// Every chrome declaration on the Select trigger carries a zero-specificity guard; the focus ring, the
// forced-colours state arms, the touch floor and disabled dimming stay unguarded; one rule neutralises the bridge.
const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/select/index.css'),
  'utf8',
);
const GUARD = ":not(:where([data-chrome='none']))";
const CHROME = [/^min-(block-size|height)$/, /^(block-size|height)$/, /^padding/, /^background/, /^border(?!.*radius)/, /^box-shadow$/, /^color$/, /^opacity$/];
const ROOT = ".ds-select-shell.ds-select-shell--modern[data-part='root']";
const NEUTRALISER = `.ds-select-shell.ds-select-shell--modern select[data-part='trigger'][data-chrome='none'] {
  block-size: auto;
  padding-block: 0;
  padding-inline: 0 calc(var(--ds-select-arrow-size) + var(--ds-select-trigger-gap, var(--ds-spacing-2)));
  background-color: transparent;
  background-image: none;
  border-width: 0;
  color: inherit;
  box-shadow: none;
}
@media not (pointer: coarse) {
  .ds-select-shell.ds-select-shell--modern select[data-part='trigger'][data-chrome='none'] {
    min-block-size: 0;
  }
}
.ds-select-shell.ds-select-shell--modern select[data-part='trigger'][data-chrome='none'] ~ [data-part='native-arrow'] {
  inset-inline-end: 0;
}`;

const rules: { rule: Rule; media: string }[] = [];
postcss.parse(SKIN).walkRules((rule) => {
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
const ownsPaint = (selector: string) => selector.startsWith(ROOT) && /\[data-part='trigger'\]/.test(lastCompound(selector)) && !lastCompound(selector).startsWith(':is(');
function kept(prop: string, selector: string, media: string): boolean {
  if (/pointer: ?coarse/.test(media)) return true;
  if (/forced-colors/.test(media)) return /data-status='error'|disabled/.test(selector) || /^outline/.test(prop);
  if (/focus-visible|data-open='true'/.test(selector) && !/hovered/.test(selector) && prop === 'box-shadow') return true;
  return prop === 'opacity' && /disabled/.test(selector);
}

describe('Modern Select skin: the chrome-none cascade contract', () => {
  it('guards every chrome declaration on the trigger outside the kept arms', () => {
    const unguarded: string[] = [];
    for (const { rule, media } of rules) {
      for (const selector of rule.selectors.filter(ownsPaint)) {
        if (selector.includes(GUARD)) continue;
        rule.each((node) => {
          if (node.type !== 'decl' || !CHROME.some((re) => re.test(node.prop))) return;
          if (!kept(node.prop, selector, media)) unguarded.push(`${media} ${selector} { ${node.prop} }`);
        });
      }
    }
    expect(unguarded).toEqual([]);
  });

  it('uses the exact zero-specificity guard, and keys chrome-less paint only in the neutraliser', () => {
    const keyed = rules.flatMap(({ rule }) => rule.selectors).filter((selector) => selector.replaceAll(GUARD, '').includes("[data-chrome='none']"));
    expect(keyed).toEqual([
      ".ds-select-shell.ds-select-shell--modern select[data-part='trigger'][data-chrome='none']",
      ".ds-select-shell.ds-select-shell--modern select[data-part='trigger'][data-chrome='none']",
      ".ds-select-shell.ds-select-shell--modern select[data-part='trigger'][data-chrome='none'] ~ [data-part='native-arrow']",
    ]);
    expect(SKIN.match(/data-chrome='none'/g)!.length).toBe(keyed.length + rules.flatMap(({ rule }) => rule.selectors).filter((selector) => selector.includes(GUARD)).length);
  });

  it('neutralises the bridge with exactly the specified block', () => {
    expect(SKIN).toContain(NEUTRALISER);
  });

  it('declares a focus channel under chrome="none" only as the neutraliser\'s box-shadow reset', () => {
    const focusChannels: string[] = [];
    for (const { rule } of rules) {
      if (!rule.selector.replaceAll(GUARD, '').includes("[data-chrome='none']")) continue;
      rule.walkDecls((decl) => {
        if (['box-shadow', 'outline', 'outline-offset'].includes(decl.prop)) focusChannels.push(`${rule.selector} { ${decl.prop}: ${decl.value} }`);
      });
    }
    expect(focusChannels).toEqual([
      ".ds-select-shell.ds-select-shell--modern select[data-part='trigger'][data-chrome='none'] { box-shadow: none }",
    ]);
  });

  const FORCED = 'media (forced-colors: active)';
  it.each([
    ['base', `${ROOT} [data-part='trigger']:is([data-state~='focus-visible'], :focus-visible)`, 'box-shadow'],
    ['base', `${ROOT} div[data-part='trigger'][data-open='true']`, 'box-shadow'],
    ['base', `${ROOT} [data-part='trigger'][data-disabled='true']`, 'opacity'],
    ['base', `${ROOT}[data-disabled='true'] [data-part='trigger']`, 'opacity'],
    ['media (pointer: coarse)', `${ROOT} [data-part='trigger']`, 'min-block-size'],
    [FORCED, `${ROOT} [data-part='trigger'][data-status='error']`, 'border-width'],
    [FORCED, `${ROOT} [data-part='trigger']:is([data-state~='focus-visible'], :focus-visible)`, 'outline'],
    [FORCED, `${ROOT} div[data-part='trigger'][data-open='true']`, 'outline'],
    [FORCED, `${ROOT} [data-part='trigger'][data-disabled='true']`, 'color'],
    [FORCED, `${ROOT} [data-part='trigger'][data-disabled='true']`, 'border-color'],
  ])('keeps the %s arm %s { %s } unguarded', (media, selector, prop) => {
    const owners = rules.filter((entry) => entry.media === (media === 'base' ? '' : media) && entry.rule.selectors.includes(selector));
    expect(owners.some(({ rule }) => rule.some((node) => node.type === 'decl' && node.prop === prop))).toBe(true);
  });
});
