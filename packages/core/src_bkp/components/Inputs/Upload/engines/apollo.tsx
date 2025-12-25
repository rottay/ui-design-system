'use client';

/**
 * Apollo Upload Engine
 *
 * Native HTML + Tailwind implementation with unified props interface.
 */

import { useState, useRef, useCallback } from 'react';
import type { UploadProps, UploadFile, UploadChangeInfo } from '../types';
import {
  fileToUploadFile,
  isImageFile,
  formatFileSize,
  getBase64,
  validateFileType,
} from '../../../../types/components/upload';

/**
 * Apollo Upload Component
 *
 * Pure Tailwind-styled file upload.
 */
export default function ApolloUpload<T = unknown>(props: UploadProps<T>) {
  const {
    accept,
    action,
    fileList: controlledFileList,
    defaultFileList = [],
    maxCount,
    multiple = false,
    disabled = false,
    directory = false,
    listType = 'text',
    showUploadList = true,
    type = 'select',
    beforeUpload,
    customRequest,
    onChange,
    onRemove,
    onPreview,
    children,
    className = '',
    style,
    id,
  } = props;

  const [internalFileList, setInternalFileList] = useState<UploadFile<T>[]>(defaultFileList);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileList = controlledFileList ?? internalFileList;

  // Handle file change
  const handleChange = useCallback(
    (info: UploadChangeInfo<T>) => {
      if (controlledFileList === undefined) {
        setInternalFileList(info.fileList);
      }
      onChange?.(info);
    },
    [controlledFileList, onChange]
  );

  // Process files
  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      // Check max count
      const availableSlots = maxCount ? maxCount - fileList.length : Infinity;
      const filesToProcess = fileArray.slice(0, availableSlots);

      for (const file of filesToProcess) {
        // Validate type
        if (!validateFileType(file, accept)) {
          continue;
        }

        // Before upload
        if (beforeUpload) {
          const result = await beforeUpload(file, filesToProcess);
          if (result === false) continue;
        }

        // Create upload file
        const uploadFile = fileToUploadFile<T>(file);

        // Get preview for images
        if (isImageFile(uploadFile)) {
          try {
            uploadFile.thumbUrl = await getBase64(file);
          } catch (e) {
            // Ignore preview errors
          }
        }

        const newFileList = [...fileList, uploadFile];
        handleChange({
          file: uploadFile,
          fileList: newFileList,
        });

        // Handle upload
        if (customRequest) {
          customRequest({
            file,
            action: typeof action === 'string' ? action : '',
            onProgress: (e) => {
              const updatedFile = { ...uploadFile, percent: e.percent, status: 'uploading' as const };
              const updatedList = newFileList.map((f) => (f.uid === uploadFile.uid ? updatedFile : f));
              handleChange({ file: updatedFile, fileList: updatedList, event: e });
            },
            onSuccess: (response) => {
              const updatedFile = { ...uploadFile, status: 'done' as const, response, percent: 100 };
              const updatedList = newFileList.map((f) => (f.uid === uploadFile.uid ? updatedFile : f));
              handleChange({ file: updatedFile, fileList: updatedList });
            },
            onError: (error) => {
              const updatedFile = { ...uploadFile, status: 'error' as const, error: error.message };
              const updatedList = newFileList.map((f) => (f.uid === uploadFile.uid ? updatedFile : f));
              handleChange({ file: updatedFile, fileList: updatedList });
            },
          });
        } else {
          // Mark as done if no custom request
          const doneFile = { ...uploadFile, status: 'done' as const, percent: 100 };
          const doneList = newFileList.map((f) => (f.uid === uploadFile.uid ? doneFile : f));
          handleChange({ file: doneFile, fileList: doneList });
        }
      }
    },
    [fileList, maxCount, accept, beforeUpload, customRequest, action, handleChange]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        processFiles(files);
      }
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [processFiles]
  );

  // Handle remove
  const handleRemove = useCallback(
    async (file: UploadFile<T>) => {
      if (onRemove) {
        const result = await onRemove(file);
        if (result === false) return;
      }
      const newFileList = fileList.filter((f) => f.uid !== file.uid);
      handleChange({
        file: { ...file, status: 'removed' },
        fileList: newFileList,
      });
    },
    [fileList, onRemove, handleChange]
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (!disabled && e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, processFiles]
  );

  // Render file list
  const renderFileList = () => {
    if (!showUploadList || fileList.length === 0) return null;

    const isPictureMode = listType.startsWith('picture');

    return (
      <ul className={`mt-3 ${isPictureMode ? 'flex flex-wrap gap-2' : 'space-y-2'}`}>
        {fileList.map((file) => (
          <li
            key={file.uid}
            className={[
              'relative group',
              isPictureMode
                ? 'w-24 h-24 border rounded-lg overflow-hidden'
                : 'flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200',
              file.status === 'error' ? 'border-red-500' : 'border-gray-200',
            ].join(' ')}
          >
            {isPictureMode ? (
              <>
                {file.thumbUrl || file.url ? (
                  <img
                    src={file.thumbUrl ?? file.url}
                    alt={file.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => onPreview?.(file)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Remove button */}
                <button
                  type="button"
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(file)}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {/* Progress */}
                {file.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Icon */}
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {/* Name */}
                <span className="flex-1 truncate text-sm text-gray-700">{file.name}</span>
                {/* Size */}
                {file.size && (
                  <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                )}
                {/* Status */}
                {file.status === 'uploading' && (
                  <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {file.status === 'error' && (
                  <span className="text-red-500 text-xs">{file.error ?? 'Error'}</span>
                )}
                {/* Remove */}
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => handleRemove(file)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    );
  };

  // Drag area
  if (type === 'drag') {
    return (
      <div className={className} style={style}>
        <div
          className={[
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            id={id}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            className="hidden"
            onChange={handleInputChange}
            {...(directory ? { webkitdirectory: '', mozdirectory: '' } : {})}
          />
          {children ?? (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-500">Click or drag files to upload</p>
            </div>
          )}
        </div>
        {renderFileList()}
      </div>
    );
  }

  // Regular upload
  return (
    <div className={className} style={style}>
      <input
        ref={inputRef}
        type="file"
        id={id}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={handleInputChange}
        {...(directory ? { webkitdirectory: '', mozdirectory: '' } : {})}
      />
      <div onClick={() => !disabled && inputRef.current?.click()}>
        {children ?? (
          <button
            type="button"
            className={[
              'inline-flex items-center px-4 py-2 border border-gray-300 rounded-md',
              'text-sm font-medium text-gray-700 bg-white',
              'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              disabled ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
            disabled={disabled}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload
          </button>
        )}
      </div>
      {renderFileList()}
    </div>
  );
}
