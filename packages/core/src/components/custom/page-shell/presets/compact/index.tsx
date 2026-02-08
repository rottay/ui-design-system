'use client';

import { createPreset } from '../../../factory';
import type { PageShellProps, PageShellBreadcrumb, PageShellAction, PageShellTab } from '../../core';
import {
  createFilterPillStyle,
  createHoverStyle,
} from '../../../helpers';

export default createPreset<PageShellProps>('compact', (context) => {
  const { primitives, props, tokens } = context;
  const { Box, Stack, Text } = primitives;

  const {
    title,
    description,
    breadcrumbs = [],
    actions = [],
    tabs = [],
    activeTab,
    onTabChange,
    children,
    className,
    style,
  } = props;

  const handleBreadcrumbClick = (breadcrumb: typeof breadcrumbs[0]) => {
    if (breadcrumb.onClick) {
      breadcrumb.onClick();
    }
  };

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.onClick) {
      action.onClick();
    }
  };

  const handleTabClick = (key: string) => {
    if (onTabChange) {
      onTabChange(key);
    }
  };

  const getActionStyles = (variant: string = 'secondary') => {
    const baseStyles = {
      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
      borderRadius: tokens.borderRadius.md,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[1],
      border: 'none',
      outline: 'none',
    };

    if (variant === 'primary') {
      return {
        ...baseStyles,
        backgroundColor: tokens.colors.primaryScale[600],
        color: tokens.colors.common.white,
      };
    }

    if (variant === 'ghost') {
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: tokens.colors.neutral[700],
      };
    }

    return {
      ...baseStyles,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.neutral[700],
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
    };
  };

  return (
    <Stack
      direction="vertical"
      className={className}
      style={{
        width: '100%',
        backgroundColor: tokens.colors.common.white,
        ...style,
      }}
    >
      {/* Compact Header: Breadcrumbs + Title + Actions in one row */}
      <Box
        style={{
          padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing[6],
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Breadcrumbs + Title */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              flex: 1,
            }}
          >
            {breadcrumbs.length > 0 && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}
              >
                {breadcrumbs.map((breadcrumb: PageShellBreadcrumb, index: number) => (
                  <Box
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}
                  >
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[600],
                        cursor: breadcrumb.onClick ? 'pointer' : 'default',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                      onClick={() => handleBreadcrumbClick(breadcrumb)}
                    >
                      {breadcrumb.label}
                    </span>
                    {index < breadcrumbs.length - 1 && (
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[400],
                        }}
                      >
                        /
                      </Text>
                    )}
                  </Box>
                ))}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[400],
                  }}
                >
                  /
                </Text>
              </Box>
            )}

            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {title}
            </Text>

            {tabs.length > 0 && (
              <Box
                style={{
                  display: 'flex',
                  gap: tokens.spacing[1],
                  marginLeft: tokens.spacing[2],
                }}
              >
                {tabs.map((tab: PageShellTab) => {
                  const isActive = tab.key === activeTab;
                  return (
                    <Box
                      key={tab.key}
                      style={{
                        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        cursor: 'pointer',
                        backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                        color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                        borderRadius: tokens.borderRadius.md,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: isActive ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                      }}
                      onClick={() => handleTabClick(tab.key)}
                    >
                      {tab.icon}
                      {tab.label}
                      {tab.badge && (
                        <Box
                          style={{
                            padding: `2px ${tokens.spacing[1]}`,
                            backgroundColor: tokens.colors.neutral[100],
                            color: tokens.colors.neutral[700],
                            borderRadius: tokens.borderRadius.full,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}
                        >
                          {tab.badge}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Right: Actions */}
          {actions.length > 0 && (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}
            >
              {actions.map((action: PageShellAction) => (
                <Box
                  key={action.key}
                  as="button"
                  style={getActionStyles(action.variant)}
                  onClick={() => handleActionClick(action)}
                >
                  {action.icon}
                  {action.label}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Description below if present */}
        {description && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
              marginTop: tokens.spacing[2],
            }}
          >
            {description}
          </Text>
        )}
      </Box>

      {/* Content */}
      <Box style={{ flex: 1 }}>{children}</Box>
    </Stack>
  );
});
