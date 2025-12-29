/**
 * Upload Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Upload } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: (name: string) => {
    if (name === 'Upload.Dragger') {
      const MockDragger = ({
        children,
        disabled,
        height,
        accept,
        multiple,
        showUploadList,
        ...props
      }: any) => (
        <div
          data-testid="upload-dragger"
          data-disabled={disabled}
          data-height={height}
          data-accept={accept}
          data-multiple={multiple}
          data-show-upload-list={showUploadList}
          {...props}
        >
          {children || 'Drop files here'}
        </div>
      );
      MockDragger.displayName = 'Upload.Dragger';
      return MockDragger;
    }

    const MockUpload = ({
      children,
      disabled,
      listType,
      accept,
      multiple,
      maxCount,
      showUploadList,
      ...props
    }: any) => (
      <div
        data-testid="upload"
        data-disabled={disabled}
        data-list-type={listType}
        data-accept={accept}
        data-multiple={multiple}
        data-max-count={maxCount}
        data-show-upload-list={showUploadList}
        {...props}
      >
        {children || 'Upload'}
      </div>
    );
    MockUpload.displayName = 'Upload';
    return MockUpload;
  },
}));

describe('Upload', () => {
  it('renders correctly', () => {
    render(<Upload>Click to upload</Upload>);
    expect(screen.getByTestId('upload')).toBeInTheDocument();
    expect(screen.getByText('Click to upload')).toBeInTheDocument();
  });

  it('renders with default children when none provided', () => {
    render(<Upload />);
    expect(screen.getByTestId('upload')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(<Upload disabled>Upload</Upload>);
    expect(screen.getByTestId('upload')).toHaveAttribute('data-disabled', 'true');
  });

  it.each(['text', 'picture', 'picture-card', 'picture-circle'] as const)(
    'renders listType %s',
    (listType) => {
      render(<Upload listType={listType}>Upload</Upload>);
      expect(screen.getByTestId('upload')).toHaveAttribute('data-list-type', listType);
    }
  );

  it('renders with accept prop', () => {
    render(<Upload accept="image/*">Upload</Upload>);
    expect(screen.getByTestId('upload')).toHaveAttribute('data-accept', 'image/*');
  });

  it('renders with multiple prop', () => {
    render(<Upload multiple>Upload</Upload>);
    expect(screen.getByTestId('upload')).toHaveAttribute('data-multiple', 'true');
  });

  it('renders with maxCount prop', () => {
    render(<Upload maxCount={5}>Upload</Upload>);
    expect(screen.getByTestId('upload')).toHaveAttribute('data-max-count', '5');
  });

  it('renders with showUploadList false', () => {
    render(<Upload showUploadList={false}>Upload</Upload>);
    expect(screen.getByTestId('upload')).toHaveAttribute('data-show-upload-list', 'false');
  });

  it('applies custom className', () => {
    render(<Upload className="custom-class">Upload</Upload>);
    expect(screen.getByTestId('upload')).toHaveClass('custom-class');
  });

  it('passes style prop to component', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<Upload style={customStyle}>Upload</Upload>);
    expect(screen.getByTestId('upload')).toBeInTheDocument();
  });

  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Upload engine={engine}>Upload with {engine}</Upload>);
    expect(screen.getByTestId('upload')).toBeInTheDocument();
    expect(screen.getByText(`Upload with ${engine}`)).toBeInTheDocument();
  });
});

describe('Upload.Dragger', () => {
  it('renders correctly', () => {
    render(<Upload.Dragger>Drag files here</Upload.Dragger>);
    expect(screen.getByTestId('upload-dragger')).toBeInTheDocument();
    expect(screen.getByText('Drag files here')).toBeInTheDocument();
  });

  it('renders with default children when none provided', () => {
    render(<Upload.Dragger />);
    expect(screen.getByTestId('upload-dragger')).toBeInTheDocument();
    expect(screen.getByText('Drop files here')).toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(<Upload.Dragger disabled>Drop files</Upload.Dragger>);
    expect(screen.getByTestId('upload-dragger')).toHaveAttribute('data-disabled', 'true');
  });

  it('renders with height prop', () => {
    render(<Upload.Dragger height={300}>Drop files</Upload.Dragger>);
    expect(screen.getByTestId('upload-dragger')).toHaveAttribute('data-height', '300');
  });

  it('renders with accept prop', () => {
    render(<Upload.Dragger accept=".pdf,.doc">Drop files</Upload.Dragger>);
    expect(screen.getByTestId('upload-dragger')).toHaveAttribute('data-accept', '.pdf,.doc');
  });

  it('renders with multiple prop', () => {
    render(<Upload.Dragger multiple>Drop files</Upload.Dragger>);
    expect(screen.getByTestId('upload-dragger')).toHaveAttribute('data-multiple', 'true');
  });

  it('applies custom className', () => {
    render(<Upload.Dragger className="custom-dragger">Drop files</Upload.Dragger>);
    expect(screen.getByTestId('upload-dragger')).toHaveClass('custom-dragger');
  });

  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Upload.Dragger engine={engine}>Drag files to {engine}</Upload.Dragger>);
    expect(screen.getByTestId('upload-dragger')).toBeInTheDocument();
    expect(screen.getByText(`Drag files to ${engine}`)).toBeInTheDocument();
  });
});

describe('Upload tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Upload>Upload</Upload>);
    expect(screen.getByTestId('upload')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
