'use client';

import { useRef } from 'react';
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
    icon,
    className,
    style,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      {/* Trigger Button */}
      {canUploadMore && (
        <Box>
          <button
            onClick={handleBrowseClick}
            style={{
              boxShadow: tokens.shadows.md,
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}`,
              backgroundColor: tokens.colors.primaryScale[600],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.common.white,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[700];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[600];
            }}
          >
            {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
            {title || 'Upload Files'}
          </button>

          {/* File Constraints */}
          {(accept || maxSize) && (
            <Text
              style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
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
        </Box>
      )}

      {/* File Chips */}
      {files.length > 0 && (
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: tokens.spacing[2],
            marginTop: canUploadMore ? tokens.spacing[4] : 0,
          }}
        >
          {files.map((file) => {
            const statusColor = getStatusColor(file.status);

            return (
              <Box
                key={file.id}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[1],
                  padding: tokens.spacing[2],
                  backgroundColor: tokens.colors.neutral[100],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  borderRadius: tokens.borderRadius.md,
                  maxWidth: '200px',
                }}
              >
                {/* Chip Content */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  {/* Status Icon */}
                  <Box
                    style={{
                      width: '16px',
                      height: '16px',
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

                  {/* File Name */}
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {file.name}
                  </Text>

                  {/* Remove Button */}
                  {onFileRemove && (
                    <button
                      onClick={() => onFileRemove(file.id)}
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: tokens.borderRadius.full,
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: tokens.colors.neutral[500],
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tokens.typography.fontSize.sm,
                        padding: 0,
                        transition: `all ${tokens.motion.hover}`,
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = tokens.colors.errorScale[600];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = tokens.colors.neutral[500];
                      }}
                    >
                      ×
                    </button>
                  )}
                </Box>

                {/* Size */}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  {formatSize(file.size)}
                </Text>

                {/* Progress Bar */}
                {file.status === 'uploading' && file.progress !== undefined && (
                  <Box
                    style={{
                      height: '3px',
                      backgroundColor: tokens.colors.neutral[300],
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

                {/* Error Message */}
                {file.status === 'error' && file.error && (
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.errorScale[600],
                      }}
                    >
                      {file.error}
                    </Text>
                    {onRetry && (
                      <button
                        onClick={() => onRetry(file.id)}
                        style={{
                          marginTop: tokens.spacing[1],
                          padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`,
                          backgroundColor: tokens.colors.common.white,
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.errorScale[600],
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          width: '100%',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = tokens.colors.errorScale[50];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                        }}
                      >
                        Retry
                      </button>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
});
