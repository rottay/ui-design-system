import React from 'react';

export const Overview: React.FC = () => {
  return (
    <div style={{ padding: '48px' }}>
      <h1 style={{ fontSize: '48px', margin: 0, color: '#1890ff' }}>
        Design System Showcase
      </h1>
      <p style={{ fontSize: '18px', color: '#666', marginTop: '16px', maxWidth: '600px' }}>
        Este es un design system basado en Ant Design. Explora los componentes
        usando el menú lateral.
      </p>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>📦 Componentes Disponibles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
          <div style={{ padding: '24px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <h3 style={{ color: '#1890ff', marginBottom: '8px' }}>Button</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>1 componente</p>
          </div>
          <div style={{ padding: '24px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <h3 style={{ color: '#1890ff', marginBottom: '8px' }}>Display</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>17 componentes</p>
          </div>
          <div style={{ padding: '24px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <h3 style={{ color: '#1890ff', marginBottom: '8px' }}>Feedback</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>9 componentes</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>🎨 Tema Actual: Ant Design</h2>
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <div style={{ padding: '16px', backgroundColor: '#1890ff', borderRadius: '8px', minWidth: '120px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#fff' }}>Primary</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#fff' }}>#1890ff</p>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: '8px', minWidth: '120px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#000' }}>Background</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#666' }}>#ffffff</p>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: '8px', minWidth: '120px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#000' }}>Surface</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#666' }}>#f5f5f5</p>
          </div>
        </div>
      </div>
    </div>
  );
};
