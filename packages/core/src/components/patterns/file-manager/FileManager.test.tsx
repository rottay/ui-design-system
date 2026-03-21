import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';

import type { StableEngineName } from '../../../_internal/testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../_internal/testing/helpers/engine-test-utils';
import type { FileManagerProps } from './FileManager.types';
import ClassicFileManager from './engines/classic';
import ModernFileManager from './engines/modern';
import RusticFileManager from './engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<FileManagerProps>> = {
  classic: ClassicFileManager,
  modern: ModernFileManager,
  rustic: RusticFileManager,
};

function createProps(overrides: Partial<FileManagerProps> = {}): FileManagerProps {
  return {
    files: [
      { id: 'f1', name: 'report.pdf', type: 'file', mimeType: 'application/pdf', size: 1024 },
      { id: 'f2', name: 'photo.jpg', type: 'file', mimeType: 'image/jpeg', size: 2048 },
    ],
    folders: [
      { id: 'd1', name: 'Documents', type: 'folder', childCount: 5 },
    ],
    ...overrides,
  };
}

describe('PatternFileManager', () => {
  it.each(STABLE_ENGINES)(
    'renders files and folders with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
      expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'shows empty message when no items in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component {...createProps({ files: [], folders: [], emptyMessage: 'Nothing here' })} />,
        engine,
      );

      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders upload button when onUpload is provided in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onUpload = vi.fn();
      renderWithEngine(<Component {...createProps({ onUpload })} />, engine);

      expect(screen.getByText('Upload')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders delete button for selected items in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onDelete = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onDelete, selectedItems: ['f1'] })} />,
        engine,
      );

      const deleteBtn = screen.getByText(/Delete \(1\)/);
      expect(deleteBtn).toBeInTheDocument();
      fireEvent.click(deleteBtn);
      expect(onDelete).toHaveBeenCalledWith(['f1']);
    },
  );

  it.each(STABLE_ENGINES)(
    'renders Root breadcrumb in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Root')).toBeInTheDocument();
    },
  );

  it.each([
    ['modern', ModernFileManager],
    ['rustic', RusticFileManager],
  ] as const)(
    'covers upload, selection, view toggles, rename, and navigation in the %s engine',
    (engine, Component) => {
      const onUpload = vi.fn();
      const onRename = vi.fn();
      const onNavigate = vi.fn();
      const onSelectionChange = vi.fn();
      const onViewModeChange = vi.fn();
      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('renamed-item');

      const props = createProps({
        onUpload,
        onRename,
        onNavigate,
        onSelectionChange,
        onViewModeChange,
      });

      const { rerender } = renderWithEngine(<Component {...props} />, engine);

      const fileInput = screen.getByTestId('file-input');
      const uploadFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      fireEvent.change(fileInput, { target: { files: [uploadFile] } });
      expect(onUpload).toHaveBeenCalledWith([uploadFile]);

      fireEvent.click(screen.getAllByRole('checkbox')[0]);
      expect(onSelectionChange).toHaveBeenCalledWith(['d1']);

      fireEvent.click(screen.getByTitle(/switch to grid/i));
      expect(onViewModeChange).toHaveBeenCalledWith('grid');

      fireEvent.click(screen.getAllByText('Rename')[0]);
      expect(onRename).toHaveBeenCalledWith('d1', 'renamed-item');

      rerender(<Component {...props} viewMode="grid" />);
      fireEvent.click(screen.getByText('Documents'));
      expect(onNavigate).toHaveBeenCalledWith('d1');

      promptSpy.mockRestore();
    },
  );

  it('covers classic uploads, drag-drop, breadcrumbs, custom icons, selection toggles, and grid mode actions', () => {
    const onUpload = vi.fn();
    const onRename = vi.fn();
    const onNavigate = vi.fn();
    const onDelete = vi.fn();
    const onSelectionChange = vi.fn();
    const onViewModeChange = vi.fn();
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('renamed-report.pdf');

    const props = createProps({
      currentPath: ['Documents'],
      onUpload,
      onRename,
      onNavigate,
      onDelete,
      onSelectionChange,
      onViewModeChange,
      renderFileIcon: (file) => <span data-testid={`custom-icon-${file.id}`}>icon</span>,
    });

    const { rerender } = renderWithEngine(<ClassicFileManager {...props} />, 'classic');

    fireEvent.click(screen.getByText('Root'));
    expect(onNavigate).toHaveBeenCalledWith(null);

    const fileInput = screen.getByTestId('file-input');
    const uploadFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [uploadFile] } });
    expect(onUpload).toHaveBeenCalledWith([uploadFile]);

    fireEvent.drop(screen.getByText('report.pdf').closest('div') ?? screen.getByText('report.pdf'), {
      dataTransfer: { files: [uploadFile] },
    });
    expect(onUpload).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(onSelectionChange).toHaveBeenCalledWith(['d1']);

    const folderRow = screen
      .getAllByText('Documents')
      .map((node) => node.closest('tr'))
      .find((node): node is HTMLTableRowElement => node instanceof HTMLTableRowElement);
    if (!(folderRow instanceof HTMLTableRowElement)) {
      throw new Error('Expected classic folder row');
    }
    const renameButton = within(folderRow).getAllByRole('button')[0];
    fireEvent.click(renameButton);
    expect(onRename).toHaveBeenCalledWith('d1', 'renamed-report.pdf');

    const gridToggle = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.trim() === '');
    if (!(gridToggle instanceof HTMLButtonElement)) {
      throw new Error('Expected classic grid toggle button');
    }
    fireEvent.click(gridToggle);
    expect(onViewModeChange).toHaveBeenCalledWith('grid');

    rerender(<ClassicFileManager {...props} viewMode="grid" selectedItems={['f1']} />);
    expect(screen.getByTestId('custom-icon-f1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Delete (1)'));
    expect(onDelete).toHaveBeenCalledWith(['f1']);

    promptSpy.mockRestore();
  });
});
