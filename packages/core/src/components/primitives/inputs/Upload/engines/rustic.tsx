'use client';

/**
 * @fileoverview Upload Rustic Engine - Rottay Design System.
 * Pure vanilla HTML/CSS implementation of the Upload component using inline
 * styles backed by CSS variables (--ds-upload-*) for multi-tenant theming.
 * Supports picture-card, picture-circle, progress bars, image preview,
 * custom itemRender, and directory upload - all without external CSS frameworks.
 *
 * @example
 * ```tsx
 * <Upload engine="rustic" listType="picture-card" maxCount={3} />
 * ```
 *
 * @module Upload/Engines/Rustic
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { UploadProps, DraggerProps, UploadFile, UploadListType } from '../Upload.types';
import { UPLOAD_DEFAULTS } from '../Upload.types';
import { removeUploadFile, resolveAcceptedUploadFiles } from '../shared';
import { useTranslation } from '../../../../../i18n';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Generates a data URL thumbnail for image files using FileReader.
// This avoids a network round-trip for newly selected files that have not
// been uploaded yet. Non-image files resolve to undefined (no preview).
function getFileThumbUrl(file: UploadFile): Promise<string | undefined> {
  return new Promise((resolve) => {
    const raw = file.originFileObj;
    if (!raw || !raw.type?.startsWith('image/')) { resolve(undefined); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(raw);
  });
}

// Determines if a file should show an image preview. Checks MIME type first
// (for newly selected files), then falls back to URL extension matching
// (for server-returned files that may lack a MIME type).
function isImageFile(file: UploadFile): boolean {
  if (file.type?.startsWith('image/')) return true;
  const url = file.thumbUrl || file.url || '';
  return /\.(png|jpe?g|gif|webp|bmp|svg|ico|avif)(\?.*)?$/i.test(url);
}

// ---------------------------------------------------------------------------
// Shared inline styles
// ---------------------------------------------------------------------------

const sharedStyles = {
  hidden: { display: 'none' } as React.CSSProperties,
  fileItemText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px',
    background: 'var(--ds-upload-file-bg)',
    borderRadius: 'var(--ds-upload-file-radius)',
    marginBottom: '4px',
  } as React.CSSProperties,
  fileName: {
    fontSize: 'var(--ds-font-size-sm)',
    color: 'var(--ds-upload-file-color)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  removeBtn: {
    border: 'none',
    background: 'transparent',
    color: 'var(--ds-upload-file-remove-color)',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px',
  } as React.CSSProperties,
  progressTrack: {
    width: '100%',
    background: 'var(--ds-upload-progress-track)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '4px',
  } as React.CSSProperties,
  // Card container is 104x104 to match antd's picture-card convention.
  // Error state doubles the border width for increased visibility.
  cardContainer: (isCircle: boolean, hasError: boolean): React.CSSProperties => ({
    position: 'relative',
    width: 104,
    height: 104,
    borderRadius: isCircle ? '50%' : 'var(--ds-upload-file-radius)',
    border: `${hasError ? '2px' : '1px'} solid ${hasError ? 'var(--ds-upload-error-border)' : 'var(--ds-upload-card-border)'}`,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--ds-upload-card-bg)',
  }),
  cardOverlay: (isCircle: boolean): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    background: 'var(--ds-upload-preview-overlay)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    borderRadius: isCircle ? '50%' : '0',
  }),
  overlayBtn: {
    border: 'none',
    background: 'transparent',
    color: 'var(--ds-upload-overlay-action-color)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  thumbImg: (isCircle: boolean): React.CSSProperties => ({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: isCircle ? '50%' : '0',
  }),
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  } as React.CSSProperties,
  addButton: (isCircle: boolean, isDisabled: boolean): React.CSSProperties => ({
    width: 104,
    height: 104,
    border: '2px dashed var(--ds-upload-card-border)',
    borderRadius: isCircle ? '50%' : 'var(--ds-upload-file-radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    background: 'transparent',
    transition: 'var(--ds-transition-fast)',
    fontFamily: 'var(--ds-font-family-base)',
  }),
  pictureThumb: {
    width: 48,
    height: 48,
    objectFit: 'cover',
    borderRadius: 'var(--ds-upload-file-radius)',
    flexShrink: 0,
    cursor: 'pointer',
  } as React.CSSProperties,
  pictureIcon: {
    width: 48,
    height: 48,
    borderRadius: 'var(--ds-upload-file-radius)',
    background: 'var(--ds-upload-file-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
  pictureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    background: 'var(--ds-upload-file-bg)',
    borderRadius: 'var(--ds-upload-file-radius)',
    marginBottom: '4px',
  } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// Preview Modal
// ---------------------------------------------------------------------------

interface PreviewModalProps { src: string; alt: string; onClose: () => void; }

const PreviewModal: React.FC<PreviewModalProps> = ({ src, alt, onClose }) => {
  const { t } = useTranslation('components');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      data-part="preview-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('upload.preview', { name: alt })}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ds-upload-preview-backdrop)' }}
    >
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          data-part="preview-close-button"
          onClick={onClose}
          aria-label={t('upload.close_preview')}
          style={{ position: 'absolute', top: -12, right: -12, border: 'none', borderRadius: '50%', width: 28, height: 28, background: 'var(--ds-upload-preview-close-bg)', color: 'var(--ds-upload-preview-close-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
        >
          x
        </button>
        <img src={src} alt={alt} style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 'var(--ds-radius-lg)', objectFit: 'contain' }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Progress Bar
// ---------------------------------------------------------------------------

const ProgressBar: React.FC<{ percent?: number; strokeColor?: string | { from: string; to: string }; strokeWidth?: number }> = ({ percent = 0, strokeColor, strokeWidth = 2 }) => {
  const bg = typeof strokeColor === 'object'
    ? `linear-gradient(to right, ${strokeColor.from}, ${strokeColor.to})`
    : strokeColor || 'var(--ds-upload-progress-bar)';
  return (
    <div data-part="progress-track" style={{ ...sharedStyles.progressTrack, height: strokeWidth + 4 }}>
      <div
        data-part="progress-bar"
        style={{ height: '100%', width: `${Math.min(percent, 100)}%`, background: bg, borderRadius: 4, transition: 'width var(--ds-transition-fast)' }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Upload progress: ${Math.round(percent)}%`}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// SVG Icons (inline, no external deps)
// ---------------------------------------------------------------------------

const EyeIcon = () => (
  <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const TrashIcon = () => (
  <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const CloseIcon = () => (
  <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const PlusIcon = () => (
  <svg width={32} height={32} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--ds-upload-dragger-icon-color)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
);
const FileIcon = () => (
  <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--ds-upload-dragger-icon-color)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
);

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
 * Renders a single file entry using inline styles. Adapts layout based on
 * listType (picture-card, picture-circle, picture, or text). Hover-triggered
 * overlay shows preview/remove actions for card/circle modes.
 */
const RusticFileItem: React.FC<FileItemProps> = ({ file, listType, onRemove, onPreview, itemRender, progress, thumbUrls }) => {
  const [hovered, setHovered] = useState(false);
  const thumb = file.thumbUrl || file.url || thumbUrls[file.uid];
  const isImg = isImageFile(file);
  const isUploading = file.status === 'uploading';
  const isCircle = listType === 'picture-circle';

  const actions = {
    download: () => { if (file.url) window.open(file.url, '_blank'); },
    preview: () => onPreview?.(file),
    remove: () => onRemove(file),
  };

  // -- picture-card / picture-circle: 104x104 tile with hover overlay --
  if (listType === 'picture-card' || listType === 'picture-circle') {
    const originNode = (
      <div
        data-part="file-item"
        data-status={file.status || undefined}
        style={sharedStyles.cardContainer(isCircle, file.status === 'error')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="listitem"
        aria-label={file.name}
      >
        {isImg && thumb ? (
          <img src={thumb} alt={file.name} style={sharedStyles.thumbImg(isCircle)} />
        ) : (
          <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-upload-file-color)', textAlign: 'center', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
        )}
        {isUploading && (
          <div style={{ position: 'absolute', bottom: isCircle ? 8 : 0, left: isCircle ? 8 : 0, right: isCircle ? 8 : 0, padding: '4px' }}>
            <ProgressBar percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />
          </div>
        )}
        {hovered && !isUploading && (
          <div data-part="file-item-overlay" style={sharedStyles.cardOverlay(isCircle)}>
            {isImg && (
              <button type="button" data-part="file-item-action" data-action="preview" style={sharedStyles.overlayBtn} onClick={() => onPreview?.(file)} aria-label={`Preview ${file.name}`}>
                <EyeIcon />
              </button>
            )}
            <button type="button" data-part="file-item-action" data-action="remove" style={sharedStyles.overlayBtn} onClick={() => onRemove(file)} aria-label={`Remove ${file.name}`}>
              {isCircle ? <CloseIcon /> : <TrashIcon />}
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
      <div data-part="file-item" data-status={file.status || undefined} style={{ ...sharedStyles.pictureRow, ...(file.status === 'error' ? { border: '1px solid var(--ds-upload-error-border)' } : {}) }} role="listitem" aria-label={file.name}>
        {isImg && thumb ? (
          <img src={thumb} alt={file.name} style={sharedStyles.pictureThumb} onClick={() => onPreview?.(file)} />
        ) : (
          <div style={sharedStyles.pictureIcon}><FileIcon /></div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={sharedStyles.fileName}>{file.name}</span>
          {isUploading && <ProgressBar percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />}
        </div>
        <button type="button" data-part="file-item-action" data-action="remove" onClick={() => onRemove(file)} style={sharedStyles.removeBtn} aria-label={`Remove ${file.name}`}>x</button>
      </div>
    );
    return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
  }

  // -- text (default): simple filename row with remove button --
  const originNode = (
    <div data-part="file-item" data-status={file.status || undefined} style={{ ...sharedStyles.fileItemText, ...(file.status === 'error' ? { border: '1px solid var(--ds-upload-error-border)' } : {}) }} role="listitem" aria-label={file.name}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={sharedStyles.fileName}>{file.name}</span>
        {isUploading && <ProgressBar percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />}
      </div>
      <button type="button" data-part="file-item-action" data-action="remove" onClick={() => onRemove(file)} style={sharedStyles.removeBtn} aria-label={`Remove ${file.name}`}>x</button>
    </div>
  );
  return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
};

// ---------------------------------------------------------------------------
// Upload Component
// ---------------------------------------------------------------------------

/**
 * Rustic Upload component (pure HTML/CSS with CSS variables).
 *
 * Manages file selection via a hidden native input. Uses inline styles from
 * the `sharedStyles` object for all visual rendering, making it fully
 * independent of external CSS. Supports controlled/uncontrolled file lists,
 * picture grid modes, and directory upload via the webkitdirectory attribute.
 *
 * @param props - {@link UploadProps}
 * @returns A themed upload component with file list and preview modal
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

    useEffect(() => {
      if (listType === 'text') return;
      actualFileList.forEach(async (file) => {
        if (thumbUrls[file.uid] || file.thumbUrl || file.url) return;
        const url = await getFileThumbUrl(file);
        if (url) setThumbUrls((prev) => ({ ...prev, [file.uid]: url }));
      });
    }, [actualFileList, listType, thumbUrls]);

    // Processes selected files through beforeUpload validation, updates state,
    // and fires onChange with progressive file list snapshots.
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const { nextFileList, acceptedFiles } = await resolveAcceptedUploadFiles(actualFileList, files, maxCount, beforeUpload);
      if (acceptedFiles.length === 0) { if (inputRef.current) inputRef.current.value = ''; return; }
      setFileList(nextFileList);
      acceptedFiles.forEach((acceptedFile, index) => {
        const fileListSnapshot = nextFileList.slice(0, actualFileList.length + index + 1);
        onChange?.({ file: acceptedFile, fileList: fileListSnapshot });
      });
      if (inputRef.current) inputRef.current.value = '';
    };

    // Allows onRemove to veto deletion by returning false
    const handleRemove = async (file: UploadFile) => {
      if (onRemove) { const result = await onRemove(file); if (result === false) return; }
      const newFileList = removeUploadFile(actualFileList, file);
      setFileList(newFileList);
      onChange?.({ file: { ...file, status: 'removed' }, fileList: newFileList });
    };

    // Falls back to built-in image preview when no custom onPreview is provided
    const handlePreview = useCallback((file: UploadFile) => {
      if (onPreview) { onPreview(file); return; }
      const src = file.thumbUrl || file.url || thumbUrls[file.uid];
      if (src && isImageFile(file)) setPreviewImage({ src, alt: file.name });
    }, [onPreview, thumbUrls]);

    // BEM-style class names for optional external CSS targeting
    const containerClasses = [
      'rottay-upload',
      'rottay-upload--rustic',
      listType !== 'text' && `rottay-upload--${listType}`,
      disabled && 'rottay-upload--disabled',
      className,
    ].filter(Boolean).join(' ');

    const isPictureCardOrCircle = listType === 'picture-card' || listType === 'picture-circle';
    const canAdd = !maxCount || actualFileList.length < maxCount;

    const directoryAttrs = directory
      ? { webkitdirectory: '', directory: '' } as unknown as React.InputHTMLAttributes<HTMLInputElement>
      : {};

    const buttonStyle: React.CSSProperties = {
      padding: 'var(--ds-upload-button-padding)',
      border: '1px solid var(--ds-upload-button-border)',
      borderRadius: 'var(--ds-upload-button-radius)',
      background: 'var(--ds-upload-button-bg)',
      color: 'var(--ds-upload-button-color)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--ds-font-family-base)',
      transition: 'var(--ds-transition-fast)',
    };

    const fileItems = actualFileList.map((file) => (
      <RusticFileItem
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

    const uploadTrigger = (
      <>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileChange}
          style={sharedStyles.hidden}
          aria-label="Upload file"
          {...directoryAttrs}
        />
        {isPictureCardOrCircle ? (
          canAdd && (
            <div
              data-part="add-button"
              style={sharedStyles.addButton(listType === 'picture-circle', !!disabled)}
              onClick={() => !disabled && inputRef.current?.click()}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label="Add file"
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); }
              }}
            >
              {children || <PlusIcon />}
            </div>
          )
        ) : (
          <div data-part="trigger" onClick={() => !disabled && inputRef.current?.click()}>
            {children || (
              <button type="button" style={buttonStyle} disabled={disabled}>{t('upload.button')}</button>
            )}
          </div>
        )}
      </>
    );

    return (
      <div ref={ref} data-part="root" className={containerClasses} style={style}>
        {isPictureCardOrCircle ? (
          <div data-part="file-list" style={sharedStyles.grid} role="list" aria-label="Uploaded files">
            {showUploadList && fileItems}
            {uploadTrigger}
          </div>
        ) : (
          <>
            {uploadTrigger}
            {showUploadList && actualFileList.length > 0 && (
              <div data-part="file-list" className="rottay-upload__file-list" style={{ marginTop: 8 }} role="list" aria-label="Uploaded files">
                {fileItems}
              </div>
            )}
          </>
        )}
        {previewImage && <PreviewModal src={previewImage.src} alt={previewImage.alt} onClose={() => setPreviewImage(null)} />}
      </div>
    );
  }
);

Upload.displayName = 'Upload.Rustic';

// ---------------------------------------------------------------------------
// Dragger Component
// ---------------------------------------------------------------------------

/**
 * Rustic Upload.Dragger component (pure HTML/CSS with CSS variables).
 *
 * Provides a drag-and-drop zone styled entirely with inline styles. The
 * dropzone border and background change on dragOver via state-driven style
 * swaps rather than CSS pseudo-classes, keeping the zero-framework promise.
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
        if (thumbUrls[file.uid] || file.thumbUrl || file.url) return;
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

    // Resets drag visual state and delegates to the shared processFiles pipeline
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      setIsDragOver(false);
      onDrop?.(e);
      processFiles(Array.from(e.dataTransfer.files));
    };

    // Allows onRemove to veto deletion by returning false
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

    // BEM-style class names for optional external CSS targeting
    const containerClasses = [
      'rottay-upload-dragger',
      'rottay-upload-dragger--rustic',
      disabled && 'rottay-upload-dragger--disabled',
      isDragOver && 'rottay-upload-dragger--drag-over',
      className,
    ].filter(Boolean).join(' ');

    const dropzoneStyle: React.CSSProperties = {
      height,
      border: `2px dashed ${isDragOver ? 'var(--ds-upload-dragger-border-active)' : 'var(--ds-upload-dragger-border)'}`,
      borderRadius: 'var(--ds-upload-dragger-radius)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: isDragOver ? 'var(--ds-upload-dragger-bg-hover)' : 'var(--ds-upload-dragger-bg)',
      transition: 'var(--ds-transition-fast)',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--ds-font-family-base)',
    };

    const iconStyle: React.CSSProperties = {
      color: 'var(--ds-upload-dragger-icon-color)',
      marginBottom: '8px',
    };

    const textStyle: React.CSSProperties = {
      margin: 0,
      color: 'var(--ds-upload-dragger-text-color)',
      fontSize: 'var(--ds-font-size-sm)',
    };

    const directoryAttrs = directory
      ? { webkitdirectory: '', directory: '' } as unknown as React.InputHTMLAttributes<HTMLInputElement>
      : {};

    return (
      <div ref={ref} data-part="root" className={containerClasses} style={style}>
        <div
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
          onDragLeave={() => { if (!disabled) setIsDragOver(false); }}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          style={dropzoneStyle}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={t('upload.drop_hint')}
          data-part="dropzone"
          data-state={isDragOver ? 'dragging' : 'idle'}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => processFiles(Array.from(e.target.files || []))}
            style={sharedStyles.hidden}
            aria-label="Upload file"
            {...directoryAttrs}
          />
          {children || (
            <>
              <svg width={48} height={48} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={iconStyle}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p style={textStyle}>{t('upload.drag_drop')}</p>
            </>
          )}
        </div>

        {showUploadList && actualFileList.length > 0 && (
          <div data-part="file-list" className="rottay-upload-dragger__file-list" style={{ marginTop: 8 }} role="list" aria-label="Uploaded files">
            {actualFileList.map(file => (
              <RusticFileItem
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

        {previewImage && <PreviewModal src={previewImage.src} alt={previewImage.alt} onClose={() => setPreviewImage(null)} />}
      </div>
    );
  }
);

Dragger.displayName = 'Upload.Dragger.Rustic';

export default Upload;
