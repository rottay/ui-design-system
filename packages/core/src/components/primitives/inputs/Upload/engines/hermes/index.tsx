'use client';

/**
 * @fileoverview Upload Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Upload component
 * with drag-and-drop support and styled file list.
 *
 * @remarks
 * The Hermes engine provides a lightweight upload using:
 * - **DaisyUI styling**: Consistent with Tailwind design tokens
 * - **Drag and drop**: Custom dragger with visual feedback
 * - **File validation**: beforeUpload hook support
 * - **Responsive design**: Mobile-friendly interface
 *
 * Optimized for smaller bundle size while maintaining core functionality.
 *
 * @example Basic upload
 * ```tsx
 * <Upload engine="hermes">
 *   <button className="btn">Upload File</button>
 * </Upload>
 * ```
 *
 * @example Drag and drop
 * ```tsx
 * <Upload.Dragger engine="hermes" multiple accept="image/*">
 *   <p>Drag images here</p>
 * </Upload.Dragger>
 * ```
 *
 * @see {@link Upload} - Main component
 * @see {@link UploadProps} - Component props
 * @module Upload/Engines/Hermes
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState, useRef } from 'react';
import type { UploadProps, DraggerProps, UploadFile, UploadChangeInfo } from '../../types';
import { UPLOAD_DEFAULTS } from '../../types';

export const Upload = React.forwardRef<HTMLDivElement, UploadProps>(
  (props, ref) => {
    const {
      accept,
      multiple = UPLOAD_DEFAULTS.multiple,
      fileList: controlledFileList,
      defaultFileList = [],
      maxCount,
      disabled = UPLOAD_DEFAULTS.disabled,
      showUploadList = UPLOAD_DEFAULTS.showUploadList,
      beforeUpload,
      onChange,
      onRemove,
      children,
      className = '',
      style,
    } = props;

    const [fileList, setFileList] = useState<UploadFile[]>(defaultFileList);
    const inputRef = useRef<HTMLInputElement>(null);
    const actualFileList = controlledFileList ?? fileList;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      for (const file of files) {
        if (maxCount && actualFileList.length >= maxCount) break;

        if (beforeUpload) {
          const result = await beforeUpload(file, files);
          if (result === false) continue;
        }

        const newFile: UploadFile = {
          uid: `${Date.now()}-${Math.random()}`,
          name: file.name,
          status: 'done',
          size: file.size,
          type: file.type,
          originFileObj: file,
        };

        const newFileList = [...actualFileList, newFile];
        setFileList(newFileList);

        const info: UploadChangeInfo = {
          file: newFile,
          fileList: newFileList,
        };
        onChange?.(info);
      }

      if (inputRef.current) inputRef.current.value = '';
    };

    const handleRemove = async (file: UploadFile) => {
      if (onRemove) {
        const result = await onRemove(file);
        if (result === false) return;
      }
      const newFileList = actualFileList.filter(f => f.uid !== file.uid);
      setFileList(newFileList);
      onChange?.({ file: { ...file, status: 'removed' }, fileList: newFileList });
    };

    return (
      <div ref={ref} className={className} style={style}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileChange}
          className="hidden"
          id="upload-input"
        />
        <label htmlFor="upload-input" className={disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}>
          {children || (
            <button type="button" className="btn btn-outline" disabled={disabled}>
              Upload
            </button>
          )}
        </label>

        {showUploadList && actualFileList.length > 0 && (
          <div className="mt-2 space-y-2">
            {actualFileList.map(file => (
              <div key={file.uid} className="flex items-center justify-between p-2 bg-base-200 rounded">
                <span className="text-sm truncate">{file.name}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => handleRemove(file)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Upload.displayName = 'Upload.Hermes';

export const Dragger = React.forwardRef<HTMLDivElement, DraggerProps>(
  (props, ref) => {
    const {
      accept,
      multiple = UPLOAD_DEFAULTS.multiple,
      fileList: controlledFileList,
      defaultFileList = [],
      maxCount,
      disabled = UPLOAD_DEFAULTS.disabled,
      showUploadList = UPLOAD_DEFAULTS.showUploadList,
      beforeUpload,
      onChange,
      onRemove,
      onDrop,
      children,
      className = '',
      style,
      height = 200,
    } = props;

    const [fileList, setFileList] = useState<UploadFile[]>(defaultFileList);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const actualFileList = controlledFileList ?? fileList;

    const processFiles = async (files: File[]) => {
      for (const file of files) {
        if (maxCount && actualFileList.length >= maxCount) break;

        if (beforeUpload) {
          const result = await beforeUpload(file, files);
          if (result === false) continue;
        }

        const newFile: UploadFile = {
          uid: `${Date.now()}-${Math.random()}`,
          name: file.name,
          status: 'done',
          size: file.size,
          type: file.type,
          originFileObj: file,
        };

        const newFileList = [...actualFileList, newFile];
        setFileList(newFileList);
        onChange?.({ file: newFile, fileList: newFileList });
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      onDrop?.(e);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    };

    const handleRemove = async (file: UploadFile) => {
      if (onRemove) {
        const result = await onRemove(file);
        if (result === false) return;
      }
      const newFileList = actualFileList.filter(f => f.uid !== file.uid);
      setFileList(newFileList);
      onChange?.({ file: { ...file, status: 'removed' }, fileList: newFileList });
    };

    return (
      <div ref={ref} className={className} style={style}>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragOver ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary'
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
          />
          {children || (
            <>
              <svg className="w-12 h-12 text-base-content/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-base-content/70">Click or drag files to upload</p>
            </>
          )}
        </div>

        {showUploadList && actualFileList.length > 0 && (
          <div className="mt-2 space-y-2">
            {actualFileList.map(file => (
              <div key={file.uid} className="flex items-center justify-between p-2 bg-base-200 rounded">
                <span className="text-sm truncate">{file.name}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => handleRemove(file)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Dragger.displayName = 'Upload.Dragger.Hermes';

export default Upload;
