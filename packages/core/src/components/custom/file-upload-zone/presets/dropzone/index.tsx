'use client';

import { useState, useRef } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { FileUploadZoneProps, UploadFile } from '../../core';

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export default createPreset<FileUploadZoneProps>((context: PresetContext<FileUploadZoneProps>) => {
  const { primitives, props, tokens } = context;
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
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
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
    // Reset input
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

  const isImageFile = (file: UploadFile) => {
    return file.type?.startsWith('image/');
  };

  return (
    <Box className={className} style={style}>
      {/* Drop Zone */}
      {canUploadMore && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? tokens.colors.primaryScale[400] : tokens.colors.neutral[300]}`,
            borderRadius: tokens.borderRadius.lg,
            padding: tokens.spacing[8],
            textAlign: 'center',
            backgroundColor: isDragging ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
            transition: `all ${tokens.motion.hover}`,
            cursor: 'pointer',
            marginBottom: files.length > 0 ? tokens.spacing[6] : 0,
          }}
          onClick={handleBrowseClick}
        >
          {/* Icon */}
          {icon && (
            <Box
              style={{
                fontSize: '48px',
                color: isDragging ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                marginBottom: tokens.spacing[4],
              }}
            >
              {icon}
            </Box>
          )}

          {/* Title */}
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[1],
            }}
          >
            {title}
          </Text>

          {/* Description */}
          {description && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[4],
              }}
            >
              {description}
            </Text>
          )}

          {/* Browse Button */}
          <button
            type="button"
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
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
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.common.white;
            }}
          >
            Browse Files
          </button>

          {/* File Constraints */}
          {(accept || maxSize) && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[4],
              }}
            >
              {accept && `Accepted: ${accept}`}
              {accept && maxSize && ' • '}
              {maxSize && `Max size: ${formatSize(maxSize)}`}
            </Text>
          )}

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

      {/* File List */}
      {files.length > 0 && (
        <Box>
          {files.map((file) => {
            const isHovered = hoveredFile === file.id;
            const statusColor = getStatusColor(file.status);
            const showPreview = isImageFile(file) && file.preview;

            return (
              <Box
                key={file.id}
                onMouseEnter={() => setHoveredFile(file.id)}
                onMouseLeave={() => setHoveredFile(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[4],
                  padding: tokens.spacing[4],
                  backgroundColor: tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.lg,
                  marginBottom: tokens.spacing[2],
                  transition: `all ${tokens.motion.hover}`,
                  boxShadow: isHovered ? tokens.shadows.sm : 'none',
                }}
              >
                {/* Preview/Icon */}
                {showPreview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      objectFit: 'cover',
                      borderRadius: tokens.borderRadius.md,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <Box
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.xl,
                      color: tokens.colors.neutral[500],
                      flexShrink: 0,
                    }}
                  >
                    📄
                  </Box>
                )}

                {/* File Info */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    {file.name}
                  </Text>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {formatSize(file.size)}
                    </Text>
                    {file.status === 'error' && file.error && (
                      <>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          •
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.errorScale[600],
                          }}
                        >
                          {file.error}
                        </Text>
                      </>
                    )}
                  </Box>
                  {/* Progress Bar */}
                  {file.status === 'uploading' && file.progress !== undefined && (
                    <Box
                      style={{
                        marginTop: tokens.spacing[1],
                        height: '4px',
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
                          transition: `width ${tokens.motion.hover}`,
                        }}
                      />
                    </Box>
                  )}
                </Box>

                {/* Status Icon */}
                <Box
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: tokens.borderRadius.full,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: tokens.typography.fontSize.sm,
                    color: statusColor,
                    flexShrink: 0,
                  }}
                >
                  {file.status === 'complete' && '✓'}
                  {file.status === 'error' && '✕'}
                  {file.status === 'uploading' && '⟳'}
                </Box>

                {/* Actions */}
                <Box style={{ display: 'flex', gap: tokens.spacing[1], flexShrink: 0 }}>
                  {file.status === 'error' && onRetry && (
                    <button
                      onClick={() => onRetry(file.id)}
                      style={{
                        padding: tokens.spacing[1],
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                        backgroundColor: tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[900],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                      }}
                    >
                      Retry
                    </button>
                  )}
                  {onFileRemove && (
                    <button
                      onClick={() => onFileRemove(file.id)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: tokens.borderRadius.md,
                        border: 'none',
                        backgroundColor: isHovered ? tokens.colors.errorScale[50] : 'transparent',
                        color: tokens.colors.errorScale[600],
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tokens.typography.fontSize.lg,
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      ×
                    </button>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
});
