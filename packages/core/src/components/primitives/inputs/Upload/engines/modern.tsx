'use client';

/**
 * @fileoverview Upload Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Upload component
 * with drag-and-drop support, picture-card/picture-circle modes, progress bars,
 * image preview, itemRender, and directory upload.
 *
 * @remarks
 * The Modern engine provides a lightweight upload using:
 * - **DaisyUI styling**: Consistent with Tailwind design tokens
 * - **Drag and drop**: Custom dragger with visual feedback
 * - **File validation**: beforeUpload hook support
 * - **Picture modes**: picture-card grid and picture-circle avatar uploads
 * - **Progress**: Per-file upload progress bars
 * - **Preview**: Image preview on hover/click for picture modes
 * - **itemRender**: Custom render function for file list items
 * - **Directory upload**: webkitdirectory attribute support
 * - **Responsive design**: Mobile-friendly interface
 *
 * @example Basic upload
 * ```tsx
 * <Upload engine="modern">
 *   <button className="btn">Upload File</button>
 * </Upload>
 * ```
 *
 * @example Picture card mode
 * ```tsx
 * <Upload engine="modern" listType="picture-card" maxCount={5}>
 *   <span>+ Add Image</span>
 * </Upload>
 * ```
 *
 * @see {@link Upload} - Main component
 * @see {@link UploadProps} - Component props
 * @module Upload/Engines/Modern
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { UploadProps, DraggerProps, UploadFile, UploadChangeInfo, UploadListType } from '../Upload.types';
import { UPLOAD_DEFAULTS } from '../Upload.types';
import { removeUploadFile, resolveAcceptedUploadFiles } from '../shared';
import { useTranslation } from '../../../../../i18n';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFileThumbUrl(file: UploadFile): Promise<string | undefined> {
  return new Promise((resolve) => {
    const raw = file.originFileObj;
    if (!raw || !raw.type?.startsWith('image/')) {
      resolve(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(raw);
  });
}

function isImageFile(file: UploadFile): boolean {
  if (file.type?.startsWith('image/')) return true;
  const url = file.thumbUrl || file.url || '';
  return /\.(png|jpe?g|gif|webp|bmp|svg|ico|avif)(\?.*)?$/i.test(url);
}

// ---------------------------------------------------------------------------
// Preview Modal
// ---------------------------------------------------------------------------

interface PreviewModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ src, alt, onClose }) => {
  const { t } = useTranslation('components');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('upload.preview', { name: alt })}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="absolute -top-3 -right-3 btn btn-circle btn-sm btn-error"
          onClick={onClose}
          aria-label={t('upload.close_preview')}
        >
          x
        </button>
        <img src={src} alt={alt} className="max-w-full max-h-[85vh] rounded-lg object-contain" />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Progress Bar
// ---------------------------------------------------------------------------

interface ProgressBarProps {
  percent?: number;
  strokeColor?: string | { from: string; to: string };
  strokeWidth?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percent = 0, strokeColor, strokeWidth = 2 }) => {
  const bg = typeof strokeColor === 'object'
    ? `linear-gradient(to right, ${strokeColor.from}, ${strokeColor.to})`
    : strokeColor || undefined;

  return (
    <div className="w-full bg-base-300 rounded-full overflow-hidden" style={{ height: strokeWidth + 4 }}>
      <div
        className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(percent, 100)}%`, ...(bg ? { background: bg } : {}) }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(percent)}%`}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// File Item Renderer
// ---------------------------------------------------------------------------

interface FileItemProps {
  file: UploadFile;
  listType: UploadListType;
  onRemove: (file: UploadFile) => void;
  onPreview?: (file: UploadFile) => void;
  itemRender?: UploadProps['itemRender'];
  progress?: UploadProps['progress'];
  thumbUrls: Record<string, string>;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  listType,
  onRemove,
  onPreview,
  itemRender,
  progress,
  thumbUrls,
}) => {
  const [hovered, setHovered] = useState(false);
  const thumb = file.thumbUrl || file.url || thumbUrls[file.uid];
  const isImg = isImageFile(file);
  const isUploading = file.status === 'uploading';

  const actions = {
    download: () => { if (file.url) window.open(file.url, '_blank'); },
    preview: () => onPreview?.(file),
    remove: () => onRemove(file),
  };

  // -- picture-card --
  if (listType === 'picture-card') {
    const originNode = (
      <div
        className={`relative group border rounded-lg overflow-hidden flex items-center justify-center bg-base-200 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
          file.status === 'error' ? 'border-error' : 'border-base-300'
        }`}
        style={{ width: 104, height: 104 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="listitem"
        aria-label={file.name}
      >
        {isImg && thumb ? (
          <img src={thumb} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-base-content/60 truncate px-1 text-center">{file.name}</span>
        )}
        {isUploading && (
          <div className="absolute inset-x-0 bottom-0 p-1 bg-black/40">
            <ProgressBar percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />
          </div>
        )}
        {hovered && !isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
            {isImg && (
              <button type="button" className="btn btn-circle btn-xs btn-ghost text-white" onClick={() => onPreview?.(file)} aria-label={`Preview ${file.name}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            )}
            <button type="button" className="btn btn-circle btn-xs btn-ghost text-white" onClick={() => onRemove(file)} aria-label={`Remove ${file.name}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        )}
      </div>
    );
    return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
  }

  // -- picture-circle --
  if (listType === 'picture-circle') {
    const originNode = (
      <div
        className={`relative group rounded-full overflow-hidden flex items-center justify-center bg-base-200 border-2 ${
          file.status === 'error' ? 'border-error' : 'border-base-300'
        }`}
        style={{ width: 104, height: 104 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="listitem"
        aria-label={file.name}
      >
        {isImg && thumb ? (
          <img src={thumb} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-base-content/60 truncate px-2 text-center">{file.name}</span>
        )}
        {isUploading && (
          <div className="absolute inset-x-2 bottom-2">
            <ProgressBar percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />
          </div>
        )}
        {hovered && !isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-1">
            {isImg && (
              <button type="button" className="btn btn-circle btn-xs btn-ghost text-white" onClick={() => onPreview?.(file)} aria-label={`Preview ${file.name}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            )}
            <button type="button" className="btn btn-circle btn-xs btn-ghost text-white" onClick={() => onRemove(file)} aria-label={`Remove ${file.name}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </div>
    );
    return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
  }

  // -- picture (list with thumbnails) --
  if (listType === 'picture') {
    const originNode = (
      <div className={`flex items-center gap-2 p-2 bg-base-200 rounded transition-colors duration-200 hover:bg-base-200/50 ${file.status === 'error' ? 'border border-error' : ''}`} role="listitem" aria-label={file.name}>
        {isImg && thumb ? (
          <img src={thumb} alt={file.name} className="w-12 h-12 object-cover rounded flex-shrink-0 cursor-pointer" onClick={() => onPreview?.(file)} />
        ) : (
          <div className="w-12 h-12 bg-base-300 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-sm truncate block">{file.name}</span>
          {isUploading && <ProgressBar percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />}
        </div>
        <button type="button" className="btn btn-ghost btn-xs flex-shrink-0 transition-colors duration-150 hover:text-error" onClick={() => onRemove(file)} aria-label={`Remove ${file.name}`}>x</button>
      </div>
    );
    return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
  }

  // -- text (default) --
  const originNode = (
    <div className={`flex items-center justify-between p-2 bg-base-200 rounded transition-colors duration-200 hover:bg-base-200/50 ${file.status === 'error' ? 'border border-error' : ''}`} role="listitem" aria-label={file.name}>
      <div className="flex-1 min-w-0">
        <span className="text-sm truncate block">{file.name}</span>
        {isUploading && <ProgressBar percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />}
      </div>
      <button type="button" className="btn btn-ghost btn-xs flex-shrink-0 transition-colors duration-150 hover:text-error" onClick={() => onRemove(file)} aria-label={`Remove ${file.name}`}>x</button>
    </div>
  );
  return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
};

// ---------------------------------------------------------------------------
// Upload Component
// ---------------------------------------------------------------------------

export const Upload = React.forwardRef<HTMLDivElement, UploadProps>(
  (props, ref) => {
    const { t } = useTranslation('components');

    const {
      accept,
      multiple = UPLOAD_DEFAULTS.multiple,
      fileList: controlledFileList,
      defaultFileList = [],
      maxCount,
      disabled = UPLOAD_DEFAULTS.disabled,
      showUploadList = UPLOAD_DEFAULTS.showUploadList,
      listType = UPLOAD_DEFAULTS.listType,
      directory = false,
      beforeUpload,
      onChange,
      onRemove,
      onPreview,
      itemRender,
      progress,
      children,
      className = '',
      style,
    } = props;

    const [fileList, setFileList] = useState<UploadFile[]>(defaultFileList);
    const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});
    const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const actualFileList = controlledFileList ?? fileList;
    const inputId = useRef(`upload-input-${Date.now()}-${Math.random().toString(36).slice(2)}`).current;

    // Generate thumbnails for picture modes
    useEffect(() => {
      if (listType === 'text') return;
      actualFileList.forEach(async (file) => {
        if (thumbUrls[file.uid] || file.thumbUrl || file.url) return;
        const url = await getFileThumbUrl(file);
        if (url) setThumbUrls((prev) => ({ ...prev, [file.uid]: url }));
      });
    }, [actualFileList, listType, thumbUrls]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const { nextFileList, acceptedFiles } = await resolveAcceptedUploadFiles(
        actualFileList, files, maxCount, beforeUpload
      );

      if (acceptedFiles.length === 0) {
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      setFileList(nextFileList);
      acceptedFiles.forEach((acceptedFile, index) => {
        const fileListSnapshot = nextFileList.slice(0, actualFileList.length + index + 1);
        const info: UploadChangeInfo = { file: acceptedFile, fileList: fileListSnapshot };
        onChange?.(info);
      });
      if (inputRef.current) inputRef.current.value = '';
    };

    const handleRemove = async (file: UploadFile) => {
      if (onRemove) {
        const result = await onRemove(file);
        if (result === false) return;
      }
      const newFileList = removeUploadFile(actualFileList, file);
      setFileList(newFileList);
      onChange?.({ file: { ...file, status: 'removed' }, fileList: newFileList });
    };

    const handlePreview = useCallback((file: UploadFile) => {
      if (onPreview) { onPreview(file); return; }
      const src = file.thumbUrl || file.url || thumbUrls[file.uid];
      if (src && isImageFile(file)) setPreviewImage({ src, alt: file.name });
    }, [onPreview, thumbUrls]);

    const isPictureCardOrCircle = listType === 'picture-card' || listType === 'picture-circle';
    const canAdd = !maxCount || actualFileList.length < maxCount;

    const directoryAttrs = directory
      ? { webkitdirectory: '', directory: '' } as unknown as React.InputHTMLAttributes<HTMLInputElement>
      : {};

    const uploadTrigger = (
      <>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileChange}
          className="hidden"
          id={inputId}
          aria-label={t('upload.upload_file')}
          {...directoryAttrs}
        />
        {isPictureCardOrCircle ? (
          canAdd && (
            <label
              htmlFor={inputId}
              className={`flex items-center justify-center border-2 border-dashed border-base-300 hover:border-primary hover:bg-primary/5 transition-all duration-300 ${
                listType === 'picture-circle' ? 'rounded-full' : 'rounded-lg'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ width: 104, height: 104 }}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={t('upload.add_file')}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); }
              }}
            >
              {children || (
                <svg className="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </label>
          )
        ) : (
          <label htmlFor={inputId} className={disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}>
            {children || (
              <button type="button" className="btn btn-outline" disabled={disabled}>{t('upload.button')}</button>
            )}
          </label>
        )}
      </>
    );

    const fileItems = actualFileList.map((file) => (
      <FileItem
        key={file.uid}
        file={file}
        listType={listType}
        onRemove={handleRemove}
        onPreview={handlePreview}
        itemRender={itemRender}
        progress={progress}
        thumbUrls={thumbUrls}
      />
    ));

    return (
      <div ref={ref} className={className} style={style}>
        {isPictureCardOrCircle ? (
          <div className="flex flex-wrap gap-2" role="list" aria-label="Uploaded files">
            {showUploadList && fileItems}
            {uploadTrigger}
          </div>
        ) : (
          <>
            {uploadTrigger}
            {showUploadList && actualFileList.length > 0 && (
              <div className="mt-2 space-y-2" role="list" aria-label="Uploaded files">
                {fileItems}
              </div>
            )}
          </>
        )}
        {previewImage && (
          <PreviewModal src={previewImage.src} alt={previewImage.alt} onClose={() => setPreviewImage(null)} />
        )}
      </div>
    );
  }
);

Upload.displayName = 'Upload.Modern';

// ---------------------------------------------------------------------------
// Dragger Component
// ---------------------------------------------------------------------------

export const Dragger = React.forwardRef<HTMLDivElement, DraggerProps>(
  (props, ref) => {
    const { t } = useTranslation('components');

    const {
      accept,
      multiple = UPLOAD_DEFAULTS.multiple,
      fileList: controlledFileList,
      defaultFileList = [],
      maxCount,
      disabled = UPLOAD_DEFAULTS.disabled,
      showUploadList = UPLOAD_DEFAULTS.showUploadList,
      listType = UPLOAD_DEFAULTS.listType,
      directory = false,
      beforeUpload,
      onChange,
      onRemove,
      onDrop,
      onPreview,
      itemRender,
      progress,
      children,
      className = '',
      style,
      height = 200,
    } = props;

    const [fileList, setFileList] = useState<UploadFile[]>(defaultFileList);
    const [isDragOver, setIsDragOver] = useState(false);
    const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});
    const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const actualFileList = controlledFileList ?? fileList;

    useEffect(() => {
      if (listType === 'text') return;
      actualFileList.forEach(async (file) => {
        if (thumbUrls[file.uid] || file.thumbUrl || file.url) return;
        const url = await getFileThumbUrl(file);
        if (url) setThumbUrls((prev) => ({ ...prev, [file.uid]: url }));
      });
    }, [actualFileList, listType, thumbUrls]);

    const processFiles = async (files: File[]) => {
      if (disabled) { if (inputRef.current) inputRef.current.value = ''; return; }
      const { nextFileList, acceptedFiles } = await resolveAcceptedUploadFiles(actualFileList, files, maxCount, beforeUpload);
      if (acceptedFiles.length === 0) { if (inputRef.current) inputRef.current.value = ''; return; }
      setFileList(nextFileList);
      acceptedFiles.forEach((acceptedFile, index) => {
        const fileListSnapshot = nextFileList.slice(0, actualFileList.length + index + 1);
        onChange?.({ file: acceptedFile, fileList: fileListSnapshot });
      });
      if (inputRef.current) inputRef.current.value = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      setIsDragOver(false);
      onDrop?.(e);
      processFiles(Array.from(e.dataTransfer.files));
    };

    const handleRemove = async (file: UploadFile) => {
      if (onRemove) { const result = await onRemove(file); if (result === false) return; }
      const newFileList = removeUploadFile(actualFileList, file);
      setFileList(newFileList);
      onChange?.({ file: { ...file, status: 'removed' }, fileList: newFileList });
    };

    const handlePreview = useCallback((file: UploadFile) => {
      if (onPreview) { onPreview(file); return; }
      const src = file.thumbUrl || file.url || thumbUrls[file.uid];
      if (src && isImageFile(file)) setPreviewImage({ src, alt: file.name });
    }, [onPreview, thumbUrls]);

    const directoryAttrs = directory
      ? { webkitdirectory: '', directory: '' } as unknown as React.InputHTMLAttributes<HTMLInputElement>
      : {};

    return (
      <div ref={ref} className={className} style={style}>
        <div
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
          onDragLeave={() => { if (!disabled) setIsDragOver(false); }}
          onDrop={handleDrop}
          onClick={() => { if (!disabled) inputRef.current?.click(); }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={t('upload.drop_hint')}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); }
          }}
          className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            isDragOver ? 'border-primary bg-primary/5 shadow-lg scale-[1.01]' : 'border-base-300 hover:border-primary hover:bg-primary/5'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ height }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => processFiles(Array.from(e.target.files || []))}
            className="hidden"
            aria-label="Upload file"
            {...directoryAttrs}
          />
          {children || (
            <>
              <svg className="w-12 h-12 text-base-content/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-base-content/70">{t('upload.drag_drop')}</p>
            </>
          )}
        </div>

        {showUploadList && actualFileList.length > 0 && (
          <div className="mt-2 space-y-2" role="list" aria-label="Uploaded files">
            {actualFileList.map(file => (
              <FileItem
                key={file.uid}
                file={file}
                listType={listType}
                onRemove={handleRemove}
                onPreview={handlePreview}
                itemRender={itemRender}
                progress={progress}
                thumbUrls={thumbUrls}
              />
            ))}
          </div>
        )}

        {previewImage && (
          <PreviewModal src={previewImage.src} alt={previewImage.alt} onClose={() => setPreviewImage(null)} />
        )}
      </div>
    );
  }
);

Dragger.displayName = 'Upload.Dragger.Modern';

export default Upload;
