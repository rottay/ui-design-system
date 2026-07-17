/**
 * ActionDock behavior and skin contract tests.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { renderWithEngine, STABLE_ENGINES } from '../../../../../tooling/testing/helpers/engine';
import { ResponsiveContext, type ResponsiveContextValue } from '../../../../../infrastructure/runtime/responsive';
import { ActionDock } from '..';

const ACTION_DOCK_SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/presentation/components/skin/action-dock.css'),
  'utf8'
);
const NORMALIZED_ACTION_DOCK_SKIN = ACTION_DOCK_SKIN.replace(/\s+/g, ' ');
const COLLECTION_WORKSPACE_SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/presentation/components/skin/collection-workspace.css'),
  'utf8'
);

describe('ActionDock', () => {
  it.each(STABLE_ENGINES)('renders the real component as a fixed bottom dock under %s', async (engine) => {
    const { findByTestId } = renderWithEngine(
      <ActionDock>
        <button type="button">Save</button>
      </ActionDock>,
      engine
    );

    const dock = await findByTestId('action-dock');
    expect(dock).toHaveAttribute('role', 'toolbar');
    expect(dock).toHaveAttribute('aria-label', 'Bottom actions');
    expect(dock).toHaveAttribute('data-part', 'root');
    expect(dock).toHaveAttribute('data-placement', 'bottom');
    expect(dock).toHaveAttribute('data-mode', 'fixed');
    expect(dock).toHaveTextContent('Save');
  });

  it('supports a sticky top dock without stamping global horizontal offsets inline', async () => {
    const { findByTestId } = renderWithEngine(
      <ActionDock position="top" mode="sticky">
        <button type="button">Continue</button>
      </ActionDock>,
      'modern'
    );

    const dock = await findByTestId('action-dock');
    expect(dock).toHaveAttribute('data-placement', 'top');
    expect(dock).toHaveAttribute('data-mode', 'sticky');
    expect(dock).toHaveAttribute('aria-label', 'Top actions');
    expect(dock.style.left).toBe('');
    expect(dock.style.right).toBe('');
  });

  it('forwards custom root attributes and merges the custom class and style', async () => {
    const { findByTestId } = renderWithEngine(
      <ActionDock
        id="candidate-actions"
        className="candidate-actions"
        data-testid="candidate-action-dock"
        aria-label="Candidate actions"
        style={{ background: 'green' }}
      >
        <button type="button">Shortlist</button>
      </ActionDock>,
      'rustic'
    );

    const dock = await findByTestId('candidate-action-dock');
    expect(dock).toHaveAttribute('id', 'candidate-actions');
    expect(dock).toHaveClass('rottay-action-dock', 'candidate-actions');
    expect(dock).toHaveAttribute('aria-label', 'Candidate actions');
    expect(dock).toHaveStyle({ background: 'green' });
  });

  it('projects the virtual-keyboard authority without replacing caller styles', async () => {
    const keyboardContext: ResponsiveContextValue = {
      hasResolvedViewport: true,
      deviceClass: 'phone',
      activeBreakpoint: 'xs',
      isPhone: true,
      isTablet: false,
      isDesktop: false,
      pointer: 'coarse',
      orientation: 'portrait',
      prefersReducedMotion: false,
      isPhoneOrTablet: true,
      isTabletOrDesktop: false,
      isTouchDevice: true,
      virtualKeyboardInset: 284,
      isVirtualKeyboardOpen: true,
    };
    const { findByTestId } = renderWithEngine(
      <ResponsiveContext.Provider value={keyboardContext}>
        <ActionDock style={{ background: 'green' }}>
          <button type="button">Save</button>
        </ActionDock>
      </ResponsiveContext.Provider>,
      'modern'
    );

    const dock = await findByTestId('action-dock');
    expect(dock).toHaveAttribute('data-keyboard-open', 'true');
    expect(dock.style.getPropertyValue('--ds-virtual-keyboard-inset')).toBe('284px');
    expect(dock).toHaveStyle({ background: 'green' });
  });

  it('keeps layout, stacking, spacing, and safe areas tenant-tokenizable', () => {
    expect(NORMALIZED_ACTION_DOCK_SKIN).toContain('var(--ds-action-dock-z-index, var(--ds-z-index-fixed, 1200))');
    expect(NORMALIZED_ACTION_DOCK_SKIN).toContain(
      'var(--ds-action-dock-sticky-z-index, var(--ds-z-index-sticky, 1100))'
    );
    expect(NORMALIZED_ACTION_DOCK_SKIN).toMatch(
      /var\(\s*--ds-action-dock-padding-inline,\s*var\(--ds-spacing-4, 1rem\)\s*\)/
    );
    expect(NORMALIZED_ACTION_DOCK_SKIN).toContain('var(--ds-action-dock-gap, var(--ds-spacing-3, 0.75rem))');
    expect(NORMALIZED_ACTION_DOCK_SKIN).toContain('var(--ds-safe-area-bottom, env(safe-area-inset-bottom, 0px))');
    expect(NORMALIZED_ACTION_DOCK_SKIN).toContain('var(--ds-safe-area-top, env(safe-area-inset-top, 0px))');
    expect(NORMALIZED_ACTION_DOCK_SKIN).toContain(
      'var(--ds-shell-bottom-inset, 0px) + var(--ds-virtual-keyboard-inset, 0px)'
    );
    expect(ACTION_DOCK_SKIN).toMatch(/\[data-keyboard-open=["']true["']\]/);
  });

  it('limits global horizontal anchoring to fixed mode', () => {
    const fixedRule = ACTION_DOCK_SKIN.match(/\[data-mode=["']fixed["']\]\s*\{([^}]*)\}/)?.[1];
    const stickyRule = ACTION_DOCK_SKIN.match(/\[data-mode=["']sticky["']\]\s*\{([^}]*)\}/)?.[1];

    expect(fixedRule).toContain('inset-inline: 0');
    expect(stickyRule).not.toMatch(/inset-inline|\bleft\b|\bright\b/);
  });

  it('limits shell and virtual-keyboard offsets to fixed bottom docks', () => {
    const fixedBottomRule = ACTION_DOCK_SKIN.match(
      /\[data-placement=["']bottom["']\]\[data-mode=["']fixed["']\]\s*\{([^}]*)\}/
    )?.[1];
    const stickyBottomRule = ACTION_DOCK_SKIN.match(
      /\[data-placement=["']bottom["']\]\[data-mode=["']sticky["']\]\s*\{([^}]*)\}/
    )?.[1];

    expect(fixedBottomRule).toContain('--ds-shell-bottom-inset');
    expect(fixedBottomRule).toContain('--ds-virtual-keyboard-inset');
    expect(stickyBottomRule).toContain('inset-block-end: 0');
    expect(stickyBottomRule).not.toContain('--ds-shell-bottom-inset');
    expect(stickyBottomRule).not.toContain('--ds-virtual-keyboard-inset');
  });

  it('keeps collection integration selectors aligned with composed component anatomy', () => {
    expect(COLLECTION_WORKSPACE_SKIN).toContain(
      ".ds-collection-workspace__sticky-action-bar.rottay-action-dock[data-mode='sticky']"
    );
    expect(COLLECTION_WORKSPACE_SKIN).toContain('.rottay-button.ds-collection-workspace__sticky-primary-action');
    expect(COLLECTION_WORKSPACE_SKIN).not.toContain("[data-part='sticky-action-bar']");
    expect(COLLECTION_WORKSPACE_SKIN).not.toContain("[data-part='sticky-primary-action']");
  });
});
