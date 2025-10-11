import React from 'react';
import { Empty, Button, theme } from 'antd';
import {
  InboxIcon,
  SearchXIcon,
  AlertTriangleIcon,
  FileQuestionIcon,
  WifiOffIcon,
  ConstructionIcon,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { EmptyStateProps, EmptyStateVariant } from './types';

const variantConfig: Record<
  EmptyStateVariant,
  { icon: React.ElementType; title: string; description: string }
> = {
  'no-data': {
    icon: InboxIcon,
    title: 'No Data',
    description: 'There is no data to display at the moment.',
  },
  'no-results': {
    icon: SearchXIcon,
    title: 'No Results Found',
    description: 'Try adjusting your search or filters to find what you are looking for.',
  },
  error: {
    icon: AlertTriangleIcon,
    title: 'Something Went Wrong',
    description: 'An error occurred while loading the data. Please try again.',
  },
  '404': {
    icon: FileQuestionIcon,
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist or has been moved.',
  },
  offline: {
    icon: WifiOffIcon,
    title: 'No Internet Connection',
    description: 'Please check your internet connection and try again.',
  },
  maintenance: {
    icon: ConstructionIcon,
    title: 'Under Maintenance',
    description: 'This feature is currently under maintenance. Please check back later.',
  },
};

const sizeConfig = {
  sm: { iconSize: 48, spacing: 12, titleSize: '16px', descSize: '14px' },
  md: { iconSize: 64, spacing: 16, titleSize: '18px', descSize: '14px' },
  lg: { iconSize: 80, spacing: 24, titleSize: '20px', descSize: '16px' },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'no-data',
  title,
  description,
  icon,
  image,
  actions = [],
  size = 'md',
  className,
  style,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const config = variantConfig[variant];
  const sizeStyles = sizeConfig[size];
  const IconComponent = config.icon;

  // Theme-specific icon size adjustments
  const getIconSize = (): number => {
    const baseSize = sizeStyles.iconSize;
    switch (template) {
      case 'spotify':
        return baseSize * 1.1; // Slightly larger for dark theme
      case 'notion':
        return baseSize * 0.9; // Smaller for minimal theme
      default:
        return baseSize;
    }
  };

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  // Theme-specific container styles
  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      ...style,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: '#121212',
          padding: sizeStyles.spacing * 3,
          borderRadius: 8,
          border: `1px solid ${token.colorBorder}`,
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: '#FAFAFA',
          padding: sizeStyles.spacing * 2.5,
          borderRadius: 6,
        };
      case 'notion':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          padding: sizeStyles.spacing * 2,
          borderRadius: 3,
        };
      case 'linear':
        return {
          ...baseStyles,
          background: '#F9FAFB',
          padding: sizeStyles.spacing * 3,
          borderRadius: 12,
        };
      default:
        return {
          ...baseStyles,
          background: token.colorBgContainer,
          padding: sizeStyles.spacing * 2,
        };
    }
  };

  // Theme-specific title styles
  const getTitleStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontSize: sizeStyles.titleSize,
      marginBottom: sizeStyles.spacing / 2,
      color: token.colorText,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          fontWeight: 700,
          letterSpacing: '-0.3px',
        };
      case 'stripe':
        return {
          ...baseStyles,
          fontWeight: 600,
        };
      case 'notion':
        return {
          ...baseStyles,
          fontWeight: 700,
        };
      case 'linear':
        return {
          ...baseStyles,
          fontWeight: 600,
          letterSpacing: '-0.2px',
        };
      default:
        return {
          ...baseStyles,
          fontWeight: 600,
        };
    }
  };

  const customImage = image ? (
    <img src={image} alt={displayTitle} style={{ maxWidth: '100%', height: 'auto' }} />
  ) : icon ? (
    <div style={{ color: token.colorTextDisabled }}>{icon}</div>
  ) : (
    <IconComponent size={getIconSize()} color={token.colorTextDisabled} strokeWidth={1.5} />
  );

  return (
    <div className={className} style={getContainerStyles()}>
      <Empty
        image={customImage}
        imageStyle={{ height: 'auto', marginBottom: sizeStyles.spacing }}
        description={
          <div>
            <div style={getTitleStyles()}>
              {displayTitle}
            </div>
            <div
              style={{
                fontSize: sizeStyles.descSize,
                color: token.colorTextSecondary,
              }}
            >
              {displayDescription}
            </div>
          </div>
        }
      />
      {actions.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: sizeStyles.spacing,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              type={action.type || 'default'}
              onClick={action.onClick}
              icon={action.icon}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
