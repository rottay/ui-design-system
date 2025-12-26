/**
 * Upload Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type UploadListType = 'text' | 'picture' | 'picture-card' | 'picture-circle';

export interface UploadFile<T = unknown> {
  uid: string;
  name: string;
  status?: 'uploading' | 'done' | 'error' | 'removed';
  percent?: number;
  url?: string;
  thumbUrl?: string;
  response?: T;
  error?: Error;
  type?: string;
  size?: number;
  originFileObj?: File;
}

export interface UploadChangeInfo<T = unknown> {
  file: UploadFile<T>;
  fileList: UploadFile<T>[];
  event?: ProgressEvent;
}

export interface UploadRequestOption<T = unknown> {
  action: string;
  filename: string;
  file: File;
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  onProgress?: (event: { percent: number }) => void;
  onSuccess?: (response: T, file: File) => void;
  onError?: (error: Error) => void;
}

export interface UploadProps<T = unknown> {
  /** Upload API endpoint */
  action?: string | ((file: File) => string | Promise<string>);
  /** Accept file types */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** File list (controlled) */
  fileList?: UploadFile<T>[];
  /** Default file list */
  defaultFileList?: UploadFile<T>[];
  /** Upload directory */
  directory?: boolean;
  /** Maximum number of files */
  maxCount?: number;
  /** Custom upload request */
  customRequest?: (options: UploadRequestOption<T>) => void;
  /** List display type */
  listType?: UploadListType;
  /** Show upload list */
  showUploadList?: boolean | { showPreviewIcon?: boolean; showRemoveIcon?: boolean; showDownloadIcon?: boolean };
  /** Disabled */
  disabled?: boolean;
  /** Headers for upload request */
  headers?: Record<string, string>;
  /** Additional data */
  data?: Record<string, unknown> | ((file: UploadFile<T>) => Record<string, unknown>);
  /** Field name for file */
  name?: string;
  /** With credentials */
  withCredentials?: boolean;
  /** Open file dialog on click */
  openFileDialogOnClick?: boolean;
  /** Progress bar props */
  progress?: {
    strokeColor?: string | { from: string; to: string };
    strokeWidth?: number;
    showInfo?: boolean;
    format?: (percent?: number) => ReactNode;
  };
  /** Before upload hook */
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean | File>;
  /** On change callback */
  onChange?: (info: UploadChangeInfo<T>) => void;
  /** On preview */
  onPreview?: (file: UploadFile<T>) => void;
  /** On remove */
  onRemove?: (file: UploadFile<T>) => boolean | Promise<boolean> | void;
  /** On download */
  onDownload?: (file: UploadFile<T>) => void;
  /** On drop */
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Item render */
  itemRender?: (originNode: ReactNode, file: UploadFile<T>, fileList: UploadFile<T>[], actions: { download: () => void; preview: () => void; remove: () => void }) => ReactNode;
  /** Icon render */
  iconRender?: (file: UploadFile<T>, listType?: UploadListType) => ReactNode;
  /** Children */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export interface DraggerProps<T = unknown> extends UploadProps<T> {
  /** Height of dragger */
  height?: number | string;
}

export const UPLOAD_DEFAULTS = {
  name: 'file',
  multiple: false,
  listType: 'text' as const,
  showUploadList: true,
  disabled: false,
  openFileDialogOnClick: true,
  withCredentials: false,
};
