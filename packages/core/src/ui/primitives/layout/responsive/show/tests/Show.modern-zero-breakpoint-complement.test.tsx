import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import { Show, buildShowMediaQuery } from '..';
import { Hide, buildHideMediaQuery } from '../../hide';

function emittedCss(container: HTMLElement): string {
  const styleTag = container.querySelector('style');
  return styleTag === null ? '' : (styleTag.textContent ?? '');
}

describe('zero-pixel breakpoints are constraints, not absent constraints', () => {
  it('emits an always-matching query for from="phone"', () => {
    expect(buildShowMediaQuery({ from: 'phone' })).toBe('(min-width: 0px)');
    expect(buildHideMediaQuery({ from: 'phone' })).toBe('(min-width: 0px)');
  });

  it('emits a never-matching query for below="phone"', () => {
    expect(buildShowMediaQuery({ below: 'phone' })).toBe('not all');
    expect(buildHideMediaQuery({ below: 'phone' })).toBe('not all');
  });

  it('keeps a genuinely absent constraint absent', () => {
    expect(buildShowMediaQuery({})).toBeNull();
    expect(buildHideMediaQuery({})).toBeNull();
  });

  it('agrees on one non-null query per constraint the props accept', () => {
    const constraints = [
      { from: 'phone' },
      { from: 'tablet' },
      { from: 'desktop' },
      { from: 'sm' },
      { from: 'md' },
      { from: 'lg' },
      { from: 'xl' },
      { from: '2xl' },
      { below: 'phone' },
      { below: 'tablet' },
      { below: 'desktop' },
      { below: 'sm' },
      { below: 'md' },
      { below: 'lg' },
      { below: 'xl' },
      { below: '2xl' },
      { on: 'phone' },
      { on: 'tablet' },
      { on: 'desktop' },
    ] as const;

    for (const constraint of constraints) {
      const showQuery = buildShowMediaQuery(constraint);
      expect(showQuery).not.toBeNull();
      expect(buildHideMediaQuery(constraint)).toBe(showQuery);
    }
  });
});

describe('Show and Hide stay exact complements at zero-pixel breakpoints', () => {
  it('hides children at every viewport for Hide from="phone"', () => {
    const { container } = render(
      <Hide from="phone">
        <span>Never visible</span>
      </Hide>
    );
    const css = emittedCss(container);
    expect(css).toContain('@media (min-width: 0px)');
    expect(css).toContain('display: none !important');
  });

  it('shows children at every viewport for Show from="phone"', () => {
    const { container } = render(
      <Show from="phone">
        <span>Always visible</span>
      </Show>
    );
    const css = emittedCss(container);
    expect(css).toContain('@media (min-width: 0px)');
    expect(css).toContain('display: contents');
  });

  it('never reveals children for Show below="phone"', () => {
    const { container } = render(
      <Show below="phone">
        <span>Never visible</span>
      </Show>
    );
    const css = emittedCss(container);
    expect(css).toContain('display: none');
    expect(css).toContain('@media not all');
  });

  it('never hides children for Hide below="phone"', () => {
    const { container } = render(
      <Hide below="phone">
        <span>Always visible</span>
      </Hide>
    );
    const css = emittedCss(container);
    expect(css).toContain('display: contents');
    expect(css).toContain('@media not all');
  });

  it('keeps the wrapper boxless at a zero-pixel constraint', () => {
    const { container } = render(
      <Show from="phone">
        <span>Always visible</span>
      </Show>
    );
    const wrapper = container.querySelector('div');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toMatch(/^ds-show-/);
  });
});
