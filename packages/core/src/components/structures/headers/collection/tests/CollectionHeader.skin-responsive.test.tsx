/**
 * The skin holds no second responsive authority (WO-FAM-10 reconcile). The
 * adapt slot decides WHAT RENDERS, under the tenant ladder and the app's
 * `adapt`; a `@container` threshold in CSS can read neither, so it was a
 * second, tenant-blind owner of the same decision. What stays in the skin is
 * paint, keyed on the resolution the root already stamps.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { waitFor } from '@testing-library/react';
import postcss, { type Rule } from 'postcss';
import { describe, expect, it, vi } from 'vitest';

import { CollectionHeader, type CollectionHeaderProps } from '..';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../../infrastructure/runtime/responsive';
import { renderWithEngine } from '@tests/support/engine';

const SKIN_PATH =
  'src/foundation/tokens/css/presentation/components/skin/collection-header/index.css';

const source = readFileSync(resolve(process.cwd(), SKIN_PATH), 'utf8');
const root = postcss.parse(source, { from: SKIN_PATH });

/** Every rule in the skin, at-rule descendants included, with the file's
    quoting and whitespace normalized away. */
const rules: Array<{ selector: string; decls: Array<{ prop: string; value: string }> }> = [];
root.walkRules((rule: Rule) => {
  rules.push({
    selector: rule.selector.replace(/["']/g, "'").replace(/\s+/g, ' '),
    decls: rule.nodes
      .filter((node): node is typeof node & { prop: string; value: string } => node.type === 'decl')
      .map((decl) => ({ prop: decl.prop, value: decl.value.replace(/\s+/g, ' ') })),
  });
});

const STAMP = ".ds-structure.ds-collection-header[data-part='root'][data-compact='true']";

describe('the collection-header skin carries no second responsive authority', () => {
  it('reads a skin with rules in it', () => {
    /* Non-vacuity floor: every absence assertion below is worthless against an
       empty parse or a moved file. */
    expect(rules.length).toBeGreaterThan(50);
    expect(rules.some((rule) => rule.selector.includes('.ds-collection-header'))).toBe(true);
  });

  it('declares no @container at-rule and no 34rem threshold', () => {
    const atRules: string[] = [];
    root.walkAtRules('container', (atRule) => {
      atRules.push(atRule.params);
    });
    expect(atRules).toEqual([]);
    expect(source).not.toContain('34rem');
  });

  it('never retires a rendered element from the skin', () => {
    const hidden = rules.filter(
      (rule) =>
        rule.decls.some((decl) => decl.prop === 'display' && decl.value === 'none') &&
        (rule.selector.includes('subtitle-divider') ||
          rule.selector.includes('editorial-tech-rule')),
    );
    expect(hidden.map((rule) => rule.selector)).toEqual([]);
  });

  it('keys the two paint rules on the stamped resolution', () => {
    const glyph = rules.find(
      (rule) =>
        rule.selector.startsWith(STAMP) &&
        rule.selector.includes("[data-part='shortcuts-label-icon']"),
    );
    expect(glyph?.decls).toEqual([{ prop: 'display', value: 'none' }]);

    const cap = rules.find(
      (rule) =>
        rule.selector.startsWith(STAMP) && rule.selector.includes("[data-part='shortcut-pill']"),
    );
    expect(cap?.decls).toEqual([{ prop: 'padding-inline', value: 'var(--ds-spacing-1, 4px)' }]);
  });

  it('keeps the container declarations the cqi fluid steps depend on', () => {
    const rootRule = rules.find(
      (rule) => rule.selector === ".ds-structure.ds-collection-header[data-part='root']",
    );
    expect(rootRule?.decls).toContainEqual({ prop: 'container-type', value: 'inline-size' });
    expect(rootRule?.decls).toContainEqual({
      prop: 'container-name',
      value: 'ds-collection-header',
    });
    expect(source).toContain('cqi');
  });
});

const DESKTOP: ResponsiveContextValue = {
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
};

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />;

const WITH_SHORTCUTS: CollectionHeaderProps = {
  eyebrow: 'Workspace',
  title: 'Candidates',
  subtitle: 'All active candidates',
  shortcuts: [{ key: 'search', label: '/' }],
  quickActions: [{ key: 'invite', label: 'Invite', icon: <Icon />, onClick: vi.fn() }],
};

describe('the stamped resolution reaches the re-keyed paint', () => {
  it('carries data-compact on an unmeasured compact render, with both paint targets rendered', async () => {
    const view = renderWithEngine(
      <ResponsiveContext.Provider value={DESKTOP}>
        <CollectionHeader {...WITH_SHORTCUTS} compact />
      </ResponsiveContext.Provider>,
      'modern',
    );
    /* Every primitive is its own lazy engine component, so the root mounts
       before its clusters: await the deepest part this arm reads. */
    const host = await waitFor(
      () => {
        const element = view.container.querySelector(
          '.ds-collection-header[data-part="root"]',
        ) as HTMLElement | null;
        if (!element?.querySelector('[data-part="shortcuts-label-icon"]')) {
          throw new Error('expected the shortcuts glyph');
        }
        return element;
      },
      { timeout: 15000 },
    );
    expect(host).toHaveAttribute('data-compact', 'true');
    expect(host.querySelectorAll('[data-part="shortcut-pill"]').length).toBeGreaterThan(0);
  });
});
