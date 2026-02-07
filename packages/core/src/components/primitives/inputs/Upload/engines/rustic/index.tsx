'use client';

/**
 * @fileoverview Upload Rustic Engine - Rottay Design System
 * @description Pure vanilla HTML/CSS implementation of the Upload component
 * using CSS variables for multi-tenant theming.
 *
 * @module RusticUpload
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

    // Build class names
    const containerClasses = [
      'rottay-upload',
      'rottay-upload--rustic',
      disabled && 'rottay-upload--disabled',
      className,
    ].filter(Boolean).join(' ');

    const buttonStyle: React.CSSProperties = {
      padding: 'var(--ds-upload-button-padding)',
      border: `1px solid var(--ds-upload-button-border)`,
      borderRadius: 'var(--ds-upload-button-radius)',
      background: 'var(--ds-upload-button-bg)',
      color: 'var(--ds-upload-button-color)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--ds-font-family-base)',
      transition: 'var(--ds-transition-fast)',
    };

    const fileItemStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px',
      background: 'var(--ds-upload-file-bg)',
      borderRadius: 'var(--ds-upload-file-radius)',
      marginBottom: '4px',
    };

    const fileNameStyle: React.CSSProperties = {
      fontSize: 'var(--ds-font-size-sm)',
      color: 'var(--ds-upload-file-color)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };

    const removeButtonStyle: React.CSSProperties = {
      border: 'none',
      background: 'transparent',
      color: 'var(--ds-upload-file-remove-color)',
      cursor: 'pointer',
      fontSize: '16px',
      padding: '0 4px',
    };

    return (
      <div ref={ref} className={containerClasses} style={style}>
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
          {children || (
            <button type="button" style={buttonStyle} disabled={disabled}>
              Upload
            </button>
          )}
        </div>

        {showUploadList && actualFileList.length > 0 && (
          <div className="rottay-upload__file-list" style={{ marginTop: 8 }}>
            {actualFileList.map(file => (
              <div key={file.uid} style={fileItemStyle}>
                <span style={fileNameStyle}>{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(file)}
                  style={removeButtonStyle}
                  aria-label={`Remove ${file.name}`}
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

Upload.displayName = 'Upload.Rustic';

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

    // Build class names
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

    const fileItemStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px',
      background: 'var(--ds-upload-file-bg)',
      borderRadius: 'var(--ds-upload-file-radius)',
      marginBottom: '4px',
    };

    const fileNameStyle: React.CSSProperties = {
      fontSize: 'var(--ds-font-size-sm)',
      color: 'var(--ds-upload-file-color)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };

    const removeButtonStyle: React.CSSProperties = {
      border: 'none',
      background: 'transparent',
      color: 'var(--ds-upload-file-remove-color)',
      cursor: 'pointer',
      fontSize: '16px',
      padding: '0 4px',
    };

    return (
      <div ref={ref} className={containerClasses} style={style}>
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
              <svg
                width={48}
                height={48}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                style={iconStyle}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p style={textStyle}>Click or drag files to upload</p>
            </>
          )}
        </div>

        {showUploadList && actualFileList.length > 0 && (
          <div className="rottay-upload-dragger__file-list" style={{ marginTop: 8 }}>
            {actualFileList.map(file => (
              <div key={file.uid} style={fileItemStyle}>
                <span style={fileNameStyle}>{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(file)}
                  style={removeButtonStyle}
                  aria-label={`Remove ${file.name}`}
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

Dragger.displayName = 'Upload.Dragger.Rustic';

export default Upload;
