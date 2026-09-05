/**
 * The classic bridge's first frame.
 *
 * The seeds antd receives must be the COMPILED ones on the very first render:
 * no `getComputedStyle`, no hardcoded palette, no tenant branding field
 * outranking a compiled channel, and the mode taken from the compiled blocks
 * rather than from a substring of a theme name.
 */

import { render, screen } from '@testing-library/react';
import { theme as antdTheme } from 'antd';
import { describe, expect, it } from 'vitest';

import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import { EngineVisualDeclarationProvider } from '@/infrastructure/runtime/foundation/engine-visual';
import { EngineProvider } from '../../../../composition/react/provider';
import { ThemeContext } from '../../../../../theming/composition/react/provider';
import { AntdConfigProvider, selectAntdTheme } from '..';
import type { ThemeContextValue } from '@/foundation/contracts';
import type { EngineVisualDeclaration } from '@/foundation/contracts/composition/tenants/themes/engine-adapter';

const CLASSIC = firstPartyEngineVisual('bithire', 'classic');
const MODERN = firstPartyEngineVisual('bithire', 'modern');

/** The palette the bridge used to paint before its first `getComputedStyle`. */
const RETIRED_SSR_BACKGROUND = '#0A0B0D';

function mount(
  resolvedTheme: ThemeContextValue['resolvedTheme'],
  declaration: EngineVisualDeclaration | undefined,
  engine: 'classic' | 'modern' = 'classic',
) {
  const themeValue: ThemeContextValue = {
    theme: resolvedTheme,
    resolvedTheme,
    setTheme: () => {},
    config: null,
  };
  return (
    <EngineProvider defaultEngine={engine}>
      <ThemeContext.Provider value={themeValue}>
        <EngineVisualDeclarationProvider declaration={declaration}>
          <AntdConfigProvider>
            <span data-testid="child">child</span>
          </AntdConfigProvider>
        </EngineVisualDeclarationProvider>
      </ThemeContext.Provider>
    </EngineProvider>
  );
}

describe('the classic bridge seeds antd from the compiled projection', () => {
  it('hands antd the compiled base seeds, object for object', () => {
    expect(selectAntdTheme(CLASSIC, 'light').token).toEqual({
      ...CLASSIC.projection.seeds,
      ...(CLASSIC.projection.modes.find((mode) => mode.mode === 'light')?.seeds ?? {}),
    });
    expect(Object.keys(selectAntdTheme(CLASSIC, 'light').token)).toHaveLength(10);
  });

  it('never carries the retired hardcoded SSR palette', () => {
    for (const mode of ['light', 'dark', 'base'] as const)
      expect(selectAntdTheme(CLASSIC, mode).token.colorBgBase).not.toBe(
        RETIRED_SSR_BACKGROUND,
      );
  });

  it('takes a mode from the compiled block, not from a theme NAME', () => {
    const dark = CLASSIC.projection.modes.find((mode) => mode.mode === 'dark');
    expect(dark).toBeDefined();
    const selected = selectAntdTheme(CLASSIC, 'dark');
    expect(selected.token.colorPrimary).toBe(dark?.seeds.colorPrimary);
    expect(selected.token.colorPrimary).not.toBe(CLASSIC.projection.seeds.colorPrimary);
    expect(selected.algorithm).toBe(antdTheme.darkAlgorithm);
  });

  it('resolves `base` to the mode the compile declares it IS', () => {
    const scheme = CLASSIC.colorScheme;
    expect(scheme).toBeDefined();
    expect(selectAntdTheme(CLASSIC, 'base')).toEqual(
      selectAntdTheme(CLASSIC, scheme as 'light' | 'dark'),
    );
  });

  it('keeps antd at zero specificity so DS layers always win', () => {
    expect(selectAntdTheme(CLASSIC, 'light').hashPriority).toBe('low');
  });

  it('renders through ConfigProvider on the first frame', () => {
    render(mount('light', CLASSIC));
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('is a transparent passthrough for a non-classic engine', () => {
    render(mount('light', undefined, 'modern'));
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('absence is refused, never guessed', () => {
  it('throws when classic renders with no published projection', () => {
    expect(() => render(mount('light', undefined))).toThrow(
      /seeds its library from the compiled projection/,
    );
  });

  it('throws when the published projection was compiled for another engine', () => {
    expect(() => render(mount('light', MODERN))).toThrow(
      /compiled for "modern" but "classic" is rendering/,
    );
  });
});
