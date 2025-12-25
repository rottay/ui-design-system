import React from 'react';
import { Breadcrumb, Flex, Button, Tabs, Avatar, Tag, Divider, theme } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { PageHeaderProps } from './types';

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  tabs,
  onBack,
  avatar,
  tags = [],
  className,
  style,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();

  // Theme-specific title styles
  const getTitleStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      margin: 0,
      lineHeight: 1.35,
      color: token.colorText,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '-0.5px',
        };
      case 'stripe':
        return {
          ...baseStyles,
          fontSize: 28,
          fontWeight: 600,
        };
      case 'notion':
        return {
          ...baseStyles,
          fontSize: 26,
          fontWeight: 700,
        };
      case 'linear':
        return {
          ...baseStyles,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: '-0.3px',
        };
      default:
        return {
          ...baseStyles,
          fontSize: 24,
          fontWeight: 600,
        };
    }
  };

  // Theme-specific container padding
  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {};

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: '#181818',
          padding: '28px 32px',
          borderBottom: `2px solid ${token.colorBorder}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          padding: '24px 28px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        };
      case 'notion':
        return {
          ...baseStyles,
          background: '#FBFBFA',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(15, 15, 15, 0.1)',
          boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px',
        };
      case 'linear':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          padding: '28px 32px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        };
      default:
        return {
          ...baseStyles,
          background: token.colorBgContainer,
          padding: '20px 24px',
        };
    }
  };

  // Theme-specific avatar size
  const getAvatarSize = (): number => {
    switch (template) {
      case 'spotify':
        return 80;
      case 'notion':
        return 56;
      case 'linear':
        return 72;
      case 'stripe':
        return 68;
      default:
        return 64;
    }
  };

  // Theme-specific breadcrumb margin
  const getBreadcrumbMargin = (): number => {
    switch (template) {
      case 'spotify':
        return 20;
      case 'stripe':
        return 18;
      case 'notion':
        return 14;
      case 'linear':
        return 20;
      default:
        return 16;
    }
  };

  const containerStyles = {
    ...getContainerStyles(),
    ...style,
  };

  return (
    <div className={className} style={containerStyles}>
      {breadcrumbs && (
        <div style={{ marginBottom: getBreadcrumbMargin() }}>
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}

      <Flex justify="space-between" align="start" gap={template === 'spotify' || template === 'linear' ? 20 : 16}>
        <Flex align="start" gap={template === 'spotify' ? 20 : template === 'linear' ? 18 : 16} style={{ flex: 1 }}>
          {onBack && (
            <Button
              type="text"
              icon={<ArrowLeft size={template === 'spotify' ? 22 : 20} />}
              onClick={onBack}
              style={{ marginTop: 4 }}
            />
          )}

          {avatar && <Avatar {...avatar} size={getAvatarSize()} style={{ marginTop: 4 }} />}

          <div style={{ flex: 1 }}>
            <Flex align="center" gap={template === 'spotify' || template === 'linear' ? 14 : 12}>
              <h1 style={getTitleStyles()}>
                {title}
              </h1>
              {tags.length > 0 && (
                <Flex gap={8}>
                  {tags.map((tag, index) => (
                    <Tag
                      key={index}
                      color={tag.color}
                      style={{
                        borderRadius: template === 'spotify' ? 6 : template === 'linear' ? 8 : template === 'notion' ? 3 : 4,
                      }}
                    >
                      {tag.label}
                    </Tag>
                  ))}
                </Flex>
              )}
            </Flex>

            {subtitle && (
              <div
                style={{
                  marginTop: template === 'spotify' || template === 'linear' ? 10 : 8,
                  fontSize: template === 'spotify' ? 15 : 14,
                  color: token.colorTextSecondary,
                  lineHeight: 1.5,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </Flex>

        {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
      </Flex>

      {tabs && (
        <>
          <Divider style={{
            margin: template === 'spotify' || template === 'linear' ? '20px 0' : '16px 0',
          }} />
          <Tabs items={tabs} />
        </>
      )}
    </div>
  );
};

PageHeader.displayName = 'PageHeader';
