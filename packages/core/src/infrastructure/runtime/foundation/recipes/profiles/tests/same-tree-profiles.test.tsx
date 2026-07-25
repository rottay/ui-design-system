/**
 * DS-S001 exit proof (unit tier): the exact same React tree under opposing
 * recipe profiles renders opposing control anatomy without any prop change.
 * The production-rendered visual specimen extends this; it does not replace
 * the structural assertion here.
 */
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ModernButton from '@/ui/primitives/inputs/Button/engines/modern';
import ModernCard from '@/ui/primitives/display/Card/engines/modern';
import ModernTag from '@/ui/primitives/display/Tag/engines/modern';
import ModernTabs from '@/ui/primitives/navigation/Tabs/engines/modern';
import { RecipeProfileProvider } from '../index';

afterEach(cleanup);

function Specimen() {
  return (
    <div>
      <ModernButton>Action</ModernButton>
      <ModernCard data-testid="specimen-card">Body</ModernCard>
      <ModernTag data-testid="specimen-tag">Status</ModernTag>
      <ModernTabs
        items={[{ key: 'one', label: 'One', children: 'Panel' }]}
      />
    </div>
  );
}

function renderUnderProfile(profileId?: string) {
  return render(
    <RecipeProfileProvider profileId={profileId}>
      <Specimen />
    </RecipeProfileProvider>
  );
}

describe('same tree under opposing recipe profiles (DS-S001)', () => {
  it('flips button and card anatomy between technical and editorial profiles', async () => {
    const technical = renderUnderProfile('rottay/technical-sharp@1');
    const technicalButton = await technical.findByRole('button');
    const technicalCard = await technical.findByTestId('specimen-card');
    const technicalTag = await technical.findByTestId('specimen-tag');
    const technicalTabs = technical.container.querySelector(
      "[data-part='root'][data-recipe]"
    );
    expect(technicalButton).toHaveAttribute('data-variant', 'outline');
    expect(technicalButton).toHaveAttribute('data-shape', 'default');
    expect(technicalButton).toHaveAttribute('data-size', 'sm');
    expect(technicalCard).toHaveAttribute('data-variant', 'outlined');
    expect(technicalTag).toHaveAttribute('data-radius', 'none');
    expect(technicalTag).toHaveAttribute('data-bordered', 'true');
    expect(technicalTag).toHaveAttribute('data-outlined', 'true');
    expect(technicalTabs).toHaveAttribute('data-recipe', 'underline');
    technical.unmount();

    const editorial = renderUnderProfile('rottay/editorial-round@1');
    const editorialButton = await editorial.findByRole('button');
    const editorialCard = await editorial.findByTestId('specimen-card');
    const editorialTag = await editorial.findByTestId('specimen-tag');
    const editorialTabs = editorial.container.querySelector(
      "[data-part='root'][data-recipe]"
    );
    expect(editorialButton).toHaveAttribute('data-variant', 'primary');
    expect(editorialButton).toHaveAttribute('data-shape', 'round');
    expect(editorialButton).toHaveAttribute('data-size', 'lg');
    expect(editorialCard).toHaveAttribute('data-variant', 'elevated');
    expect(editorialTag).toHaveAttribute('data-radius', 'full');
    expect(editorialTag).not.toHaveAttribute('data-bordered');
    expect(editorialTag).not.toHaveAttribute('data-outlined');
    expect(editorialTabs).toHaveAttribute('data-recipe', 'pills');
  });

  it('keeps explicit props sovereign over the profile', async () => {
    const { findByRole } = render(
      <RecipeProfileProvider profileId="rottay/technical-sharp@1">
        <ModernButton variant="ghost" shape="circle">X</ModernButton>
      </RecipeProfileProvider>
    );
    const explicit = await findByRole('button');
    expect(explicit).toHaveAttribute('data-variant', 'ghost');
    expect(explicit).toHaveAttribute('data-shape', 'circle');
  });

  it('falls back to engine defaults with no profile or an invalid profile', async () => {
    for (const profileId of [undefined, 'rottay/unknown@1']) {
      const { findByRole, unmount } = renderUnderProfile(profileId);
      expect(await findByRole('button')).toHaveAttribute(
        'data-variant',
        'primary'
      );
      unmount();
    }
  });
});
