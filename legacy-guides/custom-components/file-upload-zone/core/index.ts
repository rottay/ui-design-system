import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type FileUploadZonePreset = 'dropzone' | 'compact' | 'inline';

export type FileUploadStatus = 'pending' | 'uploading' | 'complete' | 'error';

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type?: string;
  progress?: number;
  status: FileUploadStatus;
  preview?: string;
  error?: string;
}

export interface FileUploadZoneProps extends EngineAwareProps {
  preset?: FileUploadZonePreset;
  files?: UploadFile[];
  onFilesAdd?: (files: File[]) => void;
  onFileRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const FILE_UPLOAD_ZONE_DEFAULTS: Partial<FileUploadZoneProps> = {
  preset: 'dropzone',
  multiple: true,
  title: 'Drop files here',
  description: 'or click to browse',
};
