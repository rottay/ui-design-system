import React, { useState } from 'react';
import { Menu, Badge, theme } from 'antd';
import type { MenuProps } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { SidebarProps, SidebarItem } from './types';

export const Sidebar: React.FC<SidebarProps> = ({
  groups,
  collapsed = false,
  onCollapse,
  activeKey,
  onItemClick,
  logo,
  footer,
  width = 260,
  collapsedWidth = 80,
  className,
  style,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const isCollapsed = onCollapse ? collapsed : internalCollapsed;

  const handleCollapse = () => {
    if (onCollapse) {
      onCollapse(!collapsed);
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  // Theme-specific container styles
  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      height: '100vh',
      width: isCollapsed ? collapsedWidth : width,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: '#000000',
          borderRight: 'none',
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: '#F7FAFC',
          borderRight: `1px solid ${token.colorBorder}`,
        };
      case 'notion':
        return {
          ...baseStyles,
          background: '#F7F6F3',
          borderRight: `1px solid ${token.colorBorder}`,
        };
      case 'linear':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRight: `1px solid ${token.colorBorder}`,
        };
      case 'airbnb':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRight: `1px solid ${token.colorBorder}`,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)',
        };
      case 'slack':
        return {
          ...baseStyles,
          background: '#3F0E40',
          borderRight: 'none',
        };
      case 'vercel':
        return {
          ...baseStyles,
          background: '#000000',
          borderRight: `1px solid #333333`,
        };
      default:
        return {
          ...baseStyles,
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorder}`,
        };
    }
  };

  // Theme-specific logo area styles
  const getLogoAreaStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          padding: isCollapsed ? '16px 12px' : '20px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          minHeight: 64,
        };
      case 'stripe':
      case 'linear':
        return {
          padding: isCollapsed ? '16px 12px' : '20px 24px',
          borderBottom: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          minHeight: 72,
        };
      case 'notion':
        return {
          padding: isCollapsed ? '12px 10px' : '14px 14px',
          borderBottom: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          minHeight: 60,
        };
      case 'airbnb':
        return {
          padding: isCollapsed ? '16px 12px' : '24px 24px',
          borderBottom: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          minHeight: 80,
        };
      case 'slack':
        return {
          padding: isCollapsed ? '16px 12px' : '20px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          minHeight: 64,
        };
      case 'vercel':
        return {
          padding: isCollapsed ? '16px 12px' : '20px 24px',
          borderBottom: '1px solid #333333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          minHeight: 72,
        };
      default:
        return {
          padding: isCollapsed ? '16px 12px' : '20px 16px',
          borderBottom: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          minHeight: 64,
        };
    }
  };

  // Theme-specific group title styles
  const getGroupTitleStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          padding: '12px 16px 8px',
          fontSize: 11,
          fontWeight: 700,
          color: '#B3B3B3',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        };
      case 'stripe':
      case 'linear':
        return {
          padding: '16px 24px 8px',
          fontSize: 12,
          fontWeight: 600,
          color: token.colorTextSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        };
      case 'notion':
        return {
          padding: '12px 14px 6px',
          fontSize: 11,
          fontWeight: 500,
          color: token.colorTextSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        };
      case 'airbnb':
        return {
          padding: '20px 24px 8px',
          fontSize: 12,
          fontWeight: 600,
          color: token.colorTextSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        };
      case 'slack':
        return {
          padding: '12px 16px 8px',
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        };
      case 'vercel':
        return {
          padding: '16px 24px 8px',
          fontSize: 11,
          fontWeight: 600,
          color: '#888888',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        };
      default:
        return {
          padding: '12px 16px 8px',
          fontSize: 12,
          fontWeight: 600,
          color: token.colorTextSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        };
    }
  };

  // Theme-specific menu styles
  const getMenuStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          background: 'transparent',
          border: 'none',
          color: '#B3B3B3',
        };
      case 'stripe':
      case 'linear':
        return {
          background: 'transparent',
          border: 'none',
          padding: '0 12px',
        };
      case 'notion':
        return {
          background: 'transparent',
          border: 'none',
          padding: '0 6px',
        };
      case 'airbnb':
        return {
          background: 'transparent',
          border: 'none',
          padding: '0 12px',
        };
      case 'slack':
        return {
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.7)',
        };
      case 'vercel':
        return {
          background: 'transparent',
          border: 'none',
          padding: '0 12px',
        };
      default:
        return {
          background: 'transparent',
          border: 'none',
        };
    }
  };

  // Theme-specific item styles
  const getItemStyle = (isActive: boolean): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          borderRadius: 4,
          margin: '2px 0',
          padding: '8px 12px',
          height: 'auto',
          lineHeight: '20px',
          color: isActive ? '#FFFFFF' : '#B3B3B3',
          background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          fontWeight: isActive ? 600 : 400,
        };
      case 'stripe':
        return {
          borderRadius: 6,
          margin: '4px 0',
          padding: '10px 16px',
          height: 'auto',
          lineHeight: '20px',
          color: isActive ? token.colorPrimary : token.colorText,
          background: isActive ? token.controlItemBgActive : 'transparent',
          fontWeight: isActive ? 500 : 400,
        };
      case 'notion':
        return {
          borderRadius: 3,
          margin: '1px 0',
          padding: '6px 8px',
          height: 'auto',
          lineHeight: '20px',
          fontSize: 14,
          color: isActive ? token.colorText : token.colorTextSecondary,
          background: isActive ? token.controlItemBgActive : 'transparent',
          fontWeight: 400,
        };
      case 'linear':
        return {
          borderRadius: 8,
          margin: '4px 0',
          padding: '8px 12px',
          height: 'auto',
          lineHeight: '20px',
          color: isActive ? token.colorText : token.colorTextSecondary,
          background: isActive ? token.controlItemBgActive : 'transparent',
          fontWeight: isActive ? 500 : 400,
        };
      case 'airbnb':
        return {
          borderRadius: 8,
          margin: '4px 0',
          padding: '12px 16px',
          height: 'auto',
          lineHeight: '20px',
          color: isActive ? token.colorPrimary : token.colorText,
          background: isActive ? token.controlItemBgActive : 'transparent',
          fontWeight: isActive ? 500 : 400,
        };
      case 'slack':
        return {
          borderRadius: 6,
          margin: '2px 0',
          padding: '6px 12px',
          height: 'auto',
          lineHeight: '20px',
          color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
          background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          fontWeight: isActive ? 700 : 400,
        };
      case 'vercel':
        return {
          borderRadius: 8,
          margin: '4px 0',
          padding: '8px 12px',
          height: 'auto',
          lineHeight: '20px',
          color: isActive ? '#FFFFFF' : '#888888',
          background: isActive ? '#1a1a1a' : 'transparent',
          fontWeight: isActive ? 500 : 400,
        };
      default:
        return {
          borderRadius: 8,
          margin: '4px 0',
          padding: '8px 12px',
          height: 'auto',
          lineHeight: '20px',
          color: isActive ? token.colorPrimary : token.colorText,
          background: isActive ? token.controlItemBgActive : 'transparent',
        };
    }
  };

  // Theme-specific collapse button styles
  const getCollapseButtonStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          position: 'absolute',
          top: 20,
          right: isCollapsed ? 12 : 16,
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          color: '#FFFFFF',
          zIndex: 10,
        };
      case 'stripe':
      case 'linear':
        return {
          position: 'absolute',
          top: 24,
          right: isCollapsed ? 16 : 24,
          width: 32,
          height: 32,
          borderRadius: 6,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          color: token.colorText,
          zIndex: 10,
        };
      case 'notion':
        return {
          position: 'absolute',
          top: 16,
          right: isCollapsed ? 10 : 14,
          width: 28,
          height: 28,
          borderRadius: 3,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          color: token.colorTextSecondary,
          zIndex: 10,
        };
      case 'airbnb':
        return {
          position: 'absolute',
          top: 28,
          right: isCollapsed ? 16 : 24,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          color: token.colorText,
          zIndex: 10,
        };
      case 'slack':
        return {
          position: 'absolute',
          top: 20,
          right: isCollapsed ? 12 : 16,
          width: 32,
          height: 32,
          borderRadius: 6,
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          color: '#FFFFFF',
          zIndex: 10,
        };
      case 'vercel':
        return {
          position: 'absolute',
          top: 24,
          right: isCollapsed ? 16 : 24,
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#1a1a1a',
          border: `1px solid #333333`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          color: '#FFFFFF',
          zIndex: 10,
        };
      default:
        return {
          position: 'absolute',
          top: 20,
          right: isCollapsed ? 12 : 16,
          width: 32,
          height: 32,
          borderRadius: 8,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          color: token.colorText,
          zIndex: 10,
        };
    }
  };

  // Theme-specific footer styles
  const getFooterStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          padding: isCollapsed ? '12px' : '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        };
      case 'stripe':
      case 'linear':
        return {
          padding: isCollapsed ? '16px 12px' : '20px 24px',
          borderTop: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        };
      case 'notion':
        return {
          padding: isCollapsed ? '10px' : '12px 14px',
          borderTop: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        };
      case 'airbnb':
        return {
          padding: isCollapsed ? '16px 12px' : '24px 24px',
          borderTop: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        };
      case 'slack':
        return {
          padding: isCollapsed ? '12px' : '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        };
      case 'vercel':
        return {
          padding: isCollapsed ? '16px 12px' : '20px 24px',
          borderTop: '1px solid #333333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        };
      default:
        return {
          padding: isCollapsed ? '12px' : '16px',
          borderTop: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        };
    }
  };

  // Convert SidebarItem to Menu items
  const convertToMenuItems = (items: SidebarItem[]): MenuProps['items'] => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          key: item.key,
          label: isCollapsed ? null : item.label,
          icon: item.icon,
          children: convertToMenuItems(item.children),
          style: getItemStyle(activeKey === item.key),
        };
      }

      return {
        key: item.key,
        label: isCollapsed ? null : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{item.label}</span>
            {item.badge && !isCollapsed && (
              <Badge
                count={item.badge}
                size="small"
                style={{
                  backgroundColor: template === 'spotify' || template === 'slack' ? '#1DB954' : token.colorPrimary,
                }}
              />
            )}
          </div>
        ),
        icon: item.icon,
        style: getItemStyle(activeKey === item.key),
        onClick: () => onItemClick?.(item),
      };
    });
  };

  return (
    <div className={className} style={{ ...getContainerStyles(), ...style }}>
      {/* Logo Area */}
      {logo && (
        <div style={getLogoAreaStyles()}>
          {!isCollapsed && logo}
          {isCollapsed && <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{logo}</div>}
        </div>
      )}

      {/* Collapse Button */}
      <button
        onClick={handleCollapse}
        style={getCollapseButtonStyles()}
        onMouseEnter={(e) => {
          if (template === 'spotify' || template === 'slack') {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          } else {
            e.currentTarget.style.background = token.controlItemBgHover;
          }
        }}
        onMouseLeave={(e) => {
          if (template === 'spotify') {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          } else if (template === 'slack') {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          } else if (template === 'notion') {
            e.currentTarget.style.background = 'transparent';
          } else if (template === 'vercel') {
            e.currentTarget.style.background = '#1a1a1a';
          } else {
            e.currentTarget.style.background = token.colorBgContainer;
          }
        }}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Navigation Groups */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
        {groups.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`}>
            {group.title && !isCollapsed && (
              <div style={getGroupTitleStyles()}>
                {group.title}
              </div>
            )}
            <Menu
              mode="inline"
              selectedKeys={activeKey ? [activeKey] : []}
              openKeys={openKeys}
              onOpenChange={setOpenKeys}
              inlineCollapsed={isCollapsed}
              items={convertToMenuItems(group.items)}
              style={getMenuStyles()}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      {footer && (
        <div style={getFooterStyles()}>
          {footer}
        </div>
      )}
    </div>
  );
};

Sidebar.displayName = 'Sidebar';
