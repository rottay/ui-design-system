import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SEMANTIC_SURFACE_ROLES } from '@/foundation/contracts/kernel/tokens/materials';
import { SemanticSurface, SemanticSurfaceSupport } from '../index';

afterEach(cleanup);

const SKIN_PATH = join(
  process.cwd(),
  'src/foundation/tokens/css/presentation/components/semantic-surface.css'
);

describe('SemanticSurface (DS-A004 public surface-role owner)', () => {
  it('stamps visual state without fabricating interaction semantics', () => {
    const { getByTestId, rerender } = render(
      <SemanticSurface
        data-testid="surface"
        surfaceRole="panel"
        interactive
        selected
        emphasis="strong"
        role="region"
      >
        content
      </SemanticSurface>
    );
    const node = getByTestId('surface');
    expect(node).toHaveAttribute('data-part', 'root');
    expect(node).toHaveAttribute('data-surface-role', 'panel');
    expect(node).toHaveAttribute('data-interactive', 'true');
    expect(node).toHaveAttribute('data-selected', 'true');
    expect(node).toHaveAttribute('data-emphasis', 'strong');
    expect(node).toHaveAttribute('role', 'region');
    expect(node).not.toHaveAttribute('tabindex');
    expect(node.className).toContain('ds-semantic-surface');

    rerender(
      <SemanticSurface
        data-testid="surface"
        surfaceRole="panel"
        interactive
        disabled
        loading
        dragging
      >
        content
      </SemanticSurface>
    );
    expect(node).not.toHaveAttribute('data-interactive');
    expect(node).toHaveAttribute('data-disabled', 'true');
    expect(node).toHaveAttribute('data-loading', 'true');
    expect(node).not.toHaveAttribute('data-dragging');
    expect(node).toHaveAttribute('aria-disabled', 'true');
    expect(node).toHaveAttribute('aria-busy', 'true');
    expect(node).not.toHaveAttribute('tabindex');
  });

  it('uses native button semantics when requested', () => {
    const { getByRole, rerender } = render(
      <SemanticSurface surfaceRole="control" as="button" interactive>
        Choose
      </SemanticSurface>
    );
    const button = getByRole('button', { name: 'Choose' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toBeDisabled();

    rerender(
      <SemanticSurface surfaceRole="control" as="button" interactive disabled>
        Choose
      </SemanticSurface>
    );
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('data-interactive');
  });

  it('renders structural elements and provides an explicit supporting-text slot', () => {
    const { getByTestId } = render(
      <SemanticSurface data-testid="outer" surfaceRole="overlay" as="section">
        <SemanticSurface data-testid="inner" surfaceRole="inset">
          <SemanticSurfaceSupport data-testid="support">
            supporting
          </SemanticSurfaceSupport>
        </SemanticSurface>
      </SemanticSurface>
    );
    expect(getByTestId('outer').tagName).toBe('SECTION');
    expect(getByTestId('outer')).toHaveAttribute('data-surface-role', 'overlay');
    expect(getByTestId('inner')).toHaveAttribute('data-surface-role', 'inset');
    expect(getByTestId('support')).toHaveAttribute('data-part', 'support');
    expect(getByTestId('support').className).toContain(
      'ds-semantic-surface__support'
    );
  });

  it('skin consumes every governed facet channel for every semantic role', () => {
    const skin = readFileSync(SKIN_PATH, 'utf8');
    const FACETS = [
      'background',
      'background-hover',
      'background-active',
      'background-selected',
      'background-disabled',
      'foreground',
      'foreground-muted',
      'foreground-disabled',
      'border',
      'border-strong',
      'border-hover',
      'border-active',
      'border-selected',
      'border-disabled',
      'focus-ring',
      'shadow',
      'shadow-hover',
      'shadow-active',
      'shadow-selected',
      'highlight',
      'texture',
    ];
    const missing: string[] = [];
    for (const role of SEMANTIC_SURFACE_ROLES) {
      for (const facet of FACETS) {
        const channel = `var(--ds-material-${role}-${facet}`;
        if (!skin.includes(channel)) missing.push(channel);
      }
    }
    expect(missing, `unconsumed channels:\n${missing.join('\n')}`).toEqual([]);
    expect(SEMANTIC_SURFACE_ROLES.length * FACETS.length).toBe(168);
  });

  it('skin never hardcodes brand paint and explicitly handles accessibility modes', () => {
    const skin = readFileSync(SKIN_PATH, 'utf8');
    expect(skin).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch?\(/);
    expect(skin).not.toContain('forced-color-adjust: none');
    expect(skin).toContain('prefers-reduced-motion');
    expect(skin).toContain('forced-colors: active');
  });
});
