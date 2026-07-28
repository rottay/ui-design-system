import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { RecipeProfileProvider } from '@/infrastructure/runtime/foundation/recipes/profiles';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';
import { SurfaceSectionCard } from '../runtime/helpers/rendering';

const skinPath = join(
  __dirname,
  '../../../foundation/tokens/css/presentation/components/skin/surface-section-card.css',
);

afterEach(cleanup);

async function renderProfile(
  profileId: string,
  variant?: 'outlined' | 'elevated' | 'filled' | 'ghost',
) {
  const result = renderWithEngine(
    <RecipeProfileProvider profileId={profileId}>
      <SurfaceSectionCard title="Section" variant={variant}>
        Content
      </SurfaceSectionCard>
    </RecipeProfileProvider>,
    'modern',
  );
  await waitFor(() =>
    expect(result.container.querySelector('.ds-section-card')).not.toBeNull(),
  );
  return result.container.querySelector('.ds-section-card');
}

describe('SurfaceSectionCard recipe profile', () => {
  it('switches the same section anatomy across opposing profiles', async () => {
    expect(
      await renderProfile('rottay/technical-sharp@1'),
    ).toHaveAttribute('data-variant', 'outlined');
    cleanup();
    expect(
      await renderProfile('rottay/editorial-round@1'),
    ).toHaveAttribute('data-variant', 'elevated');
  });

  it('keeps an explicit surface variant sovereign', async () => {
    expect(
      await renderProfile('rottay/technical-sharp@1', 'ghost'),
    ).toHaveAttribute('data-variant', 'ghost');
  });

  it('keeps the quiet-premium, RTL-safe contract in the skin', () => {
    const skin = readFileSync(skinPath, 'utf-8');

    // A static section wrapper carries no hover treatment: the header
    // gradient sweep and the icon lift were false affordances.
    expect(skin).not.toContain(':hover');
    // Logical properties only: no physical border/width axes remain.
    expect(skin).not.toMatch(/border-bottom\s*:/);
    expect(skin).not.toMatch(/(^|[{\s;])min-width\s*:/);
    expect(skin).not.toMatch(/(^|[{\s;])width\s*:/);
    expect(skin).toContain('border-block-end');
    // Former literals are tenant channels now.
    expect(skin).toContain('--ds-section-card-icon-size');
    expect(skin).toContain('--ds-section-card-header-min-height');
    expect(skin).toContain('--ds-section-card-eyebrow-tracking');
  });
});
