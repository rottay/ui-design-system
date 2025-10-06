import React, { useMemo } from 'react';
import { Watermark } from 'antd';
import type { WatermarkProps } from 'antd';

export interface SecureWatermarkProps extends WatermarkProps {
  username?: string;
  userId?: string;
  timestamp?: boolean;
  ipAddress?: string;
  sessionId?: string;
  customFields?: Record<string, string>;
  multiLine?: boolean;
  showMetadata?: boolean;
}

export const SecureWatermark: React.FC<SecureWatermarkProps> = ({
  username,
  userId,
  timestamp = true,
  ipAddress,
  sessionId,
  customFields,
  multiLine = true,
  showMetadata = true,
  content,
  ...watermarkProps
}) => {
  const secureContent = useMemo(() => {
    if (content) {
      return content;
    }

    const parts: string[] = [];

    if (username) {
      parts.push(`User: ${username}`);
    }

    if (userId) {
      parts.push(`ID: ${userId}`);
    }

    if (timestamp) {
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const timeStr = now.toLocaleTimeString();
      parts.push(`${dateStr} ${timeStr}`);
    }

    if (ipAddress) {
      parts.push(`IP: ${ipAddress}`);
    }

    if (sessionId) {
      parts.push(`Session: ${sessionId.substring(0, 8)}...`);
    }

    if (customFields) {
      Object.entries(customFields).forEach(([key, value]) => {
        parts.push(`${key}: ${value}`);
      });
    }

    if (multiLine && showMetadata) {
      return parts;
    }

    return parts.join(' | ');
  }, [username, userId, timestamp, ipAddress, sessionId, customFields, multiLine, showMetadata, content]);

  return (
    <Watermark
      content={secureContent}
      gap={[100, 100]}
      font={{
        color: 'rgba(0, 0, 0, 0.15)',
        fontSize: 14,
      }}
      {...watermarkProps}
    />
  );
};

SecureWatermark.displayName = 'SecureWatermark';
