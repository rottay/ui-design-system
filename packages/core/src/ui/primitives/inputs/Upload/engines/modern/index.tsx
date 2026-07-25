'use client';

/**
 * @fileoverview Upload Modern Engine - Rottay Design System
 * @description Token-driven, skin-painted implementation of the Upload component
 * with drag-and-drop support, picture-card/picture-circle modes, DS Progress
 * composition, image preview, itemRender, and directory upload.
 *
 * @remarks
 * The Modern engine provides upload using:
 * - **Skin-owned paint**: every visual decision lives in the `upload.css`
 *   modern skin, keyed on the public `data-part` anatomy; this file owns
 *   semantics and behavior only
 * - **DS Progress composition**: per-file upload progress renders the public
 *   `Progress` primitive (no hand-rolled bar, no second paint owner)
 * - **Drag and drop**: Custom dragger with visual feedback
 * - **File validation**: beforeUpload hook support
 * - **Picture modes**: picture-card grid and picture-circle avatar uploads
 * - **Preview**: Image preview on hover/click for picture modes
 * - **itemRender**: Custom render function for file list items
 * - **Directory upload**: webkitdirectory attribute support
 * - **Localized chrome**: action aria-labels resolve through the
 *   `components.upload` catalogue namespace
 *
 * @example Basic upload
 * ```tsx
 * <Upload engine="modern">
 *   <Button>Upload File</Button>
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
import type { UploadProps, DraggerProps, UploadFile, UploadChangeInfo, UploadListType } from '../../contracts';
import { UPLOAD_DEFAULTS } from '../../contracts';
import { removeUploadFile, resolveAcceptedUploadFiles } from '../../runtime/upload-behavior';
import { Progress } from '../../../../feedback/Progress';
import { useTranslation } from '@/infrastructure/runtime/i18n';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generates a data URL thumbnail for image files using FileReader.
 * Non-image files resolve to undefined (no preview). This avoids a network
 * round-trip for newly selected files that have not been uploaded yet.
 */
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

/**
 * Determines if a file should show an image preview. Checks MIME type first
 * (for newly selected files), then falls back to URL extension matching
 * (for server-returned files that may lack a MIME type).
 */
function isImageFile(file: UploadFile): boolean {
  if (file.type?.startsWith('image/')) return true;
  const url = file.thumbUrl || file.url || '';
  return /\.(png|jpe?g|gif|webp|bmp|svg|ico|avif)(\?.*)?$/i.test(url);
}

function readThumbUrl(thumbUrls: Record<string, string>, uid: string): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(thumbUrls, uid)) return undefined;
  const value = Reflect.get(thumbUrls, uid);
  return typeof value === 'string' ? value : undefined;
}

/**
 * Localized label with an English floor: when the catalogue entry has not
 * landed yet the provider echoes the full key, which must never reach an
 * aria-label.
 */
function translateOr(
  t: (key: string, params?: Record<string, string | number>) => string,
  key: string,
  fallback: string,
  params?: Record<string, string | number>
): string {
  const resolved = t(key, params);
  if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
  return resolved;
}

// ---------------------------------------------------------------------------
// Preview Modal
// ---------------------------------------------------------------------------

interface PreviewModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

/** Full-screen image preview overlay. Closes on Escape key or backdrop click. */
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
      data-part="preview-modal"
      className="fixed inset-0 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('upload.preview', { name: alt })}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          data-part="preview-close-button"
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
// Upload Progress (composes the public DS Progress primitive)
// ---------------------------------------------------------------------------

interface UploadProgressProps {
  percent?: number;
  strokeColor?: string | { from: string; to: string };
  strokeWidth?: number;
}

/**
 * Per-file upload progress. Composes the public `Progress` primitive so the
 * meter's paint has exactly one owner (the progress skin); the legacy
 * track-height contract (`strokeWidth + 4`) rides the governed
 * `--ds-progress-height` channel and a gradient `{from,to}` stroke is
 * serialized to the CSS `linear-gradient(...)` the primitive already accepts.
 */
const UploadProgress: React.FC<UploadProgressProps> = ({ percent = 0, strokeColor, strokeWidth = 2 }) => {
  const resolvedStrokeColor = typeof strokeColor === 'object'
    ? `linear-gradient(to right, ${strokeColor.from}, ${strokeColor.to})`
    : strokeColor;

  return (
    <Progress
      percent={Math.min(percent, 100)}
      type="line"
      showInfo={false}
      strokeColor={resolvedStrokeColor}
      style={{ '--ds-progress-height': `${strokeWidth + 4}px` } as React.CSSProperties}
    />
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

/**
 * Renders a single file entry in the upload list. Adapts its layout based on
 * `listType`: picture-card (grid thumbnail), picture-circle (avatar), picture
 * (row with thumbnail), or text (filename only). Supports hover overlays with
 * preview/remove actions and upload progress display.
 */
const FileItem: React.FC<FileItemProps> = ({
  file,
  listType,
  onRemove,
  onPreview,
  itemRender,
  progress,
  thumbUrls,
}) => {
  const { t } = useTranslation('components');
  const [hovered, setHovered] = useState(false);
  const thumb = file.thumbUrl || file.url || readThumbUrl(thumbUrls, file.uid);
  const isImg = isImageFile(file);
  const isUploading = file.status === 'uploading';

  const actions = {
    download: () => { if (file.url) window.open(file.url, '_blank'); },
    preview: () => onPreview?.(file),
    remove: () => onRemove(file),
  };

  const previewLabel = translateOr(t, 'upload.preview', `Preview ${file.name}`, { name: file.name });
  const removeLabel = translateOr(t, 'upload.remove_named', `Remove ${file.name}`, { name: file.name });

  // -- picture-card: 104x104 grid tile with hover overlay for actions --
  if (listType === 'picture-card') {
    const originNode = (
      <div
        data-part="file-item"
        data-status={file.status || undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="listitem"
        aria-label={file.name}
      >
        {isImg && thumb ? (
          <img data-part="file-thumb" src={thumb} alt={file.name} />
        ) : (
          <span data-part="file-name">{file.name}</span>
        )}
        {isUploading && (
          <div data-part="file-progress">
            <UploadProgress percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />
          </div>
        )}
        {hovered && !isUploading && (
          <div data-part="file-item-overlay">
            {isImg && (
              <button type="button" data-part="file-item-action" data-action="preview" onClick={() => onPreview?.(file)} aria-label={previewLabel}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            )}
            <button type="button" data-part="file-item-action" data-action="remove" onClick={() => onRemove(file)} aria-label={removeLabel}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        )}
      </div>
    );
    return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
  }

  // -- picture-circle: circular avatar variant of picture-card --
  if (listType === 'picture-circle') {
    const originNode = (
      <div
        className={`relative group rounded-full overflow-hidden flex items-center justify-center border-2`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="listitem"
        aria-label={file.name}
        data-part="file-item"
        data-status={file.status || undefined}
      >
        {isImg && thumb ? (
          <img src={thumb} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs truncate px-2 text-center">{file.name}</span>
        )}
        {isUploading && (
          <div className="absolute inset-x-2 bottom-2">
            <UploadProgress percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />
          </div>
        )}
        {hovered && !isUploading && (
          <div data-part="file-item-overlay" className="absolute inset-0 rounded-full flex items-center justify-center gap-1">
            {isImg && (
              <button type="button" data-part="file-item-action" data-action="preview" onClick={() => onPreview?.(file)} aria-label={previewLabel}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            )}
            <button type="button" data-part="file-item-action" data-action="remove" onClick={() => onRemove(file)} aria-label={removeLabel}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </div>
    );
    return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
  }

  // -- picture: horizontal row with a small thumbnail on the left --
  if (listType === 'picture') {
    const originNode = (
      <div data-part="file-item" data-status={file.status || undefined} className={`flex items-center gap-2 p-2 rounded transition-colors duration-200 ${file.status === 'error' ? 'border border-error' : ''}`} role="listitem" aria-label={file.name}>
        {isImg && thumb ? (
          <img src={thumb} alt={file.name} className="w-12 h-12 object-cover rounded flex-shrink-0 cursor-pointer" onClick={() => onPreview?.(file)} />
        ) : (
          <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-sm truncate block">{file.name}</span>
          {isUploading && <UploadProgress percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />}
        </div>
        <button type="button" data-part="file-item-action" data-action="remove" onClick={() => onRemove(file)} aria-label={removeLabel}>x</button>
      </div>
    );
    return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
  }

  // -- text (default): simple filename row with remove button --
  const originNode = (
    <div data-part="file-item" data-status={file.status || undefined} className={`flex items-center justify-between p-2 rounded transition-colors duration-200 ${file.status === 'error' ? 'border border-error' : ''}`} role="listitem" aria-label={file.name}>
      <div className="flex-1 min-w-0">
        <span className="text-sm truncate block">{file.name}</span>
        {isUploading && <UploadProgress percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />}
      </div>
      <button type="button" data-part="file-item-action" data-action="remove" onClick={() => onRemove(file)} aria-label={removeLabel}>x</button>
    </div>
  );
  return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
};

// ---------------------------------------------------------------------------
// Upload Component
// ---------------------------------------------------------------------------

/**
 * Modern Upload component (skin-painted, DS Progress composition).
 *
 * Provides file selection via a hidden input triggered by a label or button.
 * Supports controlled/uncontrolled file lists, picture-card and picture-circle
 * grid modes, directory upload, and per-file progress meters.
 *
 * @param props - {@link UploadProps}
 * @returns A file upload component with file list display and preview modal
 */
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
        if (readThumbUrl(thumbUrls, file.uid) || file.thumbUrl || file.url) return;
        const url = await getFileThumbUrl(file);
        if (url) setThumbUrls((prev) => ({ ...prev, [file.uid]: url }));
      });
    }, [actualFileList, listType, thumbUrls]);

    // Processes selected files through beforeUpload validation, then updates
    // state and fires onChange for each accepted file with a progressive snapshot.
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

    // Allows onRemove to veto deletion by returning false
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
      const src = file.thumbUrl || file.url || readThumbUrl(thumbUrls, file.uid);
      if (src && isImageFile(file)) setPreviewImage({ src, alt: file.name });
    }, [onPreview, thumbUrls]);

    const isPictureCardOrCircle = listType === 'picture-card' || listType === 'picture-circle';
    const canAdd = !maxCount || actualFileList.length < maxCount;

    const directoryAttrs = directory
      ? { webkitdirectory: '', directory: '' } as unknown as React.InputHTMLAttributes<HTMLInputElement>
      : {};

    // Root scope class + the listType discriminator the skin CSS keys file-item
    // variants on (mirrors rustic's pre-existing `rottay-upload--${listType}` BEM modifier).
    const rootClassName = [
      'ds-upload',
      'ds-upload--modern',
      listType !== 'text' && `ds-upload--${listType}`,
      className,
    ].filter(Boolean).join(' ');

    const fileListLabel = translateOr(t, 'upload.file_list', 'Uploaded files');

    const uploadTrigger = (
      <>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileChange}
          data-part="file-input"
          id={inputId}
          aria-label={t('upload.upload_file')}
          {...directoryAttrs}
        />
        {isPictureCardOrCircle ? (
          canAdd && (
            <label
              htmlFor={inputId}
              data-part="add-button"
              className={`flex items-center justify-center border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all duration-300 ${
                listType === 'picture-circle' ? 'rounded-full' : 'rounded-lg'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={t('upload.add_file')}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); }
              }}
            >
              {children || (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </label>
          )
        ) : (
          <span
            data-part="trigger"
            data-disabled={disabled ? 'true' : undefined}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!disabled) inputRef.current?.click(); }}
          >
            {children || (
              <button type="button" disabled={disabled}>{t('upload.button')}</button>
            )}
          </span>
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
      <div ref={ref} data-part="root" className={rootClassName} style={style}>
        {isPictureCardOrCircle ? (
          <div data-part="file-list" className="flex flex-wrap gap-2" role="list" aria-label={fileListLabel}>
            {showUploadList && fileItems}
            {uploadTrigger}
          </div>
        ) : (
          <>
            {uploadTrigger}
            {showUploadList && actualFileList.length > 0 && (
              <div data-part="file-list" className="mt-2 space-y-2" role="list" aria-label={fileListLabel}>
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

/**
 * Modern Upload.Dragger component (skin-painted).
 *
 * Provides a drag-and-drop zone that highlights on dragOver. Dropped files
 * go through the same beforeUpload validation as manually selected files.
 * Supports all the same list types and preview capabilities as the regular
 * Upload component.
 *
 * @param props - {@link DraggerProps}
 * @returns A drag-and-drop upload zone with file list below
 */
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
        if (readThumbUrl(thumbUrls, file.uid) || file.thumbUrl || file.url) return;
        const url = await getFileThumbUrl(file);
        if (url) setThumbUrls((prev) => ({ ...prev, [file.uid]: url }));
      });
    }, [actualFileList, listType, thumbUrls]);

    // Shared file processing for both drag-drop and manual selection paths
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
      const src = file.thumbUrl || file.url || readThumbUrl(thumbUrls, file.uid);
      if (src && isImageFile(file)) setPreviewImage({ src, alt: file.name });
    }, [onPreview, thumbUrls]);

    const directoryAttrs = directory
      ? { webkitdirectory: '', directory: '' } as unknown as React.InputHTMLAttributes<HTMLInputElement>
      : {};

    // Root scope class + the listType discriminator the skin CSS keys file-item
    // variants on (mirrors rustic's pre-existing `rottay-upload--${listType}` BEM modifier).
    const rootClassName = [
      'ds-upload-dragger',
      'ds-upload-dragger--modern',
      listType !== 'text' && `ds-upload-dragger--${listType}`,
      className,
    ].filter(Boolean).join(' ');

    const fileListLabel = translateOr(t, 'upload.file_list', 'Uploaded files');

    return (
      <div ref={ref} data-part="root" className={rootClassName} style={style}>
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
          data-part="dropzone"
          data-state={isDragOver ? 'dragging' : 'idle'}
          className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            isDragOver ? 'border-primary bg-primary/5 shadow-lg scale-[1.01]' : 'hover:border-primary hover:bg-primary/5'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          /* Runtime prop-driven height rides the governed channel; the skin
             owns the block-size declaration. */
          style={{ '--ds-upload-dropzone-height': typeof height === 'number' ? `${height}px` : height } as React.CSSProperties}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => processFiles(Array.from(e.target.files || []))}
            data-part="file-input"
            aria-label={t('upload.upload_file')}
            {...directoryAttrs}
          />
          {children || (
            <>
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p>{t('upload.drag_drop')}</p>
            </>
          )}
        </div>

        {showUploadList && actualFileList.length > 0 && (
          <div data-part="file-list" className="mt-2 space-y-2" role="list" aria-label={fileListLabel}>
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
