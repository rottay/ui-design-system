import React from 'react';
import { Avatar, Space } from '@designsystem/core';

export const AvatarPage: React.FC = () => {
  return (
    <div style={{ padding: '48px', color: '#FFFFFF' }}>
      <h1 style={{ fontSize: '36px', margin: 0, color: '#1DB954' }}>Avatar</h1>
      <p style={{ fontSize: '16px', color: '#B3B3B3', marginTop: '8px' }}>
        Componente para mostrar avatares de usuario
      </p>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Básico</h2>
        <Space size="middle">
          <Avatar>U</Avatar>
          <Avatar style={{ backgroundColor: '#1DB954' }}>JS</Avatar>
          <Avatar style={{ backgroundColor: '#87d068' }}>USER</Avatar>
        </Space>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Tamaños</h2>
        <Space size="middle">
          <Avatar size={64}>64</Avatar>
          <Avatar size="large">L</Avatar>
          <Avatar>M</Avatar>
          <Avatar size="small">S</Avatar>
        </Space>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Formas</h2>
        <Space size="middle">
          <Avatar shape="circle">C</Avatar>
          <Avatar shape="square">S</Avatar>
        </Space>
      </div>
    </div>
  );
};
