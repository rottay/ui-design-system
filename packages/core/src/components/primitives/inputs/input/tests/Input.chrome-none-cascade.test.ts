import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss, { type Rule } from 'postcss';
import { describe, expect, it } from 'vitest';

// Every chrome declaration on the Input paint owner carries a zero-specificity guard; the focus ring,
// forced-colours state arms, touch floor and disabled dimming stay unguarded.
const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/input/index.css'),
  'utf8',
);
const GUARD = ":not(:where([data-chrome='none']))";
const CHROME = [/^min-(block-size|height)$/, /^(block-size|height)$/, /^padding/, /^background/, /^border(?!.*radius)/, /^box-shadow$/, /^color$/, /^opacity$/];

const root = postcss.parse(SKIN);
const rules: { rule: Rule; media: string }[] = [];
root.walkRules((rule) => {
  const media: string[] = [];
  for (let parent = rule.parent; parent && parent.type !== 'root'; parent = parent.parent) {
    if (parent.type === 'atrule') media.unshift(`${(parent as postcss.AtRule).name} ${(parent as postcss.AtRule).params}`);
  }
  rules.push({ rule, media: media.join(' && ') });
});
const subject = (selector: string) => selector.split(/\s+|>/).filter(Boolean).pop() ?? '';
const ownsPaint = (selector: string) => /ds-input-shell--modern/.test(subject(selector)) && !/::(placeholder|selection)/.test(selector);
function kept(prop: string, selector: string, media: string): boolean {
  if (/pointer: ?coarse/.test(media)) return true;
  if (/forced-colors/.test(media)) return /invalid|disabled/.test(selector) || /^outline/.test(prop);
  if (/focused/.test(selector) && !/:not\(\[data-state~='focused'\]\)/.test(selector) && prop === 'box-shadow') return true;
  return prop === 'opacity' && /disabled/.test(selector);
}

describe('Modern Input skin: the chrome-none cascade contract', () => {
  it('guards every chrome declaration on the paint owner outside the kept arms', () => {
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

  it('uses the exact zero-specificity guard and nothing else to key the chrome', () => {
    const chromeKeyed = rules.flatMap(({ rule }) => rule.selectors).filter((selector) => selector.includes("data-chrome='none'"));
    for (const selector of chromeKeyed) {
      expect(selector.includes(GUARD) || selector.startsWith(".ds-input-field[data-part='field'][data-chrome='none']")).toBe(true);
    }
  });

  const SHELL = '.ds-input-shell.ds-input-shell--modern';
  const FORCED = 'media (forced-colors: active)';
  it.each([
    ['base', `${SHELL}[data-state~='focused']:not([data-disabled='true'])`, 'box-shadow'],
    ['base', `${SHELL}[data-invalid='true'][data-state~='focused']:not([data-disabled='true'])`, 'box-shadow'],
    ['base', `${SHELL}[data-warning='true'][data-state~='focused']:not([data-invalid='true']):not([data-disabled='true'])`, 'box-shadow'],
    ['base', `${SHELL}[data-success='true'][data-state~='focused']:not([data-disabled='true'])`, 'box-shadow'],
    ['base', `${SHELL}[data-disabled='true']`, 'opacity'],
    ['media (pointer: coarse)', SHELL, 'min-block-size'],
    [FORCED, `${SHELL}[data-invalid='true']`, 'border-width'],
    [FORCED, `${SHELL}[data-state~='focused']`, 'outline'],
    [FORCED, `${SHELL}[data-disabled='true']`, 'color'],
    [FORCED, `${SHELL}[data-disabled='true']`, 'border-color'],
  ])('keeps the %s arm %s { %s } unguarded', (media, selector, prop) => {
    const owners = rules.filter((entry) => entry.media === (media === 'base' ? '' : media) && entry.rule.selectors.includes(selector));
    expect(owners.some(({ rule }) => rule.some((node) => node.type === 'decl' && node.prop === prop))).toBe(true);
  });

  it('never declares a focus channel under chrome="none"', () => {
    for (const { rule } of rules) {
      if (!rule.selector.replaceAll(GUARD, '').includes("[data-chrome='none']")) continue;
      rule.each((node) => {
        if (node.type === 'decl') expect(['box-shadow', 'outline', 'outline-offset']).not.toContain(node.prop);
      });
    }
  });

  it('lets a chrome-less field size from its content (no inline-size containment)', () => {
    const wrapper = rules.find(({ rule }) => rule.selector === ".ds-input-field[data-part='field'][data-chrome='none']");
    expect(wrapper).toBeDefined();
    let containerType = '';
    wrapper!.rule.walkDecls('container-type', (decl) => {
      containerType = decl.value;
    });
    expect(containerType).toBe('normal');
  });
});
