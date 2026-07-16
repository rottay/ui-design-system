/**
 * ActionDock behavior and skin contract tests.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  renderWithEngine,
  STABLE_ENGINES,
} from '../../../../../_internal/testing/helpers/engine-test-utils';
import { ActionDock } from '../';

const ACTION_DOCK_SKIN = readFileSync(
  join(__dirname, '../../../../../tokens/css/components/skin/action-dock.css'),
  'utf8',
);
const COLLECTION_WORKSPACE_SKIN = readFileSync(
  join(__dirname, '../../../../../tokens/css/components/skin/collection-workspace.css'),
  'utf8',
);

describe('ActionDock', () => {
  it.each(STABLE_ENGINES)(
    'renders the real component as a fixed bottom dock under %s',
    async (engine) => {
      const { findByTestId } = renderWithEngine(
        <ActionDock>
          <button type="button">Save</button>
        </ActionDock>,
        engine,
      );

      const dock = await findByTestId('action-dock');
      expect(dock).toHaveAttribute('role', 'toolbar');
      expect(dock).toHaveAttribute('aria-label', 'Bottom actions');
      expect(dock).toHaveAttribute('data-part', 'root');
      expect(dock).toHaveAttribute('data-placement', 'bottom');
      expect(dock).toHaveAttribute('data-mode', 'fixed');
      expect(dock).toHaveTextContent('Save');
    },
  );

  it('supports a sticky top dock without stamping global horizontal offsets inline', async () => {
    const { findByTestId } = renderWithEngine(
      <ActionDock position="top" mode="sticky">
        <button type="button">Continue</button>
      </ActionDock>,
      'modern',
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
      'rustic',
    );

    const dock = await findByTestId('candidate-action-dock');
    expect(dock).toHaveAttribute('id', 'candidate-actions');
    expect(dock).toHaveClass('rottay-action-dock', 'candidate-actions');
    expect(dock).toHaveAttribute('aria-label', 'Candidate actions');
    expect(dock).toHaveStyle({ background: 'green' });
  });

  it('keeps layout, stacking, spacing, and safe areas tenant-tokenizable', () => {
    expect(ACTION_DOCK_SKIN).toContain(
      'var(--ds-action-dock-z-index, var(--ds-z-index-fixed, 1200))',
    );
    expect(ACTION_DOCK_SKIN).toContain(
      'var(--ds-action-dock-sticky-z-index, var(--ds-z-index-sticky, 1100))',
    );
    expect(ACTION_DOCK_SKIN).toContain(
      'var(--ds-action-dock-padding-inline, var(--ds-spacing-4, 1rem))',
    );
    expect(ACTION_DOCK_SKIN).toContain(
      'var(--ds-action-dock-gap, var(--ds-spacing-3, 0.75rem))',
    );
    expect(ACTION_DOCK_SKIN).toContain(
      'var(--ds-action-dock-safe-area-bottom, env(safe-area-inset-bottom, 0px))',
    );
    expect(ACTION_DOCK_SKIN).toContain(
      'var(--ds-action-dock-safe-area-top, env(safe-area-inset-top, 0px))',
    );
  });

  it('limits global horizontal anchoring to fixed mode', () => {
    const fixedRule = ACTION_DOCK_SKIN.match(
      /\[data-mode='fixed'\]\s*\{([^}]*)\}/,
    )?.[1];
    const stickyRule = ACTION_DOCK_SKIN.match(
      /\[data-mode='sticky'\]\s*\{([^}]*)\}/,
    )?.[1];

    expect(fixedRule).toContain('inset-inline: 0');
    expect(stickyRule).not.toMatch(/inset-inline|\bleft\b|\bright\b/);
  });

  it('keeps collection integration selectors aligned with composed component anatomy', () => {
    expect(COLLECTION_WORKSPACE_SKIN).toContain(
      '.ds-collection-workspace__sticky-action-bar.rottay-action-dock[data-mode=\'sticky\']',
    );
    expect(COLLECTION_WORKSPACE_SKIN).toContain(
      '.rottay-button.ds-collection-workspace__sticky-primary-action',
    );
    expect(COLLECTION_WORKSPACE_SKIN).not.toContain(
      "[data-part='sticky-action-bar']",
    );
    expect(COLLECTION_WORKSPACE_SKIN).not.toContain(
      "[data-part='sticky-primary-action']",
    );
  });
});
