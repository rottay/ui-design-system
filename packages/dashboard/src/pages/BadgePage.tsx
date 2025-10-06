import React from 'react';
import { Badge, Avatar, Space } from '@designsystem/core';

export const BadgePage: React.FC = () => {
  return (
    <div style={{ padding: '48px', color: '#FFFFFF' }}>
      <h1 style={{ fontSize: '36px', margin: 0, color: '#1DB954' }}>Badge</h1>
      <p style={{ fontSize: '16px', color: '#B3B3B3', marginTop: '8px' }}>
        Insignia para mostrar contadores o estados
      </p>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
        <Space size="large">
          <Badge count={5}>
            <Avatar shape="square">BG</Avatar>
          </Badge>
          <Badge count={0} showZero>
            <Avatar shape="square">BG</Avatar>
          </Badge>
          <Badge count={99}>
            <Avatar shape="square">BG</Avatar>
          </Badge>
        </Space>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Dot (Punto)</h2>
        <Space size="large">
          <Badge dot>
            <Avatar shape="square">DOT</Avatar>
          </Badge>
          <Badge dot status="success">
            <Avatar shape="square">SUC</Avatar>
          </Badge>
        </Space>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Standalone</h2>
        <Space size="middle">
          <Badge count={25} />
          <Badge count={100} style={{ backgroundColor: '#1DB954' }} />
          <Badge count={1000} overflowCount={999} />
        </Space>
      </div>
    </div>
  );
};
