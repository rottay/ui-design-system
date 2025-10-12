import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploader } from './FileUploader';
import { ThemeProvider } from '../../providers/ThemeProvider';
import type { UploadedFile } from './types';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Upload: () => <span data-testid="upload-icon">📤</span>,
  X: () => <span data-testid="x-icon">✕</span>,
  File: () => <span data-testid="file-icon">📄</span>,
  FileText: () => <span data-testid="filetext-icon">📄</span>,
  Image: () => <span data-testid="image-icon">🖼️</span>,
  Film: () => <span data-testid="film-icon">🎬</span>,
  Music: () => <span data-testid="music-icon">🎵</span>,
  Archive: () => <span data-testid="archive-icon">🗜️</span>,
}));

const mockFiles: UploadedFile[] = [
  {
    id: '1',
    name: 'document.pdf',
    size: 1024000,
    type: 'application/pdf',
    status: 'done',
    url: '#',
  },
  {
    id: '2',
    name: 'image.jpg',
    size: 512000,
    type: 'image/jpeg',
    status: 'uploading',
    progress: 50,
  },
];

const renderWithTheme = (
  ui: React.ReactElement,
  theme: 'base' | 'spotify' | 'stripe' | 'notion' | 'linear' = 'base'
) => {
  return render(<ThemeProvider defaultTemplate={theme}>{ui}</ThemeProvider>);
};

describe('FileUploader', () => {
  it('renders correctly with drop zone', () => {
    renderWithTheme(<FileUploader />);

    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop files here')).toBeInTheDocument();
    expect(screen.getByText('Browse files')).toBeInTheDocument();
  });

  it('displays custom drag drop text', () => {
    renderWithTheme(<FileUploader dragDropText="Drop your files here" />);

    expect(screen.getByText('Drop your files here')).toBeInTheDocument();
  });

  it('displays custom browse text', () => {
    renderWithTheme(<FileUploader browseText="Select Files" />);

    expect(screen.getByText('Select Files')).toBeInTheDocument();
  });

  it('displays max file size and count info', () => {
    renderWithTheme(<FileUploader maxFiles={5} maxSize={5 * 1024 * 1024} />);

    expect(screen.getByText(/Max 5 files/)).toBeInTheDocument();
    expect(screen.getByText(/5 MB per file/)).toBeInTheDocument();
  });

  it('displays accepted file types', () => {
    renderWithTheme(<FileUploader accept={['image/*', '.pdf']} />);

    expect(screen.getByText(/image\/\*, \.pdf/)).toBeInTheDocument();
  });

  it('renders uploaded files list', () => {
    renderWithTheme(<FileUploader files={mockFiles} />);

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('image.jpg')).toBeInTheDocument();
  });

  it('displays file sizes', () => {
    renderWithTheme(<FileUploader files={mockFiles} />);

    // File sizes should be formatted
    expect(screen.getByText(/KB/)).toBeInTheDocument();
  });

  it('shows progress bar for uploading files', () => {
    const { container } = renderWithTheme(<FileUploader files={mockFiles} />);

    // Ant Design Progress has specific class
    const progress = container.querySelector('.ant-progress');
    expect(progress).toBeInTheDocument();
  });

  it('shows complete status for done files', () => {
    renderWithTheme(<FileUploader files={mockFiles} />);

    expect(screen.getByText(/Complete/)).toBeInTheDocument();
  });

  it('calls onUpload when files are dropped', () => {
    const onUpload = vi.fn();
    renderWithTheme(<FileUploader onUpload={onUpload} />);

    const dropZone = screen.getByText('Drag & drop files here').closest('div');

    if (dropZone) {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });

      expect(onUpload).toHaveBeenCalled();
    }
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    renderWithTheme(<FileUploader files={mockFiles} onRemove={onRemove} />);

    const removeButtons = screen.getAllByTestId('x-icon');
    const firstRemoveButton = removeButtons[0].closest('button');

    if (firstRemoveButton) {
      fireEvent.click(firstRemoveButton);

      expect(onRemove).toHaveBeenCalledWith('1');
    }
  });

  it('handles drag enter/leave events', () => {
    renderWithTheme(<FileUploader />);

    const dropZone = screen.getByText('Drag & drop files here').closest('div');

    if (dropZone) {
      // Drag enter
      fireEvent.dragEnter(dropZone);

      // Drag leave
      fireEvent.dragLeave(dropZone);

      expect(dropZone).toBeInTheDocument();
    }
  });

  it('opens file picker on browse button click', () => {
    renderWithTheme(<FileUploader />);

    const browseButton = screen.getByText('Browse files');
    fireEvent.click(browseButton);

    // File input should exist (even though hidden)
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('supports multiple file upload', () => {
    const { container } = renderWithTheme(<FileUploader multiple />);

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('multiple');
  });

  it('disables multiple when multiple is false', () => {
    const { container } = renderWithTheme(<FileUploader multiple={false} />);

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toHaveAttribute('multiple');
  });

  it('applies accept attribute to file input', () => {
    const { container } = renderWithTheme(<FileUploader accept={['image/*', '.pdf']} />);

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('accept', 'image/*,.pdf');
  });

  it('displays file icon based on type', () => {
    const filesWithDifferentTypes: UploadedFile[] = [
      {
        id: '1',
        name: 'document.pdf',
        size: 1024,
        type: 'application/pdf',
        status: 'done',
      },
      {
        id: '2',
        name: 'image.jpg',
        size: 1024,
        type: 'image/jpeg',
        status: 'done',
      },
    ];

    renderWithTheme(<FileUploader files={filesWithDifferentTypes} />);

    // Should show appropriate icons for different file types
    expect(screen.getByTestId('filetext-icon')).toBeInTheDocument();
    expect(screen.getByTestId('image-icon')).toBeInTheDocument();
  });

  it('shows image preview when showPreview is true', () => {
    const imageFile: UploadedFile[] = [
      {
        id: '1',
        name: 'image.jpg',
        size: 1024,
        type: 'image/jpeg',
        status: 'done',
        url: 'https://example.com/image.jpg',
      },
    ];

    renderWithTheme(<FileUploader files={imageFile} showPreview />);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('hides image preview when showPreview is false', () => {
    const imageFile: UploadedFile[] = [
      {
        id: '1',
        name: 'image.jpg',
        size: 1024,
        type: 'image/jpeg',
        status: 'done',
        url: 'https://example.com/image.jpg',
      },
    ];

    renderWithTheme(<FileUploader files={imageFile} showPreview={false} />);

    // Should show icon instead of preview
    expect(screen.getByTestId('image-icon')).toBeInTheDocument();
  });

  it('applies custom className and style', () => {
    const { container } = renderWithTheme(
      <FileUploader className="custom-uploader" style={{ marginTop: 10 }} />
    );

    const wrapper = container.querySelector('.custom-uploader');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ marginTop: '10px' });
  });

  it('renders correctly with Spotify theme', () => {
    const { container } = renderWithTheme(<FileUploader />, 'spotify');
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Stripe theme', () => {
    const { container } = renderWithTheme(<FileUploader />, 'stripe');
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Notion theme', () => {
    const { container } = renderWithTheme(<FileUploader />, 'notion');
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correctly with Linear theme', () => {
    const { container } = renderWithTheme(<FileUploader />, 'linear');
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays error status', () => {
    const errorFile: UploadedFile[] = [
      {
        id: '1',
        name: 'failed.pdf',
        size: 1024,
        type: 'application/pdf',
        status: 'error',
        error: 'Upload failed',
      },
    ];

    renderWithTheme(<FileUploader files={errorFile} />);

    expect(screen.getByText(/Upload failed/)).toBeInTheDocument();
  });

  it('formats file sizes correctly', () => {
    const largeFile: UploadedFile[] = [
      {
        id: '1',
        name: 'large.zip',
        size: 5 * 1024 * 1024, // 5MB
        type: 'application/zip',
        status: 'done',
      },
    ];

    renderWithTheme(<FileUploader files={largeFile} />);

    expect(screen.getByText(/MB/)).toBeInTheDocument();
  });

  it('handles drag over event', () => {
    renderWithTheme(<FileUploader />);

    const dropZone = screen.getByText('Drag & drop files here').closest('div');

    if (dropZone) {
      fireEvent.dragOver(dropZone);
      expect(dropZone).toBeInTheDocument();
    }
  });

  it('handles file input change', () => {
    const onUpload = vi.fn();
    const { container } = renderWithTheme(<FileUploader onUpload={onUpload} />);

    const fileInput = container.querySelector('input[type="file"]');

    if (fileInput) {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(fileInput, {
        target: { files: [file] },
      });

      expect(onUpload).toHaveBeenCalled();
    }
  });
});
