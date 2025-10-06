import React from 'react';
import { Card, Rate, Space, Typography } from 'antd';
import type { CardProps } from 'antd';
import type { RateProps } from './types';

const { Text, Title } = Typography;

export interface RatingCardProps extends Omit<CardProps, 'onChange'> {
  rateProps?: RateProps;
  title?: React.ReactNode;
  description?: React.ReactNode;
  value?: number;
  onChange?: (value: number) => void;
  showCount?: boolean;
  count?: number;
  averageRating?: number;
  vertical?: boolean;
}

export const RatingCard: React.FC<RatingCardProps> = ({
  rateProps,
  title,
  description,
  value,
  onChange,
  showCount = false,
  count,
  averageRating,
  vertical = false,
  ...cardProps
}) => {
  const ratingDisplay = averageRating !== undefined ? averageRating : value;

  return (
    <Card {...cardProps}>
      <Space
        direction={vertical ? 'vertical' : 'horizontal'}
        size="large"
        style={{ width: '100%' }}
      >
        <Space direction="vertical" size={4} style={{ flex: 1 }}>
          {title && (
            <Title level={5} style={{ margin: 0 }}>
              {title}
            </Title>
          )}
          {description && <Text type="secondary">{description}</Text>}
          <Rate value={value} onChange={onChange} {...rateProps} />
          {showCount && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {ratingDisplay !== undefined && (
                <>
                  <strong>{ratingDisplay.toFixed(1)}</strong>
                  {count !== undefined && <> ({count} reviews)</>}
                </>
              )}
            </Text>
          )}
        </Space>
      </Space>
    </Card>
  );
};

RatingCard.displayName = 'RatingCard';
