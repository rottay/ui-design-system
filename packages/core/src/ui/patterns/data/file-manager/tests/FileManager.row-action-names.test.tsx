import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import ModernFileManager from '../engines/modern';

describe('ModernFileManager row action names', () => {
  // A bare "Delete" gives a screen-reader user no way to tell which row a
  // destructive control belongs to; the row's own name node supplies it.
  it('names each row action after the item it acts on', async () => {
    renderWithEngine(
      <ModernFileManager
        files={[
          { id: 'f1', name: 'quarterly-report.pdf', type: 'file', mimeType: 'application/pdf', size: 2048 },
          { id: 'f2', name: 'headshot.jpg', type: 'file', mimeType: 'image/jpeg', size: 1024 },
        ]}
        folders={[]}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
      'modern',
    );

    expect(await screen.findByRole('button', { name: 'Rename quarterly-report.pdf' })).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Delete quarterly-report.pdf' })).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Rename headshot.jpg' })).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Delete headshot.jpg' })).toBeTruthy();

    // No row action may be left announcing the bare verb alone.
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Rename' })).toBeNull();
  });
});
