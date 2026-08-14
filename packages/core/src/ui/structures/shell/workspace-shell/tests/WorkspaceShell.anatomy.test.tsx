/** WorkspaceShell anatomy: atmospheric chrome must stay decorative -- content
 *  and accessible fallbacks survive every variant and reduced-motion. */

import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import { WorkspaceShell } from '../index';

describe('WorkspaceShell anatomy', () => {
  it('renders stable root/overlay/content anatomy with no particle field for the non-atmospheric default variant', async () => {
    const { container, findByText } = renderSurface(
      <WorkspaceShell>Plain workspace body</WorkspaceShell>,
      { engine: 'modern' },
    );

    await findByText('Plain workspace body');

    const root = container.querySelector('[data-part="root"]');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute('data-variant', 'default');
    // No variant prop was passed at all, so the atmosphere must be inactive
    // rather than silently defaulting to a particle-field state.
    expect(root).toHaveAttribute('data-particle-field-mode', 'inactive');

    const overlay = container.querySelector('[data-part="overlay"]');
    expect(overlay).not.toBeNull();
    expect(root?.contains(overlay)).toBe(true);

    const content = container.querySelector('[data-part="content"]');
    expect(content).not.toBeNull();
    expect(content?.textContent).toContain('Plain workspace body');
    // WorkspaceShell is a pure atmospheric wrapper: it must not impose a
    // landmark/role of its own onto the content region it did not author.
    expect(content?.tagName.toLowerCase()).toBe('div');
    expect(content?.hasAttribute('role')).toBe(false);

    // Anti-vacuity: the non-atmospheric path must not render the particle
    // fallback markup at all (contrasted with the atmospheric test below).
    expect(container.querySelector('[data-part="particle-field-static-fallback"]')).toBeNull();
  });

  it('defaults the ai-field variant to a labelled, non-canvas static fallback', async () => {
    const { container, findByRole } = renderSurface(
      <WorkspaceShell variant="ai-field" mood="calm" fieldPattern="orbital" intensity="low">
        Identity directory
      </WorkspaceShell>,
      { engine: 'modern' },
    );

    const fallback = await findByRole('img', {
      name: 'Static atmospheric field indicating an AI-assisted collection workspace',
    });

    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('data-particle-field-mode', 'quarantined');

    // Anti-vacuity: the accessible-name query and the data-part query must
    // land on the exact same node.
    const fallbackByPart = container.querySelector('[data-part="particle-field-static-fallback"]');
    expect(fallbackByPart).toBe(fallback);
    expect(fallback).toHaveAttribute('data-field-pattern', 'orbital');
    expect(fallback).toHaveAttribute('data-intensity', 'low');
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('reflects presentation config on the root instead of a fixed set of attributes', async () => {
    const emphasized = renderSurface(
      <WorkspaceShell
        variant="ai-field"
        mood="active"
        fieldPattern="orbital"
        intensity="high"
        continuity="segmented"
        focusReaction
        previewEmphasis
        focusActive
        previewActive
      >
        Emphasized
      </WorkspaceShell>,
      { engine: 'modern' },
    );
    await emphasized.findByText('Emphasized');
    const emphasizedRoot = emphasized.container.querySelector('[data-part="root"]');
    expect(emphasizedRoot).toHaveAttribute('data-mood', 'active');
    expect(emphasizedRoot).toHaveAttribute('data-field-pattern', 'orbital');
    expect(emphasizedRoot).toHaveAttribute('data-intensity', 'high');
    expect(emphasizedRoot).toHaveAttribute('data-continuity', 'segmented');
    expect(emphasizedRoot).toHaveAttribute('data-focus-reaction', 'true');
    expect(emphasizedRoot).toHaveAttribute('data-preview-emphasis', 'true');
    expect(emphasizedRoot).toHaveAttribute('data-focus-active', 'true');
    expect(emphasizedRoot).toHaveAttribute('data-preview-active', 'true');
    emphasized.unmount();

    // Same attribute set, deliberately different values (and a non-atmospheric variant) -- proves the first render's values were not coincidental default...
    const muted = renderSurface(
      <WorkspaceShell
        variant="default"
        mood="calm"
        fieldPattern="ambient"
        intensity="low"
        continuity="seamless"
      >
        Muted
      </WorkspaceShell>,
      { engine: 'modern' },
    );
    await muted.findByText('Muted');
    const mutedRoot = muted.container.querySelector('[data-part="root"]');
    expect(mutedRoot).toHaveAttribute('data-mood', 'calm');
    expect(mutedRoot).toHaveAttribute('data-field-pattern', 'ambient');
    expect(mutedRoot).toHaveAttribute('data-intensity', 'low');
    expect(mutedRoot).toHaveAttribute('data-continuity', 'seamless');
    expect(mutedRoot).toHaveAttribute('data-focus-reaction', 'false');
    expect(mutedRoot).toHaveAttribute('data-preview-emphasis', 'false');
    expect(mutedRoot).toHaveAttribute('data-focus-active', 'false');
    expect(mutedRoot).toHaveAttribute('data-preview-active', 'false');
    // variant='default' must resolve to 'inactive' even though mood/intensity
    // are still stamped -- the two attribute families are independent.
    expect(mutedRoot).toHaveAttribute('data-particle-field-mode', 'inactive');
  });

  it('merges the consumer className onto the same root the real CollectionWorkspaceSurface premium path relies on', async () => {
    const withClassName = renderSurface(
      <WorkspaceShell className="ds-surface ds-collection-workspace ds-collection-enhanced">
        Composed
      </WorkspaceShell>,
      { engine: 'modern' },
    );
    await withClassName.findByText('Composed');

    // CollectionWorkspaceSurface's premium path (collection-workspace/index.tsx) passes its own root classes through WorkspaceShell's className prop and ...
    const merged = withClassName.container.querySelector(
      '.ds-surface.ds-collection-shell.ds-collection-workspace.ds-collection-enhanced[data-part="root"]',
    );
    expect(merged).not.toBeNull();
    withClassName.unmount();

    // Anti-vacuity: without an explicit className, the consumer-specific
    // classes must be genuinely absent, not always-present base classes.
    const withoutClassName = renderSurface(<WorkspaceShell>Bare</WorkspaceShell>, { engine: 'modern' });
    await withoutClassName.findByText('Bare');
    await waitFor(() => {
      expect(
        withoutClassName.container.querySelector('.ds-collection-workspace'),
      ).toBeNull();
    });
    expect(
      withoutClassName.container.querySelector('.ds-surface.ds-collection-shell[data-part="root"]'),
    ).not.toBeNull();
  });
});
