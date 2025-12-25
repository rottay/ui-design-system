import React, { useEffect, useState } from 'react';
import { theme } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import type { Toast as ToastType } from './types';

export interface ToastComponentProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastComponentProps> = ({ toast, onDismiss }) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  useEffect(() => {
    if (toast.duration === 0) return;

    const endTime = toast.createdAt + toast.duration;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const progressPercentage = Math.max(0, (remaining / toast.duration) * 100);

      setProgress(progressPercentage);

      if (remaining <= 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.duration, toast.createdAt]);

  // Get icon based on toast type
  const getIcon = () => {
    if (toast.icon) return toast.icon;

    const iconStyle = { fontSize: 20 };

    switch (toast.type) {
      case 'success':
        return <CheckCircleFilled style={{ ...iconStyle, color: token.colorSuccess }} />;
      case 'error':
        return <CloseCircleFilled style={{ ...iconStyle, color: token.colorError }} />;
      case 'warning':
        return <ExclamationCircleFilled style={{ ...iconStyle, color: token.colorWarning }} />;
      case 'info':
        return <InfoCircleFilled style={{ ...iconStyle, color: token.colorInfo }} />;
      case 'loading':
        return <LoadingOutlined style={{ ...iconStyle, color: token.colorPrimary }} spin />;
      default:
        return null;
    }
  };

  // Theme-specific styles
  const getToastStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: template === 'spotify' ? 16 : template === 'notion' ? 12 : 14,
      marginBottom: 12,
      minWidth: 320,
      maxWidth: 480,
      position: 'relative',
      overflow: 'hidden',
      animation: isExiting
        ? 'toast-exit 0.3s ease-out forwards'
        : 'toast-enter 0.3s ease-out',
      transition: 'all 0.3s ease',
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: '#181818',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
          border: `1px solid ${token.colorBorder}`,
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        };
      case 'airbnb':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRadius: 8,
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        };
      case 'slack':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRadius: 4,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
        };
      case 'notion':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRadius: 3,
          boxShadow: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 5px 10px',
        };
      case 'linear':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.12)',
        };
      case 'vercel':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          border: '1px solid #EAEAEA',
        };
      default:
        return {
          ...baseStyles,
          background: token.colorBgElevated,
          borderRadius: token.borderRadius,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        };
    }
  };

  // Get progress bar color based on type
  const getProgressColor = (): string => {
    switch (toast.type) {
      case 'success':
        return token.colorSuccess;
      case 'error':
        return token.colorError;
      case 'warning':
        return token.colorWarning;
      case 'info':
        return token.colorInfo;
      case 'loading':
        return token.colorPrimary;
      default:
        return token.colorPrimary;
    }
  };

  return (
    <div style={getToastStyles()}>
      {/* Icon */}
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        {getIcon()}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: template === 'spotify' ? 15 : 14,
            fontWeight: template === 'spotify' || template === 'notion' ? 600 : 500,
            color: token.colorText,
            marginBottom: toast.description ? 4 : 0,
            lineHeight: 1.4,
          }}
        >
          {toast.title}
        </div>

        {toast.description && (
          <div
            style={{
              fontSize: template === 'spotify' ? 14 : 13,
              color: token.colorTextSecondary,
              lineHeight: 1.5,
              marginTop: 4,
            }}
          >
            {toast.description}
          </div>
        )}

        {/* Action Button */}
        {toast.action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.action!.onClick();
            }}
            style={{
              marginTop: 8,
              padding: template === 'notion' ? '4px 10px' : '6px 12px',
              background: 'transparent',
              border: `1px solid ${token.colorBorder}`,
              borderRadius: template === 'spotify' ? 4 : template === 'linear' ? 8 : template === 'notion' ? 3 : 4,
              color: token.colorPrimary,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = token.colorPrimaryBg || 'rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      {toast.closable && (
        <button
          onClick={handleDismiss}
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: template === 'linear' ? 6 : 4,
            color: token.colorTextSecondary,
            cursor: 'pointer',
            transition: 'all 0.2s',
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = token.colorBgTextHover || 'rgba(0, 0, 0, 0.06)';
            e.currentTarget.style.color = token.colorText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = token.colorTextSecondary;
          }}
        >
          <CloseOutlined style={{ fontSize: 12 }} />
        </button>
      )}

      {/* Progress Bar */}
      {toast.duration > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: template === 'spotify' ? 3 : 2,
            width: `${progress}%`,
            background: getProgressColor(),
            transition: 'width 0.05s linear',
            borderRadius: template === 'linear' ? '0 0 12px 0' : template === 'notion' ? 0 : template === 'spotify' ? '0 0 8px 0' : '0 0 6px 0',
          }}
        />
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes toast-enter {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes toast-exit {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
};

Toast.displayName = 'Toast';
