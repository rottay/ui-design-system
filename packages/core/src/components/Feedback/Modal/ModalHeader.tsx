import React from 'react';
import { Space, Typography } from 'antd';

const { Title } = Typography;

export interface ModalHeaderProps {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  icon,
  extra,
  subtitle,
  className,
  style,
}) => {
  return (
    <div className={className} style={style}>
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            {icon}
            {typeof title === 'string' ? (
              <Title level={4} style={{ margin: 0 }}>
                {title}
              </Title>
            ) : (
              title
            )}
          </Space>
          {extra}
        </div>
        {subtitle && (
          <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>
            {subtitle}
          </div>
        )}
      </Space>
    </div>
  );
};

ModalHeader.displayName = 'ModalHeader';
