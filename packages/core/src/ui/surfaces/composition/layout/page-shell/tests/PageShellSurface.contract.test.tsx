/** PageShellSurface is a pure chrome adapter consumed by 29 surfaces: every
 *  SurfacePageChrome field it forwards must actually reach the rendered page. */

import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageShellSurface } from '..';
import type { SurfacePageChrome } from '../../../../foundation/contracts';
import { renderSurface } from '../../../../foundation/common/test-utils';

const BASE_CHROME: SurfacePageChrome = {
  title: 'Quarterly launch plan',
};

describe('PageShellSurface', () => {
  it('renders on the modern engine and forwards title, subtitle, metadata, header content, breadcrumbs, badge, back and actions', async () => {
    const onBack = vi.fn();

    renderSurface(
      <PageShellSurface
        chrome={{
          title: 'Quarterly launch plan',
          subtitle: 'Tracks milestones for this quarter',
          metadata: <span>42 records</span>,
          headerContent: <div>Header-level rich content</div>,
          breadcrumbs: [{ label: 'Records', onClick: () => undefined }, { label: 'Overview' }],
          badge: <span data-testid="chrome-badge">Beta</span>,
          back: { label: 'Back to records', onClick: onBack },
        }}
        actions={<button type="button">Create</button>}
      >
        <div>Page body content</div>
      </PageShellSurface>,
      { engine: 'modern' }
    );

    const heading = await screen.findByRole(
      'heading',
      { level: 1, name: 'Quarterly launch plan' },
      { timeout: 15000 }
    );
    const root = heading.closest('[data-part="root"]') as HTMLElement;

    // Anti-vacuity: prove the modern engine is genuinely active rather than a silent fallback -- every other selector below only means something if this ...
    expect(root).toHaveClass('ds-engine-modern');

    expect(screen.getByText('Tracks milestones for this quarter')).toBeInTheDocument();
    expect(screen.getByText('42 records')).toBeInTheDocument();
    expect(screen.getByText('Header-level rich content')).toBeInTheDocument();
    expect(screen.getByTestId('chrome-badge')).toBeInTheDocument();

    const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumbNav).getByText('Records')).toBeInTheDocument();
    const lastCrumb = within(breadcrumbNav).getByText('Overview');
    expect(lastCrumb).toHaveAttribute('aria-current', 'page');

    const backButton = screen.getByRole('button', { name: 'Back to records' });
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);

    const header = root.querySelector('[data-part="header"]') as HTMLElement;
    expect(header).toHaveAttribute('data-has-actions', 'true');
    expect(within(header).getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('hides the header row entirely when hideHeader is set, while still rendering children', async () => {
    renderSurface(
      <PageShellSurface chrome={{ title: 'Hidden header page', hideHeader: true }}>
        <div>Visible body</div>
      </PageShellSurface>,
      { engine: 'modern' }
    );

    await screen.findByText('Visible body', undefined, { timeout: 15000 });

    // Anti-vacuity: `[data-part="header"]` is a real selector other tests in this suite rely on -- this proves it is absent specifically because of hideH...
    expect(document.querySelector('[data-part="header"]')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('marks the header sticky and carries a numeric maxWidth as a pixel-valued CSS channel', async () => {
    renderSurface(
      <PageShellSurface chrome={{ title: 'Sticky page', sticky: true, maxWidth: 640 }}>
        <div>Body</div>
      </PageShellSurface>,
      { engine: 'modern' }
    );

    const heading = await screen.findByRole('heading', { level: 1 }, { timeout: 15000 });
    const root = heading.closest('[data-part="root"]') as HTMLElement;
    const header = root.querySelector('[data-part="header"]');

    expect(header).toHaveAttribute('data-sticky', 'true');
    expect(root.style.getPropertyValue('--ds-page-shell-max-width')).toBe('640px');
  });

  it('passes a string maxWidth through unchanged', async () => {
    renderSurface(
      <PageShellSurface chrome={{ title: 'Constrained page', maxWidth: '48rem' }}>
        <div>Body</div>
      </PageShellSurface>,
      { engine: 'modern' }
    );

    const heading = await screen.findByRole('heading', { level: 1 }, { timeout: 15000 });
    const root = heading.closest('[data-part="root"]') as HTMLElement;
    expect(root.style.getPropertyValue('--ds-page-shell-max-width')).toBe('48rem');
  });

  it('renders the loading skeleton instead of children and marks the shell busy', async () => {
    renderSurface(
      <PageShellSurface chrome={{ title: 'Loading page' }} loading>
        <div>Should not render while loading</div>
      </PageShellSurface>,
      { engine: 'modern' }
    );

    const shellRoot = await waitFor(
      () => {
        const el = document.querySelector('[data-part="root"][data-loading="true"]');
        expect(el).toBeInTheDocument();
        return el as HTMLElement;
      },
      { timeout: 15000 }
    );

    expect(shellRoot).toHaveAttribute('aria-busy', 'true');
    expect(within(shellRoot).getByRole('status')).toHaveTextContent('Loading page');
    expect(document.querySelector('[data-part="header"]')).not.toBeInTheDocument();
    expect(screen.queryByText('Should not render while loading')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('wraps children in a single named view-transition group for surface-to-surface morphs', async () => {
    renderSurface(
      <PageShellSurface chrome={BASE_CHROME}>
        <div>Morph target content</div>
      </PageShellSurface>,
      { engine: 'modern' }
    );

    const bodyText = await screen.findByText('Morph target content', undefined, { timeout: 15000 });
    const box = bodyText.closest('[data-component="box"]') as HTMLElement;

    // Anti-vacuity: this Box is the ONLY `[data-component="box"]` under a PageShellSurface render (PatternPageShell's modern engine never uses Box intern...
    expect(box).toBeInTheDocument();
    // Direct camelCase property access (not getPropertyValue, which does not resolve this property under happy-dom) -- same technique the existing Tabs.v...
    const boxStyle = box.style as CSSStyleDeclaration & { viewTransitionName?: string };
    expect(boxStyle.viewTransitionName).toBe('ds-vt-page-body');
  });
});
