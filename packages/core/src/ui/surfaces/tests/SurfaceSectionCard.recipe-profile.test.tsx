import React from 'react';
import { cleanup, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { RecipeProfileProvider } from '@/infrastructure/runtime/foundation/recipes/profiles';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';
import { SurfaceSectionCard } from '../runtime/helpers/rendering';

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
});
