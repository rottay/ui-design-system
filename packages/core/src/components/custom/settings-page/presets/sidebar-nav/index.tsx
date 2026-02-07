'use client';

import { useState } from 'react';
import { createPreset } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { SettingsPageProps, SettingsSection } from '../../core';

export default createPreset<SettingsPageProps>('sidebar-nav', (context) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Stack, Text } = primitives;

  const {
    title = 'Settings',
    sections,
    activeSection: controlledActiveSection,
    onSectionChange,
    className,
    style,
  } = props;

  const [internalActiveSection, setInternalActiveSection] = useState(
    sections[0]?.key || ''
  );

  const activeSection = controlledActiveSection ?? internalActiveSection;

  const handleSectionChange = (key: string) => {
    if (!controlledActiveSection) {
      setInternalActiveSection(key);
    }
    if (onSectionChange) {
      onSectionChange(key);
    }
  };

  const activeContent = sections.find((s: SettingsSection) => s.key === activeSection)?.content;

  const surfaceStyle = createSurfaceStyle(tokens);

  return (
    <Stack
      direction="vertical"
      className={className}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: tokens.colors.neutral[50],
        ...style,
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: `${tokens.spacing[6]} ${tokens.spacing[8]}`,
          backgroundColor: tokens.colors.common.white,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        <Text
          style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
          }}
        >
          {title}
        </Text>
      </Box>

      {/* Content Area with Sidebar */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Navigation */}
        <Box
          style={{
            width: 280,
            flexShrink: 0,
            backgroundColor: tokens.colors.common.white,
            borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            overflowY: 'auto',
            padding: tokens.spacing[4],
          }}
        >
          <Stack direction="vertical" style={{ gap: tokens.spacing[1] }}>
            {sections.map((section: SettingsSection) => {
              const isActive = section.key === activeSection;
              return (
                <Box
                  key={section.key}
                  style={{
                    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    backgroundColor: isActive
                      ? tokens.colors.primaryScale[50]
                      : 'transparent',
                    borderLeft: `3px solid ${
                      isActive ? tokens.colors.primaryScale[600] : 'transparent'
                    }`,
                    transition: `all ${tokens.motion.hover}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}
                  onClick={() => handleSectionChange(section.key)}
                >
                  {section.icon && (
                    <Box
                      style={{
                        color: isActive
                          ? tokens.colors.primaryScale[600]
                          : tokens.colors.neutral[600],
                        display: 'flex',
                        alignItems: 'center',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {section.icon}
                    </Box>
                  )}
                  <Stack direction="vertical" style={{ gap: 2 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: isActive
                          ? tokens.typography.fontWeight.semibold
                          : tokens.typography.fontWeight.medium,
                        color: isActive
                          ? tokens.colors.primaryScale[600]
                          : tokens.colors.neutral[900],
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {section.label}
                    </Text>
                    {section.description && (
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        {section.description}
                      </Text>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* Content Panel */}
        <Box
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: tokens.spacing[8],
          }}
        >
          <Box
            style={{
              maxWidth: 800,
              margin: '0 auto',
            }}
          >
            <Box
              style={{
                ...surfaceStyle,
                padding: tokens.spacing[8],
                borderRadius: tokens.borderRadius.lg,
              }}
            >
              {activeContent}
            </Box>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
});
