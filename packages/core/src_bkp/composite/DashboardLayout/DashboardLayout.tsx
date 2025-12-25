import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import type { DashboardLayoutProps } from './types';

const { Header, Sider, Content, Footer } = Layout;

/**
 * DashboardLayout Component
 *
 * Complete dashboard layout with sidebar, header, content area, and optional footer.
 * Responsive with collapsible sidebar.
 *
 * @example
 * ```tsx
 * <DashboardLayout
 *   logo="/logo.png"
 *   menuItems={menuItems}
 *   headerRight={<UserMenu />}
 * >
 *   <YourContent />
 * </DashboardLayout>
 * ```
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  logo,
  menuItems = [],
  headerRight,
  footer,
  defaultCollapsed = false,
  showFooter = true,
  className,
  style,
  onMenuClick,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // Theme-specific styles
  const getHeaderStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: '#181818',
          padding: '0 32px',
          height: 72,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          borderBottom: `2px solid ${token.colorBorder}`,
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          padding: '0 24px',
          height: 64,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        };
      case 'notion':
        return {
          ...baseStyles,
          background: '#FBFBFA',
          padding: '0 20px',
          height: 60,
          boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px',
          borderBottom: '1px solid rgba(15, 15, 15, 0.1)',
        };
      case 'linear':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          padding: '0 32px',
          height: 68,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        };
      default:
        return {
          ...baseStyles,
          background: token.colorBgContainer,
          padding: '0 24px',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        };
    }
  };

  const getContentStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      minHeight: 280,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: '#121212',
          margin: '28px 20px',
          padding: 32,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          border: `1px solid ${token.colorBorder}`,
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: '#FAFAFA',
          margin: '24px 16px',
          padding: 28,
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
        };
      case 'notion':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          margin: '20px 12px',
          padding: 24,
          borderRadius: 3,
          boxShadow: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px',
        };
      case 'linear':
        return {
          ...baseStyles,
          background: '#F9FAFB',
          margin: '28px 20px',
          padding: 32,
          borderRadius: 12,
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.08)',
        };
      default:
        return {
          ...baseStyles,
          background: token.colorBgContainer,
          margin: '24px 16px',
          padding: 24,
          borderRadius: 8,
        };
    }
  };

  // Theme-specific sidebar width
  const getSidebarWidth = (): number => {
    switch (template) {
      case 'spotify':
        return 240;
      case 'stripe':
        return 220;
      case 'notion':
        return 200;
      case 'linear':
        return 240;
      default:
        return 200;
    }
  };

  // Convert menu items to Ant Design format
  const menuItemsFormatted = menuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    children: item.children?.map((child) => ({
      key: child.key,
      icon: child.icon,
      label: child.label,
      disabled: child.disabled,
    })),
    disabled: item.disabled,
  }));

  const sidebarWidth = getSidebarWidth();

  return (
    <Layout className={className} style={{ minHeight: '100vh', ...style }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={sidebarWidth}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: template === 'spotify' ? 72 : template === 'notion' ? 60 : 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {typeof logo === 'string' ? (
            <img
              src={logo}
              alt="Logo"
              style={{
                height: template === 'spotify' ? 36 : 32,
                objectFit: 'contain',
                transition: 'all 0.3s',
              }}
            />
          ) : (
            logo
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          items={menuItemsFormatted}
          onClick={({ key }) => onMenuClick?.(key)}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : sidebarWidth, transition: 'all 0.2s' }}>
        {/* Header */}
        <Header style={getHeaderStyles()}>
          {/* Collapse trigger */}
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: template === 'spotify' ? 20 : 18,
              cursor: 'pointer',
              transition: 'color 0.3s',
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          {/* Header right content */}
          {headerRight && <div>{headerRight}</div>}
        </Header>

        {/* Content */}
        <Content style={getContentStyles()}>
          {children}
        </Content>

        {/* Footer */}
        {showFooter && (
          <Footer style={{ textAlign: 'center', background: token.colorBgLayout }}>
            {footer || `Design System ©${new Date().getFullYear()}`}
          </Footer>
        )}
      </Layout>
    </Layout>
  );
};

DashboardLayout.displayName = 'DashboardLayout';
