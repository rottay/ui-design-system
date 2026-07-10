import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { Sheet } from '..';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

describe('Sheet real engines', () => {
  it('covers overlay and escape guards in the rustic engine', async () => {
    await import('../engines/rustic');
    const handleLockedChange = vi.fn();
    const handleClosableChange = vi.fn();

    const { rerender } = renderWithEngine(
      <Sheet
        engine="rustic"
        open
        side="bottom"
        title="Locked sheet"
        onOpenChange={handleLockedChange}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      >
        Locked content
      </Sheet>,
      'rustic'
    );

    expect(await screen.findByText('Locked content', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(document.querySelector('[role=\"dialog\"]')).toBeTruthy();
    expect(screen.getByText('Locked sheet')).toBeInTheDocument();
    fireEvent.click(document.querySelector('div[style*=\"z-index: 1059\"]') as Element);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleLockedChange).not.toHaveBeenCalled();

    rerender(
      <Sheet
        engine="rustic"
        open
        side="bottom"
        title="Closable sheet"
        onOpenChange={handleClosableChange}
      >
        Closable content
      </Sheet>
    );

    fireEvent.click(document.querySelector('div[style*=\"z-index: 1059\"]') as Element);

    await waitFor(() => {
      expect(handleClosableChange).toHaveBeenCalledWith(false);
    });
  });

  it('switches side-specific layout in the rustic engine', async () => {
    await import('../engines/rustic');
    const handleChange = vi.fn();

    const { rerender } = renderWithEngine(
      <Sheet engine="rustic" open side="bottom" title="Bottom panel" onOpenChange={handleChange}>
        Body
      </Sheet>,
      'rustic'
    );

    expect(await screen.findByText('Bottom panel', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(document.querySelector('[style*=\"max-height: 85vh\"]')).toBeTruthy();

    rerender(
      <Sheet engine="rustic" open side="left" title="Left panel" onOpenChange={handleChange}>
        Body
      </Sheet>
    );

    expect(await screen.findByText('Left panel', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(document.querySelector('[style*=\"width: 380px\"]')).toBeTruthy();
  });
});
