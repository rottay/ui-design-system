import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import React from 'react';
import { render } from '@testing-library/react';

import {
  THEMANAGEMENT_TENANT_THEME_DOCUMENT,
  THEMANAGEMENT_TENANT_THEME_IDENTITY,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/themanagement-db-row';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
} from '@/infrastructure/compilers/composition/tenant-theme';

import { GlassCard } from '..';

const CSS_ROOT = resolve(process.cwd(), 'src/foundation/tokens/css');
const SKIN = 'presentation/components/skin/glass-card/index.css';

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

function declared(css: string, name: string): string[] {
  const values: string[] = [];
  postcss.parse(css).walkDecls(name, (decl) => {
    values.push(decl.value.trim());
  });
  return values;
}

function skinRule() {
  const rules: postcss.Rule[] = [];
  postcss.parse(readFileSync(resolve(CSS_ROOT, SKIN), 'utf8')).walkRules((rule) => {
    rules.push(rule);
  });
  expect(rules).toHaveLength(1);
  return rules[0]!;
}

function skinTerminal(prop: string): string {
  const decls: string[] = [];
  skinRule().walkDecls(prop, (decl) => {
    decls.push(decl.value);
  });
  expect(decls).toHaveLength(1);
  return decls[0]!;
}

/** Resolve the skin's terminal against the tenant artifact, first var() arm only. */
function paintFor(terminal: string, tenantCss: string, channel: string): string {
  const [value] = declared(tenantCss, channel);
  expect(value, `${channel} is not emitted by the tenant artifact`).toBeDefined();
  const arm = new RegExp(`^(.*?)var\\(${channel},.*\\)$`).exec(terminal);
  expect(arm, `${channel} is not the first arm of "${terminal}"`).not.toBeNull();
  return `${arm![1]}${value}`;
}

describe('GlassCard reads the tenant glass channels through its skin', () => {
  it('stamps the anatomy the skin selects', () => {
    const { container } = render(
      <GlassCard className="consumer">
        <span>Glass content</span>
      </GlassCard>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root.matches(skinRule().selector)).toBe(true);
    expect(root.classList.contains('consumer')).toBe(true);
    expect(root.style.background).toBe('');
    expect(root.style.border).toBe('');
  });

  it('is imported by the base entrypoint into the components layer', () => {
    const base = readFileSync(resolve(CSS_ROOT, 'facade/entrypoints/base/index.css'), 'utf8');

    expect(base).toContain(`@import "../../../${SKIN}"\n  layer(rottay-components);`);
  });

  it('paints a tenant-authored glass value from the compiled artifact', () => {
    const css = compileWith(() => {});

    expect(paintFor(skinTerminal('background'), css, '--ds-glass-bg')).toBe('rgba(246, 243, 236, 0.97)');
    expect(paintFor(skinTerminal('border'), css, '--ds-glass-border')).toBe(
      '1px solid rgba(42, 40, 36, 0.28)',
    );
  });

  it('moves the paint when the tenant moves the authored value', () => {
    const css = compileWith((overrides) => {
      overrides['--ds-glass-bg'] = 'rgba(10, 20, 30, 0.5)';
      overrides['--ds-glass-border'] = 'rgba(30, 20, 10, 0.4)';
    });

    expect(paintFor(skinTerminal('background'), css, '--ds-glass-bg')).toBe('rgba(10, 20, 30, 0.5)');
    expect(paintFor(skinTerminal('border'), css, '--ds-glass-border')).toBe(
      '1px solid rgba(30, 20, 10, 0.4)',
    );
  });

  it('keeps the props as the innermost fallback only', () => {
    const { container } = render(
      <GlassCard blur={16} bgOpacity={0.15} borderOpacity={0.3}>
        <span />
      </GlassCard>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root.style.getPropertyValue('--_ds-glass-card-blur')).toBe('16px');
    expect(root.style.getPropertyValue('--_ds-glass-card-bg')).toBe('rgba(255, 255, 255, 0.15)');
    expect(skinTerminal('background')).toMatch(/var\(--_ds-glass-card-bg\)\)\)$/);
    expect(skinTerminal('backdrop-filter')).toBe('blur(var(--ds-glass-blur, var(--_ds-glass-card-blur)))');
  });
});
