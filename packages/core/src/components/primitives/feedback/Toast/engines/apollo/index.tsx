/**
 * Toast - Apollo Engine (Vanilla HTML/CSS)
 */

import React, { useEffect } from 'react';
import type { ToastProps } from '../types';
import { TOAST_DEFAULTS } from '../types';

const VARIANT_COLORS = {
  default: { background: '#fff', border: '#d9d9d9', color: '#000' },
  success: { background: '#f6ffed', border: '#b7eb8f', color: '#52c41a' },
  warning: { background: '#fffbe6', border: '#ffe58f', color: '#faad14' },
  error: { background: '#fff2f0', border: '#ffccc7', color: '#ff4d4f' },
  info: { background: '#e6f7ff', border: '#91d5ff', color: '#1890ff' },
};

const VARIANT_ICONS = {
  default: '📢',
  success: '✓',
  warning: '⚠',
  error: '✕',
  info: 'ℹ',
};

export default function ApolloToast(props: ToastProps): React.ReactElement {
  const {
    variant = TOAST_DEFAULTS.variant,
    title,
    description,
    duration = TOAST_DEFAULTS.duration,
    closable = TOAST_DEFAULTS.closable,
    onClose,
    action,
    icon,
    className = '',
    style,
  } = props;

  const [visible, setVisible] = React.useState(true);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return <></>;

  const colors = VARIANT_COLORS[variant!];

  return (
    <div className={`rottay-toast ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      backgroundColor: colors.background,
      border: `1px solid ${colors.border}`,
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      minWidth: '300px',
      maxWidth: '500px',
      ...style
    }} role="alert">
      <span style={{ fontSize: '20px', color: colors.color }}>{icon || VARIANT_ICONS[variant!]}</span>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 500, fontSize: '14px' }}>{title}</div>}
        {description && <div style={{ fontSize: '12px', color: '#666' }}>{description}</div>}
      </div>
      {action && (<button style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #d9d9d9', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }} onClick={action.onClick}>{action.label}</button>)}
      {closable && (<button style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer' }} onClick={handleClose} aria-label="Close">✕</button>)}
    </div>
  );
}
