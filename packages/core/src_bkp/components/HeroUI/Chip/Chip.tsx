import React from 'react';
import { theme } from 'antd';
import { X } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import type { ChipProps } from './types';

/**
 * Chip Component - Theme-aware interactive tags
 *
 * Enhanced tag component with interactive features:
 * - Multiple variants (solid, bordered, flat, dot, shadow)
 * - Color themes (default, primary, success, warning, danger)
 * - Closeable with onClose callback
 * - Clickable with onClick callback
 * - Avatar/icon support
 * - Fully theme-aware styling
 *
 * @example
 * ```tsx
 * // Basic chip
 * <Chip>Label</Chip>
 *
 * // With close button
 * <Chip closeable onClose={() => console.log('closed')}>
 *   Removable
 * </Chip>
 *
 * // With avatar
 * <Chip avatar={<Avatar src="/user.jpg" />}>
 *   John Doe
 * </Chip>
 *
 * // Different colors and variants
 * <Chip color="success" variant="flat">Active</Chip>
 * <Chip color="danger" variant="bordered">Error</Chip>
 * ```
 */
export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'solid',
  color = 'default',
  size = 'md',
  radius = 'full',
  avatar,
  startContent,
  endContent,
  closeable = false,
  onClose,
  onClick,
  disabled = false,
  className,
  style,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();

  // Get color based on theme and color prop
  const getColorStyles = () => {
    const colors = {
      default: {
        bg: token.colorBgContainer,
        text: token.colorText,
        border: token.colorBorder,
        hover: token.controlItemBgHover,
      },
      primary: {
        bg: token.colorPrimary,
        text: '#FFFFFF',
        border: token.colorPrimaryBorder,
        hover: token.colorPrimaryHover,
      },
      success: {
        bg: token.colorSuccess,
        text: '#FFFFFF',
        border: token.colorSuccessBorder,
        hover: token.colorSuccessHover,
      },
      warning: {
        bg: token.colorWarning,
        text: '#FFFFFF',
        border: token.colorWarningBorder,
        hover: token.colorWarningHover,
      },
      danger: {
        bg: token.colorError,
        text: '#FFFFFF',
        border: token.colorErrorBorder,
        hover: token.colorErrorHover,
      },
    };

    return colors[color];
  };

  const colorStyles = getColorStyles();

  // Get variant styles
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'solid':
        return {
          background: colorStyles.bg,
          color: colorStyles.text,
          border: 'none',
        };

      case 'bordered':
        return {
          background: 'transparent',
          color: colorStyles.bg,
          border: `1px solid ${colorStyles.border}`,
        };

      case 'flat':
        return {
          background: color === 'default'
            ? token.colorBgTextHover
            : `${colorStyles.bg}15`,
          color: colorStyles.bg,
          border: 'none',
        };

      case 'dot':
        return {
          background: token.colorBgContainer,
          color: token.colorText,
          border: `1px solid ${token.colorBorder}`,
        };

      case 'shadow':
        return {
          background: colorStyles.bg,
          color: colorStyles.text,
          border: 'none',
          boxShadow: token.boxShadow,
        };

      default:
        return {};
    }
  };

  // Get size styles
  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '2px 8px',
          fontSize: '12px',
          height: '20px',
          gap: '4px',
        };

      case 'md':
        return {
          padding: '4px 12px',
          fontSize: '13px',
          height: '24px',
          gap: '6px',
        };

      case 'lg':
        return {
          padding: '6px 16px',
          fontSize: '14px',
          height: '32px',
          gap: '8px',
        };

      default:
        return {};
    }
  };

  // Get radius styles
  const getRadiusStyles = (): React.CSSProperties => {
    const radiusMap = {
      none: '0',
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px',
    };

    // Theme-specific overrides
    switch (template) {
      case 'notion':
        return { borderRadius: '3px' };
      case 'slack':
        return { borderRadius: '4px' };
      case 'stripe':
        return { borderRadius: '6px' };
      case 'linear':
        return { borderRadius: '8px' };
      default:
        return { borderRadius: radiusMap[radius] };
    }
  };

  // Combine all styles
  const chipStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    fontWeight: 500,
    transition: 'all 0.2s',
    cursor: onClick && !disabled ? 'pointer' : 'default',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...getRadiusStyles(),
    ...style,
  };

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose && !disabled) {
      onClose();
    }
  };

  // Icon size based on chip size
  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  // Close button styles
  const closeButtonStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: iconSize + 4,
    height: iconSize + 4,
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginLeft: '4px',
    background: 'transparent',
    border: 'none',
    padding: 0,
  };

  return (
    <span
      className={className}
      style={chipStyles}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (onClick && !disabled) {
          e.currentTarget.style.background = colorStyles.hover;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !disabled) {
          const bg = getVariantStyles().background;
          e.currentTarget.style.background = typeof bg === 'string' ? bg : '';
        }
      }}
    >
      {/* Dot indicator (for dot variant) */}
      {variant === 'dot' && (
        <span
          style={{
            width: size === 'sm' ? 6 : size === 'md' ? 8 : 10,
            height: size === 'sm' ? 6 : size === 'md' ? 8 : 10,
            borderRadius: '50%',
            background: colorStyles.bg,
            marginRight: '6px',
          }}
        />
      )}

      {/* Avatar */}
      {avatar && <span style={{ marginRight: '4px', display: 'flex' }}>{avatar}</span>}

      {/* Start content */}
      {startContent && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {startContent}
        </span>
      )}

      {/* Content */}
      <span>{children}</span>

      {/* End content */}
      {endContent && (
        <span style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
          {endContent}
        </span>
      )}

      {/* Close button */}
      {closeable && (
        <button
          onClick={handleClose}
          style={closeButtonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          aria-label="Close"
        >
          <X size={iconSize} />
        </button>
      )}
    </span>
  );
};

Chip.displayName = 'Chip';
