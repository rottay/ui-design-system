/**
 * @fileoverview SystemCssVariablesBridge tests - Rottay Design System
 * @description Regression coverage for WO-ENG-19: the bridge inverted the
 * documented merge chain (DS base -> vertical baseline -> BrandTheme ->
 * generated artifacts) by stamping personality variables inline on
 * document.documentElement, the highest specificity CSS offers. Inline beat
 * every tenant declaration. These tests now additionally pin that the bridge
 * publishes only namespaced data; canonical component aliases belong to the
 * static personality projection, so the bridge can no longer become a second
 * tenant paint authority.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

import { SystemCssVariablesBridge } from '..';
import { DEFAULT_PERSONALITY } from '@/infrastructure/runtime/personality/foundation/defaults';

const mockTokens = {
  colors: { primary: '#4f46e5' },
  personality: DEFAULT_PERSONALITY,
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

vi.mock('@/infrastructure/runtime/theming/composition/react/tokens', () => ({
  useTokens: () => mockTokens,
}));

function resetDom() {
  document.head.innerHTML = '';
  document.documentElement.removeAttribute('style');
  document.documentElement.removeAttribute('data-tenant');
  document.documentElement.removeAttribute('data-theme');
}

describe('SystemCssVariablesBridge', () => {
  beforeEach(() => {
    resetDom();
  });

  afterEach(() => {
    cleanup();
    resetDom();
  });

  it('never stamps personality variables inline on document.documentElement', () => {
    render(<SystemCssVariablesBridge />);

    expect(document.documentElement.style.getPropertyValue('--ds-card-border')).toBe('');
    expect(document.documentElement.getAttribute('style')).toBeNull();
  });

  it('writes personality variables into a dedicated :root stylesheet, not inline', () => {
    render(<SystemCssVariablesBridge />);

    const styleElement = document.getElementById('ds-personality-tokens') as HTMLStyleElement | null;
    expect(styleElement).not.toBeNull();
    expect(styleElement?.tagName).toBe('STYLE');

    const rule = styleElement?.sheet?.cssRules[0] as CSSStyleRule | undefined;
    expect(rule?.selectorText).toBe(':root');
    expect(rule?.style.getPropertyValue('--ds-card-border')).toBe('');
    expect(
      rule?.style.getPropertyValue('--_ds-personality-resolved-card-border'),
    ).toBe('var(--ds-color-border-primary)');
    const names = rule?.style
      ? Array.from({ length: rule.style.length }, (_, index) => rule.style.item(index))
      : [];
    expect(
      names.every(
        (name) =>
          name.startsWith('--ds-personality-') ||
          name.startsWith('--_ds-personality-resolved-'),
      ),
    ).toBe(true);
  });

  it('lets a tenant-scoped chrome rule override the personality default (the WO-ENG-19 regression)', () => {
    document.documentElement.setAttribute('data-tenant', 'acme');
    document.documentElement.setAttribute('data-theme', 'dark');

    // Simulates ThemeProvider's generatedChromeCss injection
    // (runtime/theming/ThemeProvider.tsx): a <style id="ds-chrome-<slug>">
    // scoped to html[data-tenant='x'][data-theme='dark'].
    const chrome = document.createElement('style');
    chrome.id = 'ds-chrome-acme';
    chrome.textContent = "html[data-tenant='acme'][data-theme='dark'] { --ds-card-border: #4D0033; }";
    document.head.appendChild(chrome);

    render(<SystemCssVariablesBridge />);

    const computed = getComputedStyle(document.documentElement);
    expect(computed.getPropertyValue('--ds-card-border').trim()).toBe('#4D0033');
  });

  it('supplies namespaced personality data without claiming the canonical channel', () => {
    document.documentElement.setAttribute('data-tenant', 'acme');
    document.documentElement.setAttribute('data-theme', 'dark');
    // No chrome <style> at all for this tenant -- personality must still apply.
    // Asserted against the rule personality actually wrote (rather than
    // getComputedStyle) because happy-dom does not chase a var() reference
    // through a second custom property when computing the first one; that is
    // a test-environment limitation, not a statement about the cascade this
    // test is trying to pin.

    render(<SystemCssVariablesBridge />);

    const styleElement = document.getElementById('ds-personality-tokens') as HTMLStyleElement | null;
    const rule = styleElement?.sheet?.cssRules[0] as CSSStyleRule | undefined;
    expect(rule?.style.getPropertyValue('--ds-card-border')).toBe('');
    expect(
      rule?.style.getPropertyValue('--_ds-personality-resolved-card-border'),
    ).toBe('var(--ds-color-border-primary)');
  });

  it('removes the stylesheet on unmount so tenant switches do not leak values', () => {
    const { unmount } = render(<SystemCssVariablesBridge />);
    expect(document.getElementById('ds-personality-tokens')).not.toBeNull();

    unmount();

    expect(document.getElementById('ds-personality-tokens')).toBeNull();
  });
});
