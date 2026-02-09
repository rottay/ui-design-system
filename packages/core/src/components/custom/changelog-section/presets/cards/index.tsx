import { useMemo } from 'react';
import { createPreset } from '../../../factory';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import type { ChangelogSectionProps, ChangelogType } from '../../core';

export const CardsPreset = createPreset<ChangelogSectionProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const { Box, Text } = primitives;
  const { entries, title, className, style } = props;

  const getTypeBadgeColors = (type: ChangelogType) => {
    switch (type) {
      case 'feature':
        return {
          bg: tokens.colors.successScale[100],
          text: tokens.colors.successScale[700],
          border: tokens.colors.successScale[200],
        };
      case 'improvement':
        return {
          bg: tokens.colors.primaryScale[100],
          text: tokens.colors.primaryScale[700],
          border: tokens.colors.primaryScale[200],
        };
      case 'fix':
        return {
          bg: tokens.colors.infoScale[100],
          text: tokens.colors.infoScale[700],
          border: tokens.colors.infoScale[200],
        };
      case 'breaking':
        return {
          bg: tokens.colors.errorScale[100],
          text: tokens.colors.errorScale[700],
          border: tokens.colors.errorScale[200],
        };
    }
  };

  const getTypeLabel = (type: ChangelogType) => {
    switch (type) {
      case 'feature':
        return 'New';
      case 'improvement':
        return 'Improved';
      case 'fix':
        return 'Fixed';
      case 'breaking':
        return 'Breaking';
    }
  };

  const cardStyle = useMemo(() => createCardStyle(tokens, {
    glass: isGlass,
    interactive: false,
  }), [tokens]);

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[8],
        padding: tokens.spacing[8],
        ...style,
      }}
    >
      {title && (
        <Text
          style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
      )}

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[6],
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {entries.map((entry) => {
          const typeBadgeColors = getTypeBadgeColors(entry.type);

          return (
            <Box
              key={entry.key}
              style={{
                ...cardStyle,
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[4],
                padding: tokens.spacing[8],
              }}
            >
              {/* Header - Version, Date, Type */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: tokens.spacing[2],
                  paddingBottom: tokens.spacing[4],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}
                >
                  <Box
                    style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                      backgroundColor: tokens.colors.primaryScale[100],
                      color: tokens.colors.primaryScale[700],
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                    }}
                  >
                    {entry.version}
                  </Box>
                  <Box
                    style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                      backgroundColor: typeBadgeColors.bg,
                      color: typeBadgeColors.text,
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${typeBadgeColors.border}`,
                    }}
                  >
                    {getTypeLabel(entry.type)}
                  </Box>
                </Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  {entry.date}
                </Text>
              </Box>

              {/* Title */}
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {entry.title}
              </Text>

              {/* Description */}
              {entry.description && (
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    lineHeight: tokens.typography.lineHeight.relaxed,
                  }}
                >
                  {entry.description}
                </Text>
              )}

              {/* Items list */}
              {entry.items && entry.items.length > 0 && (
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens.spacing[2],
                    marginTop: tokens.spacing[2],
                    padding: tokens.spacing[4],
                    backgroundColor: tokens.colors.neutral[50],
                    borderRadius: tokens.borderRadius.md,
                  }}
                >
                  {entry.items.map((item, index) => (
                    <Box
                      key={index}
                      style={{
                        display: 'flex',
                        gap: tokens.spacing[2],
                      }}
                    >
                      <Text
                        style={{
                          color: tokens.colors.neutral[400],
                          fontSize: tokens.typography.fontSize.sm,
                        }}
                      >
                        •
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                          lineHeight: tokens.typography.lineHeight.relaxed,
                        }}
                      >
                        {item}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});
