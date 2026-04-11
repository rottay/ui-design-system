import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { PatternCockpitHeader } from '../index';
import { renderSurface } from '../../../../surfaces/common/test-utils';

/**
 * Pre-load the rustic engine modules used by the classic CockpitHeader engine
 * so that the lazy `createEngineComponent` import resolves synchronously
 * inside the test environment.
 */
beforeAll(async () => {
  await Promise.all([
    import('../../../primitives/layout/Box/engines/rustic'),
    import('../../../primitives/layout/Flex/engines/rustic'),
    import('../../../primitives/display/Typography/engines/rustic'),
    import('../../../primitives/display/Tag/engines/rustic'),
  ]);
});

describe('PatternCockpitHeader', () => {
  it('renders title', async () => {
    renderSurface(
      <PatternCockpitHeader title="User Details" />,
    );
    expect(await screen.findByText('User Details')).toBeInTheDocument();
  });

  it('renders subtitle', async () => {
    renderSurface(
      <PatternCockpitHeader title="User Details" subtitle="View and edit user information" />,
    );
    expect(await screen.findByText('View and edit user information')).toBeInTheDocument();
  });

  it('renders breadcrumbs', async () => {
    renderSurface(
      <PatternCockpitHeader
        title="User Details"
        breadcrumbs={[
          { label: 'Users', href: '/users' },
          { label: 'John Doe' },
        ]}
      />,
    );
    expect(await screen.findByText('Users')).toBeInTheDocument();
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });

  it('renders status badges', async () => {
    renderSurface(
      <PatternCockpitHeader
        title="User Details"
        status={[
          { label: 'Active', variant: 'success' },
          { label: 'Admin', variant: 'info' },
        ]}
      />,
    );
    expect(await screen.findByText('Active')).toBeInTheDocument();
    expect(await screen.findByText('Admin')).toBeInTheDocument();
  });

  it('renders action buttons passed as ReactNode', async () => {
    const onEdit = vi.fn();
    renderSurface(
      <PatternCockpitHeader
        title="User Details"
        actions={<button onClick={onEdit}>Edit</button>}
      />,
    );
    const editBtn = await screen.findByText('Edit');
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalled();
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn();
    renderSurface(
      <PatternCockpitHeader title="User Details" onBack={onBack} />,
    );
    // The classic/rustic engine renders the back button as a Box (div) with
    // an inline SVG. Find the clickable container by its role-less structure
    // and fire the click on the SVG's parent element.
    const title = await screen.findByText('User Details');
    // The back button is a sibling element rendered before the title column.
    // It contains an SVG arrow icon. We locate it via the SVG element.
    const svg = title.closest('.ds-pattern-cockpit-header')?.querySelector('svg');
    expect(svg).toBeTruthy();
    const backButton = svg!.parentElement!;
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalled();
  });

  it('renders title and subtitle together', async () => {
    renderSurface(
      <PatternCockpitHeader
        title="Detail Page Title"
        subtitle="Additional context below the title"
      />,
    );
    expect(await screen.findByText('Detail Page Title')).toBeInTheDocument();
    expect(await screen.findByText('Additional context below the title')).toBeInTheDocument();
  });
});

describe('PatternCockpitHeader (modern engine)', () => {
  it('renders title with modern engine', async () => {
    renderSurface(
      <PatternCockpitHeader title="Modern Test" />,
      { engine: 'modern' },
    );
    expect(await screen.findByText('Modern Test')).toBeInTheDocument();
  });

  it('renders subtitle', async () => {
    renderSurface(
      <PatternCockpitHeader title="Detail" subtitle="Extra context" />,
      { engine: 'modern' },
    );
    expect(await screen.findByText('Extra context')).toBeInTheDocument();
  });

  it('renders breadcrumbs', async () => {
    renderSurface(
      <PatternCockpitHeader
        title="Detail"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Current' },
        ]}
      />,
      { engine: 'modern' },
    );
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(await screen.findByText('Current')).toBeInTheDocument();
  });

  it('renders status badges', async () => {
    renderSurface(
      <PatternCockpitHeader
        title="Detail"
        status={[
          { label: 'Live', variant: 'success' },
          { label: 'VIP', variant: 'info' },
        ]}
      />,
      { engine: 'modern' },
    );
    expect(await screen.findByText('Live')).toBeInTheDocument();
    expect(await screen.findByText('VIP')).toBeInTheDocument();
  });

  it('renders action buttons', async () => {
    const onEdit = vi.fn();
    renderSurface(
      <PatternCockpitHeader
        title="Detail"
        actions={<button onClick={onEdit}>Save</button>}
      />,
      { engine: 'modern' },
    );
    const btn = await screen.findByText('Save');
    fireEvent.click(btn);
    expect(onEdit).toHaveBeenCalled();
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn();
    renderSurface(
      <PatternCockpitHeader title="Detail" onBack={onBack} />,
      { engine: 'modern' },
    );
    const backBtn = await screen.findByLabelText('Go back');
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalled();
  });
});
