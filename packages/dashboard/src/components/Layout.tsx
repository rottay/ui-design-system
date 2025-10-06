import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '280px',
          backgroundColor: '#fff',
          borderRight: '1px solid #d9d9d9',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #d9d9d9',
          }}
        >
          <h1 style={{ fontSize: '20px', margin: 0, color: '#1890ff', fontWeight: 700 }}>
            Design System
          </h1>
          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
            Ant Design
          </p>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '16px 0' }}>{sidebar}</div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#fff',
        }}
      >
        {children}
      </main>
    </div>
  );
};
