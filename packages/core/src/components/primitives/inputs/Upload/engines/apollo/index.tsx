'use client';

/**
 * @fileoverview Upload Apollo Engine - Rottay Design System
 * @description Pure vanilla HTML/CSS implementation of the Upload component
 * with zero external dependencies for maximum portability.
 *
 * @remarks
 * The Apollo engine provides a dependency-free upload using:
 * - **Native file input**: Standard HTML file input
 * - **Custom dragger**: Pure CSS drag-and-drop zone
 * - **Inline styles**: No CSS framework dependencies
 * - **Full control**: Complete customization flexibility
 *
 * Ideal for environments where bundle size and dependency count are critical.
 *
 * @example Basic upload
 * ```tsx
 * <Upload engine="apollo">
 *   <button>Select Files</button>
 * </Upload>
 * ```
 *
 * @example Dragger with validation
 * ```tsx
 * <Upload.Dragger
 *   engine="apollo"
 *   beforeUpload={(file) => file.size < 5 * 1024 * 1024}
 * >
 *   <p>Drop files here (max 5MB)</p>
 * </Upload.Dragger>
 * ```
 *
 * @see {@link Upload} - Main component
 * @see {@link UploadProps} - Component props
 * @module Upload/Engines/Apollo
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState, useRef } from 'react';
import type { UploadProps, DraggerProps, UploadFile } from '../../types';
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
      className,
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
        onChange?.({ file: newFile, fileList: newFileList });
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

    const buttonStyle: React.CSSProperties = {
      padding: '8px 16px',
      border: '1px solid #d9d9d9',
      borderRadius: '4px',
      background: '#fff',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
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
          style={{ display: 'none' }}
        />
        <div onClick={() => !disabled && inputRef.current?.click()}>
          {children || <button type="button" style={buttonStyle} disabled={disabled}>Upload</button>}
        </div>

        {showUploadList && actualFileList.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {actualFileList.map(file => (
              <div key={file.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#fafafa', borderRadius: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <button type="button" onClick={() => handleRemove(file)} style={{ border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Upload.displayName = 'Upload.Apollo';

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
      className,
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

    const dropzoneStyle: React.CSSProperties = {
      height,
      border: `2px dashed ${isDragOver ? '#1890ff' : '#d9d9d9'}`,
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: isDragOver ? 'rgba(24, 144, 255, 0.05)' : '#fafafa',
      transition: 'all 0.2s',
      opacity: disabled ? 0.5 : 1,
    };

    return (
      <div ref={ref} className={className} style={style}>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          style={dropzoneStyle}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => processFiles(Array.from(e.target.files || []))}
            style={{ display: 'none' }}
          />
          {children || (
            <>
              <svg width={48} height={48} fill="none" stroke="#999" strokeWidth={1.5} viewBox="0 0 24 24" style={{ marginBottom: 8 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p style={{ margin: 0, color: '#666' }}>Click or drag files to upload</p>
            </>
          )}
        </div>

        {showUploadList && actualFileList.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {actualFileList.map(file => (
              <div key={file.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#fafafa', borderRadius: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <button type="button" onClick={() => handleRemove(file)} style={{ border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Dragger.displayName = 'Upload.Dragger.Apollo';

export default Upload;
