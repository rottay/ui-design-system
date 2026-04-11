/**
 * @fileoverview Tests for CSS test utilities: variable getters, injection,
 * snapshot comparison, and tenant fixture generation.
 */

import { describe, expect, it } from 'vitest';

import {
  ENGINE_CLASS_PREFIXES,
  TENANT_CSS_EXPECTATIONS,
  clearInjectedStyles,
  compareStyleSnapshots,
  createTenantCSSFixture,
  expectCSSVariable,
  getCSSVariable,
  getCSSVariables,
  getComputedStyleProperty,
  getEngineClasses,
  getRootCSSVariable,
  getStyleSnapshot,
  hasCSSVariable,
  hasEngineClasses,
  injectCSS,
  loadTenantCSSFixtures,
  waitForStyles,
} from '../css-test-utils';

describe('css-test-utils', () => {
  it('reads CSS variables from elements and the document root', () => {
    const cleanup = injectCSS(':root { --ds-test-root: #123456; }');
    const element = document.createElement('div');
    element.style.setProperty('--ds-local-color', '#abcdef');
    document.body.appendChild(element);

    expect(getCSSVariable(element, '--ds-local-color')).toBe('#abcdef');
    expect(getRootCSSVariable('--ds-test-root')).toBe('#123456');
    expect(hasCSSVariable(element, '--ds-local-color')).toBe(true);
    expect(hasCSSVariable(element, '--ds-missing')).toBe(false);
    expect(getCSSVariables(element, ['--ds-local-color', '--ds-missing'])).toEqual({
      '--ds-local-color': '#abcdef',
      '--ds-missing': '',
    });

    cleanup();
    element.remove();
  });

  it('reads computed style properties and snapshots', () => {
    const element = document.createElement('div');
    element.style.backgroundColor = 'rgb(255, 0, 0)';
    element.style.color = 'rgb(0, 0, 255)';
    element.style.padding = '8px';
    document.body.appendChild(element);

    expect(getComputedStyleProperty(element, 'backgroundColor')).toBe('rgb(255, 0, 0)');
    expectCSSVariable(element, '--ds-unknown', '');

    const snapshot = getStyleSnapshot(element, ['backgroundColor', 'color', 'padding']);
    expect(snapshot).toEqual({
      backgroundColor: 'rgb(255, 0, 0)',
      color: 'rgb(0, 0, 255)',
      padding: '8px',
    });

    const changed = document.createElement('div');
    changed.style.backgroundColor = 'rgb(255, 0, 0)';
    changed.style.color = 'rgb(10, 10, 10)';
    changed.style.padding = '12px';
    document.body.appendChild(changed);

    const comparison = compareStyleSnapshots(snapshot, getStyleSnapshot(changed, ['backgroundColor', 'color', 'padding']));
    expect(comparison.matching).toContain('backgroundColor');
    expect(comparison.different).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'color', value1: 'rgb(0, 0, 255)', value2: 'rgb(10, 10, 10)' }),
        expect.objectContaining({ property: 'padding', value1: '8px', value2: '12px' }),
      ])
    );

    element.remove();
    changed.remove();
  });

  it('throws a descriptive error when a CSS variable does not match', () => {
    const element = document.createElement('div');
    element.style.setProperty('--ds-tone', '#111111');

    expect(() => expectCSSVariable(element, '--ds-tone', '#222222')).toThrow(
      'Expected CSS variable --ds-tone to be "#222222", but got "#111111"'
    );
  });

  it('injects raw CSS and clears tagged test styles', () => {
    const cleanup = injectCSS('.probe { color: red; }', 'manual-probe');
    expect(document.getElementById('manual-probe')).not.toBeNull();

    const tagged = document.createElement('style');
    tagged.setAttribute('data-test-style', 'true');
    tagged.textContent = '.tagged { color: blue; }';
    document.head.appendChild(tagged);

    clearInjectedStyles();
    expect(document.head.querySelector('style[data-test-style]')).toBeNull();

    cleanup();
    expect(document.getElementById('manual-probe')).toBeNull();
  });

  it('detects engine-specific class prefixes', () => {
    const element = document.createElement('button');
    element.className = 'ant-btn ant-btn-primary btn btn-primary ds-button';

    expect(ENGINE_CLASS_PREFIXES.classic).toBe('ant-');
    expect(ENGINE_CLASS_PREFIXES.modern).toBe('btn');
    expect(ENGINE_CLASS_PREFIXES.rustic).toBe('ds-');
    expect(hasEngineClasses(element, 'classic')).toBe(true);
    expect(hasEngineClasses(element, 'modern')).toBe(true);
    expect(hasEngineClasses(element, 'rustic')).toBe(true);
    expect(hasEngineClasses(element, 'custom')).toBe(false);
    expect(getEngineClasses(element, 'classic')).toEqual(['ant-btn', 'ant-btn-primary']);
    expect(getEngineClasses(element, 'modern')).toEqual(['btn', 'btn-primary']);
    expect(getEngineClasses(element, 'rustic')).toEqual(['ds-button']);
    expect(getEngineClasses(element, 'custom')).toEqual([]);
  });

  it('creates and loads tenant CSS fixtures', async () => {
    expect(TENANT_CSS_EXPECTATIONS.rottay['--ds-color-primary-500']).toBe('#0066CC');
    expect(createTenantCSSFixture('bithire')).toContain('[data-tenant="bithire"]');
    expect(createTenantCSSFixture('bithire')).toContain('--ds-button-primary-bg: #6366F1;');

    const cleanup = loadTenantCSSFixtures();
    await waitForStyles(0);

    document.documentElement.setAttribute('data-tenant', 'rottay');
    expect(document.head.textContent).toContain('--ds-color-primary-500');

    cleanup();
    document.documentElement.removeAttribute('data-tenant');
  });
});
