/**
 * The increased-contrast geometry floor — the root case.
 *
 * Eight of its eleven rows are declared by every compiled tenant artifact, and
 * tenant paint is unlayered by law, so a LAYERED floor would reach none of them
 * in any vertical. The guard mirrors the Arabic root-guard device instead:
 * unlayered, (0,2,1), no `!important`.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import {
  code,
  declaredChannels,
  format,
  ruleBlocks,
  specificity,
  specificityIsGreater,
  splitSelectorList,
} from '../support/selector';
import {
  resolveDocumentRootAttributes,
  type DocumentRootAttributes,
} from '@/infrastructure/runtime/foundation/root-attributes/ssr';

const CSS_ROOT = 'src/foundation/tokens/css';
const VERTICALS = ['bithire', 'evnto', 'rottay'] as const;

const read = (relative: string): string => readFileSync(resolve(process.cwd(), relative), 'utf8');

const guard = read(`${CSS_ROOT}/foundation/a11y/contrast/index.css`);
const entrypoint = read(`${CSS_ROOT}/facade/entrypoints/base/index.css`);
const artifacts = Object.fromEntries(
  VERTICALS.map((vertical) => [
    vertical,
    read(`${CSS_ROOT}/facade/artifacts/${vertical}/index.css`),
  ]),
) as Record<(typeof VERTICALS)[number], string>;

const GUARD_SELECTOR = `html[data-engine="modern"][data-theme]`;
const ARTIFACT_SCOPE =
  ":is(html[data-tenant='bithire'], :where([data-ds-root][data-vertical='bithire']))";

/**
 * The PINNED table. Rows 1-8 are artifact-declared in all three verticals with
 * the resting values below; rows 9-11 are not, and ride the same guard so that
 * one law has one place to read. A twelfth channel fails case 4.
 *
 * Row 5 (`--ds-edge-emphasis-width`) moved in with WO-EVI-02, the A1 ruling:
 * left out, it stayed at 1px in rottay and evnto under contrast-more while
 * hairline and standard went to 2px, inverting the hierarchy (case 11).
 */
const PINNED = [
  {
    channel: '--ds-focus-ring-width',
    floor: '3px',
    resting: { bithire: '2px', evnto: '2px', rottay: '2px' },
  },
  {
    channel: '--ds-focus-ring-offset',
    floor: '3px',
    resting: { bithire: '2px', evnto: '2px', rottay: '2px' },
  },
  {
    channel: '--ds-edge-hairline-width',
    floor: '2px',
    resting: { bithire: '1px', evnto: '1px', rottay: '1px' },
  },
  {
    channel: '--ds-edge-standard-width',
    floor: '2px',
    resting: { bithire: '1.5px', evnto: '1px', rottay: '1px' },
  },
  {
    channel: '--ds-edge-emphasis-width',
    floor: '2px',
    resting: { bithire: '2px', evnto: '1px', rottay: '1px' },
  },
  {
    channel: '--ds-breadcrumb-separator-opacity',
    floor: '1',
    resting: { bithire: '0.72', evnto: '0.72', rottay: '0.72' },
  },
  {
    channel: '--ds-stack-divider-opacity',
    floor: '1',
    resting: { bithire: '0.72', evnto: '0.72', rottay: '0.72' },
  },
  {
    channel: '--ds-toolbar-divider-opacity',
    floor: '1',
    resting: { bithire: '0.6', evnto: '0.6', rottay: '0.6' },
  },
  { channel: '--ds-border-width-2', floor: '3px', resting: null },
  { channel: '--ds-avatar-focus-ring-width', floor: '3px', resting: null },
  { channel: '--ds-avatar-focus-ring-offset', floor: '3px', resting: null },
] as const;

const ARTIFACT_DECLARED = PINNED.filter((row) => row.resting !== null);

/**
 * Rows whose floor a vertical ALREADY rests at, so the floor moves nothing
 * there. bithire's emphasis is 2px at rest; the row is pinned for the two
 * verticals it does move (WO-EVI-02). Any other floor equal to its resting
 * value still fails case 5.
 */
const RESTS_AT_THE_FLOOR: Readonly<Record<string, readonly (typeof VERTICALS)[number][]>> = {
  '--ds-edge-emphasis-width': ['bithire'],
};

/** The edge-width ladder, thinnest first. Case 11 refuses an inversion of it. */
const EDGE_LADDER = [
  '--ds-edge-hairline-width',
  '--ds-edge-standard-width',
  '--ds-edge-emphasis-width',
] as const;

const importLine = entrypoint
  .split('\n')
  .find((line) => line.includes('foundation/a11y/contrast/index.css'));

describe('increased-contrast root guard', () => {
  it('1. ships UNLAYERED, by the same import shape the Arabic guard uses', () => {
    expect(importLine, 'the guard is not imported at all').toBeDefined();
    expect(importLine).not.toContain('layer(');
    // Drill: the instrument can see a layer when there is one. The responsive
    // aggregate two lines above is imported INTO `rottay-responsive`.
    const layered = entrypoint
      .split('\n')
      .find((line) => line.includes('foundation/responsive/index.css'));
    expect(layered).toContain('layer(rottay-responsive)');

    // The assembly semantics, proven on the live precedent: a file imported
    // without `layer()` lands outside every `@layer` block in the bundle.
    const bundle = read('artifacts/generated/css/verticals/bithire/index.css');
    // The layer is read off the PARSED bundle's ancestors. A text walk back to
    // the last `@layer` counted the guard's own `@media (prefers-contrast:
    // more)` brace as an open layer and matched `@layer` inside comments; it
    // held only while the bundle lacked the guard, and went red when
    // fd4185f93 first carried it (the parse shows @media as its sole ancestor).
    const tree = postcss.parse(bundle);
    const layersEnclosing = (selector: string): string[][] => {
      const found: string[][] = [];
      tree.walkRules((rule) => {
        if (!rule.selectors.some((one) => one.trim() === selector)) return;
        const layers: string[] = [];
        for (let node = rule.parent; node && node.type !== 'root'; node = node.parent) {
          if (node.type === 'atrule' && (node as postcss.AtRule).name === 'layer') {
            layers.push((node as postcss.AtRule).params);
          }
        }
        found.push(layers);
      });
      expect(found.length, `${selector} is absent from the bundle`).toBeGreaterThan(0);
      return found;
    };
    for (const layers of layersEnclosing('html[lang]:lang(ar)')) expect(layers).toEqual([]);

    // Drill: the same read DOES see a layer, on a real rule -- the first one the
    // responsive aggregate emits inside `rottay-responsive`.
    let layeredControl: string | undefined;
    tree.walkAtRules('layer', (atRule) => {
      if (layeredControl || atRule.params !== 'rottay-responsive' || !atRule.nodes) return;
      atRule.walkRules((rule) => {
        layeredControl ??= rule.selectors[0]?.trim();
      });
    });
    expect(layeredControl, 'the bundle has no rule inside rottay-responsive').toBeDefined();
    expect(layersEnclosing(layeredControl as string).some((layers) => layers.includes('rottay-responsive'))).toBe(true);

    // The bundle is build output and is regenerated by `build:vertical-bundles`,
    // not by this lot; once it carries the guard, the same read must hold.
    if (bundle.includes(GUARD_SELECTOR)) {
      for (const layers of layersEnclosing(GUARD_SELECTOR)) expect(layers).toEqual([]);
    }
  });

  it('2. outranks the tenant artifact on specificity, and a tie would lose', () => {
    const guardSpecificity = specificity(GUARD_SELECTOR);
    const artifactSpecificity = specificity(ARTIFACT_SCOPE);
    expect(guardSpecificity).toEqual({ a: 0, b: 2, c: 1 });
    expect(artifactSpecificity).toEqual({ a: 0, b: 1, c: 1 });
    expect(
      specificityIsGreater(guardSpecificity, artifactSpecificity),
      `${format(guardSpecificity)} must beat ${format(artifactSpecificity)}`,
    ).toBe(true);
    // The artifact really is written that way, and is really unlayered.
    expect(artifacts.bithire).toContain(ARTIFACT_SCOPE);
    expect(code(artifacts.bithire)).not.toContain('@layer');
    // Losing either attribute drops the guard to a TIE, and the artifact is
    // appended later, so a tie loses. Both attributes are load-bearing.
    for (const weakened of ['html[data-engine="modern"]', 'html[data-theme]']) {
      expect(specificityIsGreater(specificity(weakened), artifactSpecificity)).toBe(false);
    }
  });

  it('3. uses no !important, so an application can still override it deliberately', () => {
    expect(code(guard)).not.toContain('!important');
  });

  it('4. declares the pinned list, complete and closed', () => {
    expect(declaredChannels(guard)).toEqual(
      PINNED.map((row) => ({ channel: row.channel, value: row.floor })),
    );
  });

  it('5. every artifact-declared row is really artifact-declared, at the pinned resting value', () => {
    expect(ARTIFACT_DECLARED.length).toBe(8);
    for (const row of ARTIFACT_DECLARED) {
      for (const vertical of VERTICALS) {
        const resting = row.resting?.[vertical];
        expect(
          artifacts[vertical],
          `${row.channel} is no longer declared as ${resting} in ${vertical}`,
        ).toContain(`${row.channel}: ${resting};`);
        // A floor equal to the resting value would move nothing -- unless the
        // vertical is registered as already resting there.
        if (RESTS_AT_THE_FLOOR[row.channel]?.includes(vertical)) {
          expect(row.floor, `${row.channel} is registered at rest in ${vertical}`).toBe(resting);
          continue;
        }
        expect(row.floor, `${row.channel} does not move in ${vertical}`).not.toBe(resting);
      }
    }
    for (const row of PINNED.filter((candidate) => candidate.resting === null)) {
      for (const vertical of VERTICALS) {
        expect(artifacts[vertical]).not.toContain(`${row.channel}:`);
      }
    }
  });

  it('6. the governed projection co-locates the guard attributes with the artifact scope', () => {
    // Custom properties resolve from the NEAREST declaring ancestor: if the
    // artifact's `[data-ds-root]` arm could land lower, proximity would decide
    // instead of specificity and the guard would silently lose.
    const attributes = resolveDocumentRootAttributes({
      themeMode: 'auto',
      engine: 'modern',
      locale: 'en',
      tenant: { slug: 'bithire', verticalKey: 'bithire' },
    });
    for (const key of [
      'data-theme',
      'data-engine',
      'data-ds-root',
      'data-vertical',
      'data-tenant',
    ] as const) {
      expect(attributes, `${key} is not part of the one projection`).toHaveProperty(key);
    }
    expect(attributes['data-engine']).toBe('modern');
  });

  it('7. is fenced to the Modern engine; Classic and Rustic documents are unmatched', () => {
    expect(code(guard)).toContain('[data-engine="modern"]');
    for (const engine of ['classic', 'rustic']) {
      expect(code(guard)).not.toContain(engine);
    }
  });

  it('8. data-theme stays a non-optional key of DocumentRootAttributes', () => {
    // If it turns optional the guard loses an attribute, ties with the
    // artifact, and stops applying with no selector and no CSS test changing.
    type IsOptional<T, K extends keyof T> = Record<never, never> extends Pick<T, K> ? true : false;
    const dataThemeIsOptional: IsOptional<DocumentRootAttributes, 'data-theme'> = false;
    const dataTenantIsOptional: IsOptional<DocumentRootAttributes, 'data-tenant'> = true;
    expect(dataThemeIsOptional).toBe(false);
    expect(dataTenantIsOptional).toBe(true);

    // And the no-tenant branch still stamps it: `data-ds-root`, `data-vertical`
    // and `data-tenant` are all absent there, `data-theme` must not be.
    const untenanted = resolveDocumentRootAttributes({
      themeMode: 'auto',
      engine: 'modern',
      locale: 'en',
    });
    expect(untenanted['data-ds-root']).toBeUndefined();
    expect(untenanted['data-tenant']).toBeUndefined();
    expect(untenanted['data-theme']).toBeDefined();
  });

  it('9. is geometry only: it states no value that depends on a tenant decision', () => {
    // A hand-authored value is admissible here if, and only if, its correct
    // value under the preference does not depend on any tenant decision.
    const body = code(guard);
    expect(body).not.toContain('var(');
    expect(body).not.toContain('color-mix(');
    for (const { channel, value } of declaredChannels(guard)) {
      expect(channel, "colour is the lowering owner's, not this floor's").not.toMatch(
        /^--ds-color-/,
      );
      expect(value, `${channel} is not an absolute value`).toMatch(/^(?:\d+(?:\.\d+)?(?:px)?)$/);
    }
    expect(code(guard)).toContain('@media (prefers-contrast: more)');
  });
  it('10. no pinned channel is declared inside an artifact [data-theme] block', () => {
    // The mode block is scoped ONE attribute deeper than the artifact's base
    // rule, so it TIES the guard at (0,2,1) and is appended later -- a channel
    // emitted there would defeat the floor in that mode alone, silently.
    const scan = (css: string): { selector: string; channel: string }[] =>
      ruleBlocks(css)
        .filter((block) => block.selector.includes('[data-theme'))
        .flatMap((block) =>
          declaredChannels(block.body)
            .filter(({ channel }) => PINNED.some((row) => row.channel === channel))
            .map(({ channel }) => ({ selector: block.selector, channel })),
        );

    for (const vertical of VERTICALS) {
      const modeBlocks = ruleBlocks(artifacts[vertical]).filter((block) =>
        block.selector.includes('[data-theme'),
      );
      // Non-vacuity: the hazard block is real, and populated, in every vertical.
      expect(modeBlocks.length, `${vertical} has no [data-theme] block to scan`).toBeGreaterThan(0);
      for (const block of modeBlocks) {
        expect(declaredChannels(block.body).length).toBeGreaterThan(0);
        for (const arm of splitSelectorList(block.selector)) {
          expect(
            specificityIsGreater(specificity(GUARD_SELECTOR), specificity(arm)),
            `${arm} is ${format(specificity(arm))}: the guard does not outrank the mode block`,
          ).toBe(false);
        }
      }
      expect(
        scan(artifacts[vertical]),
        `${vertical} emits a pinned channel in a mode block`,
      ).toEqual([]);
    }

    // Drill, planted into the REAL artifact so the scanner is proven to parse
    // it: one pinned channel inside the live mode block, and the scan names it.
    const modeBlock = ruleBlocks(artifacts.bithire).find((block) =>
      block.selector.includes('[data-theme'),
    );
    const opening = `${modeBlock?.selector} {`;
    const planted = artifacts.bithire.replace(
      opening,
      `${opening}\n  --ds-edge-hairline-width: 1px;`,
    );
    expect(planted, 'the planting anchor did not match the artifact').not.toBe(artifacts.bithire);
    expect(scan(planted)).toEqual([
      { selector: modeBlock?.selector, channel: '--ds-edge-hairline-width' },
    ]);
  });

  it('11. the edge ladder is not inverted under contrast-more, in any vertical', () => {
    // Under the preference a channel resolves to the guard's value when the
    // guard declares it (case 2: it outranks the artifact; case 10: no mode
    // block ties it), else to the artifact's resting value.
    const resolveUnderMore = (
      floor: string,
      vertical: (typeof VERTICALS)[number],
    ): Record<(typeof EDGE_LADDER)[number], number> => {
      const floored = new Map(declaredChannels(floor).map(({ channel, value }) => [channel, value]));
      return Object.fromEntries(
        EDGE_LADDER.map((channel) => {
          const resting = artifacts[vertical].match(
            new RegExp(`${channel}: (\\d+(?:\\.\\d+)?)px;`),
          )?.[1];
          expect(resting, `${channel} is not artifact-declared in ${vertical}`).toBeDefined();
          return [channel, Number.parseFloat(floored.get(channel) ?? `${resting}px`)];
        }),
      ) as Record<(typeof EDGE_LADDER)[number], number>;
    };
    const inversions = (floor: string): string[] =>
      VERTICALS.flatMap((vertical) => {
        const widths = resolveUnderMore(floor, vertical);
        return EDGE_LADDER.slice(1).flatMap((channel, index) =>
          widths[channel] < widths[EDGE_LADDER[index]]
            ? [`${vertical}: ${channel} ${widths[channel]}px < ${EDGE_LADDER[index]} ${widths[EDGE_LADDER[index]]}px`]
            : [],
        );
      });

    expect(inversions(guard)).toEqual([]);
    // Reverse pin: the floor reaches exactly the three ladder rungs, no fourth
    // edge channel, and hairline/standard stay floored at 2px.
    expect(
      declaredChannels(guard).filter(({ channel }) => channel.startsWith('--ds-edge-')),
    ).toEqual(EDGE_LADDER.map((channel) => ({ channel, value: '2px' })));

    // Drill: the guard as it stood before WO-EVI-02 (emphasis unfloored) is
    // the measured inversion, named in exactly the two verticals that showed it.
    const unfloored = guard.replace(/^\s*--ds-edge-emphasis-width: 2px;\n/m, '');
    expect(unfloored, 'the drill did not remove the emphasis row').not.toBe(guard);
    expect(inversions(unfloored)).toEqual([
      'evnto: --ds-edge-emphasis-width 1px < --ds-edge-standard-width 2px',
      'rottay: --ds-edge-emphasis-width 1px < --ds-edge-standard-width 2px',
    ]);
  });
});
