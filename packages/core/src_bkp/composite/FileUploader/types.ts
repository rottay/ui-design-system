export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'uploading' | 'done' | 'error';
  progress?: number;
  error?: string;
}

export interface FileUploaderProps {
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string[];
  multiple?: boolean;
  files?: UploadedFile[];
  onUpload?: (files: File[]) => void;
  onRemove?: (fileId: string) => void;
  showPreview?: boolean;
  dragDropText?: string;
  browseText?: string;
  className?: string;
  style?: React.CSSProperties;
}
