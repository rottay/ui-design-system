'use client';

import { useState, useRef } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { FileUploadZoneProps, UploadFile } from '../../core';
import {
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
} from '../../../helpers';

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export default createPreset<FileUploadZoneProps>((context: PresetContext<FileUploadZoneProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;

  const {
    files = [],
    onFilesAdd,
    onFileRemove,
    onRetry,
    accept,
    maxSize,
    maxFiles,
    multiple,
    title,
    description,
    icon,
    className,
    style,
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (onFilesAdd) {
      onFilesAdd(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (onFilesAdd && selectedFiles.length > 0) {
      onFilesAdd(selectedFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const canUploadMore = !maxFiles || files.length < maxFiles;

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'complete':
        return tokens.colors.successScale[500];
      case 'error':
        return tokens.colors.errorScale[500];
      case 'uploading':
        return tokens.colors.primaryScale[500];
      default:
        return tokens.colors.neutral[400];
    }
  };

  return (
    <Box className={className} style={style}>
      {/* Compact Drop Zone */}
      {canUploadMore && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          style={{
            boxShadow: tokens.shadows.md,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[4],
            padding: tokens.spacing[4],
            border: `${tokens.surface.borderWidth} dashed ${isDragging ? tokens.colors.primaryScale[400] : tokens.colors.neutral[300]}`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: isDragging ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
            transition: `all ${tokens.motion.hover}`,
            cursor: 'pointer',
            marginBottom: files.length > 0 ? tokens.spacing[4] : 0,
          }}
        >
          {/* Icon */}
          {icon && (
            <Box
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                color: isDragging ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
              }}
            >
              {icon}
            </Box>
          )}

          {/* Text */}
          <Box style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[900],
              }}
            >
              {title}
            </Text>
            {description && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                {description}
              </Text>
            )}
          </Box>

          {/* Browse Button */}
          <button
            type="button"
            style={{
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}`,
              backgroundColor: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.primaryScale[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[50];
              e.currentTarget.style.transform = tokens.motion.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.common.white;
              e.currentTarget.style.transform = 'none';
            }}
          >
            Browse
          </button>

          {/* Hidden Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Compact File List */}
      {files.length > 0 && (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
          {files.map((file) => {
            const statusColor = getStatusColor(file.status);

            return (
              <Box
                key={file.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: tokens.spacing[2],
                  backgroundColor: tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                }}
              >
                {/* Status Icon */}
                <Box
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: tokens.borderRadius.full,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: tokens.typography.fontSize.xs,
                    color: statusColor,
                    flexShrink: 0,
                  }}
                >
                  {file.status === 'complete' && '✓'}
                  {file.status === 'error' && '✕'}
                  {file.status === 'uploading' && '⟳'}
                </Box>

                {/* File Info */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[1] }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {file.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        flexShrink: 0,
                      }}
                    >
                      {formatSize(file.size)}
                    </Text>
                  </Box>
                  {/* Progress Bar */}
                  {file.status === 'uploading' && file.progress !== undefined && (
                    <Box
                      style={{
                        height: '3px',
                        backgroundColor: tokens.colors.neutral[200],
                        borderRadius: tokens.borderRadius.full,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        style={{
                          height: '100%',
                          width: `${file.progress}%`,
                          backgroundColor: tokens.colors.primaryScale[500],
                          transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                        }}
                      />
                    </Box>
                  )}
                  {file.status === 'error' && file.error && (
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.errorScale[600],
                      }}
                    >
                      {file.error}
                    </Text>
                  )}
                </Box>

                {/* Actions */}
                {file.status === 'error' && onRetry && (
                  <button
                    onClick={() => onRetry(file.id)}
                    style={{
                      padding: `${tokens.spacing[1]}`,
                      borderRadius: tokens.borderRadius.md,
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.primaryScale[600],
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[50];
                      e.currentTarget.style.transform = tokens.motion.transform;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    Retry
                  </button>
                )}
                {onFileRemove && (
                  <button
                    onClick={() => onFileRemove(file.id)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: tokens.borderRadius.md,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: tokens.colors.neutral[500],
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.md,
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = tokens.colors.errorScale[600];
                      e.currentTarget.style.backgroundColor = tokens.colors.errorScale[50];
                      e.currentTarget.style.transform = tokens.motion.transform;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = tokens.colors.neutral[500];
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    ×
                  </button>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
});
