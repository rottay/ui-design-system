import React from 'react';
import { Alert, Space } from '@designsystem/core';

export const AlertPage: React.FC = () => {
  return (
    <div style={{ padding: '48px', color: '#FFFFFF' }}>
      <h1 style={{ fontSize: '36px', margin: 0, color: '#1DB954' }}>Alert</h1>
      <p style={{ fontSize: '16px', color: '#B3B3B3', marginTop: '8px' }}>
        Componente de alerta para mostrar mensajes importantes
      </p>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Tipos</h2>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert message="Success Alert" type="success" showIcon />
          <Alert message="Info Alert" type="info" showIcon />
          <Alert message="Warning Alert" type="warning" showIcon />
          <Alert message="Error Alert" type="error" showIcon />
        </Space>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Con Descripción</h2>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="Success Tips"
            description="Detailed description and advice about successful copywriting."
            type="success"
            showIcon
          />
          <Alert
            message="Informational Notes"
            description="Additional description and information about copywriting."
            type="info"
            showIcon
          />
        </Space>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Cerrable</h2>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert message="Warning Alert - Closable" type="warning" closable />
          <Alert
            message="Error Alert - Closable"
            description="Detailed description."
            type="error"
            closable
          />
        </Space>
      </div>
    </div>
  );
};
