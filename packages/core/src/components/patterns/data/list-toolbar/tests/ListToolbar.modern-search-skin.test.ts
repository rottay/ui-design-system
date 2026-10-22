/**
 * ListToolbar modern — toolbar search ownership contract (R2+R3, BATCH C).
 *
 * The toolbar search used to receive an inline `searchInputStyle(...)` object
 * from the engine: the last inline paint in the pattern (background, border
 * colour, ink, shadow and radius on the field wrapper, plus the W10 control
 * geometry). Pass 1 moves all of it into the modern skin: the `--ds-input-*`
 * channels cascade from the search section, the wrapper surface channels are
 * painted by a skin rule, and the control height/type law lives next to the
 * other toolbar controls. The shared `foundation/tokens` helper stays for the
 * frozen classic engine, untouched.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const MODERN_ENGINE = readFileSync(
  resolve(process.cwd(), 'src/components/patterns/data/list-toolbar/engines/modern/index.tsx'),
  'utf8'
);
const MODERN_SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css'
  ),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

type Rule = readonly [selector: string, body: string];

const CHANNELS = [
  "--ds-input-bg",
  "--ds-input-border",
  "--ds-input-color-placeholder",
  "--ds-input-addon-color",
  "--ds-input-clear-color",
] as const;

/** A member that selects the search section through its own part, in part form. */
const OWN_SECTION =
  /\.ds-list-toolbar__search-section\[data-part=(['"])search-section\1\](?![\w-])/g;
/** What the pre-fold reader matched: a part-form section compound up to its rule body. */
const PART_FORM_RULE =
  /\.ds-list-toolbar__search-section\[data-part=['"]search-section['"]\][^{]*\{[^}]*\}/g;
/** The same two-argument fold, allowing only CSS whitespace immediately inside its parentheses. */
const OWN_FOLD =
  /:is\([\t\n\f\r ]*\[data-part=(['"])([a-z0-9-]+)\1\],\s*\.ds-list-toolbar__([a-z0-9-]+)[\t\n\f\r ]*\)/g;

/** A fold reads back as its part only when the class is this block's class for the same part. */
const readFold = (
  fold: string,
  quote: string,
  part: string,
  hook: string
): string => (hook === part ? `[data-part=${quote}${part}${quote}]` : fold);

/** Commas inside `:is()` / `:where()` / `:not()` separate arguments, not selectors. */
function selectorList(prelude: string): string[] {
  const members: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of prelude) {
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      members.push(buf.replace(/\s+/g, " ").trim());
      buf = "";
    } else buf += ch;
  }
  members.push(buf.replace(/\s+/g, " ").trim());
  return members;
}

/** The own section compound counts only at the top level of a member, never inside a pseudo-class argument. */
const ownSection = (member: string): boolean =>
  [...member.matchAll(OWN_SECTION)].some((match) => {
    const before = member.slice(0, match.index);
    return (
      (before.match(/\(/g) ?? []).length === (before.match(/\)/g) ?? []).length
    );
  });

/** Every rule, nested ones included, with a member that selects the section through its own part; selectors read back to part form. */
function sectionRules(
  css: string
): { selector: string; declarations: string[] }[] {
  return [...css.matchAll(/(?<=^|[{}])\s*([^{}@]+?)\s*\{([^{}]*)\}/g)].flatMap(
    (rule) => {
      const members = selectorList(rule[1]!.replace(OWN_FOLD, readFold));
      if (!members.some(ownSection)) return [];
      const declarations = rule[2]!
        .split(";")
        .map((declaration) => declaration.replace(/\s+/g, " ").trim())
        .filter(Boolean);
      return [{ selector: members.join(", "), declarations }];
    }
  );
}

const missingChannels = (css: string): string[] => {
  const declared = sectionRules(css)
    .flatMap((rule) => rule.declarations)
    .join("\n");
  return CHANNELS.filter((channel) => !declared.includes(`${channel}:`));
};

const sheet = (rules: readonly Rule[]): string =>
  rules.map(([selector, body]) => `${selector} { ${body} }`).join("\n");

/** The six rules that select the section through its own part, as the skin authors them. */
const SECTION_RULES: readonly Rule[] = [
  [
    ".ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__search-section[data-part='search-section']",
    "position: relative; flex: 1 1 15rem; min-inline-size: var(--ds-toolbar-search-min-width, 11.25rem); max-inline-size: var(--ds-toolbar-search-max-width, 20rem); min-width: 0;",
  ],
  [
    ".ds-pattern-list-toolbar.ds-engine-modern[data-has-title='false'] .ds-list-toolbar__search-section[data-part='search-section']",
    "flex-grow: 2; max-inline-size: var(--ds-toolbar-search-wide-max-width, 30rem);",
  ],
  [
    ".ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__mobile-layout[data-part='mobile-layout'] .ds-list-toolbar__search-section[data-part='search-section']",
    "flex: 0 0 auto; max-inline-size: none;",
  ],
  [
    ".ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__search-section[data-part='search-section']",
    "--ds-input-bg: var(--ds-search-input-bg, var(--ds-search-bg, var(--ds-surface-control, var(--ds-color-bg-input)))); --ds-input-border: var(--ds-search-input-border, var(--ds-search-border, var(--ds-color-border))); --ds-input-color: var(--ds-search-input-color, var(--ds-search-color, var(--ds-color-text-primary))); --ds-input-color-placeholder: var(--ds-search-placeholder-color, var(--ds-color-text-muted)); --ds-input-addon-color: var(--ds-search-icon-color, var(--ds-color-text-muted)); --ds-input-clear-color: var(--ds-search-clear-color, var(--ds-color-text-muted)); --ds-input-clear-color-hover: var(--ds-search-clear-color-hover, var(--ds-color-text-secondary));",
  ],
  [
    ".ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__search-section[data-part='search-section'] .ds-input-field[data-part='field']",
    "background: var(--ds-search-bg, transparent); border-radius: var(--ds-search-radius, var(--ds-toolbar-radius, var(--ds-radius-sm, 6px))); box-shadow: var(--ds-search-shadow, none);",
  ],
  [
    ".ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__search-section[data-part='search-section'] .ds-input-shell.ds-input-shell--modern[data-part='root']",
    "block-size: var(--ds-toolbar-search-height, var(--ds-button-sm-height, 2rem)); font-size: var(--ds-toolbar-search-font-size, var(--ds-button-sm-font-size, 0.8125rem));",
  ],
];
const CHANNEL_RULE = 3;
/** The same rules in sanctioned fold form; the mixed input-shell rule folds only the own section and keeps the foreign root. */
const FOLD_SELECTORS = [
  ".ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__search-section:is([data-part='search-section'], .ds-list-toolbar__search-section)",
  ".ds-pattern-list-toolbar.ds-engine-modern[data-has-title='false'] .ds-list-toolbar__search-section:is([data-part='search-section'], .ds-list-toolbar__search-section)",
  ".ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__mobile-layout:is([data-part='mobile-layout'], .ds-list-toolbar__mobile-layout) .ds-list-toolbar__search-section:is([data-part='search-section'], .ds-list-toolbar__search-section)",
  ".ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__search-section:is([data-part='search-section'], .ds-list-toolbar__search-section)",
  ".ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__search-section:is([data-part='search-section'], .ds-list-toolbar__search-section) .ds-input-field[data-part='field']",
  ".ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__search-section:is([data-part='search-section'], .ds-list-toolbar__search-section) .ds-input-shell.ds-input-shell--modern[data-part='root']",
];
const foldOf = (rules: readonly Rule[]): Rule[] =>
  rules.map(([, body], index) => [FOLD_SELECTORS[index]!, body]);

describe('ListToolbar modern — toolbar search is skin-owned', () => {
  it('the engine no longer injects the inline search style object', () => {
    expect(MODERN_ENGINE).not.toContain('searchInputStyle');
    expect(MODERN_ENGINE).not.toContain('CONTROL_SIZE');
  });

  it('the skin cascades the search --ds-input-* channels from the section', () => {
    expect(sectionRules(MODERN_SKIN).length).toBeGreaterThan(0);
    expect(sectionRules(MODERN_SKIN).length).toBe(
      (MODERN_SKIN.replace(OWN_FOLD, readFold).match(PART_FORM_RULE) ?? [])
        .length
    );
    expect(missingChannels(MODERN_SKIN)).toEqual([]);

    // The part form and the sanctioned fold of the same rules read the same payload.
    const partForm = sectionRules(sheet(SECTION_RULES));
    expect(partForm.map((rule) => rule.selector)).toEqual(
      SECTION_RULES.map(([selector]) => selector)
    );
    expect(sectionRules(sheet(foldOf(SECTION_RULES)))).toEqual(partForm);

    // Exact multiline mixed-owner prelude emitted by the owning producer.
    const multilineMixedOwner = `.ds-pattern-list-toolbar.ds-engine-modern
  .ds-list-toolbar__search-section:is(
    [data-part='search-section'],
    .ds-list-toolbar__search-section
  )
  .ds-input-shell.ds-input-shell--modern[data-part='root']`;
    const mixedOwnerPart = sectionRules(sheet([SECTION_RULES[5]!]));
    expect(
      sectionRules(sheet([[multilineMixedOwner, SECTION_RULES[5]![1]]]))
    ).toEqual(mixedOwnerPart);
    expect(
      sectionRules(
        sheet([
          [
            multilineMixedOwner.replace(
              "[data-part='root']",
              "[data-part='foreign-root']"
            ),
            SECTION_RULES[5]![1],
          ],
        ])
      )
    ).not.toEqual(mixedOwnerPart);

    const recoloured = foldOf(SECTION_RULES).map(
      ([selector, body], index): Rule =>
        index === CHANNEL_RULE
          ? [
              selector,
              body.replace("--ds-input-bg: var(", "--ds-input-bg: var(--x, "),
            ]
          : [selector, body]
    );
    expect(sectionRules(sheet(recoloured))).not.toEqual(partForm);

    expect(
      missingChannels(
        sheet(SECTION_RULES.filter((_, index) => index !== CHANNEL_RULE))
      )
    ).toEqual([...CHANNELS]);
    const withoutClear = SECTION_RULES.map(
      ([selector, body], index): Rule =>
        index === CHANNEL_RULE
          ? [selector, body.replace(/--ds-input-clear-color: [^;]+; /, "")]
          : [selector, body]
    );
    expect(missingChannels(sheet(withoutClear))).toEqual([
      "--ds-input-clear-color",
    ]);

    // Only the section's own part, or its sanctioned fold, makes a rule a section rule.
    const section =
      ".ds-list-toolbar__search-section[data-part='search-section']";
    for (const notOwn of [
      `:is(.ds-other, ${section})`,
      ".ds-list-toolbar__search-section:is([data-part='search-section'], .ds-list-toolbar__filter-rail)",
      ".ds-list-toolbar__search-section:is([data-part='search-section'], .ds-other-toolbar__search-section)",
      ".ds-list-toolbar__search-section:is([data-part='search-section'], .ds-list-toolbar__search-section, .ds-other)",
      ".ds-list-toolbar__search-section:is([data-part='search-section'])",
      ".ds-list-toolbar__search-section:is(\u00a0[data-part='search-section'], .ds-list-toolbar__search-section)",
      ".ds-other-toolbar__search-section[data-part='search-section']",
      ".ds-list-toolbar__search-section.ds-list-toolbar__search-section",
      ".ds-list-toolbar__search-section[data-part='search-sections']",
      ".ds-pattern-list-toolbar.ds-engine-modern[data-part='root']",
    ]) {
      const moved = SECTION_RULES.map(
        ([selector, body], index): Rule =>
          index === CHANNEL_RULE
            ? [`.ds-pattern-list-toolbar.ds-engine-modern ${notOwn}`, body]
            : [selector, body]
      );
      expect(missingChannels(sheet(moved)), notOwn).toEqual([...CHANNELS]);
    }
  });

  it('the skin owns the W10 control geometry law for the toolbar search', () => {
    expect(MODERN_SKIN).toMatch(
      /\.ds-input-shell\.ds-input-shell--modern\[data-part=['"]root['"]\]\s*\{[^}]*block-size:\s*var\(--ds-toolbar-search-height/
    );
    expect(MODERN_SKIN).toContain('--ds-toolbar-search-font-size');
  });

  it('the field wrapper surface channels are painted by the skin, not inline', () => {
    expect(MODERN_SKIN).toMatch(
      /\.ds-input-field\[data-part=['"]field['"]\]\s*\{[^}]*--ds-search-bg/
    );
  });
});

describe('ListToolbar modern — the control rests the skin declares', () => {
  const declarations = (selector: RegExp, property: string): string[] =>
    [...MODERN_SKIN.matchAll(new RegExp(`${selector.source}[^{]*\\{([^}]*)\\}`, 'g'))].flatMap((m) =>
      [...m[1]!.matchAll(new RegExp(`(?:^|[;\\s])${property}:\\s*([^;]+);`, 'g'))].map((d) => d[1]!.trim()),
    );

  it('the filter dropdown item rests at 2.5rem', () => {
    expect(declarations(/\.ds-list-toolbar__filter-dropdown-item\.ds-list-toolbar__filter-dropdown-item\.ds-button\[data-variant\]\s*/, 'min-block-size')).toEqual([
      '2.5rem',
    ]);
  });

  it('the phone primary action rests at 32px on both inline axes', () => {
    const selector = /\.ds-list-toolbar__primary-action-mobile\.ds-list-toolbar__primary-action-mobile\.ds-list-toolbar__primary-action-mobile\s*/;
    expect(declarations(selector, 'inline-size')).toEqual(['32px']);
    expect(declarations(selector, 'min-inline-size')).toEqual(['32px']);
  });
});
