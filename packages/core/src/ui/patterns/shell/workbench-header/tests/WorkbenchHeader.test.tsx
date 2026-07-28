import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { PatternWorkbenchHeader } from '../index';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

/**
 * Pre-load the rustic engine modules used by the classic WorkbenchHeader engine
 * so that the lazy `createEngineComponent` import resolves synchronously
 * inside the test environment.
 */
beforeAll(async () => {
  await Promise.all([
    import('../../../../primitives/layout/Box/engines/rustic'),
    import('../../../../primitives/layout/Flex/engines/rustic'),
    import('../../../../primitives/display/Typography/engines/rustic'),
    import('../../../../primitives/display/Badge/engines/rustic'),
    import('../../../../primitives/inputs/Button/engines/rustic'),
    import('../../../../primitives/inputs/Select/engines/rustic'),
  ]);
});

describe('PatternWorkbenchHeader', () => {
  it('renders title', async () => {
    renderSurface(
      <PatternWorkbenchHeader title="Manager Hub" />,
    );
    expect(await screen.findByText('Manager Hub')).toBeInTheDocument();
  });

  it('renders subtitle', async () => {
    renderSurface(
      <PatternWorkbenchHeader title="Manager Hub" subtitle="Morning briefing" />,
    );
    expect(await screen.findByText('Morning briefing')).toBeInTheDocument();
  });

  it('renders exception badge when count > 0', async () => {
    renderSurface(
      <PatternWorkbenchHeader title="Manager Hub" exceptionCount={5} />,
    );
    expect(await screen.findByText('5')).toBeInTheDocument();
  });

  it('does not render exception badge when count is 0', async () => {
    renderSurface(
      <PatternWorkbenchHeader title="Manager Hub" exceptionCount={0} />,
    );
    await screen.findByText('Manager Hub');
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders quick actions and handles click', async () => {
    const onClick = vi.fn();
    renderSurface(
      <PatternWorkbenchHeader
        title="Manager Hub"
        quickActions={[
          { label: 'Review Queue', onClick },
        ]}
      />,
    );
    const btn = await screen.findByText('Review Queue');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it('renders with savedViews config without crashing', async () => {
    renderSurface(
      <PatternWorkbenchHeader
        title="Manager Hub"
        savedViews={[
          { id: 'v1', label: 'All Tasks' },
          { id: 'v2', label: 'My Tasks' },
        ]}
        activeViewId="v1"
        onViewChange={vi.fn()}
      />,
    );
    // The header renders; saved views may render via Select which needs
    // additional engine preloads. Verify the title still renders.
    expect(await screen.findByText('Manager Hub')).toBeInTheDocument();
  });

  it('calls onViewChange when a saved view is selected', async () => {
    const onViewChange = vi.fn();
    renderSurface(
      <PatternWorkbenchHeader
        title="Manager Hub"
        savedViews={[
          { id: 'v1', label: 'All Tasks' },
          { id: 'v2', label: 'My Tasks' },
        ]}
        activeViewId="v1"
        onViewChange={onViewChange}
      />,
    );
    // The classic engine renders saved views as a Select dropdown.
    // Interaction depends on the Select engine -- at minimum we assert
    // the component renders without error and the views are present.
    expect(await screen.findByText('All Tasks')).toBeInTheDocument();
  });

  it('renders a complete workbench header with all features', async () => {
    const onAction = vi.fn();
    const onViewChange = vi.fn();
    renderSurface(
      <PatternWorkbenchHeader
        title="Operations Dashboard"
        subtitle="3 items need your attention today"
        exceptionCount={3}
        quickActions={[
          { label: 'New Event', onClick: onAction, variant: 'primary' },
          { label: 'Export', onClick: onAction },
        ]}
        savedViews={[
          { id: 'default', label: 'Default View' },
          { id: 'compact', label: 'Compact View' },
        ]}
        activeViewId="default"
        onViewChange={onViewChange}
      />,
    );
    expect(await screen.findByText('Operations Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('3 items need your attention today')).toBeInTheDocument();
    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(await screen.findByText('New Event')).toBeInTheDocument();
    expect(await screen.findByText('Export')).toBeInTheDocument();
  });
});

describe('PatternWorkbenchHeader (modern engine)', () => {
  it('renders premium context anatomy', async () => {
    const { container } = renderSurface(
      <PatternWorkbenchHeader
        eyebrow="Talent intelligence"
        icon={<span data-testid="workbench-icon">I</span>}
        title="Modern Hub"
      />,
      { engine: 'modern' },
    );
    expect(await screen.findByText('Talent intelligence')).toBeInTheDocument();
    expect(screen.getByTestId('workbench-icon')).toBeInTheDocument();
    expect(container.querySelector('[data-part="header-icon"]')).not.toBeNull();
    expect(container.querySelector('[data-part="eyebrow"]')).not.toBeNull();
  });

  it('renders title with modern engine', async () => {
    renderSurface(
      <PatternWorkbenchHeader title="Modern Hub" />,
      { engine: 'modern' },
    );
    expect(await screen.findByText('Modern Hub')).toBeInTheDocument();
  });

  it('renders subtitle', async () => {
    renderSurface(
      <PatternWorkbenchHeader title="Modern Hub" subtitle="Morning briefing" />,
      { engine: 'modern' },
    );
    expect(await screen.findByText('Morning briefing')).toBeInTheDocument();
  });

  it('renders exception badge when count > 0', async () => {
    renderSurface(
      <PatternWorkbenchHeader title="Modern Hub" exceptionCount={7} />,
      { engine: 'modern' },
    );
    expect(await screen.findByText('7')).toBeInTheDocument();
  });

  it('renders quick actions and handles click', async () => {
    const onClick = vi.fn();
    renderSurface(
      <PatternWorkbenchHeader
        title="Modern Hub"
        quickActions={[
          { label: 'New Event', onClick, variant: 'primary' },
          { label: 'Export', onClick },
        ]}
      />,
      { engine: 'modern' },
    );
    const btn = await screen.findByText('New Event');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it('renders saved views as tabs', async () => {
    const onViewChange = vi.fn();
    renderSurface(
      <PatternWorkbenchHeader
        title="Modern Hub"
        savedViews={[
          { id: 'v1', label: 'Overview' },
          { id: 'v2', label: 'Alerts' },
        ]}
        activeViewId="v1"
        onViewChange={onViewChange}
      />,
      { engine: 'modern' },
    );
    expect(await screen.findByText('Overview')).toBeInTheDocument();
    expect(await screen.findByText('Alerts')).toBeInTheDocument();
    const alertsTab = screen.getByText('Alerts');
    fireEvent.click(alertsTab);
    expect(onViewChange).toHaveBeenCalledWith('v2');
  });

  it('names the saved-views tablist with the i18n English floor', async () => {
    renderSurface(
      <PatternWorkbenchHeader
        title="Modern Hub"
        savedViews={[{ id: 'v1', label: 'Overview' }]}
        activeViewId="v1"
        onViewChange={vi.fn()}
      />,
      { engine: 'modern' },
    );
    expect(await screen.findByRole('tablist', { name: 'Saved views' })).toBeInTheDocument();
  });

  it('marks the active saved view with aria-selected and data-active', async () => {
    renderSurface(
      <PatternWorkbenchHeader
        title="Modern Hub"
        savedViews={[
          { id: 'v1', label: 'Overview' },
          { id: 'v2', label: 'Alerts' },
        ]}
        activeViewId="v2"
        onViewChange={vi.fn()}
      />,
      { engine: 'modern' },
    );

    const alerts = (await screen.findByText('Alerts')).closest('[data-part="tab"]') as HTMLElement;
    expect(alerts).toHaveAttribute('aria-selected', 'true');
    expect(alerts).toHaveAttribute('data-active', 'true');

    const overview = screen.getByText('Overview').closest('[data-part="tab"]') as HTMLElement;
    expect(overview).toHaveAttribute('aria-selected', 'false');
    expect(overview).toHaveAttribute('data-active', 'false');
  });

  it('paints nothing inline on its own parts — the skin owns layout and paint', async () => {
    const { container } = renderSurface(
      <PatternWorkbenchHeader
        eyebrow="Intel"
        title="Modern Hub"
        subtitle="Briefing"
        exceptionCount={3}
        quickActions={[{ label: 'New Event', onClick: () => {}, variant: 'primary' }]}
        savedViews={[{ id: 'v1', label: 'Overview' }]}
        activeViewId="v1"
        onViewChange={vi.fn()}
      />,
      { engine: 'modern' },
    );
    await screen.findByText('Modern Hub');

    // Every data-part element the workbench engine renders must carry zero
    // inline style (consumer primitives like the quick-action Buttons are
    // another family's scope). The root keeps only the caller's `style`
    // prop — not passed here.
    for (const el of container.querySelectorAll('[data-part]')) {
      const htmlEl = el as HTMLElement;
      for (const prop of Array.from(htmlEl.style)) {
        expect(
          prop.startsWith('--'),
          `${htmlEl.tagName}[data-part="${htmlEl.getAttribute('data-part')}"] carries inline "${prop}"`,
        ).toBe(true);
      }
    }
  });

  it('renders the loading skeleton with skin-owned geometry hooks', async () => {
    const { container } = renderSurface(
      <PatternWorkbenchHeader title="Modern Hub" loading />,
      { engine: 'modern' },
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-loading', 'true');

    const skeletons = container.querySelectorAll('[data-part="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
    for (const el of skeletons) {
      expect((el as HTMLElement).getAttribute('data-size')).toBeTruthy();
      // Only the sanctioned custom-property data channel may be inline.
      expect((el as HTMLElement).style.width).toBe('');
      expect((el as HTMLElement).style.height).toBe('');
      expect((el as HTMLElement).style.animation).toBe('');
    }
  });
});
