import React from 'react';
import { Skeleton, Space, theme } from 'antd';
import { useTheme } from '../../hooks/useTheme';
import type { SkeletonLoaderProps } from './types';

const { useToken } = theme;

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  count = 1,
  size = 'default',
  active = true,
  children,
  className,
  style,
  rows = 3,
  columns = 4,
}) => {
  const { token } = useToken();
  const { template } = useTheme();

  // Theme-specific border radius mapping
  const borderRadiusMap: Record<string, number> = {
    spotify: 8,
    stripe: 6,
    notion: 3,
    linear: 12,
    airbnb: 8,
    slack: 4,
    vercel: 8,
    base: 6,
  };

  const borderRadius = borderRadiusMap[template] || 6;

  // Size configurations
  const sizeConfig = {
    small: {
      avatar: 32,
      titleWidth: '40%',
      paragraphRows: 2,
      spacing: 8,
    },
    default: {
      avatar: 40,
      titleWidth: '50%',
      paragraphRows: 3,
      spacing: 12,
    },
    large: {
      avatar: 64,
      titleWidth: '60%',
      paragraphRows: 4,
      spacing: 16,
    },
  };

  const config = sizeConfig[size];

  // Base skeleton styles with theme colors
  const skeletonStyles: React.CSSProperties = {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: `${borderRadius}px`,
  };

  // Render text variant
  const renderText = () => (
    <Skeleton.Input
      active={active}
      style={{
        width: '100%',
        height: size === 'small' ? 24 : size === 'large' ? 40 : 32,
        borderRadius: `${borderRadius}px`,
      }}
    />
  );

  // Render paragraph variant
  const renderParagraph = () => (
    <Skeleton
      active={active}
      paragraph={{ rows: rows || config.paragraphRows }}
      title={false}
      style={skeletonStyles}
    />
  );

  // Render card variant
  const renderCard = () => (
    <div
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: `${borderRadius}px`,
        padding: config.spacing * 2,
        backgroundColor: token.colorBgContainer,
        ...skeletonStyles,
      }}
    >
      <Skeleton.Image
        active={active}
        style={{
          width: '100%',
          height: size === 'small' ? 120 : size === 'large' ? 240 : 180,
          borderRadius: `${borderRadius}px`,
          marginBottom: config.spacing,
        }}
      />
      <Skeleton
        active={active}
        title={{ width: config.titleWidth }}
        paragraph={{ rows: 2 }}
      />
    </div>
  );

  // Render table variant
  const renderTable = () => (
    <div
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        backgroundColor: token.colorBgContainer,
      }}
    >
      {/* Table Header */}
      <div
        style={{
          display: 'flex',
          gap: config.spacing,
          padding: config.spacing * 1.5,
          backgroundColor: token.colorBgLayout,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {Array.from({ length: columns }).map((_, idx) => (
          <Skeleton.Input
            key={idx}
            active={active}
            style={{
              flex: 1,
              height: 24,
              borderRadius: `${borderRadius}px`,
            }}
          />
        ))}
      </div>

      {/* Table Rows */}
      <div>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: 'flex',
              gap: config.spacing,
              padding: config.spacing * 1.5,
              borderBottom:
                rowIdx < rows - 1
                  ? `1px solid ${token.colorBorderSecondary}`
                  : 'none',
            }}
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton.Input
                key={colIdx}
                active={active}
                style={{
                  flex: 1,
                  height: 20,
                  borderRadius: `${borderRadius}px`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // Render profile variant
  const renderProfile = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: config.spacing,
        padding: config.spacing * 1.5,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: `${borderRadius}px`,
        backgroundColor: token.colorBgContainer,
      }}
    >
      <Skeleton.Avatar
        active={active}
        size={config.avatar}
        shape="circle"
      />
      <div style={{ flex: 1 }}>
        <Skeleton.Input
          active={active}
          style={{
            width: '60%',
            height: size === 'small' ? 16 : size === 'large' ? 24 : 20,
            borderRadius: `${borderRadius}px`,
            marginBottom: config.spacing / 2,
          }}
        />
        <Skeleton.Input
          active={active}
          style={{
            width: '40%',
            height: size === 'small' ? 12 : size === 'large' ? 18 : 14,
            borderRadius: `${borderRadius}px`,
          }}
        />
      </div>
    </div>
  );

  // Render custom variant
  const renderCustom = () => (
    <div style={skeletonStyles}>
      {children || <Skeleton active={active} />}
    </div>
  );

  // Select renderer based on variant
  const renderVariant = () => {
    switch (variant) {
      case 'text':
        return renderText();
      case 'paragraph':
        return renderParagraph();
      case 'card':
        return renderCard();
      case 'table':
        return renderTable();
      case 'profile':
        return renderProfile();
      case 'custom':
        return renderCustom();
      default:
        return renderText();
    }
  };

  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <Space
        direction="vertical"
        size={config.spacing}
        style={{ width: '100%', ...style }}
        className={className}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{renderVariant()}</div>
        ))}
      </Space>
    );
  }

  // Single skeleton
  return (
    <div style={style} className={className}>
      {renderVariant()}
    </div>
  );
};

SkeletonLoader.displayName = 'SkeletonLoader';
