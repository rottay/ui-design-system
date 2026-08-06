import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SemanticSurface } from '..';

describe('SemanticSurface caller ARIA ownership', () => {
  it('keeps a caller aria-disabled when the surface is not itself disabled', () => {
    render(
      <SemanticSurface
        data-testid="surface"
        surfaceRole="panel"
        role="button"
        aria-disabled="true"
      >
        content
      </SemanticSurface>
    );

    expect(screen.getByTestId('surface')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('keeps a caller aria-busy when the surface is not itself loading', () => {
    render(
      <SemanticSurface data-testid="surface" surfaceRole="panel" aria-busy="true">
        content
      </SemanticSurface>
    );

    expect(screen.getByTestId('surface')).toHaveAttribute('aria-busy', 'true');
  });

  it('still lets its own disabled and loading posture win', () => {
    render(
      <SemanticSurface
        data-testid="surface"
        surfaceRole="panel"
        disabled
        loading
        aria-disabled="false"
        aria-busy="false"
      >
        content
      </SemanticSurface>
    );

    const node = screen.getByTestId('surface');
    expect(node).toHaveAttribute('aria-disabled', 'true');
    expect(node).toHaveAttribute('aria-busy', 'true');
  });

  it('forwards the ref to every polymorphic element', () => {
    const sectionRef = createRef<HTMLElement>();
    const buttonRef = createRef<HTMLElement>();
    render(
      <SemanticSurface ref={sectionRef} surfaceRole="panel" as="section">
        <SemanticSurface ref={buttonRef} surfaceRole="control" as="button">
          Choose
        </SemanticSurface>
      </SemanticSurface>
    );

    expect(sectionRef.current?.tagName).toBe('SECTION');
    expect(buttonRef.current?.tagName).toBe('BUTTON');
  });
});
