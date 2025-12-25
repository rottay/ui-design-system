import React from 'react';
import { Card, Skeleton, Flex, theme } from 'antd';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { DashboardCardProps } from './types';

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  trend,
  icon,
  color = 'primary',
  loading = false,
  onClick,
  className,
  style,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();

  // Get color from theme tokens
  const getColor = (): string => {
    switch (color) {
      case 'primary':
        return token.colorPrimary;
      case 'success':
        return token.colorSuccess;
      case 'warning':
        return token.colorWarning;
      case 'error':
        return token.colorError;
      case 'info':
        return token.colorInfo;
      default:
        return token.colorPrimary;
    }
  };

  const themeColor = getColor();

  // Theme-specific card styles
  const getCardStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      ...style,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: '#121212',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          border: `1px solid ${token.colorBorder}`,
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: '#FAFAFA',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
        };
      case 'notion':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRadius: 3,
          boxShadow: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px',
        };
      case 'linear':
        return {
          ...baseStyles,
          background: '#F9FAFB',
          borderRadius: 12,
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.08)',
        };
      default:
        return {
          ...baseStyles,
          background: token.colorBgContainer,
        };
    }
  };

  // Theme-specific icon size
  const getIconSize = (): number => {
    switch (template) {
      case 'spotify':
        return 64; // Larger for dark theme
      case 'notion':
        return 48; // Smaller for minimal theme
      case 'linear':
        return 56;
      default:
        return 56;
    }
  };

  // Theme-specific padding
  const getCardPadding = (): number => {
    switch (template) {
      case 'spotify':
        return 28;
      case 'stripe':
        return 24;
      case 'notion':
        return 20;
      case 'linear':
        return 28;
      default:
        return 24;
    }
  };

  const cardStyle = getCardStyles();

  if (loading) {
    return (
      <Card className={className} style={cardStyle}>
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  // Theme-specific value font size
  const getValueFontSize = (): number => {
    switch (template) {
      case 'spotify':
        return 32;
      case 'stripe':
        return 28;
      case 'notion':
        return 26;
      case 'linear':
        return 30;
      default:
        return 28;
    }
  };

  return (
    <Card
      className={className}
      style={cardStyle}
      onClick={onClick}
      hoverable={!!onClick}
      styles={{
        body: { padding: getCardPadding() },
      }}
    >
      <Flex justify="space-between" align="start">
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              color: token.colorTextSecondary,
              marginBottom: 8,
              fontWeight: template === 'spotify' || template === 'notion' ? 600 : 500,
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: getValueFontSize(),
              fontWeight: template === 'spotify' ? 700 : 600,
              color: token.colorText,
              marginBottom: trend ? 8 : 0,
              letterSpacing: template === 'spotify' || template === 'linear' ? '-0.5px' : 'normal',
            }}
          >
            {value}
          </div>

          {trend && (
            <Flex align="center" gap={4}>
              {trend.direction === 'up' ? (
                <TrendingUp size={16} color={themeColor} />
              ) : (
                <TrendingDown size={16} color={themeColor} />
              )}
              <span
                style={{
                  fontSize: 14,
                  color: themeColor,
                  fontWeight: template === 'spotify' || template === 'notion' ? 600 : 500,
                }}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
              {trend.label && (
                <span
                  style={{
                    fontSize: 14,
                    color: token.colorTextSecondary,
                    marginLeft: 4,
                  }}
                >
                  {trend.label}
                </span>
              )}
            </Flex>
          )}
        </div>

        {icon && (
          <div
            style={{
              width: getIconSize(),
              height: getIconSize(),
              borderRadius: template === 'notion' ? 6 : '50%',
              backgroundColor: `${themeColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: themeColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </Flex>
    </Card>
  );
};

DashboardCard.displayName = 'DashboardCard';
