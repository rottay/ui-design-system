/**
 * The published compile, and what happens when it is absent or foreign.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import {
  EngineVisualDeclarationProvider,
  useEngineVisualDeclaration,
  useRequiredEngineVisualDeclaration,
} from '..';

const MODERN = firstPartyEngineVisual('rottay', 'modern');
const CLASSIC = firstPartyEngineVisual('rottay', 'classic');

function Optional(): React.ReactElement {
  const declaration = useEngineVisualDeclaration();
  return <span data-testid="optional">{declaration?.engine ?? 'none'}</span>;
}

function Required({ engine }: { engine: 'classic' | 'modern' }): React.ReactElement {
  const declaration = useRequiredEngineVisualDeclaration(engine);
  return <span data-testid="required">{declaration.engine}</span>;
}

describe('the optional reader reports absence rather than inventing one', () => {
  it('returns null outside a provider', () => {
    render(<Optional />);
    expect(screen.getByTestId('optional')).toHaveTextContent('none');
  });

  it('returns null when a provider publishes nothing', () => {
    render(
      <EngineVisualDeclarationProvider>
        <Optional />
      </EngineVisualDeclarationProvider>,
    );
    expect(screen.getByTestId('optional')).toHaveTextContent('none');
  });

  it('returns the published declaration', () => {
    render(
      <EngineVisualDeclarationProvider declaration={MODERN}>
        <Optional />
      </EngineVisualDeclarationProvider>,
    );
    expect(screen.getByTestId('optional')).toHaveTextContent('modern');
  });
});

describe('the required reader refuses absence and refuses a foreign compile', () => {
  it('resolves when the engines agree', () => {
    render(
      <EngineVisualDeclarationProvider declaration={CLASSIC}>
        <Required engine="classic" />
      </EngineVisualDeclarationProvider>,
    );
    expect(screen.getByTestId('required')).toHaveTextContent('classic');
  });

  it('throws when nothing was published', () => {
    expect(() => render(<Required engine="classic" />)).toThrow(
      /seeds its library from the compiled projection, and none was published/,
    );
  });

  it('throws when the compile belongs to another engine', () => {
    expect(() =>
      render(
        <EngineVisualDeclarationProvider declaration={MODERN}>
          <Required engine="classic" />
        </EngineVisualDeclarationProvider>,
      ),
    ).toThrow(/compiled for "modern" but "classic" is rendering/);
  });
});

describe('the declaration carries the compile, not a copy of the theme', () => {
  it('publishes the projection, the declared mode and the runtime half', () => {
    expect(CLASSIC.engine).toBe('classic');
    expect(Object.keys(CLASSIC.projection.seeds)).toHaveLength(10);
    expect(MODERN.projection).toEqual({ seeds: {}, modes: [] });
    expect(MODERN.runtime.personality).toBeDefined();
    expect(MODERN.runtime.tokenOverrides).toBeDefined();
  });
});
