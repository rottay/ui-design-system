import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ModerationItem } from '../contracts';
import ModernModerationGallery from '../engines/modern';

const UPLOADED_AT = '2026-03-18T08:00:00.000Z';

function items(uploaders: string[]): ModerationItem[] {
  return uploaders.map((uploadedBy) => ({
    id: uploadedBy,
    thumbnailUrl: `/img/${uploadedBy}.jpg`,
    type: 'image' as const,
    status: 'pending' as const,
    uploadedBy,
    uploadedAt: UPLOADED_AT,
  }));
}

describe('Modern ModerationGallery — selection against live data', () => {
  it('drops a selected card from the count once the consumer removes it', () => {
    const { rerender } = render(
      <ModernModerationGallery items={items(['ada', 'bob'])} selectable onBulkAction={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select media by ada' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select media by bob' }));
    expect(screen.getByText('2 selected')).toBeInTheDocument();

    rerender(
      <ModernModerationGallery items={items(['bob'])} selectable onBulkAction={vi.fn()} />,
    );

    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('never bulk-submits an id that left the data', () => {
    const onBulkAction = vi.fn();
    const { rerender } = render(
      <ModernModerationGallery items={items(['ada', 'bob'])} selectable onBulkAction={onBulkAction} />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select media by ada' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select media by bob' }));

    rerender(
      <ModernModerationGallery items={items(['bob'])} selectable onBulkAction={onBulkAction} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Approve all/i }));

    expect(onBulkAction).toHaveBeenCalledWith('approve', ['bob']);
  });

  it('hides the bulk toolbar when every selected card has left the data', () => {
    const { rerender } = render(
      <ModernModerationGallery items={items(['ada', 'bob'])} selectable onBulkAction={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select media by ada' }));
    rerender(
      <ModernModerationGallery items={items(['bob'])} selectable onBulkAction={vi.fn()} />,
    );

    expect(screen.queryByRole('region', { name: 'Bulk actions' })).toBeNull();
  });
});

describe('Modern ModerationGallery — loading lifecycle', () => {
  it('announces the skeleton branch as busy', () => {
    const { container } = render(<ModernModerationGallery items={[]} loading />);

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('aria-busy', 'true');
  });
});
