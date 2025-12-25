/**
 * Alert - Apollo Engine (Pure HTML/CSS)
 */

import React, { useState } from 'react';
import type { AlertProps } from '../types';
import { ALERT_DEFAULTS } from '../types';

const TYPE_STYLES: Record<string, React.CSSProperties> = {
  info: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6', color: '#1E40AF' },
  success: { backgroundColor: '#F0FDF4', borderColor: '#22C55E', color: '#166534' },
  warning: { backgroundColor: '#FFFBEB', borderColor: '#F59E0B', color: '#92400E' },
  error: { backgroundColor: '#FEF2F2', borderColor: '#EF4444', color: '#991B1B' },
};

const TYPE_ICONS = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
};

export default function ApolloAlert(props: AlertProps): React.ReactElement | null {
  const [visible, setVisible] = useState(true);
  const {
    type = ALERT_DEFAULTS.type,
    message,
    description,
    icon,
    showIcon = ALERT_DEFAULTS.showIcon,
    closable = ALERT_DEFAULTS.closable,
    onClose,
    className,
    style,
  } = props;

  if (!visible) return null;

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: 'var(--radius-md, 0.375rem)',
    borderLeft: '4px solid',
    ...TYPE_STYLES[type!],
    ...style,
  };

  return (
    <div className={className} style={baseStyle}>
      {showIcon && <span style={{ fontSize: '1.25rem' }}>{icon || TYPE_ICONS[type!]}</span>}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{message}</div>
        {description && <div style={{ marginTop: '0.25rem', opacity: 0.9 }}>{description}</div>}
      </div>
      {closable && (
        <button
          onClick={() => { setVisible(false); onClose?.(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
