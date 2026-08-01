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
import { Progress } from '../../../../facade';
import { useTranslation, formatFileSize } from '@/infrastructure/runtime/i18n';
import { ActionAddIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-add';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { ActionDeleteIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-delete';
import { ActionRetryIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-retry';
import { ActionRevealIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-reveal';
import { ActionUploadIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-upload';
import { ContentFileIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-file';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';

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
 * Marks freshly accepted files as `uploading` (percent 0) when a
 * `customRequest` pipeline will actually transmit them. Pure: returns the
 * transformed list + accepted set so the accept flow can fire its onChange
 * snapshots before the async request lifecycle starts.
 */
function markAcceptedAsUploading(
  nextFileList: UploadFile[],
  acceptedFiles: UploadFile[]
): { nextFileList: UploadFile[]; acceptedFiles: UploadFile[] } {
  const uploading = acceptedFiles.map((file) => ({ ...file, status: 'uploading' as const, percent: 0 }));
  const byUid = new Map(uploading.map((file) => [file.uid, file]));
  return {
    nextFileList: nextFileList.map((file) => byUid.get(file.uid) ?? file),
    acceptedFiles: uploading,
  };
}

/**
 * Shared `customRequest` lifecycle for the Modern Upload and Dragger
 * (Phase B: the contract prop was dead in this engine -- Classic forwarded it
 * to Ant, Modern silently dropped it). For each transmitted file the request
 * option carries the contract's action/filename/data/headers/withCredentials,
 * and the onProgress/onSuccess/onError callbacks patch the file in the list
 * (uploading -> done/error) while firing onChange with the updated snapshot.
 *
 * The latest-list ref mirrors the last committed list so rapid async
 * progress ticks chain off each other instead of a stale render closure; in
 * controlled mode the ref tracks the consumer-provided list (onChange
 * snapshots stay best-effort, matching the accept flow).
 */
function useModernUploadRequest(options: {
  customRequest?: UploadProps['customRequest'];
  action?: UploadProps['action'];
  data?: UploadProps['data'];
  headers?: UploadProps['headers'];
  name?: string;
  withCredentials?: boolean;
  actualFileList: UploadFile[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  onChange?: UploadProps['onChange'];
}) {
  const { customRequest, action, data, headers, name, withCredentials, actualFileList, setFileList, onChange } = options;
  const listRef = useRef<UploadFile[]>(actualFileList);
  useEffect(() => {
    listRef.current = actualFileList;
  });

  const commitList = useCallback((next: UploadFile[]) => {
    listRef.current = next;
    setFileList(next);
  }, [setFileList]);

  const patchFile = useCallback((uid: string, patch: Partial<UploadFile>) => {
    const next = listRef.current.map((item) => (item.uid === uid ? { ...item, ...patch } : item));
    commitList(next);
    return next.find((item) => item.uid === uid);
  }, [commitList]);

  const startUpload = useCallback(async (uploadFile: UploadFile) => {
    if (!customRequest) return;
    const rawFile = uploadFile.originFileObj;
    if (!rawFile) return;
    const resolvedAction = typeof action === 'function' ? await action(rawFile) : action;
    customRequest({
      action: resolvedAction ?? '',
      filename: name ?? UPLOAD_DEFAULTS.name,
      // NOTE: originFileObj is the pre-transform File; a beforeUpload
      // transform only renames/re-sizes the descriptor (contract UploadFile
      // stores no transformed File instance) -- same floor as rustic.
      file: rawFile,
      data: typeof data === 'function' ? data(uploadFile) : data,
      headers,
      withCredentials,
      onProgress: (event) => {
        const percent = Math.min(Math.round(event.percent), 100);
        const patched = patchFile(uploadFile.uid, { status: 'uploading', percent });
        if (patched) onChange?.({ file: patched, fileList: listRef.current });
      },
      onSuccess: (response) => {
        const patched = patchFile(uploadFile.uid, { status: 'done', percent: 100, response });
        if (patched) onChange?.({ file: patched, fileList: listRef.current });
      },
      onError: (error) => {
        const patched = patchFile(uploadFile.uid, { status: 'error', error });
        if (patched) onChange?.({ file: patched, fileList: listRef.current });
      },
    });
  }, [customRequest, action, data, headers, name, withCredentials, patchFile, onChange]);

  // Retry rides the same request pipeline: the failed file re-enters the
  // uploading state and customRequest runs again (recovery next to the item).
  const retryUpload = useCallback((uploadFile: UploadFile) => {
    if (!customRequest) return;
    const uploading: UploadFile = { ...uploadFile, status: 'uploading', percent: 0, error: undefined };
    const next = listRef.current.map((item) => (item.uid === uploadFile.uid ? uploading : item));
    commitList(next);
    onChange?.({ file: uploading, fileList: next });
    void startUpload(uploading);
  }, [customRequest, commitList, onChange, startUpload]);

  return {
    hasCustomRequest: Boolean(customRequest),
    startUpload,
    retryUpload,
  };
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
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus ownership (B2.4): remember the element that opened the dialog and
    // land focus on the close button (the dialog's only control), so keyboard
    // users have an immediate exit instead of dropping focus on <body>.
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    closeRef.current?.focus();
    // On close, focus returns to the opener (a detached opener -- e.g. its
    // file item was removed while previewing -- no-ops silently).
    return () => previouslyFocused?.focus();
  }, []);

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
      onClick={onClose}
      onKeyDown={(e) => {
        // aria-modal trap: the close button is the only focusable surface, so
        // Tab/Shift+Tab cycle back onto it instead of leaking to the page
        // behind the scrim.
        if (e.key === 'Tab') {
          e.preventDefault();
          closeRef.current?.focus();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t('upload.preview', { name: alt })}
    >
      <div data-part="preview-content" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          data-part="preview-close-button"
          onClick={onClose}
          aria-label={t('upload.close_preview')}
        >
          <ActionCloseIcon decorative size={14} />
        </button>
        <img data-part="preview-image" src={src} alt={alt} />
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
  /** Present only when a `customRequest` pipeline exists to re-run. */
  onRetry?: (file: UploadFile) => void;
  itemRender?: UploadProps['itemRender'];
  iconRender?: UploadProps['iconRender'];
  progress?: UploadProps['progress'];
  thumbUrls: Record<string, string>;
  showPreviewAction: boolean;
  showRemoveAction: boolean;
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
  onRetry,
  itemRender,
  iconRender,
  progress,
  thumbUrls,
  showPreviewAction,
  showRemoveAction,
}) => {
  const { t, locale } = useTranslation('components');
  const thumb = file.thumbUrl || file.url || readThumbUrl(thumbUrls, file.uid);
  const isImg = isImageFile(file);
  const isUploading = file.status === 'uploading';
  const isError = file.status === 'error';
  // Product law: file rows carry a semantic file icon and the size in
  // locale-formatted bytes (skin paints it tabular). Size is optional in the
  // contract (server-returned entries may lack it) -- no size, no span.
  const sizeText = typeof file.size === 'number' ? formatFileSize(file.size, locale) : undefined;
  // Recovery sits next to the failed item (B2.3): retry only exists when the
  // engine has a request pipeline to re-run and the raw File is still held.
  const canRetry = isError && Boolean(onRetry) && Boolean(file.originFileObj);
  const errorText = isError ? (file.error?.message || translateOr(t, 'upload.error', 'Error uploading file')) : undefined;

  const actions = {
    download: () => { if (file.url) window.open(file.url, '_blank'); },
    preview: () => onPreview?.(file),
    remove: () => onRemove(file),
  };

  const previewLabel = translateOr(t, 'upload.preview', `Preview ${file.name}`, { name: file.name });
  const removeLabel = translateOr(t, 'upload.remove_named', `Remove ${file.name}`, { name: file.name });
  const retryLabel = translateOr(t, 'upload.retry_named', `Retry ${file.name}`, { name: file.name });

  const retryIconSize = listType === 'picture-card' ? 16 : listType === 'picture-circle' ? 12 : 14;
  const retryButton = canRetry ? (
    <button type="button" data-part="file-item-action" data-action="retry" onClick={() => onRetry?.(file)} aria-label={retryLabel}>
      <ActionRetryIcon decorative size={retryIconSize} />
    </button>
  ) : null;

  // -- picture-card: 104x104 grid tile; the action overlay is ALWAYS rendered
  // (never hover-gated in React): the skin gates its visibility with
  // opacity/pointer-events on :hover and :focus-within, so keyboard users can
  // tab to preview/remove (the hidden-action law needs focus-within reveal). --
  if (listType === 'picture-card') {
    const originNode = (
      <div
        className="ds-upload__file-item"
        data-part="file-item"
        data-status={file.status || undefined}
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
        {!isUploading && (
          <div data-part="file-item-overlay">
            {isImg && showPreviewAction && (
              <button type="button" data-part="file-item-action" data-action="preview" onClick={() => onPreview?.(file)} aria-label={previewLabel}>
                <ActionRevealIcon decorative size={16} />
              </button>
            )}
            {retryButton}
            {showRemoveAction && (
              <button type="button" data-part="file-item-action" data-action="remove" onClick={() => onRemove(file)} aria-label={removeLabel}>
                <ActionDeleteIcon decorative size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    );
    return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
  }

  // -- picture-circle: circular avatar variant of picture-card (same
  //    always-rendered overlay contract as picture-card) --
  if (listType === 'picture-circle') {
    const originNode = (
      <div
        className="ds-upload__file-item"
        role="listitem"
        aria-label={file.name}
        data-part="file-item"
        data-status={file.status || undefined}
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
        {!isUploading && (
          <div data-part="file-item-overlay">
            {isImg && showPreviewAction && (
              <button type="button" data-part="file-item-action" data-action="preview" onClick={() => onPreview?.(file)} aria-label={previewLabel}>
                <ActionRevealIcon decorative size={12} />
              </button>
            )}
            {retryButton}
            {showRemoveAction && (
              <button type="button" data-part="file-item-action" data-action="remove" onClick={() => onRemove(file)} aria-label={removeLabel}>
                <ActionDeleteIcon decorative size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    );
    return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
  }

  // -- picture: horizontal row with a small thumbnail on the left --
  if (listType === 'picture') {
    const originNode = (
      <div data-part="file-item" data-status={file.status || undefined} className="ds-upload__file-item" role="listitem" aria-label={file.name}>
        {isImg && thumb ? (
          <img data-part="file-thumb" src={thumb} alt={file.name} onClick={() => onPreview?.(file)} />
        ) : (
          <div data-part="file-icon-slot">
            {iconRender ? iconRender(file, listType) : <ContentFileIcon decorative size={24} />}
          </div>
        )}
        <div data-part="file-content">
          <span data-part="file-name">{file.name}</span>
          {sizeText && <span data-part="file-size">{sizeText}</span>}
          {isUploading && <UploadProgress percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />}
          {errorText && (
            <span data-part="file-error">
              <StatusErrorIcon decorative size={12} data-part="file-error-icon" />
              <span data-part="file-error-text">{errorText}</span>
            </span>
          )}
        </div>
        {retryButton}
        {showRemoveAction && (
          <button type="button" data-part="file-item-action" data-action="remove" onClick={() => onRemove(file)} aria-label={removeLabel}>
            <ActionDeleteIcon decorative size={14} />
          </button>
        )}
      </div>
    );
    return itemRender ? <>{itemRender(originNode, file, [], actions)}</> : originNode;
  }

  // -- text (default): simple filename row with remove button --
  const originNode = (
    <div data-part="file-item" data-status={file.status || undefined} className="ds-upload__file-item" role="listitem" aria-label={file.name}>
      <span data-part="file-icon">
        {iconRender ? iconRender(file, listType) : <ContentFileIcon decorative size={16} />}
      </span>
      <div data-part="file-content">
        <span data-part="file-name">{file.name}</span>
        {sizeText && <span data-part="file-size">{sizeText}</span>}
        {isUploading && <UploadProgress percent={file.percent} strokeColor={progress?.strokeColor} strokeWidth={progress?.strokeWidth} />}
        {errorText && (
          <span data-part="file-error">
            <StatusErrorIcon decorative size={12} data-part="file-error-icon" />
            <span data-part="file-error-text">{errorText}</span>
          </span>
        )}
      </div>
      {retryButton}
      {showRemoveAction && (
        <button type="button" data-part="file-item-action" data-action="remove" onClick={() => onRemove(file)} aria-label={removeLabel}>
          <ActionDeleteIcon decorative size={14} />
        </button>
      )}
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
      customRequest,
      action,
      data,
      headers,
      name,
      withCredentials,
      onChange,
      onRemove,
      onPreview,
      itemRender,
      iconRender,
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

    // showUploadList's object form gates which per-item actions render
    // (download stays contract debt -- see the family report).
    const uploadListConfig = typeof showUploadList === 'object' ? showUploadList : undefined;
    const showPreviewAction = uploadListConfig?.showPreviewIcon !== false;
    const showRemoveAction = uploadListConfig?.showRemoveIcon !== false;

    const { hasCustomRequest, startUpload, retryUpload } = useModernUploadRequest({
      customRequest,
      action,
      data,
      headers,
      name,
      withCredentials,
      actualFileList,
      setFileList,
      onChange,
    });

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

      const resolved = await resolveAcceptedUploadFiles(
        actualFileList, files, maxCount, beforeUpload
      );

      if (resolved.acceptedFiles.length === 0) {
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      // With a customRequest pipeline the accepted files enter the uploading
      // state and the request lifecycle drives them to done/error.
      const { nextFileList, acceptedFiles } = hasCustomRequest
        ? markAcceptedAsUploading(resolved.nextFileList, resolved.acceptedFiles)
        : resolved;

      setFileList(nextFileList);
      acceptedFiles.forEach((acceptedFile, index) => {
        const fileListSnapshot = nextFileList.slice(0, actualFileList.length + index + 1);
        const info: UploadChangeInfo = { file: acceptedFile, fileList: fileListSnapshot };
        onChange?.(info);
      });
      if (hasCustomRequest) acceptedFiles.forEach((acceptedFile) => void startUpload(acceptedFile));
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
              data-disabled={disabled || undefined}
              className="ds-upload__add-button"
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={t('upload.add_file')}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); }
              }}
            >
              {children || (
                <ActionAddIcon decorative size={32} />
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
        onRetry={hasCustomRequest ? retryUpload : undefined}
        itemRender={itemRender}
        iconRender={iconRender}
        progress={progress}
        thumbUrls={thumbUrls}
        showPreviewAction={showPreviewAction}
        showRemoveAction={showRemoveAction}
      />
    ));

    return (
      <div ref={ref} data-part="root" className={rootClassName} style={style}>
        {isPictureCardOrCircle ? (
          <div data-part="file-list" role="list" aria-label={fileListLabel}>
            {showUploadList && fileItems}
            {uploadTrigger}
          </div>
        ) : (
          <>
            {uploadTrigger}
            {showUploadList && actualFileList.length > 0 && (
              <div data-part="file-list" role="list" aria-label={fileListLabel}>
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
      customRequest,
      action,
      data,
      headers,
      name,
      withCredentials,
      onChange,
      onRemove,
      onDrop,
      onPreview,
      itemRender,
      iconRender,
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

    const uploadListConfig = typeof showUploadList === 'object' ? showUploadList : undefined;
    const showPreviewAction = uploadListConfig?.showPreviewIcon !== false;
    const showRemoveAction = uploadListConfig?.showRemoveIcon !== false;

    const { hasCustomRequest, startUpload, retryUpload } = useModernUploadRequest({
      customRequest,
      action,
      data,
      headers,
      name,
      withCredentials,
      actualFileList,
      setFileList,
      onChange,
    });

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
      const resolved = await resolveAcceptedUploadFiles(actualFileList, files, maxCount, beforeUpload);
      if (resolved.acceptedFiles.length === 0) { if (inputRef.current) inputRef.current.value = ''; return; }
      const { nextFileList, acceptedFiles } = hasCustomRequest
        ? markAcceptedAsUploading(resolved.nextFileList, resolved.acceptedFiles)
        : resolved;
      setFileList(nextFileList);
      acceptedFiles.forEach((acceptedFile, index) => {
        const fileListSnapshot = nextFileList.slice(0, actualFileList.length + index + 1);
        onChange?.({ file: acceptedFile, fileList: fileListSnapshot });
      });
      if (hasCustomRequest) acceptedFiles.forEach((acceptedFile) => void startUpload(acceptedFile));
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
          onDragLeave={(e) => {
            /* dragleave bubbles from every child boundary (the hint text, the
               icon): only clear the drag state when the pointer actually
               exits the dropzone, or the frame flickers while crossing the
               default content. relatedTarget is null when leaving the window
               (still an exit). */
            if (disabled) return;
            const next = e.relatedTarget as Node | null;
            if (next && e.currentTarget.contains(next)) return;
            setIsDragOver(false);
          }}
          onDrop={handleDrop}
          onClick={() => { if (!disabled) inputRef.current?.click(); }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={t('upload.drop_hint')}
          aria-disabled={disabled || undefined}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); }
          }}
          data-part="dropzone"
          data-state={isDragOver ? 'dragging' : 'idle'}
          data-disabled={disabled || undefined}
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
              <ActionUploadIcon decorative size={48} />
              <p data-part="dropzone-hint">{t('upload.drag_drop')}</p>
            </>
          )}
        </div>

        {showUploadList && actualFileList.length > 0 && (
          <div data-part="file-list" role="list" aria-label={fileListLabel}>
            {actualFileList.map(file => (
              <FileItem
                key={file.uid}
                file={file}
                listType={listType}
                onRemove={handleRemove}
                onPreview={handlePreview}
                onRetry={hasCustomRequest ? retryUpload : undefined}
                itemRender={itemRender}
                iconRender={iconRender}
                progress={progress}
                thumbUrls={thumbUrls}
                showPreviewAction={showPreviewAction}
                showRemoveAction={showRemoveAction}
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
