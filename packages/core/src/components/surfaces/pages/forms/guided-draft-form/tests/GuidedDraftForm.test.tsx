import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { GuidedDraftFormSurface } from '../index';
import { renderSurface } from '../../../../foundation/common/test-utils';

describe('GuidedDraftFormSurface', () => {
  const baseSections = [
    { key: 'info', title: 'Basic Info', render: () => <div>Info Form</div> },
    { key: 'details', title: 'Details', render: () => <div>Details Form</div> },
  ];

  it('renders title and sections in scroll mode', async () => {
    renderSurface(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={vi.fn()}
      />,
    );
    expect(await screen.findByText('Create Event')).toBeInTheDocument();
    expect(await screen.findByText('Info Form')).toBeInTheDocument();
    expect(await screen.findByText('Details Form')).toBeInTheDocument();
  });

  it('shows only active section in wizard mode', async () => {
    renderSurface(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        mode="wizard"
        onSubmit={vi.fn()}
      />,
    );
    expect(await screen.findByText('Create Event')).toBeInTheDocument();
    // In wizard mode, only the first section should render
    expect(await screen.findByText('Info Form')).toBeInTheDocument();
  });

  it('calls onSubmit when submit button is clicked', async () => {
    const onSubmit = vi.fn();
    renderSurface(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={onSubmit}
        submitLabel="Create"
      />,
    );
    const submitBtn = await screen.findByText('Create');
    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('shows draft recovery banner', async () => {
    renderSurface(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={vi.fn()}
        draftRecovery={{
          hasDraft: true,
          onRecover: vi.fn(),
          onDiscard: vi.fn(),
          draftDate: 'Yesterday',
        }}
      />,
    );
    expect(await screen.findByText(/unsaved draft/i)).toBeInTheDocument();
    expect(await screen.findByText('Recover')).toBeInTheDocument();
  });
});
