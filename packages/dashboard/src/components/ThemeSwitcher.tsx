import React from 'react';
import { Select, Space, Typography } from 'antd';
import { useTheme } from '@es-rottay/designsystem-core';
import type { TemplateName } from '@es-rottay/designsystem-core';

const { Text } = Typography;

export const ThemeSwitcher: React.FC = () => {
  const { template, setTemplate } = useTheme();

  const options = [
    // Ant Design Themes
    { value: 'base' as TemplateName, label: '🎨 Base (Ant Design)', group: 'Ant Design' },
    { value: 'spotify' as TemplateName, label: '🎵 Spotify', group: 'Ant Design' },
    { value: 'stripe' as TemplateName, label: '💳 Stripe', group: 'Ant Design' },
    { value: 'airbnb' as TemplateName, label: '🏠 Airbnb', group: 'Ant Design' },
    { value: 'slack' as TemplateName, label: '💬 Slack', group: 'Ant Design' },
    { value: 'notion' as TemplateName, label: '📝 Notion', group: 'Ant Design' },
    { value: 'linear' as TemplateName, label: '📊 Linear', group: 'Ant Design' },
    { value: 'vercel' as TemplateName, label: '▲ Vercel', group: 'Ant Design' },

    // DaisyUI Themes - Light
    { value: 'daisyui-light' as TemplateName, label: '☀️ Light', group: 'DaisyUI - Light' },
    { value: 'daisyui-cupcake' as TemplateName, label: '🧁 Cupcake', group: 'DaisyUI - Light' },
    { value: 'daisyui-bumblebee' as TemplateName, label: '🐝 Bumblebee', group: 'DaisyUI - Light' },
    { value: 'daisyui-emerald' as TemplateName, label: '💚 Emerald', group: 'DaisyUI - Light' },
    { value: 'daisyui-corporate' as TemplateName, label: '🏢 Corporate', group: 'DaisyUI - Light' },
    { value: 'daisyui-retro' as TemplateName, label: '📻 Retro', group: 'DaisyUI - Light' },
    { value: 'daisyui-valentine' as TemplateName, label: '💖 Valentine', group: 'DaisyUI - Light' },
    { value: 'daisyui-garden' as TemplateName, label: '🌻 Garden', group: 'DaisyUI - Light' },
    { value: 'daisyui-aqua' as TemplateName, label: '💧 Aqua', group: 'DaisyUI - Light' },
    { value: 'daisyui-lofi' as TemplateName, label: '📼 Lofi', group: 'DaisyUI - Light' },
    { value: 'daisyui-pastel' as TemplateName, label: '🎨 Pastel', group: 'DaisyUI - Light' },
    { value: 'daisyui-fantasy' as TemplateName, label: '🦄 Fantasy', group: 'DaisyUI - Light' },
    { value: 'daisyui-wireframe' as TemplateName, label: '📐 Wireframe', group: 'DaisyUI - Light' },
    { value: 'daisyui-cmyk' as TemplateName, label: '🖨️ CMYK', group: 'DaisyUI - Light' },
    { value: 'daisyui-autumn' as TemplateName, label: '🍂 Autumn', group: 'DaisyUI - Light' },
    { value: 'daisyui-acid' as TemplateName, label: '🌈 Acid', group: 'DaisyUI - Light' },
    { value: 'daisyui-lemonade' as TemplateName, label: '🍋 Lemonade', group: 'DaisyUI - Light' },
    { value: 'daisyui-winter' as TemplateName, label: '❄️ Winter', group: 'DaisyUI - Light' },

    // DaisyUI Themes - Dark
    { value: 'daisyui-dark' as TemplateName, label: '🌙 Dark', group: 'DaisyUI - Dark' },
    { value: 'daisyui-synthwave' as TemplateName, label: '🌆 Synthwave', group: 'DaisyUI - Dark' },
    { value: 'daisyui-cyberpunk' as TemplateName, label: '🤖 Cyberpunk', group: 'DaisyUI - Dark' },
    { value: 'daisyui-halloween' as TemplateName, label: '🎃 Halloween', group: 'DaisyUI - Dark' },
    { value: 'daisyui-forest' as TemplateName, label: '🌲 Forest', group: 'DaisyUI - Dark' },
    { value: 'daisyui-black' as TemplateName, label: '⚫ Black', group: 'DaisyUI - Dark' },
    { value: 'daisyui-luxury' as TemplateName, label: '💎 Luxury', group: 'DaisyUI - Dark' },
    { value: 'daisyui-dracula' as TemplateName, label: '🧛 Dracula', group: 'DaisyUI - Dark' },
    { value: 'daisyui-business' as TemplateName, label: '💼 Business', group: 'DaisyUI - Dark' },
    { value: 'daisyui-night' as TemplateName, label: '🌃 Night', group: 'DaisyUI - Dark' },
    { value: 'daisyui-coffee' as TemplateName, label: '☕ Coffee', group: 'DaisyUI - Dark' },
  ];

  // Group options by category
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || 'Other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, typeof options>);

  // Convert to Ant Design Select grouped format
  const selectOptions = Object.entries(groupedOptions).map(([label, options]) => ({
    label,
    options: options.map(opt => ({ value: opt.value, label: opt.label })),
  }));

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Text strong style={{ color: '#B3B3B3', fontSize: 12 }}>
        TEMPLATE ACTIVO ({Object.keys(groupedOptions).reduce((sum, key) => sum + groupedOptions[key].length, 0)} temas)
      </Text>
      <Select
        value={template}
        onChange={(value: TemplateName) => setTemplate(value)}
        options={selectOptions}
        style={{ width: '100%' }}
        size="large"
        showSearch
        filterOption={(input, option) =>
          (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
        }
      />
    </Space>
  );
};
