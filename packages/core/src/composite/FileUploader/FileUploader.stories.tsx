import type { Meta, StoryObj } from '@storybook/react';
import { FileUploader } from './FileUploader';
import { useState } from 'react';
import type { UploadedFile } from './types';

const meta = {
  title: 'Composite/FileUploader',
  component: FileUploader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FileUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    showPreview: true,
  },
  render: (args) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    const handleUpload = (newFiles: File[]) => {
      const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'done' as const,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));

      setFiles([...files, ...uploadedFiles]);
    };

    const handleRemove = (fileId: string) => {
      setFiles(files.filter((f) => f.id !== fileId));
    };

    return (
      <FileUploader
        {...args}
        files={files}
        onUpload={handleUpload}
        onRemove={handleRemove}
      />
    );
  },
};

export const MultipleFiles: Story = {
  args: {
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
    showPreview: true,
  },
  render: (args) => {
    const [files, setFiles] = useState<UploadedFile[]>([
      {
        id: '1',
        name: 'document.pdf',
        size: 2456789,
        type: 'application/pdf',
        status: 'done',
      },
      {
        id: '2',
        name: 'presentation.pptx',
        size: 5234567,
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        status: 'done',
      },
      {
        id: '3',
        name: 'spreadsheet.xlsx',
        size: 1234567,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        status: 'done',
      },
    ]);

    const handleUpload = (newFiles: File[]) => {
      const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'done' as const,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));

      setFiles([...files, ...uploadedFiles]);
    };

    const handleRemove = (fileId: string) => {
      setFiles(files.filter((f) => f.id !== fileId));
    };

    return (
      <div>
        <h3>Multiple Files Uploaded</h3>
        <FileUploader
          {...args}
          files={files}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />
      </div>
    );
  },
};

export const ImagePreview: Story = {
  args: {
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    showPreview: true,
    accept: ['image/*'],
  },
  render: (args) => {
    const [files, setFiles] = useState<UploadedFile[]>([
      {
        id: '1',
        name: 'photo-1.jpg',
        size: 3456789,
        type: 'image/jpeg',
        status: 'done',
        url: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=400',
      },
      {
        id: '2',
        name: 'photo-2.jpg',
        size: 4123456,
        type: 'image/jpeg',
        status: 'done',
        url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
      },
    ]);

    const handleUpload = (newFiles: File[]) => {
      const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'done' as const,
        url: URL.createObjectURL(file),
      }));

      setFiles([...files, ...uploadedFiles]);
    };

    const handleRemove = (fileId: string) => {
      setFiles(files.filter((f) => f.id !== fileId));
    };

    return (
      <div>
        <h3>Image Upload with Preview</h3>
        <p>Only image files are accepted</p>
        <FileUploader
          {...args}
          files={files}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />
      </div>
    );
  },
};

export const WithUploadProgress: Story = {
  args: {
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    showPreview: true,
  },
  render: (args) => {
    const [files, setFiles] = useState<UploadedFile[]>([
      {
        id: '1',
        name: 'large-video.mp4',
        size: 25678901,
        type: 'video/mp4',
        status: 'uploading',
        progress: 65,
      },
      {
        id: '2',
        name: 'presentation.pdf',
        size: 3456789,
        type: 'application/pdf',
        status: 'done',
      },
      {
        id: '3',
        name: 'failed-upload.zip',
        size: 5234567,
        type: 'application/zip',
        status: 'error',
        error: 'Network error',
      },
    ]);

    const handleUpload = (newFiles: File[]) => {
      const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading' as const,
        progress: 0,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));

      setFiles([...files, ...uploadedFiles]);

      // Simulate upload progress
      uploadedFiles.forEach((file) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress >= 100) {
            clearInterval(interval);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id ? { ...f, status: 'done' as const, progress: 100 } : f
              )
            );
          } else {
            setFiles((prev) =>
              prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
            );
          }
        }, 500);
      });
    };

    const handleRemove = (fileId: string) => {
      setFiles(files.filter((f) => f.id !== fileId));
    };

    return (
      <div>
        <h3>Upload Progress States</h3>
        <p>Shows uploading (with progress), completed, and error states</p>
        <FileUploader
          {...args}
          files={files}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />
      </div>
    );
  },
};

export const MaxSizeRestriction: Story = {
  args: {
    maxFiles: 5,
    maxSize: 1 * 1024 * 1024, // 1MB
    multiple: true,
    showPreview: false,
  },
  render: (args) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    const handleUpload = (newFiles: File[]) => {
      const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'done' as const,
      }));

      setFiles([...files, ...uploadedFiles]);
    };

    const handleRemove = (fileId: string) => {
      setFiles(files.filter((f) => f.id !== fileId));
    };

    return (
      <div>
        <h3>Max Size: 1MB per file</h3>
        <p>Try uploading files larger than 1MB - they will be rejected</p>
        <FileUploader
          {...args}
          files={files}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />
      </div>
    );
  },
};

export const TypeRestriction: Story = {
  args: {
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    showPreview: true,
    accept: ['.pdf', '.doc', '.docx', '.txt'],
  },
  render: (args) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    const handleUpload = (newFiles: File[]) => {
      const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'done' as const,
      }));

      setFiles([...files, ...uploadedFiles]);
    };

    const handleRemove = (fileId: string) => {
      setFiles(files.filter((f) => f.id !== fileId));
    };

    return (
      <div>
        <h3>Documents Only</h3>
        <p>Accepts only: .pdf, .doc, .docx, .txt</p>
        <FileUploader
          {...args}
          files={files}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />
      </div>
    );
  },
};

export const SingleFile: Story = {
  args: {
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    showPreview: true,
    dragDropText: 'Drag & drop your file here',
    browseText: 'Choose file',
  },
  render: (args) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    const handleUpload = (newFiles: File[]) => {
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}`,
        name: newFiles[0].name,
        size: newFiles[0].size,
        type: newFiles[0].type,
        status: 'done',
        url: newFiles[0].type.startsWith('image/') ? URL.createObjectURL(newFiles[0]) : undefined,
      };

      setFiles([uploadedFile]);
    };

    const handleRemove = () => {
      setFiles([]);
    };

    return (
      <div>
        <h3>Single File Upload</h3>
        <FileUploader
          {...args}
          files={files}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />
      </div>
    );
  },
};
