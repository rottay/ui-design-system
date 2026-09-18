/**
 * GuidedDraftFormSurface, WO-FAM-10 sub-lot F.
 *
 * What this suite owns, and the behavioural suites beside it do not: the DOM
 * contract the family cut changed. The five heading-weight sites lost their
 * per-element inline paint and now inherit the one root channel; the loading
 * state is the shared anatomy renderer's bones over the surface's own DOM, not
 * a hand-made construct; Enter commits the form through the shared
 * submit-intent kernel everywhere except editable elements and
 * self-activating controls; and the section nav keeps its name and geometry
 * under a right-to-left reading.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { GuidedDraftFormSurface } from '../index';
import { renderWithEngine } from '@tests/support/engine';

const WAIT_TIMEOUT = 4000;

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

  it('stamps the heading weight once on the root and paints none of it inline', async () => {
    const { container } = renderWithEngine(
      <GuidedDraftFormSurface title="Create Event" sections={baseSections} onSubmit={vi.fn()} />,
      'modern',
    );
    const root = await waitForPart(container, 'root');
    expect(root.style.getPropertyValue('--ds-guided-draft-form-heading-font-weight')).toBe('600');

    // The five retired sites now carry no family-authored fontWeight. The nav
    // label is the provably clean one: no engine or personality layer paints
    // its weight inline, so the skin's channel read is the only paint. The
    // two headings are merged with the app-wide personality heading style
    // (merged UNDER any caller style), which the family no longer overrides.
    const label = await waitForPart(container, 'section-nav-label');
    expect(label.getAttribute('style') ?? '').not.toContain('font-weight');
    for (const part of ['title', 'section-card-title']) {
      const element = await waitForPart(container, part);
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
    for (const part of ['content', 'content-body', 'submit-bar']) {
      expect(skeleton?.querySelector(`[data-part="${part}"]`), part).not.toBeNull();
    }
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
    const label = await waitForPart(container, 'section-nav-label');
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
    expect(scroll.container.querySelector('[data-part="section-card-title"]')).not.toBeNull();
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
    expect(wizard.container.querySelector('[data-part="section-card-title"]')).toBeNull();
    wizard.unmount();
  });
});
