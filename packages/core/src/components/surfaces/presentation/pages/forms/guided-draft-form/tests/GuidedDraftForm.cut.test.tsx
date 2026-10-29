/**
 * GuidedDraftFormSurface, WO-FAM-10 sub-lot F.
 *
 * What this suite owns, and the behavioural suites beside it do not: the DOM
 * contract the family cut changed. The five heading-weight sites inherit the
 * family channel; only an explicitly authored personality bias stamps it on
 * the surface root; the loading
 * state is the shared anatomy renderer's bones over the surface's own DOM, not
 * a hand-made construct; Enter commits the form through the shared
 * submit-intent kernel's delegated arm everywhere the press is not already
 * spoken for — editable elements, self-activating controls and nested
 * composite widgets keep their own Enter (S19-F01); and the section nav keeps
 * its name and geometry under a right-to-left reading.
 */
import React, { type CSSProperties } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { GuidedDraftFormSurface } from '../index';
import { renderWithEngine, librarySeedEngineVisual } from '@tests/support/engine';
import type { FlatTheme } from '@/foundation/contracts/composition/tenants/themes';
import type { ProductProfile } from '@/foundation/contracts/composition/tenants/product-profiles';
import { getProductProfile, ProductProfileProvider } from '@/infrastructure/runtime/product-profiles';
import { EngineVisualDeclarationProvider } from '@/infrastructure/runtime/foundation/engine-visual';
import { flatThemeToPersonality } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/personality';
import { buildLoweringContext, runDerivation } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/pipeline';
import { typographyDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography';
import { guidedDraftFormChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/guided-draft-form';
import type { FamilyDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/contract';
import { Heading } from '@/components/primitives/display/typography';

const WAIT_TIMEOUT = 4000;
const HEADING_PARTS = ['title', 'section-card-title'];
const BODY_PARTS = ['content-body', 'submit-bar'];

async function waitForPart(container: HTMLElement, part: string): Promise<HTMLElement> {
  await waitFor(
    () => {
      if (!container.querySelector(`[data-part="${part}"]`)) {
        throw new Error(`expected [data-part="${part}"] in <container>`);
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector(`[data-part="${part}"]`) as HTMLElement;
}

describe('GuidedDraftFormSurface (WO-FAM-10 cut)', () => {
  const baseSections = [
    { key: 'info', title: 'Basic Info', render: () => <div>Info Form</div> },
    { key: 'details', title: 'Details', render: () => <div>Details Form</div> },
  ];

  it('inherits the default heading channel without a masking root stamp', async () => {
    const { container } = renderWithEngine(
      <GuidedDraftFormSurface title="Create Event" sections={baseSections} onSubmit={vi.fn()} />,
      'modern',
    );
    const root = await waitForPart(container, 'root');
    expect(root.style.getPropertyValue('--ds-guided-draft-form-heading-font-weight')).toBe('');

    // The five retired sites now carry no family-authored fontWeight. The nav
    // label is the provably clean one: no engine or personality layer paints
    // its weight inline, so the skin's channel read is the only paint. The
    // two headings are merged with the app-wide personality heading style
    // (merged UNDER any caller style), which the family no longer overrides.
    const label = await waitFor(() => {
      const node = container.querySelector<HTMLElement>('.ds-guided-draft-form__section-nav-label');
      if (!node) throw new Error('expected .ds-guided-draft-form__section-nav-label');
      return node;
    });
    expect(label.getAttribute('style') ?? '').not.toContain('font-weight');
    for (const part of HEADING_PARTS) {
      const door = `.ds-guided-draft-form__${part}`;
      const element = await waitFor(() => {
        const node = container.querySelector<HTMLElement>(door);
        if (!node) throw new Error(`expected ${door}`);
        return node;
      });
      expect(element.getAttribute('style') ?? '', part).not.toContain('font-weight: 800');
    }
  });

  it('renders the loading state from the real anatomy with no hand-made constructs', async () => {
    const { container } = renderWithEngine(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={vi.fn()}
        loading
      />,
      'modern',
    );
    const root = await waitForPart(container, 'root');
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(root.getAttribute('data-loading')).toBe('true');

    // The shared renderer hosts the surface's own body DOM and draws bones
    // from its stamped anatomy; the hand-made skeleton parts are gone.
    const skeleton = container.querySelector('.ds-skeleton-anatomy');
    expect(skeleton).not.toBeNull();
    expect(skeleton?.getAttribute('aria-busy')).toBeNull();
    expect(container.querySelector('[data-part="loading-skeleton"]')).toBeNull();
    expect(container.querySelector('[data-part="loading-skeleton-title"]')).toBeNull();
    // The body anatomy the bones are read from is the real one.
    for (const part of BODY_PARTS) {
      expect(skeleton?.querySelector(`[data-part="${part}"]`), part).not.toBeNull();
    }
    // ARC-12 M-P2: the stacked content is a modern Stack reached by its class door;
    // the sidebar content is a Flex that keeps its part.
    expect(
      skeleton?.querySelector('.ds-guided-draft-form__content, [data-part="content"][data-layout]'),
      'content',
    ).not.toBeNull();
    // The single announcement stays on the surface root.
    expect(container.querySelectorAll('[aria-busy="true"]')).toHaveLength(1);
  });

  it('commits the form on Enter outside editable elements, per the submit-intent kernel', async () => {
    const onSubmit = vi.fn();
    const { container } = renderWithEngine(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={onSubmit}
      />,
      'modern',
    );
    await waitForPart(container, 'root');
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    fireEvent.keyDown(root, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('leaves Enter with a nested composite widget that already handled it (S19-F01)', async () => {
    const onSubmit = vi.fn();
    const onActivate = vi.fn();
    const { container } = renderWithEngine(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={[
          {
            key: 'info',
            title: 'Basic Info',
            render: () => (
              <div
                role="button"
                tabIndex={0}
                data-testid="composite"
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  onActivate();
                }}
              >
                Pick a venue
              </div>
            ),
          },
        ]}
        onSubmit={onSubmit}
      />,
      'modern',
    );

    const widget = await waitFor(
      () => {
        const found = container.querySelector('[data-testid="composite"]');
        if (!found) throw new Error('expected the consumer composite widget');
        return found as HTMLElement;
      },
      { timeout: WAIT_TIMEOUT },
    );

    // The press reaches the widget, the widget consumes it, and the root —
    // which sees the same bubbling event — does NOT re-read it as a commit.
    fireEvent.keyDown(widget, { key: 'Enter' });
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('leaves Enter with a nested interactive role even when it consumes nothing', async () => {
    const onSubmit = vi.fn();
    const { container } = renderWithEngine(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={[
          {
            key: 'info',
            title: 'Basic Info',
            render: () => (
              <div role="button" tabIndex={0} data-testid="composite">
                Pick a venue
              </div>
            ),
          },
        ]}
        onSubmit={onSubmit}
      />,
      'modern',
    );

    const widget = await waitFor(
      () => {
        const found = container.querySelector('[data-testid="composite"]');
        if (!found) throw new Error('expected the consumer composite widget');
        return found as HTMLElement;
      },
      { timeout: WAIT_TIMEOUT },
    );

    fireEvent.keyDown(widget, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('lets an editable element keep its own Enter behaviour', async () => {
    const onSubmit = vi.fn();
    const { container } = renderWithEngine(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={[
          { key: 'info', title: 'Basic Info', render: () => <textarea aria-label="Notes" /> },
        ]}
        onSubmit={onSubmit}
      />,
      'modern',
    );
    const field = await waitFor(
      () => {
        const textarea = container.querySelector('textarea');
        if (!textarea) throw new Error('expected the consumer textarea');
        return textarea;
      },
      { timeout: WAIT_TIMEOUT },
    );

    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('suppresses the keyboard submit while submitting or disabled', async () => {
    const onSubmit = vi.fn();
    const { container, rerender } = renderWithEngine(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={onSubmit}
        submitLoading
      />,
      'modern',
    );
    await waitForPart(container, 'root');
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    fireEvent.keyDown(root, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();

    rerender(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={onSubmit}
        submitDisabled
      />,
    );
    fireEvent.keyDown(root, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps the section nav named and unpainted-by-mirroring under rtl', async () => {
    const { container, getByRole } = renderWithEngine(
      <div dir="rtl">
        <GuidedDraftFormSurface title="Create Event" sections={baseSections} onSubmit={vi.fn()} />
      </div>,
      'modern',
    );
    expect(getByRole('navigation', { name: 'Form sections' })).toBeTruthy();
    const label = await waitFor(() => {
      const node = container.querySelector<HTMLElement>('.ds-guided-draft-form__section-nav-label');
      if (!node) throw new Error('expected .ds-guided-draft-form__section-nav-label');
      return node;
    });
    // The skin flows on logical properties; the family stamps no mirrored
    // transform of its own for either direction.
    expect(label.getAttribute('style') ?? '').not.toContain('scaleX');
  });

  it('stamps the mode and renders the matching body contract', async () => {
    const scroll = renderWithEngine(
      <GuidedDraftFormSurface title="Create Event" sections={baseSections} onSubmit={vi.fn()} />,
      'modern',
    );
    const scrollRoot = await waitForPart(scroll.container, 'root');
    expect(scrollRoot.getAttribute('data-mode')).toBe('scroll');
    expect(scroll.container.querySelector('.ds-guided-draft-form__section-card-title')).not.toBeNull();
    scroll.unmount();

    const wizard = renderWithEngine(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        mode="wizard"
        onSubmit={vi.fn()}
      />,
      'modern',
    );
    const wizardRoot = await waitForPart(wizard.container, 'root');
    expect(wizardRoot.getAttribute('data-mode')).toBe('wizard');
    // Wizard mode swaps the section stack for the composed step wizard.
    expect(wizard.container.querySelector('.ds-guided-draft-form__section-card-title')).toBeNull();
    wizard.unmount();
  });
});

const FAMILY_WEIGHT = '--ds-guided-draft-form-heading-font-weight';
const ROLE_WEIGHT = '--ds-type-section-title-font-weight';
const ROLE_POSTURES = [
  { roleWeights: 'light', expectedRole: '500' },
  { roleWeights: 'regular', expectedRole: '600' },
  { roleWeights: 'strong', expectedRole: '700' },
] as const;
const BIASES = [
  { bias: 'lighter', stamp: '500' },
  { bias: 'normal', stamp: '600' },
  { bias: 'heavier', stamp: '800' },
] as const;
const FAMILY_RANKS = ['verticalOverride', 'tenant'] as const;
const TITLE_CHAIN = 'var(--ds-type-section-title-font-weight, var(--ds-font-weight-semibold, 600))';
const WEIGHT_CASES = ROLE_POSTURES.flatMap((posture) =>
  BIASES.map((personality) => ({ ...posture, ...personality })),
);

function renderWeightCase({
  theme,
  profile = getProductProfile(),
  familyRank,
  parentFamily,
}: {
  theme: FlatTheme;
  profile?: ProductProfile;
  familyRank?: 'verticalOverride' | 'tenant';
  parentFamily?: string;
}) {
  const familyStatement: FamilyDeriver = {
    family: 'guided-draft-form-weight-statement',
    rank: familyRank ?? 'verticalOverride',
    consumes: ['chrome.*'],
    produces: [FAMILY_WEIGHT],
    derive: () => ({ '--ds-guided-draft-form-heading-font-weight': '321' }),
  };
  const { channels, provenance } = runDerivation(
    buildLoweringContext({ theme }),
    [typographyDeriver, guidedDraftFormChromeDeriver, ...(familyRank ? [familyStatement] : [])],
  );
  const style = { ...channels, ...(parentFamily ? { '--ds-guided-draft-form-heading-font-weight': parentFamily } : {}) } as CSSProperties;
  const engineVisual = {
    ...librarySeedEngineVisual('modern'),
    runtime: { personality: flatThemeToPersonality(theme), tokenOverrides: {} },
  };
  const rendered = renderWithEngine(
    <ProductProfileProvider profile={profile}>
      <EngineVisualDeclarationProvider declaration={engineVisual}>
        <div data-testid="weight-parent" style={style}>
          <GuidedDraftFormSurface
            title="Create Event"
            sections={[
              { key: 'info', title: 'Basic Info', render: () => <textarea aria-label="Notes" /> },
            ]}
            onSubmit={vi.fn()}
            headerSlot={<Heading style={{ fontWeight: 950, fontSize: '2rem', letterSpacing: '0.1em' }}>Caller heading</Heading>}
          />
        </div>
      </EngineVisualDeclarationProvider>
    </ProductProfileProvider>,
    'modern',
  );
  return { ...rendered, channels, provenance };
}

function authoredProfile(bias: 'lighter' | 'normal' | 'heavier'): ProductProfile {
  const neutral = getProductProfile();
  return {
    ...neutral,
    personality: { ...neutral.personality, typography: { headingWeightBias: bias } },
  };
}

function assertWeightControls(container: HTMLElement, channels: Record<string, string>, headingInline = '') {
  expect(Reflect.get(channels, '--ds-type-body-font-weight')).toBe('400');
  expect(Reflect.get(channels, '--ds-type-caption-font-weight')).toBe('400');
  const title = container.querySelector<HTMLElement>('.ds-guided-draft-form__title');
  const section = container.querySelector<HTMLElement>('.ds-guided-draft-form__section-card-title');
  expect(title?.tagName).toBe('H1');
  expect(title?.textContent).toBe('Create Event');
  expect(section?.textContent).toBe('Basic Info');
  expect(title?.style.fontWeight).toBe(headingInline);
  expect(section?.style.fontWeight).toBe(headingInline);
  const nav = container.querySelector<HTMLElement>('.ds-guided-draft-form__section-nav-label');
  expect(nav?.style.fontWeight).toBe('');
  const caller = Array.from(container.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6'))
    .find((node) => node.textContent === 'Caller heading');
  expect(caller?.style.fontWeight).toBe('950');
  expect(caller?.style.fontSize).toBe('2rem');
  expect(caller?.style.letterSpacing).toBe('0.1em');
  expect(container.querySelector('textarea')?.getAttribute('aria-label')).toBe('Notes');
}

describe('GuidedDraftFormSurface heading channel precedence (DOM, not computed CSS)', () => {
  it.each(ROLE_POSTURES)('leaves real $roleWeights derivation inherited on the default surface', async ({ roleWeights, expectedRole }) => {
    const { container, channels } = renderWeightCase({
      theme: { id: 'weight-test', name: 'Weight test', typography: { roleWeights } },
    });
    const root = await waitForPart(container, 'root');
    expect(Reflect.get(channels, ROLE_WEIGHT)).toBe(expectedRole);
    expect(Reflect.get(channels, FAMILY_WEIGHT)).toBe(TITLE_CHAIN);
    expect(container.querySelector<HTMLElement>('[data-testid="weight-parent"]')?.style.getPropertyValue(FAMILY_WEIGHT)).toBe(TITLE_CHAIN);
    expect(root.style.getPropertyValue(FAMILY_WEIGHT)).toBe('');
    assertWeightControls(container, channels);
  });

  it.each(WEIGHT_CASES)('stamps authored profile $bias above $roleWeights, including normal', async ({ roleWeights, bias, stamp }) => {
    const profile = authoredProfile(bias);
    expect(profile.key).toBe(getProductProfile().key);
    const { container, channels } = renderWeightCase({
      theme: { id: 'weight-test', name: 'Weight test', typography: { roleWeights } },
      profile,
    });
    const root = await waitForPart(container, 'root');
    expect(root.style.getPropertyValue(FAMILY_WEIGHT)).toBe(stamp);
    assertWeightControls(container, channels);
  });

  it.each(WEIGHT_CASES)('stamps compiled $bias above an authored opposite profile and $roleWeights', async ({ roleWeights, bias, stamp }) => {
    const { container, channels } = renderWeightCase({
      theme: { id: 'weight-test', name: 'Weight test', typography: { roleWeights, headingWeightBias: bias } },
      profile: authoredProfile(bias === 'heavier' ? 'lighter' : 'heavier'),
    });
    const root = await waitForPart(container, 'root');
    expect(root.style.getPropertyValue(FAMILY_WEIGHT)).toBe(stamp);
    assertWeightControls(container, channels, bias === 'heavier' ? '700' : stamp);
  });

  it.each(FAMILY_RANKS)('keeps a %s family statement available to the default surface', async (familyRank) => {
    const { container, channels, provenance } = renderWeightCase({
      theme: { id: 'weight-test', name: 'Weight test', typography: { roleWeights: 'strong' } },
      familyRank,
    });
    const root = await waitForPart(container, 'root');
    expect(Reflect.get(channels, FAMILY_WEIGHT)).toBe('321');
    expect(provenance.get(FAMILY_WEIGHT)?.rank).toBe(familyRank);
    expect(container.querySelector<HTMLElement>('[data-testid="weight-parent"]')?.style.getPropertyValue(FAMILY_WEIGHT)).toBe('321');
    expect(root.style.getPropertyValue(FAMILY_WEIGHT)).toBe('');
    assertWeightControls(container, channels);
  });

  it('keeps an explicit family parent override available and unrelated personality unstamped', async () => {
    const { container, channels } = renderWeightCase({
      theme: { id: 'weight-test', name: 'Weight test', typography: { roleWeights: 'light', headingLetterSpacing: '0.02em' } },
      profile: { ...getProductProfile(), personality: { typography: { labelStyle: 'uppercase' } } },
      parentFamily: '333',
    });
    const root = await waitForPart(container, 'root');
    expect(container.querySelector<HTMLElement>('[data-testid="weight-parent"]')?.style.getPropertyValue(FAMILY_WEIGHT)).toBe('333');
    expect(root.style.getPropertyValue(FAMILY_WEIGHT)).toBe('');
    assertWeightControls(container, channels);
  });

  it('retains a named profile normal decision', async () => {
    const { container } = renderWeightCase({
      theme: { id: 'weight-test', name: 'Weight test', typography: { roleWeights: 'strong' } },
      profile: getProductProfile('rottay.admin'),
    });
    expect((await waitForPart(container, 'root')).style.getPropertyValue(FAMILY_WEIGHT)).toBe('600');
  });

  it('removes a prior explicit stamp when the profile returns to the neutral default', async () => {
    const view = (profile: ProductProfile) => (
      <ProductProfileProvider profile={profile}>
        <GuidedDraftFormSurface title="Create Event" sections={[]} onSubmit={vi.fn()} />
      </ProductProfileProvider>
    );
    const { container, rerender } = renderWithEngine(view(authoredProfile('heavier')), 'modern');
    expect((await waitForPart(container, 'root')).style.getPropertyValue(FAMILY_WEIGHT)).toBe('800');
    rerender(view(getProductProfile()));
    expect((await waitForPart(container, 'root')).style.getPropertyValue(FAMILY_WEIGHT)).toBe('');
  });
});
