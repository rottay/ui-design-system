/**
 * Upload Component Types
 *
 * Unified type definitions for the Upload component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Upload file status
 */
export type UploadFileStatus = 'uploading' | 'done' | 'error' | 'removed';

/**
 * Upload file type
 */
export interface UploadFile<T = unknown> {
  /** Unique identifier */
  uid: string;
  /** File name */
  name: string;
  /** File status */
  status?: UploadFileStatus;
  /** Upload percentage (0-100) */
  percent?: number;
  /** Thumbnail URL */
  thumbUrl?: string;
  /** Full URL */
  url?: string;
  /** Preview URL */
  preview?: string;
  /** Error message */
  error?: string;
  /** Response from server */
  response?: T;
  /** Original file object */
  originFileObj?: File;
  /** File size in bytes */
  size?: number;
  /** MIME type */
  type?: string;
  /** Last modified time */
  lastModified?: number;
  /** Last modified date */
  lastModifiedDate?: Date;
  /** Cross-origin attribute */
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
}

/**
 * Upload list type
 */
export type UploadListType = 'text' | 'picture' | 'picture-card' | 'picture-circle';

/**
 * Upload request option
 */
export interface UploadRequestOption<T = unknown> {
  onProgress?: (event: { percent: number }) => void;
  onError?: (event: Error, body?: T) => void;
  onSuccess?: (body: T, xhr?: XMLHttpRequest) => void;
  data?: Record<string, unknown>;
  filename?: string;
  file: File;
  withCredentials?: boolean;
  action: string;
  headers?: Record<string, string>;
  method?: string;
}

/**
 * Upload change info
 */
export interface UploadChangeInfo<T = unknown> {
  file: UploadFile<T>;
  fileList: UploadFile<T>[];
  event?: { percent: number };
}

/**
 * Upload progress event
 */
export interface UploadProgressEvent extends Partial<ProgressEvent> {
  percent?: number;
}

/**
 * Show upload list configuration
 */
export interface ShowUploadListInterface {
  showRemoveIcon?: boolean;
  showPreviewIcon?: boolean;
  showDownloadIcon?: boolean;
  removeIcon?: ReactNode | ((file: UploadFile) => ReactNode);
  downloadIcon?: ReactNode | ((file: UploadFile) => ReactNode);
  previewIcon?: ReactNode | ((file: UploadFile) => ReactNode);
}

/**
 * Item render info
 */
export interface UploadItemRenderInfo {
  originNode: ReactNode;
  file: UploadFile;
  fileList: UploadFile[];
  actions: {
    download: () => void;
    preview: () => void;
    remove: () => void;
  };
}

/**
 * Base props shared by all Upload implementations
 */
export interface UploadBaseProps<T = unknown> {
  // ─────────────────────────────────────────────────────────────────────────────
  // Core Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Accepted file types */
  accept?: string;

  /** Upload action URL */
  action?: string | ((file: UploadFile<T>) => string) | ((file: UploadFile<T>) => Promise<string>);

  /** List of uploaded files */
  fileList?: UploadFile<T>[];

  /** Default list of uploaded files */
  defaultFileList?: UploadFile<T>[];

  /** Max number of files allowed */
  maxCount?: number;

  /** Whether multiple files can be selected */
  multiple?: boolean;

  /** Whether the upload is disabled */
  disabled?: boolean;

  /** Upload directory mode */
  directory?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Upload Behavior
  // ─────────────────────────────────────────────────────────────────────────────

  /** Custom upload method */
  method?: string;

  /** Request headers */
  headers?: Record<string, string>;

  /** Extra data to send with request */
  data?: Record<string, unknown> | ((file: UploadFile<T>) => Record<string, unknown>);

  /** Name of the file parameter */
  name?: string;

  /** Whether to send cookies */
  withCredentials?: boolean;

  /** Custom upload request */
  customRequest?: (options: UploadRequestOption<T>) => void;

  /** Transform file before upload */
  beforeUpload?: (
    file: File,
    fileList: File[]
  ) => boolean | Promise<File | Blob | boolean | void> | void;

  /** Open file dialog programmatically */
  openFileDialogOnClick?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Appearance
  // ─────────────────────────────────────────────────────────────────────────────

  /** Upload list type */
  listType?: UploadListType;

  /** Whether to show upload list */
  showUploadList?: boolean | ShowUploadListInterface;

  /** Dragger mode (drag and drop area) */
  type?: 'select' | 'drag';

  // ─────────────────────────────────────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────────────────────────────────────

  /** Callback when file list changes */
  onChange?: (info: UploadChangeInfo<T>) => void;

  /** Callback when file is removed */
  onRemove?: (file: UploadFile<T>) => boolean | Promise<boolean> | void;

  /** Callback when file is previewed */
  onPreview?: (file: UploadFile<T>) => void;

  /** Callback when file is downloaded */
  onDownload?: (file: UploadFile<T>) => void;

  /** Callback when drag state changes */
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;

  /** Callback for upload progress */
  progress?: {
    strokeColor?: string;
    strokeWidth?: number;
    showInfo?: boolean;
    format?: (percent?: number) => ReactNode;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Styling
  // ─────────────────────────────────────────────────────────────────────────────

  /** Additional CSS class */
  className?: string;

  /** Root CSS class */
  rootClassName?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** ID for the input */
  id?: string;
}

/**
 * Full Upload props
 */
export interface UploadProps<T = unknown> extends UploadBaseProps<T> {
  /** Children (trigger element) */
  children?: ReactNode;

  /** Icon render */
  iconRender?: (file: UploadFile<T>, listType?: UploadListType) => ReactNode;

  /** Item render */
  itemRender?: (
    originNode: ReactNode,
    file: UploadFile<T>,
    fileList: UploadFile<T>[],
    actions: { download: () => void; preview: () => void; remove: () => void }
  ) => ReactNode;

  /** Preview file */
  previewFile?: (file: File | Blob) => Promise<string>;

  /** Is image URL */
  isImageUrl?: (file: UploadFile<T>) => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate unique ID for upload file
 */
export function generateUid(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Convert File to UploadFile
 */
export function fileToUploadFile<T = unknown>(file: File): UploadFile<T> {
  return {
    uid: generateUid(),
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    lastModifiedDate: new Date(file.lastModified),
    originFileObj: file,
    status: 'uploading',
    percent: 0,
  };
}

/**
 * Check if file is an image
 */
export function isImageFile(file: UploadFile): boolean {
  if (file.type) {
    return file.type.startsWith('image/');
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext ?? '');
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get base64 preview for image file
 */
export function getBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validate file type
 */
export function validateFileType(file: File, accept?: string): boolean {
  if (!accept) return true;

  const acceptTypes = accept.split(',').map((t) => t.trim());
  const fileType = file.type;
  const fileExt = `.${getFileExtension(file.name)}`;

  return acceptTypes.some((type) => {
    if (type.startsWith('.')) {
      return fileExt.toLowerCase() === type.toLowerCase();
    }
    if (type.endsWith('/*')) {
      return fileType.startsWith(type.slice(0, -1));
    }
    return fileType === type;
  });
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}
