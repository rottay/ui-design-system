import React from 'react';
import { Dropdown, Badge, Space, Divider, theme } from 'antd';
import type { MenuProps } from 'antd';
import { Avatar } from '../../components/Display/Avatar';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { UserMenuProps } from './types';

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  menuItems,
  notificationCount = 0,
  showBadge = false,
  placement = 'bottomRight',
  trigger = ['click'],
  className,
  style,
  onOpenChange,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();

  // Theme-specific container styles
  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: 8,
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          padding: '6px 10px',
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: 'transparent',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 6,
          padding: '6px 12px',
        };
      case 'notion':
        return {
          ...baseStyles,
          background: 'transparent',
          borderRadius: 3,
          padding: '4px 8px',
        };
      case 'linear':
        return {
          ...baseStyles,
          background: 'rgba(0, 0, 0, 0.03)',
          borderRadius: 12,
          padding: '6px 10px',
        };
      case 'airbnb':
        return {
          ...baseStyles,
          background: 'transparent',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 24,
          padding: '6px 12px',
        };
      case 'slack':
        return {
          ...baseStyles,
          background: 'rgba(29, 28, 29, 0.04)',
          borderRadius: 4,
          padding: '6px 10px',
        };
      case 'vercel':
        return {
          ...baseStyles,
          background: 'transparent',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 8,
          padding: '6px 12px',
        };
      default:
        return {
          ...baseStyles,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
        };
    }
  };

  // Theme-specific dropdown content styles
  const getDropdownContentStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          background: '#282828',
          borderRadius: 8,
          minWidth: 240,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        };
      case 'stripe':
        return {
          background: '#FFFFFF',
          borderRadius: 6,
          minWidth: 260,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          border: `1px solid ${token.colorBorder}`,
        };
      case 'notion':
        return {
          background: '#FFFFFF',
          borderRadius: 3,
          minWidth: 240,
          boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.1) 0px 9px 24px',
        };
      case 'linear':
        return {
          background: '#FFFFFF',
          borderRadius: 12,
          minWidth: 260,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          border: `1px solid ${token.colorBorder}`,
        };
      case 'airbnb':
        return {
          background: '#FFFFFF',
          borderRadius: 12,
          minWidth: 250,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
        };
      case 'slack':
        return {
          background: '#FFFFFF',
          borderRadius: 8,
          minWidth: 260,
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 11px rgba(0, 0, 0, 0.1)',
        };
      case 'vercel':
        return {
          background: '#FFFFFF',
          borderRadius: 8,
          minWidth: 240,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          border: `1px solid ${token.colorBorder}`,
        };
      default:
        return {
          background: token.colorBgElevated,
          borderRadius: 8,
          minWidth: 240,
          boxShadow: token.boxShadow,
        };
    }
  };

  // Theme-specific avatar size
  const getAvatarSize = (): number => {
    switch (template) {
      case 'spotify':
        return 32;
      case 'stripe':
      case 'linear':
        return 36;
      case 'notion':
        return 28;
      case 'airbnb':
        return 34;
      default:
        return 32;
    }
  };

  // Theme-specific text styles
  const getNameTextStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          fontSize: 14,
          fontWeight: 600,
          color: '#FFFFFF',
        };
      case 'stripe':
      case 'linear':
        return {
          fontSize: 14,
          fontWeight: 500,
          color: token.colorText,
        };
      case 'notion':
        return {
          fontSize: 13,
          fontWeight: 500,
          color: token.colorText,
        };
      default:
        return {
          fontSize: 14,
          fontWeight: 500,
          color: token.colorText,
        };
    }
  };

  // Convert UserMenuItem[] to Ant Design MenuProps items
  const menuItemsAntD: MenuProps['items'] = menuItems.map((item) => {
    if (item.divider) {
      return {
        type: 'divider',
        key: `divider-${item.key}`,
      };
    }

    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
      danger: item.danger,
      onClick: item.onClick,
      style: {
        padding: template === 'spotify' || template === 'linear' ? '10px 16px' : '8px 12px',
        fontSize: template === 'notion' ? 13 : 14,
      },
    };
  });

  // Dropdown content
  const dropdownContent = (
    <div style={getDropdownContentStyles()}>
      {/* User Info Header */}
      <div
        style={{
          padding: template === 'spotify' || template === 'linear' ? '16px' : '12px 16px',
          borderBottom: `1px solid ${token.colorBorder}`,
        }}
      >
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <div style={getNameTextStyles()}>{user.name}</div>
          {user.email && (
            <div
              style={{
                fontSize: template === 'notion' ? 12 : 13,
                color: token.colorTextSecondary,
              }}
            >
              {user.email}
            </div>
          )}
          {user.role && (
            <div
              style={{
                fontSize: 12,
                color: token.colorPrimary,
                fontWeight: 500,
                marginTop: 4,
              }}
            >
              {user.role}
            </div>
          )}
        </Space>
      </div>

      {/* Menu Items */}
      <div style={{ padding: '4px 0' }}>
        {menuItemsAntD.map((item: any) => {
          if (item.type === 'divider') {
            return <Divider key={item.key} style={{ margin: '4px 0' }} />;
          }

          return (
            <div
              key={item.key}
              onClick={item.onClick}
              style={{
                ...item.style,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.2s',
                color: item.danger ? token.colorError : token.colorText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  template === 'spotify'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : token.controlItemBgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {item.icon && <span style={{ fontSize: 16 }}>{item.icon}</span>}
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      placement={placement}
      trigger={trigger}
      onOpenChange={onOpenChange}
    >
      <div className={className} style={{ ...getContainerStyles(), ...style }}>
        <Badge count={showBadge ? notificationCount : 0} size="small" offset={[-2, 2]}>
          <Avatar
            src={user.avatar}
            size={getAvatarSize()}
            {...user.avatarProps}
          >
            {!user.avatar && user.name.charAt(0).toUpperCase()}
          </Avatar>
        </Badge>

        <Space size={6} style={{ display: 'flex', alignItems: 'center' }}>
          <span style={getNameTextStyles()}>{user.name}</span>
          <ChevronDown
            size={template === 'notion' ? 14 : 16}
            style={{ color: token.colorTextSecondary }}
          />
        </Space>
      </div>
    </Dropdown>
  );
};

UserMenu.displayName = 'UserMenu';
