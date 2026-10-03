import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { ar, en, es, fr, pt } from '@/foundation/i18n/runtime/catalog/translations';

import { createEngineComponent } from '../..';
import { EngineProvider } from '../../../../composition/react/provider';
import { EngineErrorBoundary } from '..';

const source = readFileSync(join(__dirname, '..', 'index.tsx'), 'utf8');

const CATALOGS = { en, es, fr, pt, ar } as const;
type CatalogLocale = keyof typeof CATALOGS;
const LOCALES = Object.keys(CATALOGS) as CatalogLocale[];

const catalogTitle = (locale: CatalogLocale): string => CATALOGS[locale].errors.generic;
const catalogRetry = (locale: CatalogLocale): string =>
  CATALOGS[locale].components.surfaces.states.retry;

const LITERAL_TITLE = 'An unexpected error occurred';
const LITERAL_RETRY = 'Try again';

const COLOUR_LITERAL =
  /#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\(|\b(?:red|white|black|gray|grey|crimson|maroon)\b/i;
const LENGTH_LITERAL = /\d(?:px|rem|em|pt|%)\b|\b0?\.\d/;

function LoadedWidget() {
  return <div data-testid="loaded-widget">loaded</div>;
}

function failingEngineComponent(name: string, message: string) {
  const failing = async (): Promise<{ default: React.ComponentType<Record<never, never>> }> => {
    throw new Error(message);
  };
  return createEngineComponent<Record<never, never>>(name, {
    classic: failing,
    modern: failing,
    rustic: failing,
  });
}

function styledElements(root: HTMLElement): HTMLElement[] {
  return [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
}

describe('EngineErrorBoundary default fallback', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders when the engine import throws', async () => {
    const BrokenWidget = failingEngineComponent('BrokenWidget', 'chunk load failed');

    render(
      <EngineProvider defaultEngine="modern">
        <BrokenWidget />
      </EngineProvider>
    );

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(LITERAL_TITLE)).toBeInTheDocument();
    expect(within(alert).getByText('chunk load failed')).toBeInTheDocument();
    expect(within(alert).getByRole('button', { name: LITERAL_RETRY })).toBeInTheDocument();
  });

  it('renders with no engine, theme or i18n provider mounted', async () => {
    const UndeclaredWidget = failingEngineComponent('UndeclaredWidget', 'unreachable');

    function Thrower(): React.ReactElement {
      throw new Error('engine import failed');
    }

    const bare = render(
      <EngineErrorBoundary>
        <Thrower />
      </EngineErrorBoundary>
    );
    const alert = bare.getByRole('alert');
    expect(within(alert).getByText(LITERAL_TITLE)).toBeInTheDocument();
    expect(within(alert).getByText('engine import failed')).toBeInTheDocument();
    expect(within(alert).getByRole('button', { name: LITERAL_RETRY })).toBeInTheDocument();
    bare.unmount();

    const nested = render(
      <EngineErrorBoundary>
        <UndeclaredWidget />
      </EngineErrorBoundary>
    );
    expect(within(nested.getByRole('alert')).getByText(/no engine is declared/)).toBeInTheDocument();
  });

  it.each(LOCALES)('uses the catalog copy of locale %s when a provider is mounted', async (locale) => {
    const BrokenWidget = failingEngineComponent(`BrokenWidget-${locale}`, 'chunk load failed');

    render(
      <I18nProvider locale={locale} fallbackLocale={locale}>
        <EngineProvider defaultEngine="modern">
          <BrokenWidget />
        </EngineProvider>
      </I18nProvider>
    );

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(catalogTitle(locale))).toBeInTheDocument();
    expect(within(alert).getByRole('button', { name: catalogRetry(locale) })).toBeInTheDocument();
  });

  it('lets the catalog copy win over the literal floor', async () => {
    expect(catalogTitle('es')).not.toBe(LITERAL_TITLE);
    expect(catalogRetry('es')).not.toBe(LITERAL_RETRY);
    expect(catalogTitle('en')).toBe(LITERAL_TITLE);
    expect(catalogRetry('en')).toBe(LITERAL_RETRY);

    const BrokenWidget = failingEngineComponent('BrokenWidgetEs', 'chunk load failed');
    render(
      <I18nProvider locale="es" fallbackLocale="es">
        <EngineProvider defaultEngine="modern">
          <BrokenWidget />
        </EngineProvider>
      </I18nProvider>
    );

    const alert = await screen.findByRole('alert');
    expect(within(alert).queryByText(LITERAL_TITLE)).toBeNull();
    expect(within(alert).queryByRole('button', { name: LITERAL_RETRY })).toBeNull();
  });

  it('lets a tenant override of the catalog key win', async () => {
    const BrokenWidget = failingEngineComponent('BrokenWidgetTenant', 'chunk load failed');
    render(
      <I18nProvider
        locale="es"
        customTranslations={{ errors: { generic: 'Algo no cargó' } }}
      >
        <EngineProvider defaultEngine="modern">
          <BrokenWidget />
        </EngineProvider>
      </I18nProvider>
    );

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Algo no cargó')).toBeInTheDocument();
  });

  it('exposes alert semantics and a focusable native retry button', async () => {
    const BrokenWidget = failingEngineComponent('BrokenWidgetA11y', 'chunk load failed');
    render(
      <EngineProvider defaultEngine="modern">
        <BrokenWidget />
      </EngineProvider>
    );

    const alert = await screen.findByRole('alert');
    const retry = within(alert).getByRole('button', { name: LITERAL_RETRY });
    expect(retry.tagName).toBe('BUTTON');
    expect(retry).toHaveAttribute('type', 'button');
    expect(retry).not.toHaveAttribute('tabindex');
    expect(retry).not.toBeDisabled();
    retry.focus();
    expect(retry).toHaveFocus();
    expect(retry.style.outline).toBe('');
  });

  it('retry resets the boundary and renders the recovered child', () => {
    let broken = true;
    function Flaky(): React.ReactElement {
      if (broken) {
        throw new Error('first attempt failed');
      }
      return <LoadedWidget />;
    }

    render(
      <EngineErrorBoundary>
        <Flaky />
      </EngineErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    broken = false;
    fireEvent.click(screen.getByRole('button', { name: LITERAL_RETRY }));

    expect(screen.getByTestId('loaded-widget')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('keeps fallbackRender ahead of the default fallback', () => {
    function Thrower(): React.ReactElement {
      throw new Error('custom path');
    }

    render(
      <EngineErrorBoundary
        fallbackRender={(error, reset) => (
          <button type="button" data-testid="custom-fallback" onClick={reset}>
            {error.message}
          </button>
        )}
      >
        <Thrower />
      </EngineErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toHaveTextContent('custom path');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('reports the failure to onError', () => {
    const onError = vi.fn();
    function Thrower(): React.ReactElement {
      throw new Error('reported');
    }

    render(
      <EngineErrorBoundary onError={onError}>
        <Thrower />
      </EngineErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toMatchObject({ message: 'reported' });
  });

  it('paints only through --ds-* custom properties, with no colour or length literal', () => {
    function Thrower(): React.ReactElement {
      throw new Error('paint contract');
    }

    render(
      <EngineErrorBoundary>
        <Thrower />
      </EngineErrorBoundary>
    );

    const rendered = styledElements(screen.getByRole('alert')).flatMap((element) => {
      expect(element.getAttribute('class')).toBeNull();
      return (element.getAttribute('style') ?? '')
        .split(';')
        .map((declaration) => declaration.trim())
        .filter(Boolean)
        .map((declaration) => declaration.slice(declaration.indexOf(':') + 1).trim());
    });
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.some((value) => value.includes('var(--ds-color-error'))).toBe(true);

    const styleBlocks = Array.from(
      source.matchAll(/const (FALLBACK_[A-Z_]+_STYLE): CSSProperties = \{([\s\S]*?)\n\};/g)
    );
    const authored = styleBlocks.flatMap((block) =>
      Array.from(block[2].matchAll(/^\s+[a-zA-Z]+: '([^']*)',$/gm)).map((match) => match[1])
    );
    const authoredLines = styleBlocks.flatMap((block) =>
      block[2].split('\n').filter((line) => line.trim().length > 0)
    );
    expect(styleBlocks.length).toBeGreaterThan(0);
    expect(authored.length).toBe(authoredLines.length);

    const styleUses = Array.from(source.matchAll(/style=\{([^}]*)\}/g)).map((match) => match[1]);
    const jsx = source.slice(source.indexOf('function EngineErrorFallback'));
    const jsxStyleUses = Array.from(jsx.matchAll(/style=\{([^}]*)\}/g)).map((match) => match[1]);
    expect(styleUses.length).toBeGreaterThan(0);
    expect(jsxStyleUses.length).toBeGreaterThan(0);
    for (const use of jsxStyleUses) {
      expect(styleBlocks.map((block) => block[1])).toContain(use);
    }

    const KEYWORDS = new Set(['solid', 'pointer', 'inherit', 'none']);
    for (const value of [...rendered, ...authored]) {
      expect(value).not.toMatch(COLOUR_LITERAL);
      const withoutTokens = value.replace(/var\(|--ds-[a-z0-9-]+|[(),\s]/g, ' ').trim();
      expect(withoutTokens, value).not.toMatch(LENGTH_LITERAL);
      for (const word of withoutTokens.split(/\s+/).filter(Boolean)) {
        expect(KEYWORDS.has(word), value).toBe(true);
      }
      for (const reference of value.match(/var\(\s*--[a-z0-9-]+/g) ?? []) {
        expect(reference, value).toMatch(/^var\(\s*--ds-/);
      }
    }

    expect(authored).toContain('var(--ds-color-error-700, var(--ds-color-error))');
    expect(authored).toContain('var(--ds-color-error-border, var(--ds-color-error))');
  });

  it('resolves nothing through the engine loader or the component tier', () => {
    const imports = Array.from(source.matchAll(/^import[\s\S]*?from\s+'([^']+)';$/gm)).map(
      (match) => match[1]
    );

    expect(imports.length).toBeGreaterThan(0);
    for (const specifier of imports) {
      expect(specifier).not.toMatch(/components\//);
      expect(specifier).not.toMatch(/component-factory$|\/engines\//);
    }
    expect(source).not.toMatch(/createEngineComponent\(/);
    expect(source).not.toMatch(/className=/);
  });
});
