/**
 * BrandStudio stable-anatomy contract (Lane E1).
 *
 * Fails against the pre-change pattern: `preview-grid` named both the outer
 * two-column track and the inner preview column, and `action` named both the
 * hostile-check Card and the Button inside it — two dominant boundaries for
 * one semantic region, so no consumer or audit could address either uniquely.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import type { BrandTheme } from '../../../../../foundation/contracts/composition/tenants/themes';
import { PatternBrandStudio } from '../index';

const TEST_TENANT: TenantConfig = {
  slug: 'brand-studio-anatomy',
  name: 'Brand Studio Anatomy',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'Brand Studio Anatomy' },
};

const THEME: BrandTheme = {
  id: 'anatomy',
  name: 'Anatomy',
  palette: {
    primaryColor: '#2563eb',
    textPrimaryColor: '#111111',
    backgroundSurfaceColor: '#ffffff',
  },
};

/** Every part that must resolve to exactly one node inside the root.
 *  `preview-header` is deliberately absent: the studio header and each
 *  preview panel's header share it, and both are pinned by one compound
 *  skin selector, so that collision cannot be resolved from the pattern. */
const SINGLETON_PARTS = ['preview-grid', 'preview-column', 'editor-column', 'editor'];

describe('PatternBrandStudio stable anatomy', () => {
  it('resolves every structural data-part to exactly one node', async () => {
    const { container, findByText } = render(
      <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine="rustic" skipCssLoading>
        <PatternBrandStudio vertical="bithire" value={THEME} />
      </DesignSystemProvider>
    );
    // Engine components resolve lazily; wait for the tree to settle.
    await findByText('Run check');

    for (const part of SINGLETON_PARTS) {
      const nodes = container.querySelectorAll(`[data-part="${part}"]`);
      expect(nodes.length, `data-part="${part}" owner count`).toBe(1);
    }
  });

  it('keeps the action Button distinct from the panel that frames it', async () => {
    const { container, findByText } = render(
      <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine="rustic" skipCssLoading>
        <PatternBrandStudio vertical="bithire" value={THEME} />
      </DesignSystemProvider>
    );
    await findByText('Run check');

    // The Card primitive swallows a consumer `data-part` in every engine, so
    // the frame is addressed by its class; only the control keeps the part.
    const panel = container.querySelector('.ds-pattern-brand-studio__action-panel') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.getAttribute('data-part')).not.toBe('action');

    // The Card frame no longer answers to the Button's part name, so an
    // `action` query can only ever resolve the control itself.
    const actions = container.querySelectorAll('[data-part="action"]');
    expect(actions.length).toBeLessThanOrEqual(1);
    for (const node of Array.from(actions)) {
      expect(node.tagName).toBe('BUTTON');
    }

    // The editor form keeps `editor`; the column that frames it is its own part.
    const editorColumn = container.querySelector('[data-part="editor-column"]') as HTMLElement;
    const editorForm = container.querySelector('[data-part="editor"]') as HTMLElement;
    expect(editorColumn.contains(editorForm)).toBe(true);
    expect(editorColumn).not.toBe(editorForm);
  });

  it('keeps the two-column track distinct from the preview column it contains', async () => {
    const { container, findByText } = render(
      <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine="rustic" skipCssLoading>
        <PatternBrandStudio vertical="bithire" value={THEME} />
      </DesignSystemProvider>
    );
    await findByText('Run check');

    const track = container.querySelector('[data-part="preview-grid"]') as HTMLElement;
    const column = container.querySelector('[data-part="preview-column"]') as HTMLElement;

    // The skin's layout rule keys on the track class; it must stay the track.
    expect(track.classList.contains('brand-studio-layout')).toBe(true);
    expect(track.contains(column)).toBe(true);
    expect(column.classList.contains('brand-studio-layout')).toBe(false);
  });
});
