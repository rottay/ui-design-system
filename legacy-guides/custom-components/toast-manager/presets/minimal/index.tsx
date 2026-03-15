import { createPreset, type PresetContext } from '../../../factory';
import {
  createHoverStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { ToastManagerProps } from '../../core';

export const minimalPreset = createPreset<ToastManagerProps>((context: PresetContext<ToastManagerProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Button } = primitives;

  const {
    toasts,
    position = 'top-right',
    onDismiss,
    className,
    style,
  } = props;

  const getPositionStyles = () => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing[2],
      padding: tokens.spacing[4],
      maxWidth: '90vw',
      width: '320px',
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: 0, right: 0 };
      case 'top-left':
        return { ...baseStyles, top: 0, left: 0 };
      case 'bottom-right':
        return { ...baseStyles, bottom: 0, right: 0 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 0, left: 0 };
      case 'top-center':
        return { ...baseStyles, top: 0, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...baseStyles, bottom: 0, left: '50%', transform: 'translateX(-50%)' };
      default:
        return { ...baseStyles, top: 0, right: 0 };
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'success':
        return tokens.colors.successScale[500];
      case 'error':
        return tokens.colors.errorScale[500];
      case 'warning':
        return tokens.colors.warningScale[500];
      case 'info':
        return tokens.colors.infoScale[500];
      default:
        return tokens.colors.neutral[500];
    }
  };

  if (toasts.length === 0) return null;

  return (
    <Box className={className} style={{ ...getPositionStyles(), ...style }}>
      {toasts.map((toast) => (
        <Box
          key={toast.id}
          style={{
            ...createSurfaceStyle(tokens, { elevation: 'md' }),
            borderRadius: tokens.borderRadius.md,
            padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            animation: 'slideIn 0.2s ease-out',
          }}
        >
          {/* Icon */}
          {toast.icon && (
            <Box
              style={{
                flexShrink: 0,
                color: getTypeColor(toast.type),
                fontSize: tokens.typography.fontSize.md,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {toast.icon}
            </Box>
          )}

          {/* Message */}
          <Box
            style={{
              flex: 1,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[700],
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {toast.title}
          </Box>

          {/* Action */}
          {toast.action && (
            <Button
              onClick={toast.action.onClick}
              style={{
                flexShrink: 0,
                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.primaryScale[600],
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = tokens.colors.primaryScale[700];
                e.currentTarget.style.transform = tokens.motion.transform;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = tokens.colors.primaryScale[600];
                e.currentTarget.style.transform = 'none';
              }}
            >
              {toast.action.label}
            </Button>
          )}

          {/* Dismiss Button */}
          <Button
            onClick={() => onDismiss?.(toast.id)}
            style={{
              flexShrink: 0,
              width: '18px',
              height: '18px',
              padding: 0,
              border: 'none',
              backgroundColor: 'transparent',
              color: tokens.colors.neutral[400],
              cursor: 'pointer',
              fontSize: tokens.typography.fontSize.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = tokens.colors.neutral[600];
              e.currentTarget.style.transform = tokens.motion.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = tokens.colors.neutral[400];
              e.currentTarget.style.transform = 'none';
            }}
          >
            ×
          </Button>
        </Box>
      ))}
    </Box>
  );
});
