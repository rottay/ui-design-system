import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { RecipeProfileProvider } from '@/infrastructure/runtime/foundation/recipes/profiles';
import { renderWithEngine } from '@tests/support/engine';
import { SurfaceSectionCard } from '..';

const skinPath = join(
  __dirname,
  '../../../../../foundation/tokens/css/presentation/components/skin/surface-section-card/index.css',
);

const helperPath = join(__dirname, '../index.tsx');

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

  it('gives the section title a real heading element at a caller-chosen level', async () => {
    const base = renderWithEngine(
      <SurfaceSectionCard title="Section">Content</SurfaceSectionCard>,
      'modern',
    );
    await waitFor(() => expect(base.container.querySelector('.ds-section-card__title')).not.toBeNull());
    // The page shell owns the h1, so a page-level section card sits at h2 and
    // never skips a level; nested callers pass an explicit deeper level.
    expect(base.container.querySelector('.ds-section-card__title')?.tagName).toBe('H2');
    cleanup();

    const nested = renderWithEngine(
      <SurfaceSectionCard title="Section" titleHeadingLevel={4}>
        Content
      </SurfaceSectionCard>,
      'modern',
    );
    await waitFor(() => expect(nested.container.querySelector('.ds-section-card__title')).not.toBeNull());
    expect(nested.container.querySelector('.ds-section-card__title')?.tagName).toBe('H4');
  });

  it('holds the section-card header type on the skin, not on the primitive default', async () => {
    const { container } = renderWithEngine(
      <SurfaceSectionCard eyebrow="Context" title="Section" description="Supporting copy">
        Content
      </SurfaceSectionCard>,
      'modern',
    );
    await waitFor(() => expect(container.querySelector('.ds-section-card__title')).not.toBeNull());

    const title = container.querySelector('.ds-section-card__title') as HTMLElement;
    expect(container.querySelector('.ds-section-card__eyebrow')).not.toBeNull();
    expect(container.querySelector('.ds-section-card__description')).not.toBeNull();
    // jsdom's CSSOM drops `var()` from font-size/letter-spacing, so the value
    // chain itself is proven in the browser instrument; line-height survives.
    expect(title.style.lineHeight).toBe('1.25');

    const skin = readFileSync(skinPath, 'utf-8');
    const helper = readFileSync(helperPath, 'utf-8');
    for (const channel of [
      '--ds-card-title-font-size',
      '--ds-card-title-letter-spacing',
      '--ds-text-eyebrow-size',
    ]) {
      expect(skin).toContain(channel);
      expect(helper).toContain(channel);
    }
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
