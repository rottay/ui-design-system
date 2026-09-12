import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import {
  RESPONSIVE_HIDE_ATTRIBUTE,
  RESPONSIVE_SHOW_ATTRIBUTE,
} from '@/foundation/contracts/kernel/responsive/visibility';
import { buildResponsiveVisibilitySheet } from '@/foundation/tokens/css/foundation/responsive/tests/projection';
import { Show, buildShowMediaQuery } from '..';
import { Hide, buildHideMediaQuery } from '../../hide';

const SHEET = buildResponsiveVisibilitySheet();

/**
 * The rule the static sheet applies to a rendered boundary.
 *
 * A boundary no longer carries its own stylesheet: it stamps one token and the
 * sheet owns the prelude. These assertions therefore read the token off the
 * wrapper and the rule out of the sheet, which is the same pair the browser
 * puts together.
 */
function ruleFor(container: HTMLElement, attribute: string): string {
  const node = container.querySelector(`[${attribute}]`);
  if (node === null) return '';
  const selector = `[${attribute}="${node.getAttribute(attribute)}"]`;
  const at = SHEET.indexOf(selector);
  if (at < 0) return '';
  const open = SHEET.lastIndexOf('@media', at);
  const start = open < 0 ? at : open;
  return SHEET.slice(start, SHEET.indexOf('}', at) + 1);
}

const showRule = (container: HTMLElement): string => ruleFor(container, RESPONSIVE_SHOW_ATTRIBUTE);
const hideRule = (container: HTMLElement): string => ruleFor(container, RESPONSIVE_HIDE_ATTRIBUTE);

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
    const rule = hideRule(container);
    expect(rule).toContain('@media (min-width: 0px)');
    expect(rule).toContain('display: none !important');
  });

  it('shows children at every viewport for Show from="phone"', () => {
    const { container } = render(
      <Show from="phone">
        <span>Always visible</span>
      </Show>
    );
    const rule = showRule(container);
    expect(rule).toContain('@media (min-width: 0px)');
    expect(rule).toContain('display: contents');
  });

  it('never reveals children for Show below="phone"', () => {
    const { container } = render(
      <Show below="phone">
        <span>Never visible</span>
      </Show>
    );
    // A never-matching bound gets NO rule at all: the default
    // `[data-ds-show] { display: none }` already is the whole behaviour, and a
    // `@media not all` block would only restate it.
    expect(showRule(container)).toBe('');
    expect(container.querySelector(`[${RESPONSIVE_SHOW_ATTRIBUTE}="below:xs"]`)).not.toBeNull();
    expect(SHEET).toContain(`[${RESPONSIVE_SHOW_ATTRIBUTE}] {\n  display: none;\n}`);
  });

  it('never hides children for Hide below="phone"', () => {
    const { container } = render(
      <Hide below="phone">
        <span>Always visible</span>
      </Hide>
    );
    expect(hideRule(container)).toBe('');
    expect(container.querySelector(`[${RESPONSIVE_HIDE_ATTRIBUTE}="below:xs"]`)).not.toBeNull();
    expect(SHEET).toContain(`[${RESPONSIVE_HIDE_ATTRIBUTE}] {\n  display: contents;\n}`);
  });

  it('keeps the wrapper boxless at a zero-pixel constraint', () => {
    const { container } = render(
      <Show from="phone">
        <span>Always visible</span>
      </Show>
    );
    const wrapper = container.querySelector('div');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.getAttribute(RESPONSIVE_SHOW_ATTRIBUTE)).toBe('from:xs');
    expect(container.querySelectorAll('style')).toHaveLength(0);
  });
});
