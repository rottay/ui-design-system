/**
 * Modern-engine accessibility contract for the Upload file list.
 *
 * Two defects are pinned here: (1) the `picture` row wired preview to a bare
 * `<img onClick>`, so no keyboard could ever reach it; (2) the async
 * uploading -> error transition was rendered into a static `role="list"`,
 * so a screen-reader user was never told the upload failed.
 */
import React from 'react';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Upload as ModernUpload } from '../engines/modern';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const imageFile = {
  uid: 'image',
  name: 'cover.png',
  status: 'done' as const,
  type: 'image/png',
  thumbUrl: 'https://example.com/cover.png',
};

describe('Upload modern engine: picture-row preview is keyboard operable', () => {
  it('Tab reaches the preview control in a picture row', async () => {
    const user = userEvent.setup();
    renderWithEngine(
      <ModernUpload listType="picture" defaultFileList={[imageFile]} onPreview={vi.fn()} />,
      'modern'
    );

    const preview = screen.getByRole('button', { name: 'Preview cover.png' });

    const reached: Element[] = [];
    for (let i = 0; i < 6; i += 1) {
      await user.tab();
      if (document.activeElement) reached.push(document.activeElement);
    }

    expect(reached).toContain(preview);
  });

  it('Enter and Space on the preview control invoke onPreview', async () => {
    const user = userEvent.setup();
    const onPreview = vi.fn();
    renderWithEngine(
      <ModernUpload listType="picture" defaultFileList={[imageFile]} onPreview={onPreview} />,
      'modern'
    );

    const preview = screen.getByRole('button', { name: 'Preview cover.png' });
    await act(async () => {
      preview.focus();
    });
    expect(preview).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ name: 'cover.png' }));

    onPreview.mockClear();
    await user.keyboard(' ');
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ name: 'cover.png' }));
  });
});

describe('Upload modern engine: status changes are announced', () => {
  it('a rejected upload renders its error inside a polite live region', async () => {
    const uploading = {
      uid: 'broken',
      name: 'broken.png',
      status: 'uploading' as const,
      percent: 40,
      type: 'image/png',
    };

    const { rerender } = renderWithEngine(
      <ModernUpload fileList={[uploading]} />,
      'modern'
    );

    // The async uploading -> error transition is exactly what a screen reader
    // was never told about.
    await act(async () => {
      rerender(
        <ModernUpload
          fileList={[{ ...uploading, status: 'error' as const, error: new Error('Upload rejected') }]}
        />
      );
    });

    const errorText = await screen.findByText('Upload rejected');
    const live = errorText.closest('[aria-live]');

    expect(live).not.toBeNull();
    expect(live?.getAttribute('aria-live')).toBe('polite');
    // atomic=false so a new row announces itself, never the whole list again.
    expect(live?.getAttribute('aria-atomic')).toBe('false');
    expect(live?.getAttribute('data-part')).toBe('file-list');
    expect(within(live as HTMLElement).getByText('Upload rejected')).toBeInTheDocument();
  });
});
