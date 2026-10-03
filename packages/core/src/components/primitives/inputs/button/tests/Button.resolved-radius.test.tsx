import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { responsiveTokens } from '@tests/support/responsive';

import ModernButton from '../engines/modern';

const CSS_ROOT = join(__dirname, '../../../../../foundation/tokens/css');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const SKIN = strip(readFileSync(join(CSS_ROOT, 'runtime/engines/modern/skin/button/index.css'), 'utf8'));

interface Rule {
  selector: string;
  body: string;
}

const rulesOf = (css: string): Rule[] =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: (match[1] as string).trim().replace(/\s+/g, ' '),
    body: match[2] as string,
  }));

const declarations = (body: string): [string, string][] =>
  body
    .split(';')
    .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .map((declaration) => {
      const colon = declaration.indexOf(':');
      return [declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim()];
    });

const RULES = rulesOf(SKIN);
const PUBLISHED = '--ds-button-resolved-radius';
const ROOT = '.ds-button.ds-button--modern';

const publishedBy = (selector: string) =>
  RULES.filter((rule) => rule.selector === selector).flatMap((rule) =>
    declarations(rule.body)
      .filter(([name]) => name === PUBLISHED)
      .map(([, value]) => value),
  );

describe('Modern Button publishes the radius it resolves', () => {
  it('names the radius once, publicly, and paints its own corner from it', () => {
    expect(SKIN).not.toContain('--_ds-button-resolved-radius');
    const base = RULES.find((rule) => rule.selector === `${ROOT}[data-variant]`);
    expect(declarations(base?.body ?? '')).toEqual(
      expect.arrayContaining([
        [PUBLISHED, 'var(--ds-button-md-radius, var(--ds-radius-md))'],
        ['--ds-button-resolved-height', 'var(--ds-button-md-height)'],
        ['border-radius', `var(${PUBLISHED}, var(--ds-radius-md))`],
      ]),
    );
  });

  it('publishes the size step on every size arm, beside the resolved height', () => {
    const steps = { xs: 'sm', sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' } as const;
    for (const [size, ramp] of Object.entries(steps)) {
      const arm = RULES.find((rule) => rule.selector === `${ROOT}[data-size='${size}']:not([data-size-responsive])`);
      expect(declarations(arm?.body ?? '')).toEqual(
        expect.arrayContaining([
          [PUBLISHED, `var(--ds-button-${size}-radius, var(--ds-radius-${ramp}))`],
          ['--ds-button-resolved-height', `var(--ds-button-${size}-height)`],
        ]),
      );
    }
  });

  it('publishes what a shape or an explicit radius paints, never the size step under it', () => {
    const NOT_JOINED = ":not([data-connected='true'])";
    expect(publishedBy(`${ROOT}:is([data-shape='circle'], [data-shape='round'])${NOT_JOINED}`)).toEqual([
      'var(--ds-radius-full)',
    ]);
    const explicit = { none: '0px', sm: 'var(--ds-radius-sm)', md: 'var(--ds-radius-md)', lg: 'var(--ds-radius-lg)', full: 'var(--ds-radius-full)' };
    for (const [radius, value] of Object.entries(explicit)) {
      const arm = `${ROOT}[data-shape='default'][data-radius='${radius}']`;
      expect(publishedBy(`${arm}${NOT_JOINED}`)).toEqual([value]);
      const painted = RULES.find((rule) => rule.selector === arm);
      expect(declarations(painted?.body ?? '')).toEqual([['border-radius', radius === 'none' ? '0' : value]]);
    }
    for (const shape of ['circle', 'round']) {
      const painted = RULES.filter((rule) => rule.selector === `${ROOT}[data-shape='${shape}']`).flatMap((rule) =>
        declarations(rule.body).filter(([name]) => name === 'border-radius'),
      );
      expect(painted).toEqual([['border-radius', 'var(--ds-radius-full)']]);
    }
  });

  it('keeps the size step on a joined child, whose exterior corners read it', () => {
    const corners = RULES.filter((rule) => /\[data-connected='true'\]\[data-group-position~=/.test(rule.selector));
    expect(corners).toHaveLength(4);
    for (const rule of corners) {
      expect(declarations(rule.body).every(([, value]) => value === `var(${PUBLISHED})`)).toBe(true);
    }
    expect(
      RULES.filter((rule) => declarations(rule.body).some(([name]) => name === PUBLISHED)).filter(
        (rule) => /data-shape|data-radius/.test(rule.selector) && !rule.selector.endsWith(":not([data-connected='true'])"),
      ),
    ).toEqual([]);
  });

  describe('a responsive size', () => {
    const armed = (ui: React.ReactElement) =>
      responsiveTokens(render(ui).container).filter((token) => token.includes('resolved-radius'));

    it('projects the size step into the published radius', () => {
      expect(armed(<ModernButton size={{ xs: 'sm', lg: 'lg' }}>Label</ModernButton>)).toEqual([
        'ds-button-resolved-radius@xs',
        'ds-button-resolved-radius@lg',
      ]);
    });

    it('leaves the published radius to a shape or an explicit radius', () => {
      expect(armed(<ModernButton size={{ xs: 'sm', lg: 'lg' }} shape="round">Label</ModernButton>)).toEqual([]);
      expect(armed(<ModernButton size={{ xs: 'sm', lg: 'lg' }} shape="circle" aria-label="Label" />)).toEqual([]);
      expect(armed(<ModernButton size={{ xs: 'sm', lg: 'lg' }} radius="lg">Label</ModernButton>)).toEqual([]);
    });

    it('still projects the size step on a joined child of any shape', () => {
      expect(
        armed(
          <ModernButton size={{ xs: 'sm', lg: 'lg' }} shape="round" data-connected="true">
            Label
          </ModernButton>,
        ),
      ).toEqual(['ds-button-resolved-radius@xs', 'ds-button-resolved-radius@lg']);
    });
  });
});
