import React from 'react';
import { Button, Space } from '@designsystem/core';

export const ButtonPage: React.FC = () => {
  return (
    <div style={{ padding: '48px', color: '#FFFFFF' }}>
      <h1 style={{ fontSize: '36px', margin: 0, color: '#1DB954' }}>Button</h1>
      <p style={{ fontSize: '16px', color: '#B3B3B3', marginTop: '8px' }}>
        Wrapper del componente Button de Ant Design con tema Spotify
      </p>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Variantes</h2>
        <Space size="middle">
          <Button type="primary">Primary</Button>
          <Button type="default">Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="link">Link</Button>
          <Button type="text">Text</Button>
        </Space>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Tamaños</h2>
        <Space size="middle" align="center">
          <Button type="primary" size="large">Large</Button>
          <Button type="primary" size="middle">Middle</Button>
          <Button type="primary" size="small">Small</Button>
        </Space>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Estados</h2>
        <Space size="middle">
          <Button type="primary">Normal</Button>
          <Button type="primary" disabled>Disabled</Button>
          <Button type="primary" loading>Loading</Button>
          <Button type="primary" danger>Danger</Button>
        </Space>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Full Width</h2>
        <Button type="primary" fullWidth>Full Width Button</Button>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Con Íconos</h2>
        <Space size="middle">
          <Button type="primary" icon={<span>▶</span>}>Play</Button>
          <Button type="default" icon={<span>♥</span>}>Like</Button>
          <Button type="dashed" icon={<span>⊕</span>}>Add</Button>
        </Space>
      </div>
    </div>
  );
};
