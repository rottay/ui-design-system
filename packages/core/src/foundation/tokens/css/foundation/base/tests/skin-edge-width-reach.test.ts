/**
 * Contract for the depth axis reaching eight engine-agnostic skins: each rule
 * below painted its border width as a bare `1px`, so the tenant's edge profile
 * (`--ds-edge-hairline-width` / `--ds-edge-standard-width`) moved every other
 * container while these stayed put. Each now reads its edge ROLE with the old
 * literal as the fallback, so an unset profile paints the same 1px.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const SKIN = 'src/foundation/tokens/css/presentation/components/skin';

interface EdgeRule {
  readonly family: string;
  readonly selector: string;
  readonly role: 'hairline' | 'standard';
}

const RULES: readonly EdgeRule[] = [
  { family: 'activity-cards', selector: ".ds-activity-cards.ds-activity-cards[data-part='root'][data-part='root']", role: 'hairline' },
  { family: 'activity-compact', selector: ".ds-activity-compact.ds-activity-compact[data-part='root'][data-part='root']", role: 'hairline' },
  { family: 'activity-ticker', selector: ".ds-activity-ticker.ds-activity-ticker[data-part='root'][data-part='root']", role: 'hairline' },
  { family: 'activity-timeline', selector: ".ds-activity-timeline.ds-activity-timeline[data-part='root'][data-part='root']", role: 'hairline' },
  { family: 'ascii-frame', selector: '.rt-ascii-frame', role: 'hairline' },
  { family: 'terminal-block', selector: '.rt-terminal-block', role: 'hairline' },
  { family: 'code-block', selector: ".ds-code-block[data-part='root'] [data-part='copy-button']", role: 'standard' },
  { family: 'radio-group', selector: ".ds-radio-group.ds-radio-group--button [data-part='option'][data-part='option']", role: 'standard' },
];

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function classTwin(selector: string): string | undefined {
  const scope = /^\.([\w-]+)\.\1(?![\w-])/.exec(selector)?.[1];
  return scope === undefined ? undefined : selector.replace(/\[data-part='([\w-]+)'\]/g, `.${scope}__$1`);
}

function memberForms(selector: string): readonly (readonly string[])[] {
  const twin = classTwin(selector);
  return twin === undefined ? [[selector]] : [[selector], [selector, twin], [twin]];
}

function skinOf(family: string): string {
  return readFileSync(resolve(process.cwd(), SKIN, family, 'index.css'), 'utf8');
}

/** The `border` declaration of the first top-level rule written with this selector, bare or paired with its class twin. */
function borderIn(source: string, selector: string): string | undefined {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const forms = memberForms(selector).map((form) => form.map(escapeRegExp).join('\\s*,\\s*')).join('|');
  const body = new RegExp(`(?:^|\\})\\s*(?:${forms})\\s*\\{([^}]*)\\}`).exec(css)?.[1];
  return /(?:^|;)\s*border\s*:\s*([^;]+);/.exec(body ?? '')?.[1]?.trim();
}

function borderOf(family: string, selector: string): string | undefined {
  return borderIn(skinOf(family), selector);
}

type Members = (selector: string, twin: string) => readonly string[];

function reshaped(source: string, selector: string, members: Members): string {
  const root = postcss.parse(source);
  const forms = memberForms(selector).map((form) => form.join(','));
  root.walkRules((rule) => {
    if (forms.includes(rule.selectors.map((member) => member.replace(/\s+/g, ' ').trim()).join(','))) {
      rule.selectors = [...members(selector, classTwin(selector) ?? selector)];
    }
  });
  return root.toString();
}

const TWINNED = RULES.filter((rule) => classTwin(rule.selector) !== undefined);

describe('engine-agnostic skins -- depth reach through the edge roles', () => {
  it.each(RULES)('$family paints its border width from the $role edge role', ({ family, selector, role }) => {
    const border = borderOf(family, selector);
    expect(border, `${family}: no border on ${selector}`).toBeDefined();
    expect(border?.startsWith(`var(--ds-edge-${role}-width, 1px) solid `)).toBe(true);
  });

  it('the edge reader finds each root rule bare or paired with its exact class twin, and the exact-selector reader does not', () => {
    const exact = (source: string, selector: string): string | undefined => {
      const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
      const body = new RegExp(`(?:^|\\})\\s*${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`).exec(css)?.[1];
      return /(?:^|;)\s*border\s*:\s*([^;]+);/.exec(body ?? '')?.[1]?.trim();
    };
    expect(TWINNED.map((rule) => rule.family)).toEqual(['activity-cards', 'activity-compact', 'activity-ticker', 'activity-timeline']);
    const shapes: readonly [string, Members][] = [
      ['bare', (selector) => [selector]],
      ['paired', (selector, twin) => [selector, twin]],
      ['class-only', (_selector, twin) => [twin]],
    ];
    for (const { family, selector, role } of TWINNED) {
      const live = skinOf(family);
      for (const [name, members] of shapes) {
        expect(borderIn(reshaped(live, selector, members), selector)?.startsWith(`var(--ds-edge-${role}-width, 1px) solid `), `${family} ${name}`).toBe(true);
      }
      expect(exact(reshaped(live, selector, shapes[0][1]), selector), family).toBeDefined();
      expect(exact(reshaped(live, selector, shapes[1][1]), selector), family).toBeUndefined();
      expect(exact(reshaped(live, selector, shapes[2][1]), selector), family).toBeUndefined();
    }
  });

  it('NEGATIVE: an extra, widened or foreign-block member and a missing rule each fail the edge reader', () => {
    for (const { family, selector } of TWINNED) {
      const live = skinOf(family);
      const scope = `ds-${family}`;
      const refused: readonly [string, Members][] = [
        ['extra member', (k, c) => [k, c, `.${scope}.${scope}.${scope}__extra`]],
        ['widened member', (k) => [k, `.${scope}.${scope}.rottay-box--modern`]],
        ['foreign-block member', (k) => [k, `.${scope}.${scope}.ds-metrics-cards__root.ds-metrics-cards__root`]],
        ['duplicated member', (k) => [k, k]],
        ['duplicated twin', (k, c) => [k, c, c]],
        ['reversed order', (k, c) => [c, k]],
        ['partial class form', (k) => [k, `.${scope}.${scope}.${scope}__root[data-part='root']`]],
        ['collapsed doubled units', (k) => [k, `.${scope}.${scope}.${scope}__root`]],
      ];
      for (const [name, members] of refused) {
        expect(borderIn(reshaped(live, selector, members), selector), `${family} ${name}`).toBeUndefined();
      }
      const missing = postcss.parse(live);
      missing.walkRules((rule) => {
        if (memberForms(selector).some((form) => form.join(',') === rule.selectors.map((member) => member.replace(/\s+/g, ' ').trim()).join(','))) rule.remove();
      });
      expect(borderIn(missing.toString(), selector), `${family} missing rule`).toBeUndefined();
    }
  });
});
