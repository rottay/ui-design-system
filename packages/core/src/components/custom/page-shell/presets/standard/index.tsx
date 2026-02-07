'use client';

import { createPreset } from '../../../factory';
import type { PageShellProps, PageShellBreadcrumb, PageShellAction, PageShellTab } from '../../core';

export default createPreset<PageShellProps>('standard', (context) => {
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
      padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
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
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
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
              gap: tokens.spacing[1],
              flexWrap: 'wrap',
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
                    color: index === breadcrumbs.length - 1
                      ? tokens.colors.neutral[900]
                      : tokens.colors.neutral[600],
                    cursor: breadcrumb.onClick ? 'pointer' : 'default',
                    transition: `all ${tokens.motion.hover}`,
                    fontWeight: index === breadcrumbs.length - 1
                      ? tokens.typography.fontWeight.medium
                      : tokens.typography.fontWeight.normal,
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
          </Box>
        </Box>
      )}

      {/* Title Area */}
      <Box
        style={{
          padding: `${tokens.spacing[8]} ${tokens.spacing[6]}`,
          borderBottom: tabs.length > 0 ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: tokens.spacing[6],
          }}
        >
          <Stack direction="vertical" style={{ gap: tokens.spacing[2], flex: 1 }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                lineHeight: tokens.typography.lineHeight.tight,
              }}
            >
              {title}
            </Text>
            {description && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  color: tokens.colors.neutral[600],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}
              >
                {description}
              </Text>
            )}
          </Stack>

          {/* Actions */}
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
      </Box>

      {/* Tabs */}
      {tabs.length > 0 && (
        <Box
          style={{
            padding: `0 ${tokens.spacing[6]}`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[4],
            }}
          >
            {tabs.map((tab: PageShellTab) => {
              const isActive = tab.key === activeTab;
              return (
                <Box
                  key={tab.key}
                  style={{
                    padding: `${tokens.spacing[4]} ${tokens.spacing[2]}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    cursor: 'pointer',
                    borderBottom: `2px solid ${isActive ? tokens.colors.primaryScale[600] : 'transparent'}`,
                    color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: isActive ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                  onClick={() => handleTabClick(tab.key)}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && (
                    <Box
                      style={{
                        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
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
        </Box>
      )}

      {/* Content */}
      <Box style={{ flex: 1 }}>{children}</Box>
    </Stack>
  );
});
