'use client';

import { useState } from 'react';
import { createPreset } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { SettingsPageProps, SettingsSection } from '../../core';

export default createPreset<SettingsPageProps>('tabbed', (context) => {
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

      {/* Tabs */}
      <Box
        style={{
          backgroundColor: tokens.colors.common.white,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          padding: `0 ${tokens.spacing[8]}`,
        }}
      >
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[4],
            overflowX: 'auto',
          }}
        >
          {sections.map((section: SettingsSection) => {
            const isActive = section.key === activeSection;
            return (
              <Box
                key={section.key}
                style={{
                  padding: `${tokens.spacing[4]} ${tokens.spacing[2]}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  cursor: 'pointer',
                  borderBottom: `2px solid ${
                    isActive ? tokens.colors.primaryScale[600] : 'transparent'
                  }`,
                  color: isActive
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: isActive
                    ? tokens.typography.fontWeight.medium
                    : tokens.typography.fontWeight.normal,
                  transition: `all ${tokens.motion.hover}`,
                  whiteSpace: 'nowrap',
                }}
                onClick={() => handleSectionChange(section.key)}
              >
                {section.icon && (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {section.icon}
                  </Box>
                )}
                {section.label}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Content */}
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
    </Stack>
  );
});
