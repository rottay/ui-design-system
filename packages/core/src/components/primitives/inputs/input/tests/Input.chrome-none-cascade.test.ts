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

  it('keeps the focus rings, the coarse floor and the forced-colours state arms unguarded', () => {
    const unguardedSelectors = rules.filter(({ rule }) => !rule.selector.includes(GUARD)).map(({ rule, media }) => `${media}|${rule.selector}`);
    for (const ring of [
      ".ds-input-shell.ds-input-shell--modern[data-state~='focused']:not([data-disabled='true'])",
      ".ds-input-shell.ds-input-shell--modern[data-invalid='true'][data-state~='focused']:not([data-disabled='true'])",
    ]) {
      expect(unguardedSelectors.some((entry) => entry.endsWith(`|${ring}`))).toBe(true);
    }
    expect(unguardedSelectors.some((entry) => /pointer: coarse/.test(entry) && entry.endsWith('|.ds-input-shell.ds-input-shell--modern'))).toBe(true);
    expect(unguardedSelectors.some((entry) => /forced-colors/.test(entry) && entry.endsWith("|.ds-input-shell.ds-input-shell--modern[data-invalid='true']"))).toBe(true);
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
