/**
 * @fileoverview Upload Component Types - Rottay Design System
 * @description Type definitions for the Upload component including file structure,
 * upload request options, list display types, and event handlers.
 *
 * @remarks
 * The Upload types provide comprehensive configuration for:
 * - File structure: Status, progress, URL, metadata
 * - Request options: Action, headers, credentials
 * - Display types: Text, picture, picture-card, picture-circle
 * - Event handlers: Change, preview, remove, download
 * - Validation: beforeUpload hook for file filtering
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   UploadProps,
 *   UploadFile,
 *   UploadChangeInfo,
 * } from '@rottay/design-system';
 *
 * const files: UploadFile[] = [
 *   { uid: '1', name: 'file.pdf', status: 'done', url: '/files/file.pdf' },
 * ];
 *
 * const handleChange = (info: UploadChangeInfo) => {
 *   console.log(info.file.status);
 * };
 * ```
 *
 * @module Upload/Types
 * @category Inputs
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '@/foundation/contracts/runtime/engine';

/**
 * Display type for the upload file list.
 * - 'text': Simple text list with file names
 * - 'picture': List with small thumbnails
 * - 'picture-card': Card layout with thumbnails
 * - 'picture-circle': Circular thumbnail display
 */
export type UploadListType = 'text' | 'picture' | 'picture-card' | 'picture-circle';

/**
 * Structure representing an uploaded file.
 *
 * @example
 * ```tsx
 * const file: UploadFile = {
 *   uid: 'file-1',
 *   name: 'document.pdf',
 *   status: 'done',
 *   url: '/uploads/document.pdf',
 *   size: 1024000,
 * };
 * ```
 */
export interface UploadFile<T = unknown> {
  /** Unique identifier for the file */
  uid: string;
  /** File name */
  name: string;
  /** Upload status */
  status?: 'uploading' | 'done' | 'error' | 'removed';
  /** Upload progress percentage (0-100) */
  percent?: number;
  /** URL of the uploaded file */
  url?: string;
  /** Thumbnail URL for images */
  thumbUrl?: string;
  /** Server response data */
  response?: T;
  /** Error if upload failed */
  error?: Error;
  /** MIME type */
  type?: string;
  /** File size in bytes */
  size?: number;
  /** Original File object */
  originFileObj?: File;
}

/**
 * Information passed to onChange callback.
 *
 * @example
 * ```tsx
 * const handleChange = (info: UploadChangeInfo) => {
 *   if (info.file.status === 'done') {
 *     console.log('Upload complete:', info.file.name);
 *   }
 *   setFileList(info.fileList);
 * };
 * ```
 */
export interface UploadChangeInfo<T = unknown> {
  /** The file that triggered the change */
  file: UploadFile<T>;
  /** Current list of all files */
  fileList: UploadFile<T>[];
  /** Progress event (during upload) */
  event?: ProgressEvent;
}

/**
 * Options for custom upload request handler.
 *
 * @example
 * ```tsx
 * const customRequest = (options: UploadRequestOption) => {
 *   const { file, onProgress, onSuccess, onError } = options;
 *   // Implement custom upload logic
 *   uploadToServer(file)
 *     .then((res) => onSuccess?.(res, file))
 *     .catch((err) => onError?.(err));
 * };
 * ```
 */
export interface UploadRequestOption<T = unknown> {
  /** Upload endpoint URL */
  action: string;
  /** Form field name for the file */
  filename: string;
  /** File to upload */
  file: File;
  /** Additional form data */
  data?: Record<string, unknown>;
  /** Request headers */
  headers?: Record<string, string>;
  /** Include credentials in request */
  withCredentials?: boolean;
  /** Progress callback */
  onProgress?: (event: { percent: number }) => void;
  /** Success callback */
  onSuccess?: (response: T, file: File) => void;
  /** Error callback */
  onError?: (error: Error) => void;
}

/**
 * Props for the Upload component.
 *
 * @example Basic usage
 * ```tsx
 * <Upload action="/api/upload">
 *   <Button>Click to Upload</Button>
 * </Upload>
 * ```
 *
 * @example With validation and list type
 * ```tsx
 * <Upload
 *   action="/api/upload"
 *   listType="picture-card"
 *   accept="image/*"
 *   maxCount={5}
 *   beforeUpload={(file) => file.size < 5 * 1024 * 1024}
 * >
 *   <span>+ Add Image</span>
 * </Upload>
 * ```
 */
export interface UploadProps<T = unknown> extends EngineAwareProps {
  /** Upload API endpoint (string or function returning URL) */
  action?: string | ((file: File) => string | Promise<string>);
  /** Accepted file types (e.g., 'image/*', '.pdf,.doc') */
  accept?: string;
  /** Allow selecting multiple files */
  multiple?: boolean;
  /** Controlled file list */
  fileList?: UploadFile<T>[];
  /** Default file list (uncontrolled) */
  defaultFileList?: UploadFile<T>[];
  /** Enable directory upload */
  directory?: boolean;
  /** Maximum number of files allowed */
  maxCount?: number;
  /** Custom upload request handler */
  customRequest?: (options: UploadRequestOption<T>) => void;
  /** Display type for file list */
  listType?: UploadListType;
  /** Show/configure file list display */
  showUploadList?: boolean | { showPreviewIcon?: boolean; showRemoveIcon?: boolean; showDownloadIcon?: boolean };
  /** Disable the upload component */
  disabled?: boolean;
  /** HTTP headers for upload request */
  headers?: Record<string, string>;
  /** Additional form data to include */
  data?: Record<string, unknown> | ((file: UploadFile<T>) => Record<string, unknown>);
  /** Form field name for uploaded file */
  name?: string;
  /** Include credentials in CORS requests */
  withCredentials?: boolean;
  /** Open file dialog when clicking component */
  openFileDialogOnClick?: boolean;
  /** Progress bar configuration */
  progress?: {
    strokeColor?: string | { from: string; to: string };
    strokeWidth?: number;
    showInfo?: boolean;
    format?: (percent?: number) => ReactNode;
  };
  /** Hook before upload, return false to prevent upload */
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean | File>;
  /** Callback when file list changes */
  onChange?: (info: UploadChangeInfo<T>) => void;
  /** Callback when preview icon is clicked */
  onPreview?: (file: UploadFile<T>) => void;
  /** Callback when remove icon is clicked, return false to prevent */
  onRemove?: (file: UploadFile<T>) => boolean | Promise<boolean> | void;
  /** Callback when download icon is clicked */
  onDownload?: (file: UploadFile<T>) => void;
  /** Callback when files are dropped */
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Custom render for file list items */
  itemRender?: (originNode: ReactNode, file: UploadFile<T>, fileList: UploadFile<T>[], actions: { download: () => void; preview: () => void; remove: () => void }) => ReactNode;
  /** Custom render for file icons */
  iconRender?: (file: UploadFile<T>, listType?: UploadListType) => ReactNode;
  /** Content to display inside upload area */
  children?: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * Props for the Upload.Dragger component.
 * Extends UploadProps with drag-and-drop specific options.
 *
 * @example
 * ```tsx
 * <Upload.Dragger action="/api/upload" height={200}>
 *   <p>Drag files here or click to select</p>
 * </Upload.Dragger>
 * ```
 */
export interface DraggerProps<T = unknown> extends UploadProps<T> {
  /** Height of the dragger area */
  height?: number | string;
}

/**
 * Default values for Upload props.
 * Used across all engine implementations for consistency.
 */
export const UPLOAD_DEFAULTS = {
  /** Default form field name */
  name: 'file',
  /** Single file by default */
  multiple: false,
  /** Text list by default */
  listType: 'text' as const,
  /** Show file list by default */
  showUploadList: true,
  /** Not disabled by default */
  disabled: false,
  /** Click to open file dialog */
  openFileDialogOnClick: true,
  /** No credentials by default */
  withCredentials: false,
};
