import React from 'react';
import { Select, Space, Typography } from 'antd';
import { useTheme } from '@es-rottay/designsystem-core';
import type { TemplateName } from '@es-rottay/designsystem-core';

const { Text } = Typography;

export const ThemeSwitcher: React.FC = () => {
  const { template, setTemplate } = useTheme();

  const options = [
    { value: 'base' as TemplateName, label: '🎨 Base (Ant Design)' },
    { value: 'spotify' as TemplateName, label: '🎵 Spotify' },
    { value: 'stripe' as TemplateName, label: '💳 Stripe' },
    { value: 'airbnb' as TemplateName, label: '🏠 Airbnb' },
    { value: 'slack' as TemplateName, label: '💬 Slack' },
    { value: 'notion' as TemplateName, label: '📝 Notion' },
    { value: 'linear' as TemplateName, label: '📊 Linear' },
    { value: 'vercel' as TemplateName, label: '▲ Vercel' },
  ];

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Text strong style={{ color: '#B3B3B3', fontSize: 12 }}>
        TEMPLATE ACTIVO
      </Text>
      <Select
        value={template}
        onChange={(value: TemplateName) => setTemplate(value)}
        options={options}
        style={{ width: '100%' }}
        size="large"
      />
    </Space>
  );
};
