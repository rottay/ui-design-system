import React, { useState, useRef } from 'react';
import { Progress, theme } from 'antd';
import { Upload as UploadIcon, X, File, FileText, Image as ImageIcon, Film, Music, Archive } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { FileUploaderProps } from './types';

export const FileUploader: React.FC<FileUploaderProps> = ({
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = [],
  multiple = true,
  files = [],
  onUpload,
  onRemove,
  showPreview = true,
  dragDropText = 'Drag & drop files here',
  browseText = 'Browse files',
  className,
  style,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={20} />;
    if (type.startsWith('video/')) return <Film size={20} />;
    if (type.startsWith('audio/')) return <Music size={20} />;
    if (type.includes('pdf')) return <FileText size={20} />;
    if (type.includes('zip') || type.includes('rar')) return <Archive size={20} />;
    return <File size={20} />;
  };

  // Theme-specific container styles
  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      width: '100%',
    };
    return baseStyles;
  };

  // Theme-specific drop zone styles
  const getDropZoneStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          border: `2px dashed ${isDragging ? '#1DB954' : 'rgba(255, 255, 255, 0.2)'}`,
          borderRadius: 8,
          padding: '48px 24px',
          textAlign: 'center',
          background: isDragging ? 'rgba(29, 185, 84, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s',
          cursor: 'pointer',
        };
      case 'stripe':
        return {
          border: `2px dashed ${isDragging ? token.colorPrimary : token.colorBorder}`,
          borderRadius: 8,
          padding: '48px 24px',
          textAlign: 'center',
          background: isDragging ? token.controlItemBgActiveHover : '#FAFAFA',
          transition: 'all 0.3s',
          cursor: 'pointer',
        };
      case 'notion':
        return {
          border: `2px dashed ${isDragging ? token.colorPrimary : token.colorBorder}`,
          borderRadius: 3,
          padding: '40px 20px',
          textAlign: 'center',
          background: isDragging ? 'rgba(46, 170, 220, 0.05)' : 'rgba(242, 241, 238, 0.6)',
          transition: 'all 0.3s',
          cursor: 'pointer',
        };
      case 'linear':
        return {
          border: `2px dashed ${isDragging ? token.colorPrimary : token.colorBorder}`,
          borderRadius: 12,
          padding: '48px 24px',
          textAlign: 'center',
          background: isDragging ? 'rgba(94, 106, 210, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          transition: 'all 0.3s',
          cursor: 'pointer',
        };
      case 'airbnb':
        return {
          border: `2px dashed ${isDragging ? token.colorPrimary : token.colorBorder}`,
          borderRadius: 12,
          padding: '56px 24px',
          textAlign: 'center',
          background: isDragging ? 'rgba(255, 56, 92, 0.05)' : '#FFFFFF',
          transition: 'all 0.3s',
          cursor: 'pointer',
          boxShadow: isDragging ? '0 4px 16px rgba(0, 0, 0, 0.1)' : 'none',
        };
      case 'slack':
        return {
          border: `2px dashed ${isDragging ? '#1264A3' : 'rgba(29, 28, 29, 0.3)'}`,
          borderRadius: 8,
          padding: '48px 24px',
          textAlign: 'center',
          background: isDragging ? 'rgba(18, 100, 163, 0.05)' : 'rgba(248, 248, 248, 1)',
          transition: 'all 0.3s',
          cursor: 'pointer',
        };
      case 'vercel':
        return {
          border: `2px dashed ${isDragging ? '#FFFFFF' : '#333333'}`,
          borderRadius: 8,
          padding: '48px 24px',
          textAlign: 'center',
          background: isDragging ? 'rgba(255, 255, 255, 0.05)' : '#0A0A0A',
          transition: 'all 0.3s',
          cursor: 'pointer',
        };
      default:
        return {
          border: `2px dashed ${isDragging ? token.colorPrimary : token.colorBorder}`,
          borderRadius: 8,
          padding: '48px 24px',
          textAlign: 'center',
          background: isDragging ? token.controlItemBgActiveHover : token.colorBgContainer,
          transition: 'all 0.3s',
          cursor: 'pointer',
        };
    }
  };

  // Theme-specific icon styles
  const getIconStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          color: isDragging ? '#1DB954' : '#B3B3B3',
          marginBottom: 16,
        };
      case 'slack':
        return {
          color: isDragging ? '#1264A3' : token.colorTextSecondary,
          marginBottom: 16,
        };
      case 'vercel':
        return {
          color: isDragging ? '#FFFFFF' : '#888888',
          marginBottom: 16,
        };
      default:
        return {
          color: isDragging ? token.colorPrimary : token.colorTextSecondary,
          marginBottom: 16,
        };
    }
  };

  // Theme-specific text styles
  const getTextStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          fontSize: 16,
          fontWeight: 600,
          color: '#FFFFFF',
          marginBottom: 8,
        };
      case 'stripe':
      case 'linear':
        return {
          fontSize: 16,
          fontWeight: 500,
          color: token.colorText,
          marginBottom: 8,
        };
      case 'notion':
        return {
          fontSize: 15,
          fontWeight: 500,
          color: token.colorText,
          marginBottom: 8,
        };
      case 'airbnb':
        return {
          fontSize: 18,
          fontWeight: 500,
          color: token.colorText,
          marginBottom: 8,
        };
      case 'vercel':
        return {
          fontSize: 16,
          fontWeight: 500,
          color: '#FFFFFF',
          marginBottom: 8,
        };
      default:
        return {
          fontSize: 16,
          fontWeight: 500,
          color: token.colorText,
          marginBottom: 8,
        };
    }
  };

  // Theme-specific file item styles
  const getFileItemStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          padding: '16px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'all 0.2s',
        };
      case 'stripe':
        return {
          background: '#FFFFFF',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 8,
          padding: '16px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'all 0.2s',
        };
      case 'notion':
        return {
          background: '#FFFFFF',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 3,
          padding: '12px',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          transition: 'all 0.2s',
        };
      case 'linear':
        return {
          background: '#FFFFFF',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 12,
          padding: '16px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'all 0.2s',
        };
      case 'airbnb':
        return {
          background: '#FFFFFF',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 12,
          padding: '18px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'all 0.2s',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        };
      case 'slack':
        return {
          background: '#FFFFFF',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 8,
          padding: '14px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          transition: 'all 0.2s',
        };
      case 'vercel':
        return {
          background: '#0A0A0A',
          border: '1px solid #333333',
          borderRadius: 8,
          padding: '16px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'all 0.2s',
        };
      default:
        return {
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 8,
          padding: '16px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'all 0.2s',
        };
    }
  };

  // Theme-specific button styles
  const getButtonStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          background: '#1DB954',
          color: '#000000',
          border: 'none',
          borderRadius: 24,
          padding: '8px 24px',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: 14,
        };
      case 'stripe':
        return {
          background: token.colorPrimary,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 6,
          padding: '8px 20px',
          fontWeight: 500,
          cursor: 'pointer',
          fontSize: 14,
        };
      case 'notion':
        return {
          background: 'rgba(46, 170, 220, 1)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 3,
          padding: '6px 16px',
          fontWeight: 500,
          cursor: 'pointer',
          fontSize: 14,
        };
      case 'linear':
        return {
          background: token.colorPrimary,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 500,
          cursor: 'pointer',
          fontSize: 14,
        };
      case 'airbnb':
        return {
          background: token.colorPrimary,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 500,
          cursor: 'pointer',
          fontSize: 15,
        };
      case 'vercel':
        return {
          background: '#FFFFFF',
          color: '#000000',
          border: 'none',
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 500,
          cursor: 'pointer',
          fontSize: 14,
        };
      default:
        return {
          background: token.colorPrimary,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 500,
          cursor: 'pointer',
          fontSize: 14,
        };
    }
  };

  // Handle drag events
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
    handleFiles(droppedFiles);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  // Validate and process files
  const handleFiles = (fileList: File[]) => {
    const validFiles: File[] = [];

    fileList.forEach((file) => {
      // Check file count
      if (files.length + validFiles.length >= maxFiles) {
        console.warn(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds maximum size of ${formatSize(maxSize)}`);
        return;
      }

      // Check file type
      if (accept.length > 0) {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isAccepted = accept.some(
          (type) => type === file.type || type === fileExtension
        );
        if (!isAccepted) {
          console.warn(`File type ${file.type} not accepted`);
          return;
        }
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      onUpload?.(validFiles);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (fileId: string) => {
    onRemove?.(fileId);
  };

  return (
    <div className={className} style={{ ...getContainerStyles(), ...style }}>
      {/* Drop Zone */}
      <div
        style={getDropZoneStyles()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div style={getIconStyles()}>
          <UploadIcon size={48} />
        </div>
        <div style={getTextStyles()}>
          {dragDropText}
        </div>
        <div style={{
          fontSize: 14,
          color: template === 'spotify' ? '#B3B3B3' : template === 'vercel' ? '#888888' : token.colorTextSecondary,
          marginBottom: 16,
        }}>
          or
        </div>
        <button
          style={getButtonStyles()}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {browseText}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div style={{
          fontSize: 12,
          color: template === 'spotify' ? '#B3B3B3' : template === 'vercel' ? '#666666' : token.colorTextTertiary,
          marginTop: 16,
        }}>
          Max {maxFiles} files • {formatSize(maxSize)} per file
          {accept.length > 0 && ` • ${accept.join(', ')}`}
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div style={{ marginTop: 24 }}>
          {files.map((file) => (
            <div key={file.id} style={getFileItemStyles()}>
              {/* File Icon or Preview */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: template === 'notion' ? 3 : template === 'airbnb' ? 8 : 6,
                background: template === 'spotify' ? 'rgba(255, 255, 255, 0.1)' : template === 'vercel' ? '#1a1a1a' : token.colorBgTextHover,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: template === 'spotify' ? '#1DB954' : template === 'vercel' ? '#FFFFFF' : token.colorPrimary,
                flexShrink: 0,
                overflow: 'hidden',
              }}>
                {showPreview && file.type.startsWith('image/') && file.url ? (
                  <img src={file.url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getFileIcon(file.type)
                )}
              </div>

              {/* File Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: template === 'spotify' ? '#FFFFFF' : template === 'vercel' ? '#FFFFFF' : token.colorText,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: 4,
                }}>
                  {file.name}
                </div>
                <div style={{
                  fontSize: 12,
                  color: template === 'spotify' ? '#B3B3B3' : template === 'vercel' ? '#888888' : token.colorTextSecondary,
                  marginBottom: file.status === 'uploading' ? 8 : 0,
                }}>
                  {formatSize(file.size)}
                  {file.status === 'done' && ' • Complete'}
                  {file.status === 'error' && ` • ${file.error || 'Upload failed'}`}
                </div>

                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <Progress
                    percent={file.progress || 0}
                    size="small"
                    strokeColor={template === 'spotify' ? '#1DB954' : token.colorPrimary}
                    showInfo={false}
                  />
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(file.id);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: template === 'notion' ? 3 : template === 'airbnb' ? 8 : 6,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: template === 'spotify' ? '#B3B3B3' : template === 'vercel' ? '#888888' : token.colorTextSecondary,
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = template === 'spotify' ? 'rgba(255, 255, 255, 0.1)' : template === 'vercel' ? '#1a1a1a' : token.colorBgTextHover;
                  e.currentTarget.style.color = token.colorError;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = template === 'spotify' ? '#B3B3B3' : template === 'vercel' ? '#888888' : token.colorTextSecondary;
                }}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

FileUploader.displayName = 'FileUploader';
