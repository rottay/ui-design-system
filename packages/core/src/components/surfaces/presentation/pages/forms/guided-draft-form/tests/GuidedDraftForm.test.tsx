import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { GuidedDraftFormSurface } from '../index';
import { renderSurface } from '../../../../../foundation/common/test-utils';

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

  it('names the page, the section nav and the submit action in scroll mode', async () => {
    renderSurface(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={vi.fn()}
        submitLabel="Create"
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Create Event' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Form sections' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('keeps the same landmarks in wizard mode', async () => {
    renderSurface(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        mode="wizard"
        onSubmit={vi.fn()}
        submitLabel="Create"
      />,
    );
    expect(await screen.findByRole('heading', { level: 1, name: 'Create Event' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Form sections' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('announces the autosave state through the draft status badge', async () => {
    const { rerender } = renderSurface(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={vi.fn()}
        draftStatus="saving"
      />,
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Saving…');

    rerender(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={vi.fn()}
        draftStatus="saved"
        lastSavedAt="12:30"
      />,
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Saved 12:30');
  });

  it('exposes the template picker as a labelled region', async () => {
    renderSurface(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={vi.fn()}
        templates={{
          items: [
            { id: 'blank', name: 'Blank', description: 'Start empty' },
            { id: 'meetup', name: 'Meetup', description: 'Social event' },
          ],
          onSelect: vi.fn(),
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    const region = await screen.findByRole('region', { name: 'Form templates' });
    expect(region).toHaveAttribute('aria-label', 'Form templates');
    expect(region.textContent).toContain('Blank');
    expect(region.textContent).toContain('Meetup');
  });

  it('announces validation issues as a list with a severity summary', async () => {
    renderSurface(
      <GuidedDraftFormSurface
        title="Create Event"
        sections={baseSections}
        onSubmit={vi.fn()}
        validationIssues={[
          { field: 'Name', message: 'Required', severity: 'error' },
          { field: 'Date', message: 'In the past', severity: 'warning' },
        ]}
      />,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(await screen.findByText(/errors: 1/iu)).toBeInTheDocument();
    expect(screen.getByText(/warnings: 1/iu)).toBeInTheDocument();
  });
});
