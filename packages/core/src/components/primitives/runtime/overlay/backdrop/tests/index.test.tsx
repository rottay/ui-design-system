import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render } from '@testing-library/react';

import {
  THEMANAGEMENT_TENANT_THEME_DOCUMENT,
  THEMANAGEMENT_TENANT_THEME_IDENTITY,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/themanagement-db-row';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
} from '@/infrastructure/compilers/composition/tenant-theme';

import { Overlay } from '..';

const SKIN = resolve(
  process.cwd(),
  'src/foundation/tokens/css/presentation/components/skin/overlay-modal-compounds/index.css',
);

type Overrides = Record<string, string>;

function compileWith(edit: (overrides: Overrides) => void): string {
  const row = structuredClone({
    ...THEMANAGEMENT_TENANT_THEME_DOCUMENT,
    ...THEMANAGEMENT_TENANT_THEME_IDENTITY,
  }) as { visualFoundation: { advanced: { tokenOverrides: Overrides } } };
  edit(row.visualFoundation.advanced.tokenOverrides);
  return compileTenantThemeConfig(row, {
    verticalEnvelope: getTenantThemeVerticalEnvelope(THEMANAGEMENT_TENANT_THEME_IDENTITY.verticalKey),
  }).css;
}

function declared(css: string, name: string): string | undefined {
  let value: string | undefined;
  postcss.parse(css).walkDecls(name, (decl) => {
    value ??= decl.value.trim();
  });
  return value;
}

function intensityRule(step: 'light' | 'heavy') {
  const rules: postcss.Rule[] = [];
  postcss.parse(readFileSync(SKIN, 'utf8')).walkRules((rule) => {
    if (rule.selector.includes(`[data-intensity='${step}']`)) rules.push(rule);
  });
  expect(rules).toHaveLength(1);
  return rules[0]!;
}

function paintFor(step: 'light' | 'heavy', tenantCss: string): string {
  const channel = `--ds-overlay-${step}`;
  let terminal = '';
  intensityRule(step).walkDecls('background-color', (decl) => {
    terminal = decl.value;
  });
  const arm = new RegExp(`^var\\(${channel},.*\\)$`).exec(terminal);
  expect(arm, `${channel} is not the first arm of "${terminal}"`).not.toBeNull();
  const value = declared(tenantCss, channel);
  expect(value, `${channel} is not emitted by the tenant artifact`).toBeDefined();
  return value!;
}

describe('Overlay paints the tenant overlay ladder through its skin', () => {
  it.each(['light', 'heavy'] as const)('stamps the %s step the skin selects, with no inline veil', (step) => {
    const { container } = render(<Overlay visible intensity={step} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root.matches(intensityRule(step).selector)).toBe(true);
    expect(renderToStaticMarkup(<Overlay visible intensity={step} />)).not.toContain('background-color');
  });

  it('keeps the canonical scrim inline when no step is asked for', () => {
    const { container } = render(<Overlay visible />);
    const root = container.firstElementChild as HTMLElement;

    expect(root.hasAttribute('data-intensity')).toBe(false);
    expect(renderToStaticMarkup(<Overlay visible />)).toContain(
      'background-color:var(--ds-overlay-bg, var(--ds-modal-overlay-bg, rgba(0, 0, 0, 0.5)))',
    );
  });

  it('lets an explicit backgroundColor win over the step', () => {
    const { container } = render(<Overlay visible intensity="heavy" backgroundColor="red" />);

    expect((container.firstElementChild as HTMLElement).style.backgroundColor).toBe('red');
  });

  it('paints the tenant-authored step value from the compiled artifact, and moves with it', () => {
    const first = compileWith((overrides) => {
      overrides['--ds-overlay-light'] = 'rgba(12, 12, 12, 0.3)';
      overrides['--ds-overlay-heavy'] = 'rgba(12, 12, 12, 0.7)';
    });
    const moved = compileWith((overrides) => {
      overrides['--ds-overlay-light'] = 'rgba(40, 20, 0, 0.25)';
      overrides['--ds-overlay-heavy'] = 'rgba(40, 20, 0, 0.8)';
    });

    expect(paintFor('light', first)).toBe('rgba(12, 12, 12, 0.3)');
    expect(paintFor('heavy', first)).toBe('rgba(12, 12, 12, 0.7)');
    expect(paintFor('light', moved)).toBe('rgba(40, 20, 0, 0.25)');
    expect(paintFor('heavy', moved)).toBe('rgba(40, 20, 0, 0.8)');
  });
});
