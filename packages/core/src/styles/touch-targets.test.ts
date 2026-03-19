/**
 * Touch Target CSS - Existence and Content Verification
 *
 * Ensures the touch-targets.css file exists and contains the expected
 * @media (pointer: coarse) rules for WCAG 2.5.5 compliance.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('touch-targets.css', () => {
  const cssPath = resolve(__dirname, 'touch-targets.css');
  let css: string;

  it('file exists and is readable', () => {
    css = readFileSync(cssPath, 'utf-8');
    expect(css.length).toBeGreaterThan(0);
  });

  it('contains @media (pointer: coarse) query', () => {
    css = readFileSync(cssPath, 'utf-8');
    expect(css).toContain('@media (pointer: coarse)');
  });

  it('enforces 44px minimum touch targets', () => {
    css = readFileSync(cssPath, 'utf-8');
    expect(css).toContain('min-height: 44px');
    expect(css).toContain('min-width: 44px');
  });

  it('targets interactive elements: button, [role="button"], a', () => {
    css = readFileSync(cssPath, 'utf-8');
    expect(css).toContain('button');
    expect(css).toContain('[role="button"]');
    expect(css).toContain('a,');
  });

  it('targets form controls: checkbox, radio, select', () => {
    css = readFileSync(cssPath, 'utf-8');
    expect(css).toContain('input[type="checkbox"]');
    expect(css).toContain('input[type="radio"]');
    expect(css).toContain('select');
  });

  it('targets DS interactive attribute', () => {
    css = readFileSync(cssPath, 'utf-8');
    expect(css).toContain('[data-ds-interactive="true"]');
  });

  it('targets Ant Design components: .ant-btn, .ant-tabs-tab, .ant-tag', () => {
    css = readFileSync(cssPath, 'utf-8');
    expect(css).toContain('.ant-btn');
    expect(css).toContain('.ant-tabs-tab');
    expect(css).toContain('.ant-tag');
  });

  it('includes enhanced tab padding for touch devices', () => {
    css = readFileSync(cssPath, 'utf-8');
    expect(css).toContain('.ant-tabs-tab');
    expect(css).toContain('padding: 12px 16px');
  });

  it('includes enhanced tag padding for touch devices', () => {
    css = readFileSync(cssPath, 'utf-8');
    expect(css).toContain('padding: 8px 12px');
    expect(css).toContain('font-size: 14px');
  });
});
